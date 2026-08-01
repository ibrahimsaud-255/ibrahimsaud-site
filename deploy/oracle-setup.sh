#!/usr/bin/env bash
# =============================================================
#  نشر نظام إبراهيم سعود على خادم Oracle Cloud (Ubuntu 24.04 ARM)
#  قاعدة البيانات: Supabase (مخطّط معزول)
#
#  الاستخدام على الخادم:
#     git clone https://github.com/ibrahimsaud-255/ibrahimsaud-site.git
#     cd ibrahimsaud-site/deploy
#     cp env.example .env && nano .env      # عبّي البيانات
#     bash oracle-setup.sh
# =============================================================
set -euo pipefail

HERE="$(cd "$(dirname "$0")" && pwd)"
ODOO_HOME=/opt/isystem
ODOO_SRC=$ODOO_HOME/core
ODOO_VENV=$ODOO_HOME/venv
ODOO_DATA=$ODOO_HOME/data
ODOO_ADDONS=$ODOO_HOME/addons
CONF=/etc/isystem.conf
SERVICE=/etc/systemd/system/isystem.service

# يجبر كل اتصال بقاعدة Supabase على العمل داخل مخطّط odoo المعزول.
# على مستوى الاتصال (libpq) فلا يحتاج أي صلاحية على القاعدة — وهذا
# ما يمنع كتابة جداول النظام في public المكشوف للإنترنت.
export PGOPTIONS="-c search_path=odoo,public"

# ---------- ١) قراءة الإعدادات ----------
if [ ! -f "$HERE/.env" ]; then
  echo "✗ ملف .env غير موجود. انسخ env.example إلى .env وعبّيه أولاً."
  exit 1
fi
set -a; source "$HERE/.env"; set +a

for v in SUPABASE_HOST SUPABASE_USER SUPABASE_PASSWORD DOMAIN ADMIN_EMAIL; do
  [ -z "${!v:-}" ] && { echo "✗ المتغيّر $v ناقص في .env"; exit 1; }
done

echo "▶ الوجهة: $DOMAIN | القاعدة: $SUPABASE_HOST"

# ---------- ٢) حزم النظام ----------
echo "▶ تثبيت متطلبات النظام..."
sudo apt-get update -qq
sudo DEBIAN_FRONTEND=noninteractive apt-get install -y -qq \
  python3 python3-venv python3-dev build-essential git curl \
  libxml2-dev libxslt1-dev libldap2-dev libsasl2-dev libssl-dev libpq-dev \
  libjpeg-dev zlib1g-dev libfreetype6-dev liblcms2-dev libwebp-dev \
  libharfbuzz-dev libfribidi-dev libtiff5-dev libopenjp2-7-dev \
  libmagic1 nodejs npm postgresql-client fonts-noto fonts-noto-core

# rtlcss ضروري لعكس الواجهة للعربية فعلياً
sudo npm install -g --silent rtlcss

# wkhtmltopdf لطباعة PDF (اختياري — لا يوقف النشر لو فشل)
if ! command -v wkhtmltopdf >/dev/null; then
  echo "▶ محاولة تثبيت wkhtmltopdf..."
  sudo apt-get install -y -qq wkhtmltopdf || echo "  (تخطّي — التقارير ستعمل بجودة أقل)"
fi

# ---------- ٣) مستخدم النظام والمجلدات ----------
id -u isystem >/dev/null 2>&1 || sudo useradd -m -d $ODOO_HOME -s /bin/bash isystem
sudo mkdir -p $ODOO_SRC $ODOO_DATA $ODOO_ADDONS
sudo chown -R isystem:isystem $ODOO_HOME

# ---------- ٤) سورس المحرّك ----------
if [ ! -f "$ODOO_SRC/odoo-bin" ]; then
  echo "▶ تنزيل سورس المحرّك (قد يأخذ دقائق)..."
  sudo -u isystem git clone --depth 1 --branch 19.0 \
    https://github.com/odoo/odoo.git $ODOO_SRC
else
  echo "▶ السورس موجود — تحديث..."
  sudo -u isystem git -C $ODOO_SRC pull --ff-only || true
fi

# ---------- ٥) وحدة الهوية من مستودعك ----------
echo "▶ نسخ وحدة الهوية is_brand..."
sudo rm -rf $ODOO_ADDONS/is_brand
sudo cp -R "$HERE/../odoo-addons/is_brand" $ODOO_ADDONS/
sudo chown -R isystem:isystem $ODOO_ADDONS

# ---------- ٦) بيئة بايثون ----------
if [ ! -x "$ODOO_VENV/bin/python" ]; then
  echo "▶ إنشاء بيئة بايثون..."
  sudo -u isystem python3 -m venv $ODOO_VENV
fi
echo "▶ تثبيت مكتبات المحرّك (الأطول — اصبر)..."
sudo -u isystem $ODOO_VENV/bin/pip install --quiet --upgrade pip wheel setuptools
sudo -u isystem $ODOO_VENV/bin/pip install --quiet -r $ODOO_SRC/requirements.txt

# ---------- ٧) الإعدادات ----------
echo "▶ كتابة ملف الإعدادات..."
MASTER_PWD="$(openssl rand -base64 24 | tr -d '/+=' | head -c 24)"
sudo tee $CONF >/dev/null <<EOF
[options]
; نظام إبراهيم سعود — إعدادات الإنتاج
admin_passwd = $MASTER_PWD

; --- قاعدة البيانات: Supabase (مخطّط odoo المعزول) ---
db_host = $SUPABASE_HOST
db_port = ${SUPABASE_PORT:-5432}
db_user = $SUPABASE_USER
db_password = $SUPABASE_PASSWORD
db_name = ${SUPABASE_DB:-postgres}
db_sslmode = require
db_maxconn = ${DB_MAXCONN:-8}
list_db = False

; --- المسارات ---
addons_path = $ODOO_SRC/addons,$ODOO_ADDONS
data_dir = $ODOO_DATA

; --- الخادم (خلف Caddy) ---
http_interface = 127.0.0.1
http_port = 8069
gevent_port = 8072
proxy_mode = True
workers = ${WORKERS:-4}
max_cron_threads = 1
limit_time_cpu = 600
limit_time_real = 1200
limit_memory_soft = 1400000000
limit_memory_hard = 1800000000
log_level = info
logfile = $ODOO_DATA/isystem.log
EOF
sudo chown isystem:isystem $CONF
sudo chmod 640 $CONF

# ---------- ٨) تهيئة قاعدة البيانات (أول مرة فقط) ----------
DBNAME="${SUPABASE_DB:-postgres}"
ALREADY=$(PGPASSWORD="$SUPABASE_PASSWORD" psql "sslmode=require host=$SUPABASE_HOST port=${SUPABASE_PORT:-5432} user=$SUPABASE_USER dbname=$DBNAME" \
  -tAc "select count(*) from information_schema.tables where table_schema='odoo' and table_name='ir_module_module';" 2>/dev/null || echo 0)

# sudo يمسح متغيّرات البيئة، فنمرّر PGOPTIONS صراحة عبر env
RUN_ODOO="sudo -u isystem env PGOPTIONS=$PGOPTIONS $ODOO_VENV/bin/python $ODOO_SRC/odoo-bin -c $CONF"

if [ "$ALREADY" = "0" ]; then
  echo "▶ تهيئة النظام لأول مرة داخل مخطّط odoo (١٠–٢٠ دقيقة)..."
  $RUN_ODOO -d "$DBNAME" --without-demo=all --load-language=ar_001 --stop-after-init \
    -i base,contacts,crm,sale_management,sale_timesheet,purchase,stock,account,l10n_sa,l10n_sa_edi,point_of_sale,l10n_sa_pos,project,hr,hr_timesheet,calendar,is_brand
  echo "✓ تمت التهيئة"
else
  echo "▶ النظام مُهيّأ مسبقاً — تحديث وحدة الهوية فقط"
  $RUN_ODOO -d "$DBNAME" -u is_brand --stop-after-init
fi

# ---------- ٨.١) فحص أمني: هل نزلت الجداول في المكان الصحيح؟ ----------
echo "▶ فحص أمني للعزل..."
PSQL_URI="sslmode=require host=$SUPABASE_HOST port=${SUPABASE_PORT:-5432} user=$SUPABASE_USER dbname=$DBNAME"
IN_ODOO=$(PGPASSWORD="$SUPABASE_PASSWORD" psql "$PSQL_URI" -tAc \
  "select count(*) from information_schema.tables where table_schema='odoo';")
LEAKED=$(PGPASSWORD="$SUPABASE_PASSWORD" psql "$PSQL_URI" -tAc \
  "select count(*) from information_schema.tables where table_schema='public' and table_name like 'ir\_%';")

echo "   جداول النظام داخل مخطّط odoo: $IN_ODOO"
if [ "${LEAKED:-0}" != "0" ]; then
  echo ""
  echo "✗✗ توقّف: تسرّبت $LEAKED من جداول النظام إلى مخطّط public المكشوف للإنترنت."
  echo "   لا تكمل. أوقف الخدمة وراجع إعداد PGOPTIONS قبل أي شيء آخر."
  sudo systemctl stop isystem 2>/dev/null || true
  exit 1
fi
echo "   ✓ لا تسرّب إلى public"

# ---------- ٩) خدمة تعمل دائماً ----------
echo "▶ تسجيل الخدمة..."
sudo tee $SERVICE >/dev/null <<EOF
[Unit]
Description=نظام إبراهيم سعود
After=network.target

[Service]
Type=simple
User=isystem
# عزل مخطّط قاعدة البيانات — لا تحذف هذا السطر
Environment=PGOPTIONS=-c search_path=odoo,public
ExecStart=$ODOO_VENV/bin/python $ODOO_SRC/odoo-bin -c $CONF
Restart=always
RestartSec=5
KillMode=mixed

[Install]
WantedBy=multi-user.target
EOF
sudo systemctl daemon-reload
sudo systemctl enable --now isystem
sleep 8

# ---------- ١٠) HTTPS عبر Caddy ----------
if ! command -v caddy >/dev/null; then
  echo "▶ تثبيت Caddy (شهادة HTTPS تلقائية)..."
  sudo apt-get install -y -qq debian-keyring debian-archive-keyring apt-transport-https
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' \
    | sudo gpg --batch --yes --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' \
    | sudo tee /etc/apt/sources.list.d/caddy-stable.list >/dev/null
  sudo apt-get update -qq && sudo apt-get install -y -qq caddy
fi

sudo tee /etc/caddy/Caddyfile >/dev/null <<EOF
$DOMAIN {
    encode gzip zstd

    # قناة التحديث اللحظي
    handle /websocket {
        reverse_proxy 127.0.0.1:8072
    }
    handle /longpolling/* {
        reverse_proxy 127.0.0.1:8072
    }
    handle {
        reverse_proxy 127.0.0.1:8069
    }

    header {
        Strict-Transport-Security "max-age=31536000;"
        X-Content-Type-Options "nosniff"
        X-Frame-Options "SAMEORIGIN"
    }
}
EOF
sudo systemctl reload caddy || sudo systemctl restart caddy

# ---------- ١١) فتح المنافذ في جدار الخادم ----------
echo "▶ فتح منفذي 80 و443..."
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT || true
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT || true
sudo netfilter-persistent save >/dev/null 2>&1 || sudo apt-get install -y -qq iptables-persistent

# ---------- تم ----------
cat <<EOF

═══════════════════════════════════════════════
 ✓ النظام يعمل الآن

   العنوان        : https://$DOMAIN
   كلمة السر الرئيسية: $MASTER_PWD
   (محفوظة في $CONF)

 أوامر مفيدة:
   sudo systemctl status isystem     الحالة
   sudo systemctl restart isystem    إعادة تشغيل
   sudo tail -f $ODOO_DATA/isystem.log   السجل

 ⚠️ تذكّر: افتح 80 و443 في قائمة أمان الشبكة (VCN)
    من لوحة تحكّم Oracle أيضاً، وإلا لن يفتح الموقع.
═══════════════════════════════════════════════
EOF
