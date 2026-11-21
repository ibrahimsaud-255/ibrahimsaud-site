/*
 * 33-nav.js — الشريط الجانبيّ على نمط آبل (macOS Tahoe / System Settings) — البادئة nv
 * ─────────────────────────────────────────────────────────────────────────
 * حسب إرشادات آبل للأشرطة الجانبيّة (HIG › Sidebars):
 *   • يطفو زجاجاً فوق المحتوى والخلفيّة تمتدّ تحته (التنسيق في assets/sidebar.css).
 *   • التطبيقات في مجموعات بعناوين قصيرة، وكلّ مجموعة تُطوى (مستويان كحدّ أقصى).
 *   • لا إجراءات مهمّة في أسفله: الحساب صفّ واحد أعلاه يفتح قائمة صغيرة (حسابي، بيانات الجمعيّة، الخروج).
 *   • يُخفى بزرّ الطيّ، وعلى الجوال لا يظهر إلا عند الطلب (التنقّل هناك = المكتب والـDock).
 * يستبدل renderNav (04-home) و rUserChip (20-org-core). ⚠️ تعريفات فقط.
 */
const NV_GROUPS = [
  ['', ['home', 'desktop']],
  ['العمل اليوميّ', ['tasks', 'season', 'calendar', 'inbox', 'library', 'boards', 'requests', 'myhr']],
  ['المال', ['finance', 'ledger', 'procurement', 'grants']],
  ['الناس', ['beneficiaries', 'volunteers', 'hr', 'team']],
  ['الحوكمة', ['governance', 'orgfile', 'comply', 'mail']],
  ['الموقع', ['site']],
];
function nvClosed() { try { return JSON.parse(localStorage.getItem('nv_closed') || '[]'); } catch (e) { return []; } }
function renderNav() {
  const items = navItems(), byId = Object.fromEntries(items.map(a => [a.id, a])), used = new Set(), closed = nvClosed();
  byId.desktop = { id: 'desktop', name: 'المكتب', icon: 'layout-grid' };
  const row = a => `<a data-v="${a.id}" onclick="go('${a.id}')"${CUR === a.id ? ' class="active"' : ''}><span class="nic"><i data-lucide="${a.icon}"></i></span><span class="nv-t">${esc(a.name)}</span></a>`;
  const groups = NV_GROUPS.map(([t, ids]) => [t, ids.filter(id => byId[id]).map(id => (used.add(id), byId[id]))]);
  const rest = items.filter(a => !used.has(a.id)); if (rest.length) groups.push(['أخرى', rest]);
  document.getElementById('nav').innerHTML = groups.filter(([, a]) => a.length).map(([t, a], i) => {
    const k = 'g' + i, off = t && closed.includes(t);
    return (t ? `<button type="button" class="nv-h${off ? ' off' : ''}" onclick="nvToggle(this,'${esc(t)}')" aria-expanded="${!off}">${esc(t)}<i data-lucide="chevron-down"></i></button>` : '')
      + `<div class="nv-g${off ? ' off' : ''}" data-g="${k}">${a.map(row).join('')}</div>`;
  }).join('');
  refreshIcons();
}
function nvToggle(b, t) {
  const g = b.nextElementSibling, off = !g.classList.contains('off');
  g.classList.toggle('off', off); b.classList.toggle('off', off); b.setAttribute('aria-expanded', String(!off));
  let c = nvClosed().filter(x => x !== t); if (off) c.push(t); try { localStorage.setItem('nv_closed', JSON.stringify(c)); } catch (e) {}
}

/* الحساب: صفّ واحد أعلى الشريط (مثل حساب Apple في إعدادات النظام) يفتح قائمة صغيرة */
function rUserChip() {
  const sb0 = document.getElementById('sidebar'); if (!sb0 || !ME) return;
  let c = document.getElementById('rMe');
  if (!c || !c.classList.contains('nv-acct')) { if (c) c.remove(); c = document.createElement('div'); c.id = 'rMe'; c.className = 'nv-acct'; const la = sb0.querySelector('.logo-area'); la ? la.after(c) : sb0.prepend(c); }
  c.innerHTML = `<button type="button" class="nv-me" onclick="nvMenu()" aria-haspopup="menu" aria-expanded="false">${avatar(ME, 36)}<span class="nv-me-t"><b>${esc(ME.name)}</b><small>${esc(ME.title || ROLES[ME.role])}</small></span><i data-lucide="chevron-down"></i></button>
    <div class="nv-menu" id="nvMenu" role="menu" hidden></div>`;
  refreshIcons();
}
function nvMenu(force) {
  const m = document.getElementById('nvMenu'), b = document.querySelector('.nv-me'); if (!m) return;
  const open = force !== undefined ? force : m.hidden;
  if (open) {
    // تُبنى عند الفتح: روابط الأسفل القديمة (بيانات الجمعيّة، الخروج…) تنتقل إلى هنا
    const links = Array.from(document.querySelectorAll('.nav-foot a')).filter(a => getComputedStyle(a).display !== 'none' && a.id !== 'rMe');
    m.innerHTML = `<button type="button" role="menuitem" onclick="nvMenu(false);myAccountModal()"><i data-lucide="user-round"></i> حسابي وصورتي</button>`
      + `<button type="button" role="menuitem" onclick="nvMenu(false);apDisplaySheet()"><i data-lucide="sun-moon"></i> المظهر والنص</button>`
      + links.map((a, i) => `<button type="button" role="menuitem" data-i="${i}"${/logout/.test(a.getAttribute('onclick') || '') ? ' class="bad"' : ''}>${a.innerHTML}</button>`).join('')
      + (RUSO_DEMO ? `<div class="nv-demo"><small>تجربة الصلاحيّات</small><select onchange="demoSwitch(this.value)">${ORG.members.map(x => `<option value="${x.id}"${x.id === ME.id ? ' selected' : ''}>عرض كـ: ${esc(x.name.split(' ')[0])} — ${esc(DEPTS[x.dept].short)}</option>`).join('')}</select></div>` : '');
    m.querySelectorAll('[data-i]').forEach(btn => btn.onclick = () => { nvMenu(false); links[+btn.dataset.i].click(); });
    m.hidden = false; refreshIcons();
    setTimeout(() => document.addEventListener('click', nvOutside, true), 0);
  } else { m.hidden = true; document.removeEventListener('click', nvOutside, true); }
  if (b) b.setAttribute('aria-expanded', String(!m.hidden));
}
function nvOutside(e) { if (!e.target.closest('.nv-acct')) nvMenu(false); }
