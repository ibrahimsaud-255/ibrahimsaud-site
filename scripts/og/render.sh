#!/bin/zsh
# يصيّر بطاقات رابط الواتساب من cards.html إلى public/og/<id>.jpg (١٢٠٠×٦٣٠).
# الاستعمال: scripts/og/render.sh            ← كلّ البطاقات
#            scripts/og/render.sh ai blog    ← بطاقات محدّدة
set -e
cd "$(dirname "$0")"
ROOT=$(cd ../.. && pwd)
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
ALL=(ai charities charity-youth-clubs charity-transparency charity-regulation jawwali content video build course ads blog)
IDS=("$@"); (( $#IDS )) || IDS=($ALL)
TMP=$(mktemp -d)
for id in $IDS; do
  "$CHROME" --headless=new --disable-gpu --hide-scrollbars --allow-file-access-from-files \
    --force-device-scale-factor=1 --window-size=1200,630 --virtual-time-budget=4000 \
    --screenshot="$TMP/$id.png" "file://$PWD/cards.html?c=$id" >/dev/null 2>&1
  sips -s format jpeg -s formatOptions 86 "$TMP/$id.png" --out "$ROOT/public/og/$id.jpg" >/dev/null
  echo "public/og/$id.jpg"
done
rm -rf "$TMP"
