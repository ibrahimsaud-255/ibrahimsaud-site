// ╔══════════════════════════════════════════════════════════════╗
// ║  newsletter-unsub — Supabase Edge Function                     ║
// ║  رابط عام في تذييل كل إيميل: يلغي اشتراك صاحب الرمز.           ║
// ║  انشرها بـ --no-verify-jwt (رابط يفتحه المشترك مباشرة).        ║
// ╚══════════════════════════════════════════════════════════════╝

function page(msg: string, ok: boolean) {
  return `<!doctype html><html dir="rtl" lang="ar"><head><meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>إلغاء الاشتراك</title></head>
  <body style="margin:0;background:#0a0a0b;color:#f4f4f5;font-family:Tahoma,Arial,sans-serif;display:grid;place-items:center;min-height:100vh">
    <div style="text-align:center;padding:32px;max-width:440px">
      <div style="font-size:44px">${ok ? "✅" : "⚠️"}</div>
      <h1 style="color:#f5a623;font-size:22px;margin:14px 0">${msg}</h1>
      <p style="color:#9b9ba3">إبراهيم سعود — تقنية أعمال وبودكاست</p>
      <a href="https://ibrahimsaud.com" style="color:#f5a623">العودة للموقع</a>
    </div>
  </body></html>`;
}

Deno.serve(async (req) => {
  const url = new URL(req.url);
  const token = url.searchParams.get("t") || "";
  const html = { "Content-Type": "text/html; charset=utf-8" };
  if (!token || token === "test") {
    return new Response(page("رابط غير صالح.", false), { status: 400, headers: html });
  }
  const SUPA_URL = Deno.env.get("SUPABASE_URL")!;
  const SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  try {
    const r = await fetch(
      `${SUPA_URL}/rest/v1/subscribers?unsub_token=eq.${encodeURIComponent(token)}`,
      {
        method: "PATCH",
        headers: {
          apikey: SERVICE,
          Authorization: "Bearer " + SERVICE,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify({ unsubscribed: true }),
      },
    );
    const rows = await r.json().catch(() => []);
    if (r.ok && Array.isArray(rows) && rows.length) {
      return new Response(page("تم إلغاء اشتراكك بنجاح. لن تصلك رسائل بعد الآن.", true), { headers: html });
    }
    return new Response(page("الرابط منتهٍ أو الاشتراك غير موجود.", false), { status: 404, headers: html });
  } catch {
    return new Response(page("حدث خطأ، حاول لاحقاً.", false), { status: 500, headers: html });
  }
});
