#!/usr/bin/env python3
"""يولّد فهرس دروس 3D الثانويّة اللي تخدم التحصيلي العلميّ من مكتبة حروف ودروس.

المصدر: lab3d-index.json في مونوريبو حروف (الدروس الحيّة فقط)، والصور المصغّرة thumb.card.webp.
المخرَج: src/lib/tahsili-3d.json + public/tahsili/3d/<slug>.webp
أعد تشغيله كلّما زادت دروس 3D:  python3 tools/tahsili/build-3d-index.py
"""
import json, os, shutil, sys

MONO = os.path.expanduser("~/Desktop/حروف ودروس/01_الكود_والتطبيق/huroof-monorepo")
INDEX = f"{MONO}/artifacts/api-server/src/data/lab3d-index.json"
THUMBS = f"{MONO}/artifacts/huroof-wa-duroos/public/3d"
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT_JSON = f"{ROOT}/src/lib/tahsili-3d.json"
OUT_IMG = f"{ROOT}/public/tahsili/3d"

# مادّة التطبيق ← مادّة التحصيلي
SUBJECTS = {
    "الفيزياء": "physics",
    "الكيمياء": "chemistry",
    "الأحياء": "biology",
    "أنظمة جسم الإنسان": "biology",
    "الرياضيات": "math",
    "الإحصاء": "math",
}

d = json.load(open(INDEX))

# رابط الدرس: /app/3d/<page>/?<query> — page وquery من lab3d.ts (الأوضاع الفرعيّة تشترك في صفحة أمّ)
import re
SRC = open(f"{MONO}/artifacts/huroof-wa-duroos/data/lab3d.ts").read()
LINKS = {}
for blk in re.split(r"\n  \{", SRC):
    m = re.search(r'\bid: "([^"]+)"', blk)
    if not m:
        continue
    pg = re.search(r'\bpage: "([^"]+)"', blk)
    q = re.search(r'\bquery: "([^"]+)"', blk)
    LINKS[m.group(1)] = (pg.group(1) if pg else m.group(1)) + "/" + (("?" + q.group(1)) if q else "")
rows, missing = [], []
os.makedirs(OUT_IMG, exist_ok=True)
for slug, v in d.items():
    if v.get("status") != "live" or not (10 <= v.get("gradeOrder", 0) <= 12):
        continue
    subj = SUBJECTS.get(v["subject"])
    if not subj:
        continue
    thumb = v.get("thumb") or f"{slug}/thumb.jpg"
    card = os.path.join(THUMBS, thumb.replace(".jpg", ".card.webp"))
    dst = os.path.join(OUT_IMG, f"{slug}.webp")
    jpg = os.path.join(THUMBS, thumb)
    if os.path.exists(card):
        shutil.copyfile(card, dst)
    elif os.path.exists(jpg):  # أوضاع الدرس الفرعيّة لها jpg فقط
        from PIL import Image
        im = Image.open(jpg).convert("RGB"); im.thumbnail((480, 300)); im.save(dst, "WEBP", quality=72)
    elif os.path.exists(os.path.join(THUMBS, os.path.dirname(thumb), "thumb.card.webp")):  # صورة الصفحة الأمّ
        shutil.copyfile(os.path.join(THUMBS, os.path.dirname(thumb), "thumb.card.webp"), dst)
    else:
        missing.append(slug)
        continue
    rows.append({
        "slug": slug,
        "title": v["title"],
        "subject": subj,
        "grade": v["gradeOrder"],
        "unit": v.get("lesson", ""),
        "glossary": slug.startswith("terms-"),
        "href": LINKS.get(slug, slug + "/"),
    })

rows.sort(key=lambda r: (r["subject"], r["grade"], r["unit"], r["slug"]))
json.dump(rows, open(OUT_JSON, "w"), ensure_ascii=False, indent=0)
from collections import Counter
print(len(rows), "درساً", Counter(r["subject"] for r in rows), "| بلا صورة:", missing)
