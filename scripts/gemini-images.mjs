// ===================================================================
// توليد صور المتجر آلياً عبر Gemini API
//
//   GEMINI_API_KEY=... node scripts/gemini-images.mjs            # الكل
//   GEMINI_API_KEY=... node scripts/gemini-images.mjs abaya      # ما يطابق فقط
//
// يقرأ الأوامر من scripts/sarah-image-prompts.json ويحفظ كل صورة في مسارها.
// الصور تُحفظ png ثم حوّليها webp لو حبيتِ:  cwebp -q 82 x.png -o x.webp
//
// ملاحظة: يحتاج مفتاح Gemini API فعّال ووصولاً للخدمة من منطقتك.
// ===================================================================

import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname } from "node:path";

const KEY = process.env.GEMINI_API_KEY;
if (!KEY) {
  console.error("✋ ناقص المفتاح:  GEMINI_API_KEY=... node scripts/gemini-images.mjs");
  process.exit(1);
}

const MODEL = process.env.GEMINI_IMAGE_MODEL ?? "gemini-2.5-flash-image";
const filter = process.argv[2];
const items = JSON.parse(readFileSync("scripts/sarah-image-prompts.json", "utf8"));
const list = filter ? items.filter((i) => i.file.includes(filter)) : items;

console.log(`🎨 ${list.length} صورة عبر ${MODEL}\n`);

let done = 0;
let failed = 0;

for (const [i, item] of list.entries()) {
  const out = item.file.replace(/\.webp$/, ".png");
  if (existsSync(out) && !process.env.FORCE) {
    console.log(`⏭  ${i + 1}/${list.length} موجودة مسبقاً: ${out}`);
    continue;
  }

  process.stdout.write(`⏳ ${i + 1}/${list.length} ${item.title} … `);
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": KEY },
        body: JSON.stringify({
          contents: [{ parts: [{ text: item.prompt }] }],
        }),
      },
    );

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`HTTP ${res.status} — ${body.slice(0, 200)}`);
    }

    const json = await res.json();
    const parts = json?.candidates?.[0]?.content?.parts ?? [];
    const img = parts.find((p) => p.inlineData?.data);
    if (!img) throw new Error("ما رجعت صورة في الرد");

    mkdirSync(dirname(out), { recursive: true });
    writeFileSync(out, Buffer.from(img.inlineData.data, "base64"));
    console.log("✅");
    done++;
  } catch (e) {
    console.log(`❌ ${e.message}`);
    failed++;
  }

  // تهدئة بين الطلبات
  await new Promise((r) => setTimeout(r, 1200));
}

console.log(`\nتم: ${done} · فشل: ${failed}`);
if (done) {
  console.log(
    "\nبعدها: حوّلي png إلى webp، ثم بدّلي المسارات في src/lib/sarah.ts من .svg إلى .webp",
  );
}
