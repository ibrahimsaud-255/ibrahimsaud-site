#!/usr/bin/env node
/**
 * فحص سلامة بيانات «مسارك».
 *
 *   node scripts/masarak-check.mjs
 *
 * شغّله بعد أي تعديل على ملفات `src/masarak/data/`. يكتشف الأخطاء التي
 * لا يلتقطها المدقّق اللغوي لأنها منطقية لا نحوية:
 *
 *   • تخصص بلا بصمة شخصية  → يظهر للطالب بلا نسبة توافق
 *   • بصمة لتخصص محذوف     → بيانات ميتة
 *   • تخصص لا تدرّسه جامعة  → لن يظهر أبداً
 *   • معادلة مجموع أوزانها ليس ١٠٠ → نسبة موزونة خاطئة
 *   • اختلال توازن بنود الاختبار → درجات منحازة لنمط
 *
 * يخرج برمز ١ عند أي خطأ ليصلح للاستخدام في CI.
 */

import { readFileSync } from "node:fs";

const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");

const majors = read("src/masarak/data/majors.ts");
const fit = read("src/masarak/data/majorFit.ts");
const unis = read("src/masarak/data/universities.ts");
const inst = read("src/masarak/data/instrument.ts");

const problems = [];
const notes = [];

const dup = (a) => [...new Set(a.filter((v, i) => a.indexOf(v) !== i))];
const tally = (a) => a.reduce((o, k) => ((o[k] = (o[k] || 0) + 1), o), {});

/* ── التخصصات وبصماتها ── */

const majorIds = [...majors.matchAll(/^ {4}id: "([a-z]+)",/gm)].map((m) => m[1]);
const fitIds = [...fit.matchAll(/^ {2}([a-z]+): \{ riasec/gm)].map((m) => m[1]);

if (dup(majorIds).length) problems.push(`معرّف تخصص مكرّر: ${dup(majorIds).join(", ")}`);

const noFit = majorIds.filter((id) => !fitIds.includes(id));
if (noFit.length) problems.push(`تخصصات بلا بصمة في majorFit.ts: ${noFit.join(", ")}`);

const orphan = fitIds.filter((id) => !majorIds.includes(id));
if (orphan.length) problems.push(`بصمات لتخصصات غير موجودة: ${orphan.join(", ")}`);

/* ── هل تدرّسه جامعة؟ ── */

const mentioned = new Set([...unis.matchAll(/"([a-z]+)"/g)].map((m) => m[1]));
const unoffered = majorIds.filter((id) => !mentioned.has(id));
if (unoffered.length)
  problems.push(`تخصصات لا تدرّسها أي جامعة (لن تظهر): ${unoffered.join(", ")}`);

/* ── أوزان المعادلات ── */

const rules = [...unis.matchAll(/weights: \{ hs: (\d+), qud: (\d+), tah: (\d+) \}/g)];
const badRules = rules
  .map((r) => [+r[1], +r[2], +r[3]])
  .filter((w) => w[0] + w[1] + w[2] !== 100);
if (badRules.length)
  problems.push(
    `معادلات مجموع أوزانها ليس ١٠٠: ${badRules.map((w) => w.join("/")).join("، ")}`
  );

/* ── بنود الاختبار ── */

const interestIds = [...inst.matchAll(/\{ id: "([a-z]\d+)", type:/g)].map((m) => m[1]);
const anchorIds = [...inst.matchAll(/\{ id: "(v\d+)", anchor:/g)].map((m) => m[1]);
const allItemIds = [...interestIds, ...anchorIds];
if (dup(allItemIds).length)
  problems.push(`معرّف بند مكرّر: ${dup(allItemIds).join(", ")}`);

const byType = tally([...inst.matchAll(/type: "([RIASEC])"/g)].map((m) => m[1]));
const typeCounts = Object.values(byType);
if (Object.keys(byType).length !== 6)
  problems.push(`أنماط هولاند الموجودة ${Object.keys(byType).length} لا ٦`);
if (new Set(typeCounts).size !== 1)
  problems.push(`بنود الميول غير متوازنة بين الأنماط: ${JSON.stringify(byType)}`);

const byAnchor = tally([...inst.matchAll(/anchor: "([a-z]+)"/g)].map((m) => m[1]));
if (Object.keys(byAnchor).length !== 9)
  problems.push(`القيم المهنية الموجودة ${Object.keys(byAnchor).length} لا ٩`);
if (new Set(Object.values(byAnchor)).size !== 1)
  problems.push(`بنود القيم غير متوازنة: ${JSON.stringify(byAnchor)}`);

/* ── رموز هولاند في البصمات ── */

for (const m of fit.matchAll(/^ {2}([a-z]+): \{ riasec: \[([^\]]+)\]/gm)) {
  const letters = m[2].match(/"([RIASEC])"/g)?.map((s) => s.replace(/"/g, "")) ?? [];
  if (letters.length !== 3)
    problems.push(`${m[1]}: رمز هولاند يجب أن يكون ثلاثة أحرف`);
  else if (new Set(letters).size !== 3)
    problems.push(`${m[1]}: رمز هولاند فيه حرف مكرّر (${letters.join("")})`);
}

/* ── ملاحظات (ليست أخطاء) ── */

const officialCount = (unis.match(/confidence: "official"/g) || []).length;
const uniCount = [...unis.matchAll(/^ {4}id: "([a-z-]+)",/gm)].length;
notes.push(`${uniCount} جامعة · ${majorIds.length} تخصصاً · ${allItemIds.length} بنداً`);
notes.push(`معادلات مؤكّدة رسمياً: ${officialCount} من ${uniCount}`);

const withKnown = (unis.match(/knownCutoffs:/g) || []).length;
notes.push(`جامعات لها نسب قبول رسمية: ${withKnown} — كلّما زادت زادت الدقّة`);

/* ── التقرير ── */

for (const n of notes) console.log(`  ${n}`);
console.log("");

if (problems.length === 0) {
  console.log("✓ البيانات سليمة.");
  process.exit(0);
}

console.error(`✗ ${problems.length} مشكلة:\n`);
for (const p of problems) console.error(`  • ${p}`);
process.exit(1);
