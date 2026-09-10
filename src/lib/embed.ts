// يحوّل أي رابط فيديو إلى رابط تضمين (embed) قابل للتشغيل داخل الموقع.
export type Embed =
  | { kind: "iframe"; src: string }
  | { kind: "video"; src: string }
  | { kind: "none" };

export function toEmbed(url: string): Embed {
  if (!url) return { kind: "none" };

  // YouTube
  const yt =
    url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{11})/);
  if (yt) return { kind: "iframe", src: `https://www.youtube.com/embed/${yt[1]}` };

  // Vimeo
  const vm = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vm) return { kind: "iframe", src: `https://player.vimeo.com/video/${vm[1]}` };

  // TikTok
  const tk = url.match(/tiktok\.com\/.*\/video\/(\d+)/);
  if (tk) return { kind: "iframe", src: `https://www.tiktok.com/embed/v2/${tk[1]}` };

  // Google Drive — يقبل روابط /file/d/ID/view و open?id=
  const gd =
    url.match(/drive\.google\.com\/file\/d\/([\w-]{20,})/) ||
    url.match(/drive\.google\.com\/open\?id=([\w-]{20,})/);
  if (gd) return { kind: "iframe", src: `https://drive.google.com/file/d/${gd[1]}/preview` };

  // ملف مباشر (mp4/webm/mov) — مثلاً من GitHub release أو raw
  if (/\.(mp4|webm|mov|m4v)(\?.*)?$/i.test(url)) return { kind: "video", src: url };

  // افتراضيًا: ضمّنه كـ iframe
  return { kind: "iframe", src: url };
}

// يرجّع رابط الصورة المصغّرة (thumbnail) للفيديو إن أمكن.
// يوتيوب: صورة عالية الجودة من CDN يوتيوب.
// قوقل درايف: نستخدم Drive Thumbnail API (يشترط أن يكون الملف «أي شخص لديه الرابط»).
export function toThumb(url: string): string | null {
  if (!url) return null;
  const yt = url.match(
    /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{11})/,
  );
  if (yt) return `https://img.youtube.com/vi/${yt[1]}/hqdefault.jpg`;
  const gd =
    url.match(/drive\.google\.com\/file\/d\/([\w-]{20,})/) ||
    url.match(/drive\.google\.com\/open\?id=([\w-]{20,})/);
  if (gd) return `https://drive.google.com/thumbnail?id=${gd[1]}&sz=w1920-h1080`;
  return null; // Vimeo / TikTok / ملف مباشر: لا صورة مصغّرة جاهزة
}
