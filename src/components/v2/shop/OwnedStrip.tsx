// شريط «اشتريت؟ حمّل آخر تحديث من «حسابي»» — للمشترين اللي ما يعرفون من وين ينزّلون التحديث.
// يظهر في /shop/ وأعلى صفحة البيع العربيّة (/lessons-broadcast/).
export default function OwnedStrip({ text = "اشتريت؟ حمّل آخر تحديث من «حسابي»", sub = "ادخل بالإيميل اللي اشتريت فيه — كلّ مشترياتك بآخر نسخة لكلّ جهاز." }: { text?: string; sub?: string }) {
  return (
    <a className="v2-owned" href="/account/">
      <svg className="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M12 3v12M7 10l5 5 5-5" />
        <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
      </svg>
      <span className="tx"><b>{text}</b><span>{sub}</span></span>
      <span className="go">حسابي <span className="chev" aria-hidden>‹</span></span>
    </a>
  );
}
