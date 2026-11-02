#!/usr/bin/env python3
"""نسخ العرض الحيّة على ibrahimsaud.com/demo/ — كلّها بالوضع التجريبيّ (البيانات في متصفّح الزائر، بلا قاعدة بيانات)،
وبشريط معاينة بهويّة إبراهيم.
- nasaq: نظام إبراهيم نفسه (public/app) بلا قاعدة بيانات، ببيانات عامّة (tools/nasaq-demo/demo-pre.js وdemo-post.js).
- ruso وmanabir وtakamul: أعمال لعملائه، من معرض الأعمال في ~/التقنية_نظام/works.
الاستخدام (من جذر الموقع): python3 tools/build-demos.py"""
import os, re, shutil, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.expanduser('~/التقنية_نظام/works')
DST = os.path.join(ROOT, 'public', 'demo')
DEMOS = ['ruso', 'manabir', 'takamul']
APP = os.path.join(ROOT, 'public', 'app')
SKIP = shutil.ignore_patterns('.git', '*.py', '*.md', '*.sql', '_headers', '.DS_Store')

def rd(p): return open(p, encoding='utf-8').read()
def wr(p, s): open(p, 'w', encoding='utf-8').write(s)

if os.path.exists(DST):
    for d in os.listdir(DST):
        if d != 'bar.js': shutil.rmtree(os.path.join(DST, d), ignore_errors=True)
os.makedirs(DST, exist_ok=True)
for d in DEMOS:
    shutil.copytree(os.path.join(SRC, d), os.path.join(DST, d), ignore=SKIP)

for dp, _, fs in os.walk(DST):
    for f in fs:
        if not f.endswith(('.html', '.js', '.webmanifest', '.css')) or f == 'bar.js': continue
        p = os.path.join(dp, f); s = rd(p); o = s
        s = s.replace('/works/preview-bar.js', '/demo/bar.js').replace('/works/erp/', '/demo/nasaq/').replace('/works/', '/demo/')
        s = s.replace('#mnwbar', '#isbar').replace('bottom:58px', 'bottom:70px').replace('bottom:74px', 'bottom:86px').replace('bottom:84px', 'bottom:96px')
        s = s.replace('ERP مِنوال — نسخة عرض', 'نَسَق — نسخة عرض').replace('data-name="ERP مِنوال"', 'data-name="نَسَق"')
        s = s.replace('معاينة في مِنوال', 'معاينة').replace('معرض أعمال مِنوال', 'أعمال إبراهيم سعود').replace('demo@minwal.tech', 'demo@ibrahimsaud.com')
        s = s.replace("'/assets/logo-black.png'", "'/v2/ibrahim-saud-logo-black-tight.png'").replace("'/assets/logo-white.png'", "'/v2/ibrahim-saud-logo-white-tight.png'")
        if f.endswith('.html') and 'name="robots"' not in s:
            s = s.replace('<head>', '<head>\n<meta name="robots" content="noindex,nofollow">', 1)
        if s != o: wr(p, s)

# ===== نَسَق: نسخة من نظام إبراهيم =====
NQ = os.path.join(DST, 'nasaq')
shutil.copytree(APP, NQ, ignore=shutil.ignore_patterns('3d', '*.md', 'b.html', 'r.html', '.DS_Store'))
for f in ('demo-pre.js', 'demo-post.js'): shutil.copy(os.path.join(ROOT, 'tools', 'nasaq-demo', f), NQ)
p = os.path.join(NQ, 'js', '01-core.js'); s = rd(p)
for a, b in [(re.search(r"const SUPA_URL='[^']*';", s).group(0), "const SUPA_URL='https://demo.invalid';"),  # بلا قاعدة بيانات إطلاقاً
             (re.search(r"const SUPA_KEY='[^']*';", s).group(0), "const SUPA_KEY='demo';"),
             ("const KEY='ibsaud_erp_v1';", "const KEY='nasaq_demo_v1';")]:
    assert a in s, a; s = s.replace(a, b)
wr(p, s)
# تنظيف: لا مسار النظام الحقيقيّ ولا بيانات إبراهيم الخاصّة في كود العرض (طلبه للحماية)
for dp, _, fs in os.walk(NQ):
    for f in fs:
        if not f.endswith(('.js', '.html')): continue
        p = os.path.join(dp, f); s = rd(p); o = s
        for a, b in [('ibrahimsaud.com/app', 'نَسَق'), ('(/app/3d/)', ''), ('SA8810000001400036240910', 'SA0000000000000000000000'),
                     ('ibrahimsaud25@gmail.com', 'demo@ibrahimsaud.com'), ('966504895213', '966500000000')]:
            s = s.replace(a, b)
        if f == '01-core.js':
            s = re.sub(r"const LOGO='[^']*';", "const LOGO='/v2/ibrahim-saud-logo-white-tight.png';", s)  # شعار من الموقع بدل رابط GitHub
            s = re.sub(r"\n  subscriptions:\[\n.*?\n  \],", "\n  subscriptions:[],", s, count=1, flags=re.S)  # اشتراكات وأقساط إبراهيم
        s = re.sub(r"دخل شهري ثابت[^'\"]*", '', s)  # ملاحظة رؤية شخصيّة
        if s != o: wr(p, s)
p = os.path.join(NQ, 'index.html'); s = rd(p)
s = s.replace('<head>', '<head>\n<meta name="robots" content="noindex,nofollow">', 1)
s = re.sub(r'<title>.*?</title>', '<title>نَسَق — نسخة عرض</title>', s, count=1)
s = re.sub(r'<a[^>]*href="\./3d/"[^>]*>.*?</a>', '', s, count=1, flags=re.S)  # الاستوديو 3D أداة خاصّة
s = s.replace('<script src="./js/99-boot.js', '<script src="./demo-pre.js"></script>\n<script src="./js/99-boot.js', 1)
s = s.replace('</body>', '<style>body:has(#isbar) .fab-desk{bottom:84px!important}</style>\\n<script src="./demo-post.js"></script>\n<script src="/demo/bar.js" data-name="نَسَق"></script>\n</body>', 1)
wr(p, s)
total = sum(os.path.getsize(os.path.join(dp, f)) for dp, _, fs in os.walk(DST) for f in fs)
print(f'✓ {DST} ({total / 1e6:.1f} MB)')
