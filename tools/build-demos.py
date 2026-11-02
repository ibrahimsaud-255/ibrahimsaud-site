#!/usr/bin/env python3
"""نسخ العرض الحيّة على ibrahimsaud.com/demo/ — من معرض الأعمال في ~/التقنية_نظام/works.
كلّها بالوضع التجريبيّ (البيانات في متصفّح الزائر، بلا قاعدة بيانات)، وبشريط معاينة بهويّة إبراهيم.
الاستخدام (من جذر الموقع): python3 tools/build-demos.py"""
import os, re, shutil, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.expanduser('~/التقنية_نظام/works')
DST = os.path.join(ROOT, 'public', 'demo')
DEMOS = ['erp', 'ruso', 'manabir', 'takamul']
SKIP = shutil.ignore_patterns('.git', '*.py', '*.md', '*.sql', '_headers', '.DS_Store')
RENAME = {'erp': 'diwan'}  # «ERP مِنوال» صار «ديوان»

def rd(p): return open(p, encoding='utf-8').read()
def wr(p, s): open(p, 'w', encoding='utf-8').write(s)

if os.path.exists(DST):
    for d in os.listdir(DST):
        if d != 'bar.js': shutil.rmtree(os.path.join(DST, d), ignore_errors=True)
os.makedirs(DST, exist_ok=True)
for d in DEMOS:
    shutil.copytree(os.path.join(SRC, d), os.path.join(DST, RENAME.get(d, d)), ignore=SKIP)

for dp, _, fs in os.walk(DST):
    for f in fs:
        if not f.endswith(('.html', '.js', '.webmanifest', '.css')) or f == 'bar.js': continue
        p = os.path.join(dp, f); s = rd(p); o = s
        s = s.replace('/works/preview-bar.js', '/demo/bar.js').replace('/works/erp/', '/demo/diwan/').replace('/works/', '/demo/')
        s = s.replace('#mnwbar', '#isbar').replace('bottom:58px', 'bottom:70px').replace('bottom:74px', 'bottom:86px').replace('bottom:84px', 'bottom:96px')
        s = s.replace('ERP مِنوال — نسخة عرض', 'ديوان — نسخة عرض').replace('data-name="ERP مِنوال"', 'data-name="ديوان"')
        s = s.replace('معاينة في مِنوال', 'معاينة').replace('معرض أعمال مِنوال', 'أعمال إبراهيم سعود').replace('demo@minwal.tech', 'demo@ibrahimsaud.com')
        s = s.replace("'/assets/logo-black.png'", "'/v2/ibrahim-saud-logo-black-tight.png'").replace("'/assets/logo-white.png'", "'/v2/ibrahim-saud-logo-white-tight.png'")
        if f.endswith('.html') and 'name="robots"' not in s:
            s = s.replace('<head>', '<head>\n<meta name="robots" content="noindex,nofollow">', 1)
        if s != o: wr(p, s)

# شريط ديوان: الواجهة/لوحة التحكّم غير موجودة في ERP (نظام فقط)
p = os.path.join(DST, 'diwan', 'index.html'); s = rd(p)
s = s.replace('data-name="ديوان"', 'data-name="ديوان" data-dash="/demo/diwan/index.html"')
wr(p, s)
total = sum(os.path.getsize(os.path.join(dp, f)) for dp, _, fs in os.walk(DST) for f in fs)
print(f'✓ {DST} ({total / 1e6:.1f} MB)')
