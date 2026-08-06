#!/usr/bin/env node
/**
 * جلب شعارات الجامعات الرسمية وحفظها في public/masarak/logos،
 * ثم توليد خريطة الملفات في src/masarak/data/logos.ts.
 *
 *   node scripts/masarak-logos.mjs
 *
 * ترتيب المصادر لكل جامعة:
 *   ١. ويكي بيانات — الخاصية P154 «صورة الشعار» (الأدقّ)
 *   ٢. صور المقالة التي يحمل اسمها كلمة logo/شعار/seal
 *   ٣. صورة المقالة الرئيسية — وتُقبل فقط إن كانت صغيرة (شعار لا صورة حرم)
 *
 * تُحمَّل دائماً نسخة مصغّرة بعرض ٥١٢ بكسل، فتخرج كل الملفات بحجم معقول
 * وبصيغة نقطية موحّدة حتى لو كان الأصل SVG.
 *
 * الشعارات ملك لأصحابها وتُستخدم للتعريف بالجامعات داخل المنصة.
 */

import { writeFile, mkdir, rm } from "node:fs/promises";
import { createHash } from "node:crypto";
import { join } from "node:path";

const OUT = "public/masarak/logos";
const UA = "masarak-logo-fetch/2.0 (https://ibrahimsaud.com)";
const THUMB_WIDTH = 512;

/** المعرّف داخل المنصة → [عنوان المقالة العربية، عنوان المقالة الإنجليزية] */
const TITLES = {
  ksu: ["جامعة الملك سعود", "King Saud University"],
  imamu: ["جامعة الإمام محمد بن سعود الإسلامية", "Imam Muhammad ibn Saud Islamic University"],
  pnu: ["جامعة الأميرة نورة بنت عبد الرحمن", "Princess Nourah bint Abdulrahman University"],
  ksauhs: ["جامعة الملك سعود بن عبد العزيز للعلوم الصحية", "King Saud bin Abdulaziz University for Health Sciences"],
  psau: ["جامعة الأمير سطام بن عبد العزيز", "Prince Sattam bin Abdulaziz University"],
  mu: ["جامعة المجمعة", "Majmaah University"],
  su: ["جامعة شقراء", "Shaqra University"],
  seu: ["الجامعة السعودية الإلكترونية", "Saudi Electronic University"],
  kau: ["جامعة الملك عبد العزيز", "King Abdulaziz University"],
  uqu: ["جامعة أم القرى", "Umm al-Qura University"],
  uj: ["جامعة جدة", "University of Jeddah"],
  tu: ["جامعة الطائف", "Taif University"],
  taibahu: ["جامعة طيبة", "Taibah University"],
  iu: ["الجامعة الإسلامية بالمدينة المنورة", "Islamic University of Madinah"],
  kfupm: ["جامعة الملك فهد للبترول والمعادن", "King Fahd University of Petroleum and Minerals"],
  iau: ["جامعة الإمام عبد الرحمن بن فيصل", "Imam Abdulrahman Bin Faisal University"],
  kfu: ["جامعة الملك فيصل", "King Faisal University"],
  uohb: ["جامعة حفر الباطن", "University of Hafr Al Batin"],
  qu: ["جامعة القصيم", "Qassim University"],
  kku: ["جامعة الملك خالد", "King Khalid University"],
  ub: ["جامعة بيشة", "University of Bisha"],
  ut: ["جامعة تبوك", "University of Tabuk"],
  uoh: ["جامعة حائل", "University of Ha'il"],
  nbu: ["جامعة الحدود الشمالية", "Northern Border University"],
  ju: ["جامعة الجوف", "Al Jouf University"],
  jazanu: ["جامعة جازان", "Jazan University"],
  nu: ["جامعة نجران", "Najran University"],
  bu: ["جامعة الباحة", "Al Baha University"],
};

/**
 * تجاوزات يدوية — تُفحص قبل كل شيء.
 *   اسم ملف  → استخدمه مباشرةً
 *   null     → لا تبحث أصلاً، اعرض حرفَي الاسم (لأن المتاح صور مبانٍ لا شعارات)
 */
const OVERRIDES = {
  pnu: "PNU logo.png",
  su: null,      // المتاح على ويكيبيديا صورة لواجهة مبنى الجامعة
  ksauhs: null,  // لا شعار حرّ متاح
  psau: null,    // لا شعار حرّ متاح
  ju: null,      // لا شعار حرّ متاح
};

const LOGOISH = /(logo|شعار|seal|crest|emblem)/i;

/**
 * صور واجهة ويكيبيديا التي تظهر في كل مقالة (أيقونات القوالب والتذييل).
 * بدون هذا الفلتر يلتقط السكربت شعار ويكيبيديا نفسه لكل الجامعات.
 */
const CHROME = new RegExp(
  [
    // واجهة ويكي والقوالب
    "wikimedia", "wikipedia", "wikidata", "wikisource", "wikiquote",
    "wiktionary", "commons", "meta-wiki", "mediawiki", "oojs", "ambox",
    "imbox", "edit-", "question_book", "padlock", "symbol", "crystal",
    "nuvola", "gnome-", "folder", "magnify", "disambig", "portal", "stub",
    "picto infobox", "info simple", "pix\\.gif", "twemoji", "p education",
    "sciences humaines",
    // شعارات شبكات اجتماعية تظهر في صناديق المعلومات
    "x logo", "twitter", "facebook", "instagram", "youtube", "linkedin",
    "snapchat", "telegram", "tiktok",
    // رموز الدولة العامة
    "flag of", "emblem of saudi", "coat of arms",
  ].join("|"),
  "i"
);

async function json(url) {
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

const api = (host, params) =>
  `https://${host}/w/api.php?format=json&origin=*&` +
  new URLSearchParams({ ...params }).toString();

/** معرّف ويكي بيانات للمقالة */
async function wikidataId(title, lang) {
  const data = await json(
    api(`${lang}.wikipedia.org`, {
      action: "query",
      prop: "pageprops",
      redirects: "1",
      titles: title,
    })
  );
  for (const p of Object.values(data?.query?.pages ?? {})) {
    if (p?.pageprops?.wikibase_item) return p.pageprops.wikibase_item;
  }
  return null;
}

/** اسم ملف الشعار من الخاصية P154 */
async function logoFromWikidata(qid) {
  const data = await json(
    api("www.wikidata.org", {
      action: "wbgetclaims",
      entity: qid,
      property: "P154",
    })
  );
  const claim = data?.claims?.P154?.[0];
  const name = claim?.mainsnak?.datavalue?.value;
  return typeof name === "string" ? name : null;
}

/** اسم ملف الشعار من معامل صندوق المعلومات في نص المقالة */
async function logoFromInfobox(title, lang) {
  const data = await json(
    api(`${lang}.wikipedia.org`, {
      action: "parse",
      page: title,
      prop: "wikitext",
      redirects: "1",
    })
  );
  const text = data?.parse?.wikitext?.["*"];
  if (typeof text !== "string") return null;

  // «شعار = ملف.png» أو «logo = File.svg» فقط.
  // معاملا image/صورة يحملان صورة الحرم الجامعي لا الشعار، فلا نقرأهما.
  const params = /\|\s*(logo|شعار)\s*=\s*([^\n|}]+)/gi;
  for (const m of text.matchAll(params)) {
    const raw = m[2]
      .replace(/\[\[|\]\]/g, "")
      .replace(/^(File|Image|ملف|صورة):/i, "")
      .split("|")[0]
      .trim();
    if (/\.(png|svg|jpe?g)$/i.test(raw) && !CHROME.test(raw)) return raw;
  }
  return null;
}

/** قائمة صور المقالة بعد استبعاد صور الواجهة والقوالب */
async function articleImages(title, lang) {
  const data = await json(
    api(`${lang}.wikipedia.org`, {
      action: "query",
      prop: "images",
      imlimit: "80",
      redirects: "1",
      titles: title,
    })
  );
  const out = [];
  for (const p of Object.values(data?.query?.pages ?? {})) {
    for (const img of p?.images ?? []) {
      const name = String(img.title).replace(/^File:|^ملف:/, "");
      if (CHROME.test(name)) continue;
      if (/\.(png|svg|jpe?g)$/i.test(name)) out.push(name);
    }
  }
  return out;
}

/**
 * صورة يحمل اسمها اسم الجامعة نفسه — أقوى إشارة على الإطلاق.
 * مثال: مقالة «جامعة المجمعة» فيها «ملف:جامعة المجمعة.svg».
 */
async function logoByName(title, lang) {
  const key = title.replace(/^جامعة\s+/, "").toLowerCase();
  for (const name of await articleImages(title, lang)) {
    const stem = name.replace(/\.(png|svg|jpe?g)$/i, "").toLowerCase();
    if (stem.includes(key) || key.includes(stem)) return name;
  }
  return null;
}

/**
 * صور المقالة التي يوحي اسمها بأنها شعار **وتذكر اسم الجامعة**.
 * الشرط الثاني ضروري: مقالات الجامعات تحوي شعار المنطقة والوزارة أيضاً،
 * وبدونه يلتقط السكربت شعار «الرياض» بدل شعار جامعة الأميرة نورة.
 */
async function logoFromArticleImages(title, lang) {
  const words = title
    .replace(/^(جامعة|الجامعة|University of|The)\s+/i, "")
    .split(/\s+/)
    .filter((w) => w.length > 2)
    .map((w) => w.toLowerCase());

  for (const name of await articleImages(title, lang)) {
    if (!LOGOISH.test(name)) continue;
    const stem = name.toLowerCase();
    if (words.some((w) => stem.includes(w))) return name;
  }
  return null;
}

/** رابط نسخة مصغّرة لملف — يُجرَّب على كومنز ثم الويكي المحلية */
async function thumbUrl(fileName) {
  for (const host of ["commons.wikimedia.org", "ar.wikipedia.org", "en.wikipedia.org"]) {
    try {
      const data = await json(
        api(host, {
          action: "query",
          prop: "imageinfo",
          iiprop: "url|size",
          iiurlwidth: String(THUMB_WIDTH),
          titles: `File:${fileName}`,
        })
      );
      for (const p of Object.values(data?.query?.pages ?? {})) {
        const info = p?.imageinfo?.[0];
        if (info?.thumburl) return info.thumburl;
        if (info?.url) return info.url;
      }
    } catch {
      /* نجرّب المضيف التالي */
    }
  }
  return null;
}

/** صورة المقالة الرئيسية — مقبولة فقط إن كانت صغيرة (شعار غالباً) */
async function smallPageImage(title, lang) {
  const data = await json(
    api(`${lang}.wikipedia.org`, {
      action: "query",
      prop: "pageimages",
      piprop: "thumbnail|original",
      pithumbsize: String(THUMB_WIDTH),
      redirects: "1",
      titles: title,
    })
  );
  for (const p of Object.values(data?.query?.pages ?? {})) {
    const orig = p?.original;
    // صور الحرم الجامعي عريضة؛ الشعارات مربّعة تقريباً
    if (orig?.width && orig?.height && orig.width / orig.height > 1.6) continue;
    if (p?.thumbnail?.source) return p.thumbnail.source;
  }
  return null;
}

const extOf = (url) => {
  const m = url.split("?")[0].match(/\.(png|jpe?g|svg|webp)$/i);
  return m ? m[1].toLowerCase().replace("jpeg", "jpg") : "png";
};

async function resolve(id, [ar, en]) {
  // ٠) تجاوز يدوي
  if (id in OVERRIDES) {
    if (OVERRIDES[id] === null) return null;
    const url = await thumbUrl(OVERRIDES[id]);
    if (url) return { url, via: "override" };
  }

  // ١) ويكي بيانات
  for (const [title, lang] of [[ar, "ar"], [en, "en"]]) {
    try {
      const qid = await wikidataId(title, lang);
      if (!qid) continue;
      const file = await logoFromWikidata(qid);
      if (!file) continue;
      const url = await thumbUrl(file);
      if (url) return { url, via: "wikidata" };
    } catch {
      /* المصدر التالي */
    }
  }

  // ٢) معامل الشعار في صندوق معلومات المقالة
  for (const [title, lang] of [[ar, "ar"], [en, "en"]]) {
    try {
      const file = await logoFromInfobox(title, lang);
      if (!file) continue;
      const url = await thumbUrl(file);
      if (url) return { url, via: "infobox" };
    } catch {
      /* المصدر التالي */
    }
  }

  // ٣) صورة تحمل اسم الجامعة
  for (const [title, lang] of [[ar, "ar"], [en, "en"]]) {
    try {
      const file = await logoByName(title, lang);
      if (!file) continue;
      const url = await thumbUrl(file);
      if (url) return { url, via: "byname" };
    } catch {
      /* المصدر التالي */
    }
  }

  // ٤) صور المقالة التي اسمها يوحي بشعار — تُقبل فقط إن ذكرت اسم الجامعة،
  //    وإلا التقطنا شعار المنطقة أو الوزارة الظاهر في نفس المقالة.
  for (const [title, lang] of [[ar, "ar"], [en, "en"]]) {
    try {
      const file = await logoFromArticleImages(title, lang);
      if (!file) continue;
      const url = await thumbUrl(file);
      if (url) return { url, via: "article" };
    } catch {
      /* المصدر التالي */
    }
  }

  // ٥) صورة المقالة الرئيسية إن كانت بنسبة شعار
  for (const [title, lang] of [[ar, "ar"], [en, "en"]]) {
    try {
      const url = await smallPageImage(title, lang);
      if (url) return { url, via: "pageimage" };
    } catch {
      /* انتهت المصادر */
    }
  }

  return null;
}

async function main() {
  await rm(OUT, { recursive: true, force: true });
  await mkdir(OUT, { recursive: true });

  const map = {};
  const missing = [];
  const seen = new Map();

  for (const [id, titles] of Object.entries(TITLES)) {
    let found = null;
    try {
      found = await resolve(id, titles);
    } catch {
      found = null;
    }

    if (!found) {
      missing.push(id);
      console.log(`✗ ${id.padEnd(9)} — لم يُعثر على شعار`);
      continue;
    }

    try {
      const res = await fetch(found.url, { headers: { "User-Agent": UA } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());

      // حارس أخير: لو نزل الملف نفسه لجامعتين فهو صورة مشتركة لا شعاراً
      const hash = createHash("md5").update(buf).digest("hex");
      if (seen.has(hash)) {
        missing.push(id);
        console.log(`✗ ${id.padEnd(9)} — صورة مكرّرة مع ${seen.get(hash)}، تُرفض`);
        continue;
      }
      seen.set(hash, id);

      const file = `${id}.${extOf(found.url)}`;
      await writeFile(join(OUT, file), buf);
      map[id] = file;
      console.log(
        `✓ ${id.padEnd(9)} — ${file.padEnd(12)} ${String(Math.round(buf.length / 1024)).padStart(4)}kB  [${found.via}]`
      );
    } catch (e) {
      missing.push(id);
      console.log(`✗ ${id.padEnd(9)} — فشل التحميل: ${e.message}`);
    }
  }

  const ts =
    "// مولَّد بواسطة scripts/masarak-logos.mjs — لا تحرّره يدوياً.\n" +
    "// المعرّف → اسم ملف الشعار داخل public/masarak/logos.\n" +
    "// الجامعات غير المذكورة هنا تظهر بحرفين من اسمها على لون هويتها.\n" +
    `export const LOGO_FILES: Record<string, string> = ${JSON.stringify(map, null, 2)};\n`;
  await writeFile("src/masarak/data/logos.ts", ts);

  console.log(`\nتم: ${Object.keys(map).length} شعاراً من ${Object.keys(TITLES).length}.`);
  if (missing.length) console.log(`بلا شعار (ستظهر بالأحرف): ${missing.join(", ")}`);
}

main();
