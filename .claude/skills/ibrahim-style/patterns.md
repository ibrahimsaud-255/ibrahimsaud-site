# الأنماط الجاهزة

كل نمط هنا مستخرج من موقع منشور. انسخ البنية وغيّر النص والصورة فقط.

---

## ١) الهيرو — صورة كاملة وحجاب وعنوان بكلمة ملوّنة

```html
<section class="hero">
  <div class="hero__slides">
    <div class="hero__slide is-on"><img src="img/hero-1.jpg" alt="" fetchpriority="high"></div>
    <div class="hero__slide"><img src="img/hero-2.jpg" alt="" loading="lazy"></div>
  </div>
  <div class="wrap hero__inner">
    <span class="hero__eyebrow">منشأة سعودية</span>
    <h1>حلول <em>ترفع كفاءة</em> مستودعك خلال ٩٠ يوماً</h1>
    <p>نشخّص المشكلة، نعيد التصميم، وندرّب فريقك — بمؤشرات تقيسها بنفسك.</p>
    <div class="hero__actions">
      <a class="btn btn--accent" href="#contact">اطلب استشارة</a>
      <a class="btn btn--light" href="#services">تعرّف على خدماتنا</a>
    </div>
    <div class="hero__dots"><button class="is-on"></button><button></button></div>
  </div>
</section>
```

```css
.hero{position:relative;min-height:100svh;display:flex;align-items:center;overflow:hidden;background:var(--brand-900)}
.hero__slides{position:absolute;inset:0}
.hero__slide{position:absolute;inset:0;opacity:0;transition:opacity 1.4s var(--ease)}
.hero__slide.is-on{opacity:1}
.hero__slide img{width:100%;height:100%;object-fit:cover;animation:kb 12s linear forwards}
@keyframes kb{from{transform:scale(1.08)}to{transform:scale(1)}}
/* الحجاب: تدرّجان — عمودي للقراءة، وأفقي ليثقل جهة النص */
.hero::after{content:"";position:absolute;inset:0;background:
  linear-gradient(to bottom,rgba(7,21,40,.86) 0%,rgba(7,21,40,.42) 45%,rgba(7,21,40,.82) 100%),
  linear-gradient(to left,rgba(7,21,40,.88) 0%,rgba(7,21,40,.5) 55%,rgba(7,21,40,.14) 100%)}
.hero__inner{position:relative;z-index:2;width:100%;padding-block:calc(var(--header-h) + 46px) 200px}
.hero__eyebrow{display:flex;align-items:center;gap:12px;color:var(--accent);font-size:15px;font-weight:700;margin-bottom:18px}
.hero__eyebrow::before{content:"";width:38px;height:2px;background:var(--accent);border-radius:2px;flex:none}
.hero h1{color:#fff;font-size:clamp(2.1rem,5.2vw,3.9rem);max-width:16ch;margin-bottom:22px}
.hero h1 em{font-style:normal;color:var(--accent)}   /* كلمة واحدة فقط بلون التمييز */
.hero p{color:rgba(255,255,255,.86);font-size:clamp(1.02rem,2vw,1.22rem);max-width:56ch;line-height:1.95;margin-bottom:34px}
.hero__dots button{width:34px;height:4px;border:0;border-radius:4px;background:rgba(255,255,255,.34);cursor:pointer;transition:.3s var(--ease)}
.hero__dots button.is-on{background:var(--accent);width:54px}
```

**القاعدة:** كلمة واحدة فقط في `h1` بلون التمييز. العنوان لا يتجاوز ١٦ حرفاً عرضاً.

---

## ٢) شريط الأرقام — ملتصق بأسفل الهيرو

```html
<div class="hero-strip"><div class="wrap"><div class="hero-strip__grid">
  <div class="hero-strip__cell"><b>١٢<span class="suf">سنة</span></b><span>خبرة ميدانية</span></div>
  <div class="hero-strip__cell"><b>٨٠<span class="suf">+</span></b><span>مشروع منجز</span></div>
  <div class="hero-strip__cell"><b>٣٥<span class="suf">%</span></b><span>متوسط توفير المساحة</span></div>
  <div class="hero-strip__cell"><b>٩٠<span class="suf">يوم</span></b><span>متوسط مدة التنفيذ</span></div>
</div></div></div>
```

الأرقام `direction:ltr` واللاحقة بلون التمييز وبحجم `.46em`. أربع خانات على سطر واحد،
تصير خانتين على الجوال.

---

## ٣) الشريط المصوّر — دمج الصورة مع الكلام

أهم نمط عنده. صورة عريضة تملأ العرض، والنص فوقها في جهة واحدة.

```html
<section class="band">
  <img class="band__bg" src="img/warehouse.jpg" alt="" loading="lazy">
  <div class="band__in">
    <span class="eyebrow">لماذا نحن</span>
    <h2>خبرة ميدانية لا استشارات نظرية</h2>
    <p>فريقنا داخل المستودع معك، من أول جرد حتى تشغيل النظام الجديد.</p>
    <ul class="band__pills"><li>جرد شامل</li><li>إعادة تخطيط</li><li>تدريب الفريق</li></ul>
    <a class="btn btn--accent" href="#contact">ابدأ التشخيص</a>
  </div>
</section>
```

```css
.band{position:relative;display:flex;align-items:center;overflow:hidden;min-height:clamp(440px,62vh,620px);background:var(--brand-900)}
.band__bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.band::after{content:"";position:absolute;inset:0;background:
  linear-gradient(to bottom,rgba(7,21,40,.88) 0%,rgba(7,21,40,.42) 45%,rgba(7,21,40,.80) 100%),
  linear-gradient(to left,rgba(7,21,40,.86) 0%,rgba(7,21,40,.55) 55%,rgba(7,21,40,.18) 100%)}
.band__in{position:relative;z-index:2;width:100%;max-width:var(--max);margin-inline:auto;padding:clamp(56px,8vw,90px) var(--pad)}
.band__in>*{max-width:58ch}
.band h2{color:#fff;max-width:20ch;font-size:clamp(1.7rem,3.6vw,2.65rem);margin-bottom:16px}
.band p{color:rgba(255,255,255,.84);line-height:1.9;margin-bottom:28px}
/* عناصر مفصولة بخط رأسي، تتحوّل لقائمة بشرطات على الجوال */
.band__pills{display:flex;flex-wrap:wrap;gap:8px 30px;margin-bottom:32px;max-width:none}
.band__pills li{position:relative;font-size:15.5px;color:rgba(255,255,255,.9);padding-block:4px}
.band__pills li:not(:last-child)::after{content:"";position:absolute;inset-inline-end:-15px;inset-block:8px;width:1px;background:rgba(255,255,255,.26)}
@media (max-width:680px){
  .band__pills{flex-direction:column;align-items:flex-start;gap:0}
  .band__pills li::before{content:"— ";color:var(--accent)}
  .band__pills li::after{display:none}
}
```

---

## ٤) قسم داكن بصورة خافتة

للأقسام التي تحتاج ثقلاً بصرياً دون أن تسرق الانتباه:

```html
<section class="section section--dark">
  <img class="sec-bg" src="img/team.jpg" alt="">
  <div class="sec-veil"></div>
  <div class="wrap"> … </div>
</section>
```

```css
.sec-bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:.13;z-index:0}
.sec-veil{position:absolute;inset:0;z-index:1;background:linear-gradient(to bottom,rgba(13,36,64,.86),rgba(13,36,64,.55) 45%,rgba(13,36,64,.9))}
.section--dark>.wrap{position:relative;z-index:2}
```

---

## ٥) الخطوات المرقّمة

```html
<ol class="grid grid--4">
  <li class="step"><span class="step__n">١</span><h3>التشخيص</h3><p>زيارة ميدانية وقياس الوضع الحالي.</p></li>
  …
</ol>
```

الرقم بخط العناوين، حجم كبير، بلون فاتح جداً من الهوية (`--brand-050`) خلف العنوان.

---

## ٦) الأسئلة على شكل محادثة

بديل الأكورديون التقليدي — من موقع التكامل المتحدة:

```html
<div class="chat">
  <div class="chat__row chat__row--q"><span class="chat__ava">؟</span><div class="bubble bubble--q">كم يستغرق المشروع؟</div></div>
  <div class="chat__row chat__row--a"><span class="chat__ava">✓</span><div class="bubble bubble--a">من ٤ إلى ١٢ أسبوعاً حسب حجم المستودع.</div></div>
</div>
```

فقاعة السؤال بخلفية فاتحة على جهة البداية، والجواب بلون الهوية على جهة النهاية،
والانحناء غير متماثل (`border-radius:18px 18px 18px 4px`).

---

## ٧) شريط شعارات العملاء

```html
<div class="marquee"><div class="marquee__track">
  <span class="marquee__item"><img src="logos/a.png" alt="عميل"></span>
  <!-- كرّر القائمة مرتين ليكون الدوران بلا فجوة -->
</div></div>
```

الشعارات `filter:grayscale(1);opacity:.55` وتعود لألوانها عند المرور.
`animation:marquee 32s linear infinite` وتتوقف عند `:hover`.

---

## ٨) الحث الختامي

سؤال + زر واتساب. لا نموذج طويل في الصفحة الرئيسية.

```html
<section class="section section--tint">
  <div class="wrap sec-head center">
    <h2>جاهزون لرفع كفاءة مستودعك؟</h2>
    <p>أرسل لنا رسالة واحدة، ونرد عليك خلال ساعات العمل بخطة مبدئية.</p>
    <a class="btn btn--wa" href="https://wa.me/9665XXXXXXXX">تواصل عبر واتساب</a>
  </div>
</section>
```

---

## ٩) الترويسة

`position:sticky;top:0` بارتفاع ٨٤px، شفافة فوق الهيرو ثم تمتلئ بالأبيض بعد التمرير
(`.is-scrolled`) مع ظل خفيف. القائمة على الجوال لوحة منزلقة من جهة البداية.
