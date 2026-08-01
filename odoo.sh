#!/usr/bin/env bash
# تشغيل نظام أودو — إبراهيم سعود
# الاستخدام:
#   ./odoo.sh            تشغيل النظام (يفتح المتصفح)
#   ./odoo.sh stop       إيقاف النظام
#   ./odoo.sh restart    إعادة تشغيل
#   ./odoo.sh update <وحدة>   تحديث وحدة (مثل: ./odoo.sh update is_brand)
#   ./odoo.sh log        متابعة السجل مباشرة
#   ./odoo.sh shell      صدفة بايثون داخل النظام

set -e
cd "$(dirname "$0")"

PGBIN="/Applications/Postgres.app/Contents/Versions/16/bin"
PGDATA="$HOME/Library/Application Support/Postgres/var-16"
PY="./odoo-venv/bin/python"
ODOO="./odoo-19.0/odoo-bin"
CONF="./odoo.conf"
DB="ibrahimsaud"
URL="http://127.0.0.1:8069"

start_pg() {
  if ! "$PGBIN/pg_isready" -q -p 5432 2>/dev/null; then
    echo "▶ تشغيل قاعدة البيانات..."
    "$PGBIN/pg_ctl" -D "$PGDATA" -l "$PGDATA/postgres.log" -o "-p 5432" start >/dev/null
    sleep 2
  fi
}

stop_odoo() {
  pkill -f "odoo-bin -c $CONF" 2>/dev/null && echo "■ أُوقف أودو." || echo "أودو غير مُشغَّل."
}

case "${1:-start}" in
  stop)
    stop_odoo
    ;;

  restart)
    stop_odoo; sleep 2; exec "$0" start
    ;;

  update)
    [ -z "$2" ] && { echo "حدّد اسم الوحدة: ./odoo.sh update is_brand"; exit 1; }
    start_pg; stop_odoo; sleep 2
    echo "▶ تحديث الوحدة: $2"
    $PY $ODOO -c $CONF -d $DB -u "$2" --stop-after-init
    echo "✓ تم. شغّل النظام بـ ./odoo.sh"
    ;;

  log)
    tail -f odoo-data/odoo.log
    ;;

  shell)
    start_pg
    $PY $ODOO shell -c $CONF -d $DB --no-http
    ;;

  start)
    start_pg
    if curl -s -o /dev/null -m 2 "$URL/web/login" 2>/dev/null; then
      echo "أودو يعمل أصلاً: $URL"
      open "$URL/web" 2>/dev/null || true
      exit 0
    fi
    echo "▶ تشغيل نظام إبراهيم سعود..."
    nohup $PY $ODOO -c $CONF >/dev/null 2>&1 &
    for i in $(seq 1 40); do
      if curl -s -o /dev/null -m 2 "$URL/web/login" 2>/dev/null; then
        echo "✓ النظام جاهز: $URL"
        open "$URL/web" 2>/dev/null || true
        exit 0
      fi
      sleep 2
    done
    echo "✗ لم يستجب النظام. راجع السجل: ./odoo.sh log"
    exit 1
    ;;

  *)
    echo "أمر غير معروف: $1"
    grep '^#' "$0" | head -9 | sed 's/^# \{0,1\}//'
    exit 1
    ;;
esac
