// يبني www/ (ما يُحزَم داخل التطبيق) من صفحات الموقع نفسها — لا نسخة ثانية من منطق «جوّالي».
//   public/charity/season/*  ← www/season/   (عدا sw.js وmanifest: لا عامل خدمة داخل التطبيق)
//   public/charity/vendor/qrcode.min.js, assets/apps/{default,dark}/*.webp, assets/favicon.png
//   web/native.js            ← www/season/native.js (الجسر الأصليّ؛ يُحمَّل قبل jawwali.js)
//   www/index.html           ← يحوّل إلى season/
import { cpSync, rmSync, mkdirSync, readFileSync, writeFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";
import { tmpdir } from "node:os";
// المصدر = آخر commit (git archive HEAD) لا نسخة العمل: جلسات أخرى تعدّل season/ ولا يُحزَم عمل لم يُعتمد بعد.
//   JW_WORKTREE=1 npm run www  ← للتجربة المحلّيّة من نسخة العمل
const here = dirname(dirname(fileURLToPath(import.meta.url))), repo = join(here, "../.."), W = join(here, "www");
let CH = join(repo, "public/charity");
if (!process.env.JW_WORKTREE) {
  const t = join(tmpdir(), "jawwali-head"); rmSync(t, { recursive: true, force: true }); mkdirSync(t, { recursive: true });
  execSync(`git -C "${repo}" archive HEAD public/charity | tar -x -C "${t}"`);
  CH = join(t, "public/charity");
  console.log("المصدر: " + execSync(`git -C "${repo}" log --oneline -1`).toString().trim().slice(0, 60));
}
rmSync(W, { recursive: true, force: true });
mkdirSync(join(W, "season"), { recursive: true });
cpSync(join(CH, "season"), join(W, "season"), { recursive: true, filter: s => !/(sw\.js|manifest\.webmanifest)$/.test(s) });
mkdirSync(join(W, "vendor"), { recursive: true });
cpSync(join(CH, "vendor/qrcode.min.js"), join(W, "vendor/qrcode.min.js"));
for (const look of ["default", "dark"]) cpSync(join(CH, "assets/apps", look), join(W, "assets/apps", look), { recursive: true, filter: s => !/\.(png|jpg)$/.test(s) });
cpSync(join(CH, "assets/favicon.png"), join(W, "assets/favicon.png"));
cpSync(join(here, "web/native.js"), join(W, "season/native.js"));
// index.html: الجسر يحمّل jawwali.js بعد استرجاع الجلسة من سلسلة المفاتيح
let html = readFileSync(join(W, "season/index.html"), "utf8");
const m = html.match(/<script src="\.\/jawwali\.js(\?v=\d+)?"><\/script>/);
if (!m) throw new Error("لم أجد وسم jawwali.js في index.html");
html = html.replace(m[0], `<script src="./native.js" data-app="./jawwali.js${m[1] || ""}"></script>`)
  .replace(/<link rel="manifest"[^>]*>\n?/, "");
writeFileSync(join(W, "season/index.html"), html);
writeFileSync(join(W, "index.html"), `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><style>html{background:#0B0B14}</style><script>location.replace('season/index.html' + location.search)</script>`);
const n = (d) => readdirSync(d, { recursive: true }).length;
console.log(`www/ جاهز — ${n(W)} ملفّاً`);
