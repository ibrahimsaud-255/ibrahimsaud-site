/* ============ App shell injector — sidebar + topbar shared across pages ============ */
(function () {
  const nav = [
    {
      group: "حسابي",
      items: [
        { key: "dashboard", label: "الرئيسيّة", href: "dashboard.html", icon: "home" },
        { key: "profile",   label: "شاهد ملفي", href: "profile.html?self=1", icon: "user" },
        { key: "settings",  label: "بياناتي وشروطي", href: "settings.html", icon: "clipboard" },
        { key: "points",    label: "نقاطي", href: "points.html", icon: "coin", badge: "٤٥٠" },
        { key: "notifs",    label: "التبليغات", href: "notifications.html", icon: "bell", badge: "12" },
        { key: "likes",     label: "أعجب بي", href: "#", icon: "thumb", badge: "7" },
        { key: "engagement",label: "طلبات التوافق", href: "engagement.html", icon: "heart", badge: "2" },
        { key: "favorites", label: "المفضّلون", href: "#", icon: "star" },
        { key: "chat",      label: "الرسائل", href: "chat.html", icon: "chat", badge: "3" },
        { key: "blocks",    label: "قائمة الحظر", href: "#", icon: "block" },
        { key: "stories",   label: "قصص النجاح", href: "#", icon: "book" },
      ],
    },
    {
      group: "الأعضاء",
      items: [
        { key: "search",    label: "البحث المتقدّم", href: "search.html", icon: "search" },
        { key: "matches",   label: "المتوافقون معي", href: "search.html?matched=1", icon: "match" },
        { key: "counselor", label: "المستشار الأسريّ", href: "counselor.html", icon: "phone" },
      ],
    },
    {
      group: "لوحات إضافيّة",
      items: [
        { key: "guardian", label: "لوحة وليّ الأمر", href: "guardian.html", icon: "family" },
        { key: "broker",   label: "لوحة الوسيط", href: "broker.html", icon: "network" },
        { key: "admin",    label: "لوحة الإدارة", href: "admin.html", icon: "shield" },
      ],
    },
  ];

  const icons = {
    home:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12l9-8 9 8"/><path d="M5 10v10h14V10"/></svg>',
    user:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0116 0"/></svg>',
    clipboard: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="4" width="12" height="18" rx="2"/><path d="M9 3h6v3H9z"/></svg>',
    thumb:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 9V5a3 3 0 00-6 0v4H4v11h16V9z"/></svg>',
    heart:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.6l-1-1a5.5 5.5 0 00-7.8 7.8l1 1L12 21l7.8-7.8 1-1a5.5 5.5 0 000-7.6z"/></svg>',
    star:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1 3-6z"/></svg>',
    chat:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 01-2 2H8l-5 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>',
    block:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M4.9 4.9l14.2 14.2"/></svg>',
    book:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>',
    coin:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 6v12M8 10h6a2 2 0 010 4H9a2 2 0 000 4h7"/></svg>',
    bell:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 8a6 6 0 0112 0c0 7 3 9 3 9H3s3-2 3-9M14 21a2 2 0 01-4 0"/></svg>',
    search:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>',
    match:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.6l-1-1a5.5 5.5 0 00-7.8 7.8l1 1L12 21l7.8-7.8 1-1a5.5 5.5 0 000-7.6z"/></svg>',
    phone:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3.1 19.5 19.5 0 01-6-6A19.8 19.8 0 012.1 4.2 2 2 0 014.1 2h3a2 2 0 012 1.7c.1.9.3 1.8.6 2.6a2 2 0 01-.4 2.1L8 9.8a16 16 0 006 6l1.4-1.4a2 2 0 012.1-.4c.8.3 1.7.5 2.6.6a2 2 0 011.7 2z"/></svg>',
    family:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="8" r="3"/><circle cx="17" cy="10" r="3"/><path d="M3 21a6 6 0 0112 0M14 21a5 5 0 018-4"/></svg>',
    network:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="5" r="2"/><circle cx="5" cy="19" r="2"/><circle cx="19" cy="19" r="2"/><path d="M12 7v3M12 10l-6 7M12 10l6 7"/></svg>',
    shield:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l8 4v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6z"/></svg>',
  };

  function renderSidebar(activeKey) {
    return `
      <aside class="side">
        <div class="side-brand">
          <img src="../assets/logo.webp" alt="تكوين الأسرة" />
          <div class="n">تكوين الأسرة<small>منصّة التوافق</small></div>
        </div>
        ${nav.map(g => `
          <div class="side-group">${g.group}</div>
          <nav class="side-list">
            ${g.items.map(it => `
              <a class="side-item${it.key === activeKey ? ' active' : ''}" href="${it.href}">
                ${icons[it.icon] || ''}
                ${it.label}
                ${it.badge ? `<span class="badge">${it.badge}</span>` : ''}
              </a>
            `).join('')}
          </nav>
        `).join('')}
        <div class="side-footer">
          جمعيّة تكوين الأسرة — الخبر<br/>
          ترخيص <span class="en">100072430</span>
        </div>
      </aside>
    `;
  }

  function renderTopbar(pageTitle) {
    return `
      <div class="topbar-app">
        <div class="searchbar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>
          <input type="text" placeholder="ابحث بالاسم أو رقم العضويّة…" />
        </div>
        <div class="actions">
          <a class="icon-round" href="chat.html" title="الرسائل">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 01-2 2H8l-5 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
            <span class="dot-badge">3</span>
          </a>
          <a class="icon-round" title="الإشعارات">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 8a6 6 0 0112 0c0 7 3 9 3 9H3s3-2 3-9M14 21a2 2 0 01-4 0"/></svg>
            <span class="dot-badge">5</span>
          </a>
          <a class="icon-round" href="counselor.html" title="المستشار الأسريّ">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3.1 19.5 19.5 0 01-6-6A19.8 19.8 0 012.1 4.2 2 2 0 014.1 2h3a2 2 0 012 1.7c.1.9.3 1.8.6 2.6a2 2 0 01-.4 2.1L8 9.8a16 16 0 006 6l1.4-1.4a2 2 0 012.1-.4c.8.3 1.7.5 2.6.6a2 2 0 011.7 2z"/></svg>
          </a>
          <a class="me" href="settings.html">
            <span class="name">أبو سعود</span>
            <span class="avatar">أ</span>
          </a>
        </div>
      </div>
    `;
  }

  window.mountShell = function (activeKey) {
    const sideMount = document.querySelector('[data-shell="side"]');
    const topMount = document.querySelector('[data-shell="top"]');
    if (sideMount) sideMount.outerHTML = renderSidebar(activeKey);
    if (topMount) topMount.outerHTML = renderTopbar();
  };
})();
