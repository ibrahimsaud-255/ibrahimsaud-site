"use client";

// «قائمة تجهيز المسجد للبث» — الهديّة المجّانيّة (قمع: هديّة ← شكر ← صفحة البيع).
// الاسم والبريد (والجوال اختياريّاً) ← جدول subscribers بمصدر «lb-kit»، ثمّ تظهر القائمة للطباعة فوراً.
// لا إيميلات ولا رسائل آليّة من هنا (قرار إبراهيم ٢٠٢٦-١١-٢٣: الإرسال لاحقاً).
import { useEffect, useState } from "react";

const SUPA_URL = "https://rrerwhhxrjyzmnnjsfev.supabase.co";
const SUPA_KEY = "sb_publishable_T-ka4hy2LVRjUuf0wUH9yA_g4Emxm13";
const OPENED = "lb-kit-open";

const LEVELS = [
  {
    t: "المستوى الأوّل — البداية",
    who: "مسجد حيّ يبدأ البثّ، ويشغّله شخص واحد",
    items: ["جوّال حديث على حامل ثلاثيّ ثابت", "مايك لاسلكيّ للشيخ (لافلير يُشبك على الثوب)", "شاحن وكابل طويل — الجوّال على الشاحن طول الدرس", "تطبيق بثّ للدروس على الجوّال"],
  },
  {
    t: "المستوى الثاني — الدرس الأسبوعيّ الثابت",
    who: "بثّ على يوتيوب وفيسبوك وتيليجرام معاً، والكتاب بجانب الشيخ",
    items: ["لابتوب أو كمبيوتر (ويندوز ١٠/١١ بمعالج Core i5 الجيل الثامن فما فوق، أو ماك M1 فما فوق، وذاكرة ٨ جيجا)", "كاميرا ويب جيّدة، أو كاميرا تصوير مع كرت التقاط HDMI", "مايكان لاسلكيّان: للشيخ وللقارئ", "كابل شبكة من الراوتر إلى جهاز البثّ"],
  },
  {
    t: "المستوى الثالث — الجامع والجمعيّة",
    who: "دورات علميّة وبثّ يوميّ، وجودة 4K إن أردتم",
    items: ["كمبيوتر ثابت في غرفة الإعلام", "كاميرا تصوير بتقريب بصريّ + كرت التقاط", "خطّ صوت من مكسر المسجد عبر كرت صوت صغير (من المكسر لا من السمّاعات)", "إنترنت مخصّص للبثّ فقط", "شاشة ثانية للمتابعة"],
  },
];

const BEFORE = [
  "الجهاز على الشاحن، والجوّال (لو مستخدم) على وضع «عدم الإزعاج»",
  "كابل الشبكة موصول — أو جرّب سرعة الرفع الحين: ٦ ميغابت على الأقلّ لكل منصّة",
  "بطاريّة المايك مشحونة، والمايك على ثوب الشيخ قريب من صدره",
  "كلمة تجربة من الشيخ وأنت تسمع بسمّاعة: لا صدى ولا تقطيع",
  "الكاميرا أمام الشيخ على مستوى عينيه، والنافذة مو خلفه",
  "الكتاب والصفحة جاهزان، واسم الشيخ وعنوان الدرس مكتوبان",
];

const SHEET = [
  "افتح برنامج البثّ",
  "اختر الكتاب والصفحة",
  "اكتب اسم الشيخ وعنوان الدرس",
  "كلمة تجربة من الشيخ — تأكّد إنّ الصوت واصل وواضح",
  "اضغط «بثّ مباشر» (أو «تسجيل» لو بدون بثّ)",
  "بعد الدرس: أوقف البثّ، وتأكّد إنّ التسجيل انحفظ",
];

const TIPS = [
  "جرّب بما عندك أوّلاً (جوّال ومايك واحد) أسبوعين، ثمّ اشترِ الناقص فعلاً",
  "لا تشترِ كاميرا قبل ما تحلّ الصوت — المشاهد يتحمّل صورة متوسّطة، ولا يتحمّل صوتاً فيه صدى",
  "اختبر الإنترنت وقت الدرس نفسه والمسجد ممتلئ، لا وقت الفراغ",
];

export default function KitView() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    try { if (localStorage.getItem(OPENED) || new URLSearchParams(location.search).get("demo") === "1") setOpen(true); } catch { /* تخزين مقفل */ }
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (name.trim().length < 2) return setErr("اكتب اسمك");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) return setErr("اكتب بريداً صحيحاً");
    setBusy(true);
    try {
      const r = await fetch(`${SUPA_URL}/rest/v1/subscribers`, {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}`, Prefer: "return=minimal" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), name: name.trim().slice(0, 80), phone: phone.replace(/[^\d+]/g, "").slice(0, 16) || null, source: "lb-kit" }),
      });
      // ٤٠٩ = البريد مسجّل من قبل — نفتح له القائمة عادي
      if (!r.ok && r.status !== 409) throw new Error(String(r.status));
      try { localStorage.setItem(OPENED, "1"); } catch { /* تخزين مقفل */ }
      setOpen(true);
      setTimeout(() => document.getElementById("kit")?.scrollIntoView({ behavior: "smooth" }), 50);
    } catch {
      setErr("تعذّر الإرسال — تأكّد من الإنترنت وجرّب مرّة ثانية");
    }
    setBusy(false);
  }

  if (!open) {
    return (
      <section className="v2-shop-verify v2-kit-form">
        <p className="eyebrow">مجّاناً — للطباعة</p>
        <h1>قائمة تجهيز المسجد لبثّ الدروس</h1>
        <p>المعدّات بثلاثة مستويات حسب ميزانيّتكم، وقائمة فحص قبل الدرس بربع ساعة، و<b>ورقة تشغيل</b> تلصقها على باب غرفة الإعلام حتى يشغّل البثّ أيّ متطوّع.</p>
        <form onSubmit={submit} noValidate>
          <input className="code" value={name} onChange={(e) => setName(e.target.value)} placeholder="اسمك" autoComplete="name" aria-label="الاسم" />
          <input className="code" type="email" dir="ltr" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" autoComplete="email" inputMode="email" aria-label="البريد" />
          <input className="code" type="tel" dir="ltr" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="واتساب (اختياريّ)" autoComplete="tel" inputMode="tel" aria-label="واتساب — اختياريّ" />
          {err && <p className="msg" role="alert">{err}</p>}
          <div className="row"><button className="v2-btn v2-btn-primary" type="submit" disabled={busy}>{busy ? "لحظة…" : "أبي القائمة"}</button></div>
          <p className="fine">نستخدم بريدك لإرسال ما يفيدك عن بثّ الدروس فقط، وتقدر تلغي متى ما بغيت.</p>
        </form>
      </section>
    );
  }

  return (
    <div className="v2-kit" id="kit">
      <header className="v2-kit-head">
        <p className="eyebrow">قائمة تجهيز المسجد لبثّ الدروس</p>
        <h1>الترتيب الصحيح: الصوت، ثمّ الإنترنت، ثمّ الصورة</h1>
        <div className="no-print"><button className="v2-btn v2-btn-primary" onClick={() => window.print()}>اطبع القائمة</button></div>
      </header>

      <section className="v2-kit-page">
        <h2>١. المعدّات — اختر مستواكم</h2>
        {LEVELS.map((l) => (
          <div key={l.t} className="v2-kit-level">
            <h3>{l.t}</h3>
            <p className="who">{l.who}</p>
            <ul className="check">{l.items.map((x) => <li key={x}>{x}</li>)}</ul>
          </div>
        ))}
        <h2>قبل ما تشتري</h2>
        <ul className="dot">{TIPS.map((x) => <li key={x}>{x}</li>)}</ul>
      </section>

      <section className="v2-kit-page">
        <h2>٢. قبل الدرس بربع ساعة</h2>
        <ul className="check">{BEFORE.map((x) => <li key={x}>{x}</li>)}</ul>
      </section>

      <section className="v2-kit-page v2-kit-sheet">
        <p className="eyebrow">ألصقها على باب غرفة الإعلام</p>
        <h2>٣. ورقة تشغيل البثّ</h2>
        <ol>{SHEET.map((x) => <li key={x}>{x}</li>)}</ol>
        <p className="who">تعطّل شي؟ أعد تشغيل البرنامج، وتأكّد من كابل الشبكة والمايك، ثمّ ابدأ البثّ من جديد.</p>
      </section>

      <section className="v2-kit-cta no-print">
        <h2>البرنامج اللي يجمع هذا كلّه</h2>
        <p>«برنامج بث الدروس العلمية»: الشيخ والكتاب في الشاشة، المكتبة الشاملة داخله، ويوتيوب وفيسبوك وتيليجرام معاً — من جهاز واحد، بدون فريق تصوير. ويندوز وماك وأندرويد.</p>
        <a className="v2-btn v2-btn-primary" href="/lessons-broadcast/#buy">شوف البرنامج</a>
      </section>
    </div>
  );
}
