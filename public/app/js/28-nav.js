/*
 * 28-nav.js — الشريط الجانبيّ على نمط macOS Tahoe (زجاج عائم، مجموعات تُطوى، الحساب أعلاه) — البادئة nv
 * ─────────────────────────────────────────────────────────────────────────
 * منقول من نظام الجمعيات الشبابية (public/charity/js/33-nav.js). الشكل في assets/sidebar.css.
 * روابط الأسفل القديمة (.nav-foot: الاستوديو 3D، الإعدادات، الخروج) تنتقل إلى قائمة الحساب.
 * يستبدل renderNav (04-home) و applyBranding (19-freeform). ⚠️ تعريفات فقط.
 */
const NV_GROUPS = [
  ['', ['home', 'desktop', 'huroof', 'dashboards']],
  ['المبيعات والعملاء', ['sales', 'pipeline', 'contacts', 'partners', 'collab', 'quotedesign', 'pricing']],
  ['المال', ['invoicing', 'accounting', 'subs', 'products', 'suppliers', 'dshop']],
  ['العمل', ['projects', 'calendar', 'boards', 'habits']],
  ['الموقع والمحتوى', ['sitework', 'blog', 'newsletter']],
];
function nvClosed() { try { return JSON.parse(localStorage.getItem('nv_closed') || '[]'); } catch (e) { return []; } }
function renderNav() {
  const items = navItems(), byId = Object.fromEntries(items.map(a => [a.id, a])), used = new Set(), closed = nvClosed();
  const row = a => a.href ? `<a href="${a.href}"><span class="nic"><i data-lucide="${a.icon}"></i></span><span class="nv-t">${esc(a.name)}</span></a>`
    : `<a data-v="${a.id}" onclick="go('${a.id}')"${CUR === a.id ? ' class="active"' : ''}><span class="nic"><i data-lucide="${a.icon}"></i></span><span class="nv-t">${esc(a.name)}</span></a>`;
  const groups = NV_GROUPS.map(([t, ids]) => [t, ids.filter(id => byId[id]).map(id => (used.add(id), byId[id]))]);
  const rest = items.filter(a => !used.has(a.id)); if (rest.length) groups.push(['أخرى', rest]);
  document.getElementById('nav').innerHTML = groups.filter(([, a]) => a.length).map(([t, a]) => {
    const off = t && closed.includes(t);
    return (t ? `<button type="button" class="nv-h${off ? ' off' : ''}" onclick="nvToggle(this,'${esc(t)}')" aria-expanded="${!off}">${esc(t)}<i data-lucide="chevron-down"></i></button>` : '')
      + `<div class="nv-g${off ? ' off' : ''}">${a.map(row).join('')}</div>`;
  }).join('');
  rUserChip();
  refreshIcons();
}
function nvToggle(b, t) {
  const g = b.nextElementSibling, off = !g.classList.contains('off');
  g.classList.toggle('off', off); b.classList.toggle('off', off); b.setAttribute('aria-expanded', String(!off));
  let c = nvClosed().filter(x => x !== t); if (off) c.push(t); try { localStorage.setItem('nv_closed', JSON.stringify(c)); } catch (e) {}
}

/* الحساب: صفّ واحد أعلى الشريط يفتح قائمة صغيرة */
function rUserChip() {
  const sb0 = document.getElementById('sidebar'); if (!sb0) return;
  let c = document.getElementById('rMe');
  if (!c) { c = document.createElement('div'); c.id = 'rMe'; c.className = 'nv-acct'; const la = sb0.querySelector('.logo-area'); la ? la.after(c) : sb0.prepend(c); }
  const email = (typeof USER !== 'undefined' && USER && USER.email) || '';
  const name = (S.settings && S.settings.ownerName) || 'إبراهيم سعود';
  c.innerHTML = `<button type="button" class="nv-me" onclick="nvMenu()" aria-haspopup="menu" aria-expanded="false"><span class="nv-av" aria-hidden="true">${esc(name.trim().charAt(0))}</span><span class="nv-me-t"><b>${esc(name)}</b><small>${esc(WS_DEMO ? 'نسخة تجريبيّة' : (email || 'المالك'))}</small></span><i data-lucide="chevron-down"></i></button>
    <div class="nv-menu" id="nvMenu" role="menu" hidden></div>`;
}
function nvMenu(force) {
  const m = document.getElementById('nvMenu'), b = document.querySelector('.nv-me'); if (!m) return;
  const open = force !== undefined ? force : m.hidden;
  if (open) {
    const links = Array.from(document.querySelectorAll('.nav-foot a')).filter(a => a.style.display !== 'none');
    m.innerHTML = `<button type="button" role="menuitem" onclick="nvMenu(false);apDisplaySheet()"><i data-lucide="sun-moon"></i> المظهر والنص</button>`
      + `<button type="button" role="menuitem" onclick="nvMenu(false);wallpaperModal()"><i data-lucide="image"></i> الخلفيّة</button>`
      + (WS_DEMO ? '' : links.map((a, i) => `<button type="button" role="menuitem" data-i="${i}"${/logout/.test(a.getAttribute('onclick') || '') ? ' class="bad"' : ''}>${a.innerHTML}</button>`).join(''));
    m.querySelectorAll('[data-i]').forEach(btn => btn.onclick = () => { nvMenu(false); links[+btn.dataset.i].click(); });
    m.hidden = false; refreshIcons();
    setTimeout(() => document.addEventListener('click', nvOutside, true), 0);
  } else { m.hidden = true; document.removeEventListener('click', nvOutside, true); }
  if (b) b.setAttribute('aria-expanded', String(!m.hidden));
}
function nvOutside(e) { if (!e.target.closest('.nv-acct')) nvMenu(false); }

/* الشعار + المظهر + الخلفيّة — تُنادى عند كلّ دخول (enterApp / enterDemo) */
function applyBranding() {
  // الشعار: ما رفعته في الإعدادات، وإلا نسخة الموقع المحلّيّة الأحاديّة (أسرع من رابط GitHub وتنقلب في الداكن)
  const sl = document.querySelector('.logo-area img'); if (sl) { sl.src = S.settings.logo || '/v2/ibrahim-saud-logo-black-tight.png'; sl.classList.toggle('ib-logo', !S.settings.logo); sl.style.display = ''; }
  applyTheme(); applyWallpaper(); rUserChip(); refreshIcons();
}
