/*
 * 35-photos.js — «كيف أصوّرها؟»: دليل لكلّ صورة في موقع الجمعيّة — البادئة ph
 * ─────────────────────────────────────────────────────────────────────────
 * الفكرة: مدير الجمعيّة ليس مصوّراً. لكلّ خانة صورة نعرض: أين تظهر، مثالاً للشكل المطلوب، خطوات تصوير
 * بالجوال بلغة بسيطة، وأمراً جاهزاً لـGemini (مجّانيّ في تطبيقه) يحسّن صورته الحقيقيّة — دون تكلفة علينا.
 * المبدأ: Gemini يُحسّن صوراً حقيقيّة، ولا يخترع أشخاصاً أو أنشطة لم تحدث (أمانة أمام المتبرّعين).
 * الدليل طبقة مستقلّة فوق النافذة المفتوحة (لا يستبدل محتوى openModal). ⚠️ تعريفات فقط.
 */
const PH_GEMINI = 'https://gemini.google.com/app';
const PH_EXAMPLES = new Set([]);   // الأنواع التي لها صورة مثال حقيقيّة في assets/photo-examples/<kind>.webp
/* أوامر الصور الشخصيّة بالإنجليزيّة (أدقّ مع Gemini) — تُحسّن صورة الشخص نفسه ولا تخترع وجهاً،
   وخلفيّة واحدة ثابتة لكلّ الجمعيّة (#E6E7EA) حتى تتطابق صور المجلس والفريق */
const PH_BASE = 'Edit the uploaded photo into a high-quality professional corporate headshot. Keep the person\'s face, facial features, skin tone, facial hair (if any) and identity exactly the same — do not change the face or make it look like someone else.';
const PH_TAIL = sh => ` Background: solid, clean, light grey studio backdrop (#E6E7EA), evenly lit, no texture, no objects. Soft professional studio lighting from the front, natural relaxed smile, looking at the camera. Composition: ${sh}, centered. Photorealistic, natural colors and skin texture, sharp focus, no beauty filter, no text, no watermark.`;
const PH_HEADSHOT = sh => PH_BASE + ' Attire: traditional Saudi dress — a crisp white thobe and a red-and-white checkered shemagh with a black agal, neatly arranged (keep the person\'s own attire if already wearing it).' + PH_TAIL(sh);
const PH_HEADSHOT_F = sh => PH_BASE + ' Attire: a modest black abaya and a neatly arranged black hijab (keep the person\'s own attire and covering exactly as in the photo).' + PH_TAIL(sh);
const PH_KINDS = {
  board: {
    t: 'صورة عضو مجلس الإدارة', where: 'تظهر في قسم «الحوكمة» بجانب اسم العضو ومنصبه.', ratio: '4/5', icon: 'user-round',
    shoot: ['قف أمام جدار فاتح بلا زخارف — أو باب أبيض.', 'صوّر من منتصف الصدر إلى أعلى الرأس، والجوال بمستوى العين وعلى بُعد متر تقريباً.', 'واجه نافذة في النهار — الضوء أمامك لا خلفك.', 'الشماغ أو الغترة مرتّبة، والملابس كما في المناسبات الرسميّة.', 'نظرة إلى الكاميرا وابتسامة خفيفة.'],
    ai: PH_HEADSHOT('4:5 portrait, from mid-chest to just above the head'), aiF: PH_HEADSHOT_F('4:5 portrait, from mid-chest to just above the head'),
    note: 'من لا يرغب بنشر صورته يكفيه اسمه — يظهر مكانها الحرف الأوّل من اسمه بشكل أنيق.',
  },
  hero: {
    t: 'صورة الواجهة', where: 'أوّل ما يراه الزائر أعلى الموقع — هي «وجه» الجمعيّة.', ratio: '16/10', icon: 'image',
    shoot: ['اختر لحظة من نشاط حقيقيّ: توزيع، دورة، زيارة، فريق المتطوّعين.', 'أمسك الجوال بالعرض (أفقيّاً).', 'صوّر في الصباح أو قبل المغرب — الضوء أجمل.', 'اترك مساحة فارغة في جهة من الصورة (سماء أو جدار) حتى يُقرأ العنوان فوقها.', 'تجنّب وجوه المستفيدين والأطفال إلا بموافقتهم — صوّر الأيدي أو من الخلف.'],
    ai: 'حسّن إضاءة هذه الصورة وألوانها لتصلح غلافاً لموقع جمعيّة خيريّة سعوديّة: إضاءة دافئة طبيعيّة، ألوان واضحة غير مبالغ فيها، ووضوح أعلى. لا تُضف أشخاصاً ولا عناصر غير موجودة، ولا تغيّر الوجوه. أبقِ الصورة أفقيّة بنسبة ١٦:١٠.',
  },
  program: {
    t: 'صورة البرنامج', where: 'غلاف بطاقة البرنامج وصفحته.', ratio: '16/10', icon: 'graduation-cap',
    shoot: ['صورة من البرنامج نفسه: القاعة، الأدوات، المشاركون أثناء النشاط.', 'أفقيّة، والموضوع في المنتصف.', 'لقطة قريبة لتفصيلة معبّرة (يد تكتب، أداة، شهادة) أجمل من صورة جماعيّة بعيدة.'],
    ai: 'حسّن هذه الصورة لتكون غلافاً لبرنامج جمعيّة: اضبط الإضاءة والتباين وقوّم الميلان، وأزل التشويش. لا تُضف أشخاصاً ولا عناصر غير موجودة. نسبة ١٦:١٠ أفقيّة.',
  },
  news: {
    t: 'صورة الخبر', where: 'تظهر مع الخبر في الموقع وعند مشاركته في واتساب.', ratio: '16/9', icon: 'newspaper',
    shoot: ['صورة من الحدث نفسه: التوقيع، التكريم، الافتتاح.', 'أفقيّة، والأشخاص الرئيسيّون في المنتصف.', 'صورة واحدة قويّة تكفي — لا تجمع عدّة صور في واحدة.'],
    ai: 'حسّن هذه الصورة لخبر على موقع جمعيّة: إضاءة طبيعيّة ووضوح أعلى وتقويم للميلان. لا تغيّر الأشخاص ولا تُضف شيئاً. نسبة ١٦:٩.',
  },
  staff: {
    t: 'صورة الموظّف', where: 'صورتك في النظام — في المهامّ والتعليقات وصفحة الفريق.', ratio: '1/1', icon: 'user-round',
    shoot: ['صوّر نفسك بالكاميرا الأماميّة أمام جدار فاتح.', 'الجوال بمستوى العين، والضوء من نافذة أمامك.', 'الوجه في المنتصف، من الكتفين إلى أعلى الرأس.'],
    ai: PH_HEADSHOT('square 1:1, head and shoulders'), aiF: PH_HEADSHOT_F('square 1:1, head and shoulders'),
    note: 'كلّ صور الفريق بنفس الأمر = نفس الخلفيّة والإضاءة، فيبدو الفريق كأنّه صُوِّر في استوديو واحد.',
  },
  person: {
    t: 'صورة صاحب الشهادة', where: 'بجانب الشهادة أو قصّة النجاح.', ratio: '1/1', icon: 'quote',
    shoot: ['اطلب إذنه قبل نشر صورته.', 'صورة قريبة للوجه بخلفيّة هادئة — أو اتركها فارغة فيظهر حرف اسمه.', 'للمستفيدين: الأفضل بلا صورة حفظاً لكرامتهم وخصوصيّتهم.'],
    ai: 'حسّن هذه الصورة الشخصيّة: خلفيّة ناعمة فاتحة وإضاءة متوازنة، واحتفظ بملامح الوجه كما هي تماماً. قصّ مربّع من الكتفين إلى أعلى الرأس.',
  },
  logo: {
    t: 'الشعار', where: 'أعلى الموقع وفي التذييل وعلى الوثائق.', ratio: '1/1', icon: 'badge',
    shoot: ['لا تصوّر الشعار بالجوال — اطلب ملفّه من المصمّم أو من تصاميم الجمعيّة.', 'الأفضل ملفّ PNG بخلفيّة شفّافة (بلا مربّع أبيض حوله).', 'إن لم يوجد إلا صورة بخلفيّة بيضاء فارفعها، وتبدو جيّدة في أغلب القوالب.'],
    ai: 'هذا شعار جمعيّة. أعد رسمه بدقّة عالية كما هو تماماً دون أيّ تغيير في الأشكال أو النصّ أو الألوان، على خلفيّة بيضاء نقيّة، وفي المنتصف مع هامش حوله.',
  },
  partner: {
    t: 'شعار الشريك', where: 'شريط «شركاء النجاح».', ratio: '3/2', icon: 'handshake',
    shoot: ['حمّل الشعار من موقع الجهة الرسميّ أو اطلبه منهم.', 'لا تقصّ الشعار ولا تغيّر ألوانه.'],
  },
};
/* أيّ حقل صورة ← أيّ نوع (حقول المحرّر وحقول المحتوى في 23-org-site) */
const PH_FIELD = { ws_logo: 'logo', ws_hero_img: 'hero', ss_image: 'hero', sf_cover_url: 'program', sf_photo_url: 'person', sf_logo_url: 'partner' };
function phKind(id, ctx) { if (id === 'sf_cover_url') return ctx === 'news' ? 'news' : 'program'; return PH_FIELD[id] || (/board/.test(id) ? 'board' : ''); }
/* زرّ صغير بجانب أيّ حقل صورة */
function phBtn(kind) { return PH_KINDS[kind] ? `<button type="button" class="ph-how" onclick="phGuide('${kind}')"><i data-lucide="camera"></i> كيف أصوّرها؟</button>` : ''; }

function phGuide(kind) {
  const k = PH_KINDS[kind]; if (!k) return;
  phClose();
  const root = document.createElement('div'); root.id = 'phRoot';
  root.innerHTML = `<div class="modal-bg ph-bg" onclick="if(event.target===this)phClose()"><div class="modal ph-sheet" role="dialog" aria-modal="true" aria-label="${esc(k.t)}">
    <div class="ap-grab" aria-hidden="true"></div>
    <div class="modal-head"><h3>${esc(k.t)}</h3><button class="x" type="button" onclick="phClose()" aria-label="إغلاق">×</button></div>
    <div class="modal-body">
      <p class="ph-where"><i data-lucide="map-pin"></i> ${esc(k.where)}</p>
      <div class="ph-ex" style="--r:${k.ratio}">${phArt(kind)}<span>مثال للشكل المطلوب</span></div>
      <h4 class="ph-h"><i data-lucide="smartphone"></i> صوّرها بجوالك</h4>
      <ol class="ph-steps">${k.shoot.map(s => `<li>${esc(s)}</li>`).join('')}</ol>
      ${k.note ? `<p class="ph-note"><i data-lucide="info"></i> ${esc(k.note)}</p>` : ''}
      ${k.ai ? `<h4 class="ph-h"><i data-lucide="sparkles"></i> حسّنها بـGemini (مجّاناً)</h4>
      <ol class="ph-ai"><li>افتح Gemini وارفع صورتك (زرّ <b>+</b>).</li><li>انسخ الأمر التالي والصقه، ثمّ أرسل.</li><li>احفظ الصورة الناتجة وارفعها هنا.</li></ol>
      ${k.aiF ? `<div class="r-seg ph-seg" role="tablist"><button type="button" class="on" onclick="phSwap(this,0)">رجل</button><button type="button" onclick="phSwap(this,1)">امرأة</button></div>` : ''}
      <div class="ph-prompt" dir="${/^[A-Za-z]/.test(k.ai) ? 'ltr' : 'rtl'}"><p id="phP" data-k="${kind}">${esc(k.ai)}</p></div>
      ${/^[A-Za-z]/.test(k.ai) ? '<p class="ph-fine">الأمر بالإنجليزيّة لأنّ Gemini يفهمه بدقّة أعلى — لا تحتاج قراءته، انسخه فقط.</p>' : ''}
      <div class="ph-acts"><button type="button" class="btn btn-gold" onclick="phCopy()"><i data-lucide="copy"></i> انسخ الأمر</button>
        <a class="btn btn-ghost" href="${PH_GEMINI}" target="_blank" rel="noopener"><i data-lucide="external-link"></i> افتح Gemini</a></div>
      <p class="ph-fine">Gemini يحسّن صورتك الحقيقيّة فقط — لا تستخدمه لاختراع أشخاص أو أنشطة لم تحدث؛ ثقة المتبرّعين أهمّ.</p>` : ''}
    </div></div></div>`;
  document.body.appendChild(root); refreshIcons();
  root.querySelector('.x').focus({ preventScroll: true });
  root.addEventListener('keydown', e => { if (e.key === 'Escape') { e.stopPropagation(); phClose(); } });
}
function phSwap(b, f) {
  b.parentElement.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b));
  const p = document.getElementById('phP'), k = PH_KINDS[p.dataset.k]; p.textContent = f ? k.aiF : k.ai;
}
function phClose() { const r = document.getElementById('phRoot'); if (r) r.remove(); }
async function phCopy() {
  const t = (document.getElementById('phP') || {}).textContent || '';
  try { await navigator.clipboard.writeText(t); rToast('نُسخ الأمر — الصقه في Gemini بعد رفع صورتك'); } catch (e) { await apPrompt('انسخ الأمر:', t); }
}
/* رسم توضيحيّ للتأطير المطلوب (بدل صور جاهزة — مؤقّتاً حتى تُعتمد أمثلة حقيقيّة في assets/photo-examples) */
function phArt(kind) {

  const svg = {
    board: `<svg viewBox="0 0 200 250" aria-hidden="true"><rect width="200" height="250" fill="#ECEEF2"/><path d="M38 250c4-52 30-78 62-78s58 26 62 78z" fill="#fff"/><path d="M100 172l-14 78h28z" fill="#D9DDE4"/><circle cx="100" cy="112" r="38" fill="#C9A882"/><path d="M52 104c6-40 30-58 48-58s42 18 48 58c-14-18-30-24-48-24s-34 6-48 24z" fill="#fff"/><path d="M52 104l-10 70 22-8 6-50zM148 104l10 70-22-8-6-50z" fill="#fff"/><path d="M60 92c12-14 26-20 40-20s28 6 40 20" stroke="#B3261E" stroke-width="3" fill="none" stroke-dasharray="2 5"/><rect x="18" y="18" width="164" height="214" fill="none" stroke="#1003BD" stroke-width="2" stroke-dasharray="6 6" opacity=".5"/></svg>`,
    person: `<svg viewBox="0 0 200 200" aria-hidden="true"><rect width="200" height="200" fill="#ECEEF2"/><circle cx="100" cy="86" r="36" fill="#C9A882"/><path d="M40 200c4-46 30-66 60-66s56 20 60 66z" fill="#fff"/></svg>`,
    logo: `<svg viewBox="0 0 200 200" aria-hidden="true"><rect width="200" height="200" fill="#fff"/><path d="M0 0h20v20H0zM40 0h20v20H40zM20 20h20v20H20z" fill="#EEF0F3"/><circle cx="100" cy="88" r="34" fill="none" stroke="#1003BD" stroke-width="8"/><path d="M100 60v56M72 88h56" stroke="#1003BD" stroke-width="8"/><rect x="56" y="140" width="88" height="12" rx="6" fill="#1D1D1F"/></svg>`,
    partner: `<svg viewBox="0 0 300 200" aria-hidden="true"><rect width="300" height="200" fill="#fff"/><rect x="60" y="70" width="60" height="60" rx="14" fill="#9AA3AF"/><rect x="134" y="84" width="110" height="14" rx="7" fill="#9AA3AF"/><rect x="134" y="106" width="76" height="10" rx="5" fill="#C9CED6"/></svg>`,
  }[kind];
  const scene = `<svg viewBox="0 0 320 200" aria-hidden="true"><defs><linearGradient id="phsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F6E7CF"/><stop offset="1" stop-color="#FBF5EC"/></linearGradient></defs><rect width="320" height="200" fill="url(#phsky)"/><rect x="0" y="0" width="130" height="200" fill="#fff" opacity=".35"/><path d="M0 160h320v40H0z" fill="#E5D3B3"/><g fill="#7A5C3E"><circle cx="196" cy="92" r="13"/><path d="M178 160c2-30 8-48 18-48s16 18 18 48z"/><circle cx="244" cy="98" r="12"/><path d="M228 160c2-26 7-42 16-42s14 16 16 42z"/></g><rect x="150" y="132" width="120" height="30" rx="4" fill="#C98A4B"/><text x="64" y="104" font-size="12" text-anchor="middle" fill="#8A7A66" font-family="sans-serif">مساحة للعنوان</text></svg>`;
  return PH_EXAMPLES.has(kind) ? `<img src="./assets/photo-examples/${kind}.webp?v=1" alt="">` : `<span class="ph-svg">${svg || scene}</span>`;
}

/* ═════════ «ما عندي نطاق» — دليل شراء النطاق خطوة بخطوة (نفس طبقة الدليل) ═════════
 * المصادر (٢٠٢٦-١١): nic.sa — ‎.sa لا تُباع إلا عبر مسجّلين مرخّصين، و‎.org.sa للجهات غير الربحيّة بموافقة
 * المركز السعوديّ لمعلومات الشبكة خلال يومي عمل تقريباً. الأسعار تتغيّر فلا نذكر أرقاماً. */
const DM_REG_SA = [['حلول stc', 'https://domains.solutions.com.sa/'], ['حوسبة', 'https://sahabah.com.sa/'], ['نورنت', 'https://nour.net.sa/'], ['صحارى نت', 'https://sahara.sa/registersa'], ['القائمة الرسميّة لكلّ المسجّلين', 'https://nic.sa/en/registrars']];
/* ‎.com/.org: الشركات المحلّيّة أعلاه تبيعها أيضاً — نعرضها أوّلاً، ثمّ بديلان دوليّان (لا شركات مرتبطة بالكيان الصهيونيّ — طلب إبراهيم) */
const DM_REG_COM = [['Namecheap (أمريكيّة)', 'https://www.namecheap.com/'], ['Hostinger (ليتوانيّة)', 'https://www.hostinger.com/domain-name-search']];
function dmGuide(suggest) {
  phClose();
  const s = String(suggest || '').toLowerCase().replace(/[^a-z0-9-]/g, '') || 'ghiras';
  const link = ([n, u]) => `<a class="dm-reg" href="${u}" target="_blank" rel="noopener"><span>${esc(n)}</span><i data-lucide="external-link"></i></a>`;
  const ext = (e, badge, txt, need) => `<div class="dm-ext${badge ? ' best' : ''}"><div class="dm-ext-h"><bdi dir="ltr"><b>${e}</b></bdi>${badge ? `<em>${badge}</em>` : ''}</div><p>${txt}</p>${need ? `<small>${need}</small>` : ''}</div>`;
  const root = document.createElement('div'); root.id = 'phRoot';
  root.innerHTML = `<div class="modal-bg ph-bg" onclick="if(event.target===this)phClose()"><div class="modal ph-sheet" role="dialog" aria-modal="true" aria-label="شراء النطاق">
    <div class="ap-grab" aria-hidden="true"></div>
    <div class="modal-head"><h3>شراء النطاق</h3><button class="x" type="button" onclick="phClose()" aria-label="إغلاق">×</button></div>
    <div class="modal-body">
      <h4 class="ph-h"><i data-lucide="help-circle"></i> ما هو النطاق؟</h4>
      <p class="dm-p">هو عنوان موقعكم على الإنترنت — مثل اسم المحلّ على اللوحة: <b dir="ltr">www.${esc(s)}.org.sa</b>. تشترونه من شركة مرخّصة وتجدّدونه كلّ سنة، ويبقى ملكاً للجمعيّة.</p>
      <p class="dm-p dm-soft">رابط موقعكم الحاليّ يعمل دائماً — النطاق الخاصّ اختياريّ، لكنّه يزيد الثقة ويسهل حفظه.</p>
      <h4 class="ph-h"><i data-lucide="list-checks"></i> أيّ نهاية أختار؟</h4>
      <div class="dm-exts">
        ${ext('.org.sa', 'الأفضل للجمعيّات', 'مخصّص للجهات غير الربحيّة في المملكة فقط، فيثق به المتبرّع فوراً.', 'يحتاج: شهادة تسجيل الجمعيّة، والعنوان الوطنيّ، وخطاب طلب على ورق الجمعيّة بختمها. يوافق عليه المركز السعوديّ لمعلومات الشبكة خلال يومي عمل تقريباً.')}
        ${ext('.sa', '', 'قصير وسعوديّ، ولا يحتاج موافقة خاصّة — يعمل خلال يوم تقريباً.', '')}
        ${ext('.com / .org', '', 'فوريّ ومتوفّر في كلّ مكان، لكن أيّ أحد يستطيع شراءه، فثقته أقلّ.', '')}
      </div>
      <p class="dm-p dm-soft">تجنّبوا <bdi dir="ltr">.ngo</bdi> — غير مألوف للمتبرّعين في المملكة.</p>
      <h4 class="ph-h"><i data-lucide="shopping-bag"></i> من أين أشتري؟</h4>
      <p class="dm-p">للنهايتين <bdi dir="ltr"><b>.org.sa</b></bdi> و <bdi dir="ltr"><b>.sa</b></bdi> — من الشركات المرخّصة في المملكة:</p>
      <div class="dm-regs">${DM_REG_SA.map(link).join('')}</div>
      <p class="dm-p">للنهايتين <bdi dir="ltr"><b>.com</b></bdi> و <bdi dir="ltr"><b>.org</b></bdi> — الشركات المحلّيّة أعلاه تبيعهما أيضاً، أو:</p>
      <div class="dm-regs">${DM_REG_COM.map(link).join('')}</div>
      <h4 class="ph-h"><i data-lucide="shield-check"></i> قبل أن تدفع</h4>
      <ol class="ph-steps">
        <li>اختر اسماً قصيراً من اسم الجمعيّة أو اختصارها — مثل <b dir="ltr">${esc(s)}</b>.</li>
        <li>سجّله باسم الجمعيّة لا باسم شخص، حتى يبقى للجمعيّة إن تغيّر المسؤول.</li>
        <li>احفظ اسم المستخدم وكلمة المرور لحساب الشركة في مكان آمن.</li>
        <li>فعّل «التجديد التلقائيّ» حتى لا يتوقّف الموقع فجأة.</li>
        <li>السعر يظهر عند الدفع ويختلف بين الشركات.</li>
      </ol>
      <div class="ph-acts"><button type="button" class="btn btn-gold" onclick="phClose();var i=document.getElementById('ws_domain');if(i){i.focus();i.scrollIntoView({block:'center'})}"><i data-lucide="check"></i> اشتريته — أكتبه الآن</button></div>
    </div></div></div>`;
  document.body.appendChild(root); refreshIcons();
  root.querySelector('.x').focus({ preventScroll: true });
  root.addEventListener('keydown', e => { if (e.key === 'Escape') { e.stopPropagation(); phClose(); } });
}
