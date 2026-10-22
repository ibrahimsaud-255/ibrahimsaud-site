// ╔══════════════════════════════════════════════════════════════════════╗
// ║  partner-notify — رسائل «فريق الشراكات» لبرنامج شركاء حروف ودروس       ║
// ║  [2026-10-22]                                                         ║
// ║  يُستدعى من قاعدة البيانات (pg_net) عبر public.pp_notify(event, id):   ║
// ║   • partner_new    طلب جديد: رقم الاتفاقية + رابط التوقيع والبوابة،     ║
// ║                    أو تأكيد قائمة السفراء.                             ║
// ║   • partner_active وقّع واعتُمد آليّاً: ترحيب + البوابة + الموادّ.        ║
// ║   • lead_new       سجّل مدرسة: القرار الآليّ للشريك (+ تنبيه للمالك).    ║
// ║   • daily          (pg_cron 9 ص الرياض) تذكير التوقيع بعد ٢ و٦ أيام،     ║
// ║                    وتنبيه قبل انتهاء حماية المدرسة بـ٧ أيام.             ║
// ║  التحقّق: ترويسة x-pp-secret تُطابَق مع pp_settings.notify.secret      ║
// ║  (بدور الخدمة) — لا سرّ في متغيّرات البيئة.                              ║
// ║  الإرسال: Resend (RESEND_API_KEY المشترك في المشروع). المرسل:           ║
// ║  PP_FROM أو «فريق شراكات حروف ودروس <partners@huroofduroos.com>»؛       ║
// ║  إن رفض Resend الدومين يعيد المحاولة بعنوان RESEND_FROM.                ║
// ║  انشرها بـ --no-verify-jwt.                                           ║
// ╚══════════════════════════════════════════════════════════════════════╝
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SITE = "https://huroofduroos.com";
const RESEND_API = "https://api.resend.com/emails";
const ADMIN = Deno.env.get("ADMIN_EMAIL") || "ibrahimsaud25@gmail.com";
const REPLY_TO = "huroofduroos@gmail.com";

const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
  auth: { persistSession: false },
});

type Partner = {
  id: string; kind: string; status: string; agreement_no: string; name: string; phone: string;
  email: string | null; city: string | null; portal_token: string; sign_link_id: string | null;
  rate: number | null; protect_days: number | null; created_at: string; notified: Record<string, string> | null;
};
type Lead = {
  id: string; partner_id: string; school: string; city: string | null; contact_name: string | null;
  status: string; decision: string | null; notes: string | null; expires_at: string | null; seats_est: number | null;
  notified: Record<string, string> | null;
};

function esc(s: unknown) {
  return String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]!));
}
const first = (n: string) => esc(String(n || "").trim().split(/\s+/)[0] || "");
const portalUrl = (p: Partner) => `${SITE}/partners/portal#${p.portal_token}`;
const fmtDate = (iso: string | null) =>
  iso ? new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Asia/Riyadh" }).format(new Date(iso)) : "";

// ── قالب الرسالة: ورق حروف الفاتح، رقم مرجعيّ، توقيع الفريق ──
function mail(title: string, ref: string, body: string, cta?: { label: string; url: string }) {
  return `<!doctype html><html lang="ar" dir="rtl"><body style="margin:0;background:#f4f6fb;padding:24px 12px">
  <div dir="rtl" style="max-width:560px;margin:auto;background:#fff;border:1px solid #e3e7ef;border-radius:16px;overflow:hidden;font-family:Rubik,Tahoma,Arial,sans-serif;color:#1d2433;line-height:1.9">
    <div style="background:#173264;padding:18px 22px;color:#fff">
      <div style="font-size:18px;font-weight:700">حروف ودروس</div>
      <div style="font-size:13px;color:#00C6FF">برنامج الشركاء</div>
    </div>
    <div style="padding:22px">
      <h1 style="font-size:19px;color:#173264;margin:0 0 4px">${title}</h1>
      ${ref ? `<div style="font-size:12px;color:#6b7280;margin-bottom:14px">المرجع: <span dir="ltr">${esc(ref)}</span></div>` : ""}
      <div style="font-size:15px">${body}</div>
      ${cta ? `<div style="margin:22px 0 6px"><a href="${cta.url}" style="display:inline-block;background:#FF9000;color:#fff;text-decoration:none;font-weight:700;padding:12px 22px;border-radius:12px">${cta.label}</a></div>
      <div style="font-size:11.5px;color:#6b7280;word-break:break-all" dir="ltr">${cta.url}</div>` : ""}
    </div>
    <div style="border-top:1px solid #e3e7ef;padding:14px 22px;font-size:12.5px;color:#6b7280">
      مع التحيّة،<br><b style="color:#173264">فريق الشراكات — حروف ودروس</b><br>
      للاستفسار ردّ على هذه الرسالة، أو زر <a href="${SITE}/support" style="color:#173264">مركز الدعم</a>.
    </div>
  </div></body></html>`;
}

async function send(to: string, subject: string, html: string) {
  const key = Deno.env.get("RESEND_API_KEY");
  if (!key) throw new Error("RESEND_API_KEY missing");
  const primary = Deno.env.get("PP_FROM") || "فريق شراكات حروف ودروس <partners@huroofduroos.com>";
  const post = (from: string) =>
    fetch(RESEND_API, {
      method: "POST",
      headers: { Authorization: "Bearer " + key, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to, subject, html, reply_to: REPLY_TO }),
    });
  let r = await post(primary);
  if (!r.ok && (r.status === 403 || r.status === 422)) {
    // الدومين غير موثّق في Resend: نرسل من العنوان الموثّق للمشروع باسم الفريق
    const fallback = (Deno.env.get("RESEND_FROM") || "").match(/<([^>]+)>/)?.[1] || Deno.env.get("RESEND_FROM") || "";
    if (fallback && !primary.includes(fallback)) r = await post(`فريق شراكات حروف ودروس <${fallback}>`);
  }
  if (!r.ok) throw new Error("resend " + r.status + ": " + (await r.text()).slice(0, 300));
}

async function markPartner(p: Partner, k: string) {
  const n = { ...(p.notified || {}), [k]: new Date().toISOString() };
  await db.from("pp_partners").update({ notified: n }).eq("id", p.id);
}
async function markLead(l: Lead, k: string) {
  const n = { ...(l.notified || {}), [k]: new Date().toISOString() };
  await db.from("pp_leads").update({ notified: n }).eq("id", l.id);
}

async function signUrl(p: Partner): Promise<string> {
  if (!p.sign_link_id) return portalUrl(p);
  const { data } = await db.from("partner_sign_links").select("token,status,expires_at").eq("id", p.sign_link_id).single();
  if (!data || data.status !== "pending" || new Date(data.expires_at) < new Date()) return portalUrl(p); // البوابة تجدّد الرابط آليّاً
  return `${SITE}/partners/sign/?t=${data.token}&p=${p.portal_token}`;
}

// ── الأحداث ──
async function partnerNew(p: Partner) {
  if (!p.email || p.notified?.welcome_apply) return;
  if (p.kind === "ambassador") {
    await send(p.email, `أنت في قائمة سفراء حروف — ${p.agreement_no}`, mail(
      `أهلاً ${first(p.name)}، وصلنا طلبك`, p.agreement_no,
      `<p>سجّلناك في قائمة الانتظار لمسار <b>سفير حروف</b>. حين يُفتح المسار نرسل لك كودك الشخصيّ ورابط بوابتك.</p>
       <p>كسفير تحصل على <b>٢٠٪</b> من كلّ دفعة لمدّة ١٢ شهراً، ويحصل من يشترك بكودك على خصم <b>١٠٪</b>.</p>`,
    ));
  } else if (p.status === "signing") {
    await send(p.email, `اتفاقيتك جاهزة للتوقيع — ${p.agreement_no}`, mail(
      `أهلاً ${first(p.name)}، اتفاقيتك جاهزة`, p.agreement_no,
      `<p>شكراً لانضمامك إلى برنامج شركاء حروف ودروس. أعددنا اتفاقية التسويق بالعمولة باسمك برقم <b dir="ltr">${esc(p.agreement_no)}</b>.</p>
       <p>الخطوة الوحيدة الباقية: اقرأ الاتفاقية، أكمل بيانات التحويل البنكيّ، ووقّع إلكترونيّاً. بعدها تُفعَّل بوابتك فوراً وتبدأ تسجيل مدارسك.</p>
       <p style="font-size:13px;color:#6b7280">احفظ رابط بوابتك: <a href="${portalUrl(p)}" style="color:#173264">بوابة الشريك</a> — منها تكمل التوقيع في أيّ وقت.</p>`,
      { label: "راجع الاتفاقية ووقّع", url: await signUrl(p) },
    ));
  } else if (p.status === "applied") {
    await send(p.email, `استلمنا طلب انضمامك — ${p.agreement_no}`, mail(
      `أهلاً ${first(p.name)}، طلبك قيد المراجعة`, p.agreement_no,
      `<p>استلم فريق الشراكات طلبك، وتصلك رسالة حين تجهز اتفاقيتك للتوقيع.</p>`,
      { label: "بوابة الشريك", url: portalUrl(p) },
    ));
  }
  await markPartner(p, "welcome_apply");
}

async function partnerActive(p: Partner) {
  if (p.notified?.welcome_active) return;
  if (p.email) {
    await send(p.email, `مرحباً بك شريكاً معتمداً — ${p.agreement_no}`, mail(
      `${first(p.name)}، أصبحت شريكاً معتمداً`, p.agreement_no,
      `<p>تم توقيع اتفاقيتك واعتمادها. عمولتك <b>${Number(p.rate || 10)}٪</b> من صافي كلّ بيعة تتمّ عن طريقك، وكلّ مدرسة تسجّلها تُحمى باسمك <b>${Number(p.protect_days || 90)} يوماً</b>.</p>
       <p><b>كيف تبدأ:</b></p>
       <ol style="padding-right:18px;margin:0">
         <li>سجّل كلّ مدرسة من بوابتك فور أوّل تواصل معها، ويصلك التأكيد في الحال.</li>
         <li>شارك المدرسة <a href="${SITE}/brochure" style="color:#173264">الملفّ التعريفيّ</a> و<a href="${SITE}/pricing" style="color:#173264">باقات المدارس</a>، وتجد في بوابتك رسالة جاهزة للإرسال.</li>
         <li>تحتاج المدرسة عرضاً تجريبيّاً؟ اكتب ذلك في ملاحظات تسجيلها، ويتواصل معها الفريق.</li>
         <li>المدرسة تدفع لحروف ودروس مباشرة، وعمولتك تُحوَّل خلال ١٠ أيام عمل من التحصيل.</li>
       </ol>`,
      { label: "ادخل بوابتك", url: portalUrl(p) },
    ));
  }
  await send(ADMIN, `شريك جديد معتمد: ${p.name} (${p.agreement_no})`, mail(
    "شريك جديد وقّع واعتُمد آليّاً", p.agreement_no,
    `<p><b>${esc(p.name)}</b> — ${esc(p.city || "")}<br><span dir="ltr">${esc(p.phone)}</span> · ${esc(p.email || "")}</p>
     <p style="font-size:13px;color:#6b7280">لا يلزمك شيء. يظهر في النظام الداخليّ ← الشركات.</p>`,
  ));
  await markPartner(p, "welcome_active");
}

async function leadNew(l: Lead) {
  if (l.notified?.decision) return;
  const p = (await db.from("pp_partners").select("*").eq("id", l.partner_id).single()).data as Partner | null;
  if (!p) return;
  if (p.email) {
    const ok = l.status === "confirmed";
    await send(p.email, ok ? `تأكيد تسجيل: ${l.school}` : `لم يُقبل تسجيل: ${l.school}`, mail(
      ok ? "تم تأكيد تسجيل المدرسة باسمك" : "لم يُقبل تسجيل المدرسة",
      p.agreement_no,
      `<p><b>${esc(l.school)}</b>${l.city ? " — " + esc(l.city) : ""}</p><p>${esc(l.decision || "")}</p>`,
      { label: "افتح بوابتك", url: portalUrl(p) },
    ));
  }
  if (l.status === "confirmed") {
    await send(ADMIN, `مدرسة محميّة جديدة: ${l.school} — عبر ${p.name}`, mail(
      "فرصة بيع جديدة من شريك", p.agreement_no,
      `<p><b>${esc(l.school)}</b>${l.city ? " — " + esc(l.city) : ""}${l.seats_est ? ` · قرابة ${l.seats_est} معلّم` : ""}<br>
       المسؤول: ${esc(l.contact_name || "")}<br>${l.notes ? "ملاحظات الشريك: " + esc(l.notes) + "<br>" : ""}الشريك: ${esc(p.name)} · <span dir="ltr">${esc(p.phone)}</span></p>
       <p style="font-size:13px;color:#6b7280">الحماية حتى ${fmtDate(l.expires_at)}. تظهر في النظام الداخليّ ← الشركات ← المدارس المحالة.</p>`,
    ));
  }
  await markLead(l, "decision");
}

async function daily() {
  const day = 864e5, now = Date.now();
  // تذكير التوقيع: بعد يومين، ثم بعد ستّة أيام
  const { data: pending } = await db.from("pp_partners").select("*").eq("status", "signing");
  for (const p of (pending || []) as Partner[]) {
    if (!p.email) continue;
    const age = (now - new Date(p.created_at).getTime()) / day;
    const k = age >= 6 ? "remind2" : age >= 2 ? "remind1" : "";
    if (!k || p.notified?.[k]) continue;
    await send(p.email, `تذكير: اتفاقيتك ${p.agreement_no} بانتظار توقيعك`, mail(
      `${first(p.name)}، بقيت خطوة واحدة`, p.agreement_no,
      `<p>اتفاقيتك جاهزة ولم تُوقَّع بعد. التوقيع يستغرق دقيقتين، وبعده تُفعَّل بوابتك وتبدأ تسجيل مدارسك وحمايتها باسمك.</p>`,
      { label: "أكمل التوقيع", url: await signUrl(p) },
    ));
    await markPartner(p, k);
  }
  // الحماية تنتهي خلال ٧ أيام
  const soon = new Date(now + 7 * day).toISOString();
  const { data: leads } = await db.from("pp_leads").select("*").eq("status", "confirmed")
    .gt("expires_at", new Date(now).toISOString()).lt("expires_at", soon);
  for (const l of (leads || []) as Lead[]) {
    if (l.notified?.expiry7) continue;
    const p = (await db.from("pp_partners").select("*").eq("id", l.partner_id).single()).data as Partner | null;
    if (!p || p.status !== "active") continue;
    const stage = ((p as unknown as { snapshot?: { leads?: { ppLeadId?: string; stage?: string }[] } }).snapshot?.leads || [])
      .find((x) => x.ppLeadId === l.id)?.stage;
    if (stage === "won" || stage === "lost") { await markLead(l, "expiry7"); continue; }
    if (p.email) {
      await send(p.email, `حماية «${l.school}» تنتهي ${fmtDate(l.expires_at)}`, mail(
        "تنبيه: حماية مدرسة تقترب من نهايتها", p.agreement_no,
        `<p>حماية <b>${esc(l.school)}</b> باسمك تنتهي في <b>${fmtDate(l.expires_at)}</b>. إن كانت المدرسة قريبة من القرار فردّ على هذه الرسالة لطلب عرض تجريبيّ لها أو تمديد الحماية كتابيّاً.</p>`,
        { label: "افتح بوابتك", url: portalUrl(p) },
      ));
    }
    await markLead(l, "expiry7");
  }
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("ok");
  try {
    const { data: cfg } = await db.from("pp_settings").select("value").eq("key", "notify").single();
    const secret = cfg?.value?.secret;
    if (!secret || req.headers.get("x-pp-secret") !== secret) return new Response("unauthorized", { status: 401 });
    const { event, id } = await req.json().catch(() => ({}));
    if (event === "ping") {
      // فحص قراءةٍ فقط: هل المفتاح مضبوط، وما الدومينات الموثّقة في Resend (لا يُرسل شيئاً)
      const key = Deno.env.get("RESEND_API_KEY") || "";
      let domains: unknown = null;
      if (key) { const r = await fetch("https://api.resend.com/domains", { headers: { Authorization: "Bearer " + key } }); domains = r.ok ? ((await r.json()).data || []).map((d: { name: string; status: string }) => d.name + ":" + d.status) : "http " + r.status; }
      return new Response(JSON.stringify({ ok: true, resend: !!key, domains, from: Deno.env.get("RESEND_FROM") || "", pp_from: Deno.env.get("PP_FROM") || "" }), { headers: { "Content-Type": "application/json" } });
    }
    if (event === "daily") await daily();
    else if (event === "partner_new" || event === "partner_active") {
      const p = (await db.from("pp_partners").select("*").eq("id", id).single()).data as Partner | null;
      if (p) await (event === "partner_new" ? partnerNew(p) : partnerActive(p));
    } else if (event === "lead_new") {
      const l = (await db.from("pp_leads").select("*").eq("id", id).single()).data as Lead | null;
      if (l) await leadNew(l);
    }
    return new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json" } });
  } catch (e) {
    console.error("partner-notify", e);
    return new Response(JSON.stringify({ ok: false, error: String((e as Error).message || e) }), { status: 500 });
  }
});
