// ╔══════════════════════════════════════════════════════════════╗
// ║  board-upload — رفع صور شريك الخريطة الذهنية (بلا حساب)        ║
// ║  الطلب: POST multipart { token, file }                         ║
// ║  يتحقّق من التوكن (رابط مفعّل وقابل للتعديل) ثم يرفع الصورة   ║
// ║  إلى task-images/shared/<id اللوحة>/ ويعيد الرابط العامّ.      ║
// ║  تُنشر بـ --no-verify-jwt (المفتاح العلنيّ ليس JWT).            ║
// ╚══════════════════════════════════════════════════════════════╝
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const TYPES: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif" };
const MAX = 8 * 1024 * 1024;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json" } });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ ok: false, err: "method" }, 405);
  try {
    const form = await req.formData();
    const token = String(form.get("token") || "");
    const file = form.get("file");
    if (!/^[0-9a-f]{20,64}$/.test(token) || !(file instanceof File)) return json({ ok: false, err: "bad_request" }, 400);
    const ext = TYPES[file.type];
    if (!ext) return json({ ok: false, err: "type" }, 415);
    if (file.size > MAX) return json({ ok: false, err: "too_large" }, 413);

    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: row } = await sb.from("shared_boards").select("id,enabled,can_edit").eq("token", token).maybeSingle();
    if (!row || !row.enabled || !row.can_edit) return json({ ok: false, err: "forbidden" }, 403);

    const path = `shared/${row.id}/${crypto.randomUUID()}.${ext}`;
    const { error } = await sb.storage.from("task-images").upload(path, file, { contentType: file.type, upsert: false });
    if (error) return json({ ok: false, err: error.message }, 500);
    return json({ ok: true, url: sb.storage.from("task-images").getPublicUrl(path).data.publicUrl });
  } catch (e) {
    return json({ ok: false, err: String(e) }, 500);
  }
});
