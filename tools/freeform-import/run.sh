#!/bin/zsh
# تحويل لوحات Freeform (المصدَّرة PDF) إلى ملف استيراد لنظام إبراهيم.
# الاستخدام: ./run.sh <مجلد-ملفات-PDF> [ملف-الإخراج]
set -e
DIR=${0:A:h}
SRC=${1:?ضع مسار مجلد ملفات PDF}
OUT=${2:-$SRC/freeform-boards.json}
[[ -x $DIR/ocr ]] || swiftc -O $DIR/ocr.swift -o $DIR/ocr
python3 -c "import fitz" 2>/dev/null || python3 -m pip install --user pymupdf
python3 $DIR/ff2board.py "$SRC" "$OUT"
echo "جاهز: $OUT — افتح النظام ← الخرائط الذهنية ← «استيراد» واختر الملف."
