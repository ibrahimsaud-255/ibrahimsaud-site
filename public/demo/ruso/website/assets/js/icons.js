/*
 * icons.js — أيقونات رسو المرسومة خصيصاً (خط متصل بسماكة واحدة + لمسة «الخطوط المائلة» من الشعار)
 * تُستخدم بلا مربعات حولها: bi('gem', 56)
 */
(function () {
  const S = (d) => d; // للتوضيح فقط
  const I = {
    /* المحاور */
    skill: S('<path d="M7 40l7-15h7l-7 15z" fill="currentColor" stroke="none" opacity=".35"/><path d="M18 40l9-20h7l-9 20z" fill="currentColor" stroke="none" opacity=".6"/><path d="M29 40l11-26h7l-11 26z" fill="currentColor" stroke="none"/><path d="M9 15l3-3 3 3M12 12v9" />'),
    gem: S('<path d="M14 8h20l8 11-18 22L6 19z"/><path d="M6 19h36M19 8l-4 11 9 22 9-22-4-11"/>'),
    book: S('<path d="M24 13c-4.5-3.5-11-4.5-18-3.5v27c7-1 13.5 0 18 3.5 4.5-3.5 11-4.5 18-3.5v-27c-7-1-13.5 0-18 3.5z"/><path d="M24 13v27"/><path d="M11 18c3-.4 5.8 0 8 1M11 24c3-.4 5.8 0 8 1M29 19c2.2-1 5-1.4 8-1"/><path d="M33 27l3-7" stroke-width="3.2" stroke="var(--gold, #CAB05F)"/>'),
    /* الرؤية والرسالة */
    vision: S('<path d="M3 24s7.5-13 21-13 21 13 21 13-7.5 13-21 13S3 24 3 24z"/><circle cx="24" cy="24" r="7"/><path d="M22 28l4-8" stroke-width="3" stroke="var(--gold, #CAB05F)"/>'),
    mission: S('<circle cx="24" cy="24" r="18"/><circle cx="24" cy="24" r="2"/><path d="M24 8l5.5 14L24 40l-5.5-18z"/><path d="M24 8l5.5 14H18.5z" fill="currentColor" stroke="none" opacity=".35"/>'),
    /* القيم */
    initiative: S('<path d="M12 43V6"/><path d="M12 8h22l-5 7.5 5 7.5H12"/><path d="M8 43h10"/>'),
    leadership: S('<path d="M3 41l13-19 7 9 6-8 16 18z"/><path d="M29 23V8"/><path d="M29 9h9l-2.5 3 2.5 3h-9"/>'),
    impact: S('<circle cx="24" cy="24" r="3" fill="currentColor"/><path d="M15 24a9 9 0 0 1 9-9M33 24a9 9 0 0 1-9 9"/><path d="M7 24A17 17 0 0 1 24 7M41 24a17 17 0 0 1-17 17"/>'),
    communication: S('<path d="M5 9h24v15H14l-6 5v-5H5z"/><path d="M33 17h10v15h-3v5l-6-5H21v-5"/><path d="M11 15h12M11 19h7"/>'),
    citizenship: S('<path d="M24 44V20"/><path d="M24 20c-2-6-8-9-15-8 4 1 7 3 8 6"/><path d="M24 20c2-6 8-9 15-8-4 1-7 3-8 6"/><path d="M24 20c-4-3-6-8-5-14 2 3 4 6 5 9"/><path d="M24 20c4-3 6-8 5-14-2 3-4 6-5 9"/><path d="M17 44h14"/>'),
    development: S('<path d="M24 43V24"/><path d="M24 30c-9 0-14-5-14-13 9 0 14 5 14 13z"/><path d="M24 25c0-8 5-13 14-13 0 8-5 13-14 13z"/><path d="M16 43h16"/>'),
    /* الأهداف */
    youth: S('<circle cx="20" cy="11" r="5"/><path d="M10 42V28a10 10 0 0 1 20 0v14"/><path d="M38 34V12M33 17l5-5 5 5"/>'),
    workers: S('<circle cx="16" cy="12" r="5"/><path d="M6 42V29a10 10 0 0 1 20 0v13"/><circle cx="34" cy="17" r="4"/><path d="M28 42V32a6 6 0 0 1 12 0v10"/>'),
    environment: S('<path d="M6 22L24 7l18 15"/><path d="M10 19v23h28V19"/><path d="M24 37c-5-3-8-6-8-10a4 4 0 0 1 8-1.5A4 4 0 0 1 32 27c0 4-3 7-8 10z"/>'),
    /* عامة */
    building: S('<path d="M8 42V12l16-6 16 6v30"/><path d="M4 42h40"/><path d="M15 18h4M29 18h4M15 26h4M29 26h4M21 42v-9h6v9"/>'),
    volunteer: S('<path d="M6 30l8-3 10 3 9-4c2-1 4 1 2 3l-10 7-12-1-7 3"/><path d="M24 22c-5-3-8-6-8-10a4 4 0 0 1 8-1.5 4 4 0 0 1 8 1.5c0 4-3 7-8 10z"/>'),
    handshake: S('<path d="M4 20l8-6 8 2 6-3 8 1 10 6"/><path d="M4 20v10l7 5M44 20v10l-9 7"/><path d="M20 16l-5 6c-1 2 1 4 3 3l6-4 9 9c1.5 1.5-1 4-2.5 2.5M27 31l-3 3M23 27l-4 4"/>'),
    heart: S('<path d="M24 41C12 33 6 26 6 18a9 9 0 0 1 18-3 9 9 0 0 1 18 3c0 8-6 15-18 23z"/>'),
    target: S('<circle cx="24" cy="24" r="18"/><circle cx="24" cy="24" r="11"/><circle cx="24" cy="24" r="4" fill="currentColor"/><path d="M24 24L40 8M34 8h6v6"/>'),
    doc: S('<path d="M28 5H12a3 3 0 0 0-3 3v32a3 3 0 0 0 3 3h24a3 3 0 0 0 3-3V16z"/><path d="M28 5v11h11"/><path d="M16 26h16M16 33h10"/>'),
    arrowL: S('<path d="M30 12L18 24l12 12"/>'),
    calendar: S('<rect x="6" y="9" width="36" height="33" rx="4"/><path d="M6 18h36M16 5v8M32 5v8"/>'),
    quote: S('<path d="M20 12c-7 3-11 9-11 16v8h11V25h-6c0-5 3-8 7-10zM39 12c-7 3-11 9-11 16v8h11V25h-6c0-5 3-8 7-10z" fill="currentColor" stroke="none"/>'),
  };
  window.RUSO_ICONS = I;
  window.bi = function (name, size, cls) {
    return `<svg class="bi ${cls || ''}" width="${size || 48}" height="${size || 48}" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${I[name] || ''}</svg>`;
  };
})();
