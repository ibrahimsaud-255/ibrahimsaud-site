/* ============================================================================
   قالب موقع — جافاسكربت التحسين فقط. الموقع يعمل بدونه.
   ============================================================================ */
(function () {
  "use strict";

  var reduce = matchMedia("(prefers-reduced-motion:reduce)").matches;

  /* ------------------------------------------------ الترويسة عند التمرير */
  var header = document.getElementById("header");
  function onScroll() {
    if (!header) return;
    header.classList.toggle("is-scrolled", scrollY > 40);
  }
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ------------------------------------------------------ قائمة الجوال */
  var burger = document.getElementById("burger");
  var nav = document.getElementById("nav");
  if (burger && nav) {
    burger.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") nav.classList.remove("is-open");
    });
  }

  /* ------------------------------------------------- شرائح الهيرو */
  var slides = document.querySelectorAll(".hero__slide");
  var dots = document.getElementById("dots");
  if (slides.length > 1) {
    var i = 0, timer = null;

    if (dots) {
      slides.forEach(function (_, n) {
        var b = document.createElement("button");
        b.className = n === 0 ? "is-on" : "";
        b.setAttribute("aria-label", "الشريحة " + (n + 1));
        b.addEventListener("click", function () { go(n); restart(); });
        dots.appendChild(b);
      });
    }

    function go(n) {
      slides[i].classList.remove("is-on");
      if (dots) dots.children[i].classList.remove("is-on");
      i = (n + slides.length) % slides.length;
      slides[i].classList.add("is-on");
      if (dots) dots.children[i].classList.add("is-on");
      /* إعادة تشغيل حركة التقريب */
      var img = slides[i].querySelector("img");
      if (img && !reduce) { img.style.animation = "none"; void img.offsetWidth; img.style.animation = ""; }
    }
    function restart() {
      clearInterval(timer);
      if (!reduce) timer = setInterval(function () { go(i + 1); }, 6500);
    }
    restart();
  }

  /* ------------------------------------------ تمرير ناعم للروابط الداخلية */
  document.addEventListener("click", function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute("href");
    if (id.length < 2) return;
    var t = document.querySelector(id);
    if (!t) return;
    e.preventDefault();
    t.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  });

  /* --------------------------------------- ظهور تدريجي عند الوصول للقسم */
  if (!reduce && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -12% 0px" });
    document.querySelectorAll(".card,.step,.sec-head,.band__in").forEach(function (el) {
      el.classList.add("reveal"); io.observe(el);
    });
    var st = document.createElement("style");
    st.textContent =
      ".reveal{opacity:0;transform:translateY(14px);transition:opacity .7s var(--ease),transform .7s var(--ease)}" +
      ".reveal.is-in{opacity:1;transform:none}";
    document.head.appendChild(st);
  }

  /* ------------------------------------------------------------ السنة */
  var yr = document.getElementById("yr");
  if (yr) yr.textContent = new Date().getFullYear();
})();
