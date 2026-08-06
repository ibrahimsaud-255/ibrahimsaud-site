/* ============================================================================
   بوابة المواقع — التحكم بمواقع العملاء داخل النظام
   • فتح/إقفال أي موقع، أو فتحه لمدة محدّدة مع عدّ تنازلي.
   • إحصاءات الزيارات لكل موقع وصفحة.
   • «طلب فتح»: إشعار يصلك عندما يضغط العميل زر واتساب في شاشة العدسة.
   • ربط كل موقع بعميل من نظام العملاء.
   الجداول: client_sites · site_visits · site_knocks   (supabase/client_sites.sql)
   ============================================================================ */

let GT_SITES = null, GT_VISITS = null, GT_KNOCKS = null, GT_SEL = null, GT_LOADING = false, GT_ERR = null;

/* ------------------------------------------------------------------ أدوات */
function gtNow() { return Date.now(); }

function gtIsOpen(s) {
  if (!s) return false;
  if (s.status !== 'open') return false;
  if (s.expires_at && new Date(s.expires_at).getTime() <= gtNow()) return false;
  return true;
}

/* عدّ تنازلي مقروء: "٥ ساعات و١٢ دقيقة" */
function gtLeft(iso) {
  const ms = new Date(iso).getTime() - gtNow();
  if (ms <= 0) return 'انتهت';
  const m = Math.floor(ms / 60000), h = Math.floor(m / 60), d = Math.floor(h / 24);
  if (d > 0) return d + ' ي و' + (h % 24) + ' س';
  if (h > 0) return h + ' س و' + (m % 60) + ' د';
  return m + ' د';
}

function gtDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('ar-SA-u-nu-latn', { day: 'numeric', month: 'short' }) + ' · ' +
    d.toLocaleTimeString('ar-SA-u-nu-latn', { hour: '2-digit', minute: '2-digit' });
}

function gtDayKey(iso) { return String(iso).slice(0, 10); }

function gtStatusPill(s) {
  if (gtIsOpen(s)) {
    return s.expires_at
      ? '<span class="pill scheduled">مفتوح · يقفل بعد ' + esc(gtLeft(s.expires_at)) + '</span>'
      : '<span class="pill done">مفتوح</span>';
  }
  return '<span class="pill unpaid">مقفل</span>';
}

/* ------------------------------------------------------------ تحميل البيانات */
async function gtLoad(force) {
  if (GT_LOADING) return;
  if (GT_SITES && !force) return;
  GT_LOADING = true; GT_ERR = null;
  try {
    const since = new Date(gtNow() - 30 * 864e5).toISOString();
    const [sites, visits, knocks] = await Promise.all([
      sb.from('client_sites').select('*').order('name'),
      sb.from('site_visits').select('slug,path,ref,device,visitor,at').gte('at', since).order('at', { ascending: false }).limit(8000),
      sb.from('site_knocks').select('*').order('at', { ascending: false }).limit(200)
    ]);
    if (sites.error) throw new Error(sites.error.message);
    GT_SITES = sites.data || [];
    GT_VISITS = visits.error ? [] : (visits.data || []);
    GT_KNOCKS = knocks.error ? [] : (knocks.data || []);
  } catch (e) {
    GT_ERR = e.message || 'تعذّر الاتصال';
  }
  GT_LOADING = false;
  renderSites();
}

/* إحصاءات موقع واحد */
function gtStats(slug) {
  const v = (GT_VISITS || []).filter(x => x.slug === slug);
  const dayAgo = gtNow() - 864e5, weekAgo = gtNow() - 7 * 864e5;
  const t = x => new Date(x.at).getTime();
  const uniq = new Set(v.map(x => x.visitor)).size;
  return {
    all: v.length,
    today: v.filter(x => t(x) >= dayAgo).length,
    week: v.filter(x => t(x) >= weekAgo).length,
    uniq: uniq,
    last: v.length ? v[0].at : null,
    rows: v
  };
}

/* سلسلة آخر ١٤ يوماً */
function gtSeries(rows, days) {
  days = days || 14;
  const out = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(gtNow() - i * 864e5);
    const key = d.toISOString().slice(0, 10);
    out.push({ key: key, label: d.getDate(), value: rows.filter(x => gtDayKey(x.at) === key).length });
  }
  return out;
}

function gtBars(series) {
  const max = Math.max(1, ...series.map(s => s.value));
  return '<div class="gt-bars">' + series.map(s =>
    '<div class="gt-bar" title="' + esc(s.key) + ' — ' + s.value + ' زيارة">' +
    '<span style="height:' + Math.round((s.value / max) * 100) + '%"></span>' +
    '<small>' + s.label + '</small></div>').join('') + '</div>';
}

function gtTop(rows, field, n) {
  const map = {};
  rows.forEach(r => { const k = (r[field] || '—'); map[k] = (map[k] || 0) + 1; });
  return Object.keys(map).map(k => ({ k: k, v: map[k] })).sort((a, b) => b.v - a.v).slice(0, n || 6);
}

/* ------------------------------------------------------------------ الواجهة */
function renderSites() {
  const el = document.getElementById('main');
  if (!GT_SITES && !GT_ERR) {
    el.innerHTML = `<div class="page-head"><h1><i data-lucide="door-closed"></i> بوابة المواقع</h1></div>
      <div class="card" style="text-align:center;padding:30px;opacity:.7">جارٍ التحميل…</div>`;
    refreshIcons(); gtLoad();
    return;
  }
  if (GT_ERR) {
    el.innerHTML = `<div class="page-head"><h1><i data-lucide="door-closed"></i> بوابة المواقع</h1></div>
      <div class="card"><h3><i data-lucide="shield-alert"></i> تعذّر التحميل</h3>
      <div style="opacity:.85;margin-bottom:12px">${esc(GT_ERR)}</div>
      <div style="opacity:.6;font-size:13px">تأكّد من تنفيذ ملف <code>supabase/client_sites.sql</code> في لوحة Supabase.</div>
      <button class="btn btn-ghost btn-sm" style="margin-top:12px" onclick="gtLoad(true)"><i data-lucide="refresh-cw"></i> إعادة المحاولة</button></div>`;
    refreshIcons();
    return;
  }
  if (GT_SEL) { gtDetail(GT_SEL); return; }

  const newKnocks = (GT_KNOCKS || []).filter(k => !k.seen);
  const allVisits = GT_VISITS || [];
  const dayAgo = gtNow() - 864e5, weekAgo = gtNow() - 7 * 864e5;
  const today = allVisits.filter(v => new Date(v.at).getTime() >= dayAgo).length;
  const week = allVisits.filter(v => new Date(v.at).getTime() >= weekAgo).length;
  const uniq = new Set(allVisits.map(v => v.visitor)).size;

  el.innerHTML = `
    <div class="page-head"><h1><i data-lucide="door-closed"></i> بوابة المواقع</h1>
      <div style="display:flex;gap:6px">
        <button class="btn btn-ghost btn-sm" onclick="gtLoad(true)"><i data-lucide="refresh-cw"></i> تحديث</button>
        <button class="btn btn-gold btn-sm" onclick="gtSiteForm()"><i data-lucide="plus"></i> موقع جديد</button>
      </div>
    </div>

    ${gtStyle()}

    <div class="stats">
      <div class="stat"><span class="ic" style="color:#0ea5e9"><i data-lucide="mouse-pointer-click"></i></span><div class="v">${today}</div><div class="l">زيارة اليوم</div></div>
      <div class="stat"><span class="ic" style="color:#22c55e"><i data-lucide="trending-up"></i></span><div class="v">${week}</div><div class="l">آخر ٧ أيام</div></div>
      <div class="stat"><span class="ic" style="color:#a855f7"><i data-lucide="users"></i></span><div class="v">${uniq}</div><div class="l">زائر مميّز (٣٠ يوم)</div></div>
      <div class="stat"><span class="ic" style="color:${newKnocks.length ? '#f59e0b' : ''}"><i data-lucide="bell-ring"></i></span><div class="v">${newKnocks.length}</div><div class="l">طلبات فتح جديدة</div></div>
    </div>

    ${newKnocks.length ? `<div class="card" style="border-color:#f59e0b55;margin-bottom:14px">
      <h3><i data-lucide="bell-ring"></i> طلبات فتح جديدة</h3>
      ${newKnocks.slice(0, 6).map(k => {
        const site = (GT_SITES || []).find(s => s.slug === k.slug);
        return `<div class="gt-knock-row">
          <div><b>${esc(site ? site.name : k.slug)}</b><small>${esc(k.msg || '')} · ${esc(gtDate(k.at))}</small></div>
          <div style="display:flex;gap:6px">
            <button class="btn btn-gold btn-sm" onclick="gtOpenFor('${esc(k.slug)}',24)"><i data-lucide="unlock"></i> افتح ٢٤ ساعة</button>
            <button class="btn btn-ghost btn-sm" onclick="gtSeen(${k.id})"><i data-lucide="check"></i></button>
          </div></div>`;
      }).join('')}
    </div>` : ''}

    <div class="gt-grid">
      ${(GT_SITES || []).map(s => {
        const st = gtStats(s.slug);
        const open = gtIsOpen(s);
        return `<div class="card gt-card">
          <div class="gt-head">
            <div class="gt-dot ${open ? 'on' : 'off'}"></div>
            <div style="min-width:0;flex:1">
              <b>${esc(s.name)}</b>
              <small><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.url)}</a>${s.client_name ? ' · ' + esc(s.client_name) : ''}</small>
            </div>
            ${gtStatusPill(s)}
          </div>

          <div class="gt-mini">
            <div><b>${st.today}</b><span>اليوم</span></div>
            <div><b>${st.week}</b><span>٧ أيام</span></div>
            <div><b>${st.uniq}</b><span>زائر</span></div>
            <div><b>${st.all}</b><span>٣٠ يوم</span></div>
          </div>

          ${gtBars(gtSeries(st.rows, 14))}

          <div class="gt-actions">
            ${open
              ? `<button class="btn btn-sm" style="background:#ef444422;border-color:#ef444455" onclick="gtSetStatus('${esc(s.slug)}','locked')"><i data-lucide="lock"></i> إقفال</button>`
              : `<button class="btn btn-gold btn-sm" onclick="gtSetStatus('${esc(s.slug)}','open')"><i data-lucide="unlock"></i> فتح</button>`}
            <select class="gt-sel" onchange="if(this.value){gtOpenFor('${esc(s.slug)}',+this.value);this.value=''}">
              <option value="">فتح لمدة…</option>
              <option value="2">ساعتان</option>
              <option value="6">٦ ساعات</option>
              <option value="24">يوم</option>
              <option value="72">٣ أيام</option>
              <option value="168">أسبوع</option>
            </select>
            <button class="btn btn-ghost btn-sm" onclick="gtPreview('${esc(s.slug)}')" title="يفتح لك الموقع دائماً حتى وهو مقفل"><i data-lucide="eye"></i> معاينتي</button>
            <button class="btn btn-ghost btn-sm" onclick="GT_SEL='${esc(s.slug)}';renderSites()"><i data-lucide="bar-chart-3"></i> التفاصيل</button>
            <button class="btn btn-ghost btn-sm" onclick="gtSiteForm('${esc(s.slug)}')"><i data-lucide="settings-2"></i></button>
          </div>
          <div class="gt-last">${st.last ? 'آخر زيارة: ' + esc(gtDate(st.last)) : 'لا زيارات بعد'}</div>
        </div>`;
      }).join('')}
    </div>

    <div class="card" style="margin-top:14px;opacity:.75;font-size:12.5px;line-height:1.9">
      <b>كيف تعمل البوابة؟</b><br>
      كل موقع فيه سطر واحد يربطه بالنظام. عند الإقفال يظهر الموقع كاملاً لكن مغبّشاً، ومع الزائر
      عدسة يحرّكها ليكشف ما تحتها — وتكبر كلما ضغط أكثر — بلا تصفّح ولا نسخ،
      وفي الزاوية زر واتساب يصلك عبره طلب الفتح ويُسجَّل هنا.
      زر «معاينتي» ينسخ لك رابطاً خاصاً يفتح لك الموقع دائماً — لا تشاركه مع أحد.
    </div>`;
  refreshIcons();
}

/* ------------------------------------------------------------------ التفاصيل */
function gtDetail(slug) {
  const s = (GT_SITES || []).find(x => x.slug === slug);
  if (!s) { GT_SEL = null; renderSites(); return; }
  const st = gtStats(slug);
  const knocks = (GT_KNOCKS || []).filter(k => k.slug === slug);
  const pages = gtTop(st.rows, 'path', 8);
  const refs = gtTop(st.rows, 'ref', 6);
  const mob = st.rows.filter(r => r.device === 'mobile').length;
  const pct = st.rows.length ? Math.round((mob / st.rows.length) * 100) : 0;

  document.getElementById('main').innerHTML = `
    <div class="page-head"><h1><i data-lucide="bar-chart-3"></i> ${esc(s.name)}</h1>
      <button class="btn btn-ghost btn-sm" onclick="GT_SEL=null;renderSites()"><i data-lucide="arrow-right"></i> رجوع</button>
    </div>
    ${gtStyle()}
    <div class="stats">
      <div class="stat"><span class="ic" style="color:#0ea5e9"><i data-lucide="mouse-pointer-click"></i></span><div class="v">${st.today}</div><div class="l">اليوم</div></div>
      <div class="stat"><span class="ic" style="color:#22c55e"><i data-lucide="calendar"></i></span><div class="v">${st.week}</div><div class="l">٧ أيام</div></div>
      <div class="stat"><span class="ic" style="color:#a855f7"><i data-lucide="users"></i></span><div class="v">${st.uniq}</div><div class="l">زائر مميّز</div></div>
      <div class="stat"><span class="ic" style="color:#f59e0b"><i data-lucide="smartphone"></i></span><div class="v">${pct}%</div><div class="l">من الجوال</div></div>
    </div>

    <div class="card"><h3><i data-lucide="activity"></i> الزيارات — آخر ١٤ يوماً</h3>${gtBars(gtSeries(st.rows, 14))}</div>

    <div class="gt-grid" style="margin-top:14px">
      <div class="card"><h3><i data-lucide="file-text"></i> أكثر الصفحات زيارة</h3>
        ${pages.length ? pages.map(p => `<div class="gt-row"><span>${esc(p.k)}</span><b>${p.v}</b></div>`).join('') : '<div style="opacity:.6">لا بيانات</div>'}
      </div>
      <div class="card"><h3><i data-lucide="link"></i> من أين جاء الزوّار</h3>
        ${refs.length ? refs.map(r => `<div class="gt-row"><span>${esc(r.k === '—' ? 'مباشر (رابط مكتوب)' : r.k)}</span><b>${r.v}</b></div>`).join('') : '<div style="opacity:.6">لا بيانات</div>'}
      </div>
    </div>

    <div class="card" style="margin-top:14px"><h3><i data-lucide="bell-ring"></i> سجلّ طلبات الفتح (${knocks.length})</h3>
      ${knocks.length ? knocks.map(k => `<div class="gt-row"><span>${esc(gtDate(k.at))} ${k.seen ? '' : '<span class="pill unpaid">جديد</span>'}</span>
        ${k.seen ? '' : `<button class="btn btn-ghost btn-sm" onclick="gtSeen(${k.id})">تمّت</button>`}</div>`).join('')
      : '<div style="opacity:.6">لا توجد طلبات فتح بعد</div>'}
    </div>`;
  refreshIcons();
}

/* ------------------------------------------------------------------ إجراءات */
async function gtSetStatus(slug, status, expires) {
  const patch = { status: status, expires_at: expires || null };
  const { error } = await sb.from('client_sites').update(patch).eq('slug', slug);
  if (error) { alert('تعذّر الحفظ: ' + error.message); return; }
  const s = (GT_SITES || []).find(x => x.slug === slug);
  if (s) { s.status = status; s.expires_at = patch.expires_at; }
  renderSites();
}

function gtOpenFor(slug, hours) {
  gtSetStatus(slug, 'open', new Date(gtNow() + hours * 3600e3).toISOString());
}

async function gtSeen(id) {
  await sb.from('site_knocks').update({ seen: true }).eq('id', id);
  const k = (GT_KNOCKS || []).find(x => x.id === id);
  if (k) k.seen = true;
  renderSites();
}

/* رابط معاينتك الخاص (يفتح الموقع لك حتى وهو مقفل) */
async function gtPreview(slug) {
  const { data, error } = await sb.from('client_sites').select('url,owner_key').eq('slug', slug).single();
  if (error) { alert('تعذّر جلب المفتاح: ' + error.message); return; }
  const link = location.origin + data.url + (data.url.indexOf('?') > -1 ? '&' : '?') + 'k=' + data.owner_key;
  try { await navigator.clipboard.writeText(link); } catch (e) { /* تجاهل */ }
  openModal('رابط معاينتك الخاص',
    `<div style="font-size:13px;line-height:1.9;opacity:.8;margin-bottom:10px">
       يفتح لك الموقع دائماً حتى وهو مقفل، ولا يُحتسب في الإحصاءات. لا تشاركه مع العميل.
     </div>
     <div style="word-break:break-all;background:rgba(255,255,255,.06);padding:10px;border-radius:10px;font-size:12.5px">${esc(link)}</div>
     <div style="margin-top:10px"><a class="btn btn-gold btn-sm" href="${esc(link)}" target="_blank" rel="noopener"><i data-lucide="external-link"></i> افتح الآن</a></div>`,
    null);
  refreshIcons();
}

/* إضافة / تعديل موقع وربطه بعميل */
function gtSiteForm(slug) {
  const s = slug ? (GT_SITES || []).find(x => x.slug === slug) : null;
  const contacts = (S.contacts || []).slice().sort((a, b) => (a.name || '').localeCompare(b.name || '', 'ar'));
  openModal(s ? 'إعدادات ' + s.name : 'إضافة موقع',
    `<label>المعرّف (slug)</label>
     <input id="gt_slug" value="${esc(s ? s.slug : '')}" ${s ? 'disabled' : ''} placeholder="manabir">
     <label>الاسم</label>
     <input id="gt_name" value="${esc(s ? s.name : '')}" placeholder="منابر — منصة المحاضرات">
     <label>المسار</label>
     <input id="gt_url" value="${esc(s ? s.url : '')}" placeholder="/manabir/">
     <label>العميل</label>
     <select id="gt_client">
       <option value="">— بلا ربط —</option>
       ${contacts.map(c => `<option value="${esc(c.id)}" ${s && s.client_id === c.id ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}
     </select>
     <label>رقم واتساب زر التواصل</label>
     <input id="gt_wa" value="${esc(s ? (s.wa_phone || '966504895213') : '966504895213')}" placeholder="966504895213">
     <label>رسالة تظهر للعميل في شاشة العدسة</label>
     <textarea id="gt_note" rows="2" placeholder="مثال: هذه معاينة — للنسخة الكاملة تواصل معي.">${esc(s ? (s.note || '') : '')}</textarea>`,
    async () => {
      const slugV = (document.getElementById('gt_slug').value || '').trim();
      const name = (document.getElementById('gt_name').value || '').trim();
      const url = (document.getElementById('gt_url').value || '').trim();
      const cid = document.getElementById('gt_client').value;
      const note = document.getElementById('gt_note').value;
      if (!slugV || !name || !url) { alert('المعرّف والاسم والمسار مطلوبة'); return; }
      const cname = cid ? ((S.contacts || []).find(c => c.id === cid) || {}).name || '' : '';
      const wa = (document.getElementById('gt_wa').value || '').replace(/[^0-9]/g, '');
      const row = { slug: slugV, name: name, url: url, client_id: cid || null, client_name: cname, note: note, wa_phone: wa || '966504895213' };
      const { error } = s
        ? await sb.from('client_sites').update(row).eq('slug', slugV)
        : await sb.from('client_sites').insert(row);
      if (error) { alert('تعذّر الحفظ: ' + error.message); return; }
      closeModal();
      gtLoad(true);
    });
}

/* ------------------------------------------------------------------- التنسيق */
function gtStyle() {
  return `<style>
    .gt-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(330px,1fr));gap:14px}
    .gt-card{display:flex;flex-direction:column;gap:12px}
    .gt-head{display:flex;align-items:center;gap:10px}
    .gt-head b{display:block;font-size:14.5px}
    .gt-head small{display:block;opacity:.6;font-size:11.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .gt-head small a{color:inherit;text-decoration:none}
    .gt-dot{width:9px;height:9px;border-radius:50%;flex:none}
    .gt-dot.on{background:#22c55e;box-shadow:0 0 0 4px rgba(34,197,94,.18)}
    .gt-dot.off{background:#ef4444;box-shadow:0 0 0 4px rgba(239,68,68,.16)}
    .gt-mini{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;text-align:center}
    .gt-mini b{display:block;font-size:19px;font-weight:700}
    .gt-mini span{font-size:10.5px;opacity:.6}
    .gt-bars{display:flex;align-items:flex-end;gap:3px;height:64px}
    .gt-bar{flex:1;display:flex;flex-direction:column;justify-content:flex-end;align-items:center;gap:3px;height:100%}
    .gt-bar span{width:100%;border-radius:3px 3px 1px 1px;background:linear-gradient(180deg,#38bdf8,#0369a1);min-height:2px}
    .gt-bar small{font-size:8.5px;opacity:.45}
    .gt-actions{display:flex;gap:6px;flex-wrap:wrap;align-items:center}
    .gt-sel{height:30px;border-radius:8px;font-size:12.5px;padding:0 8px}
    .gt-last{font-size:11px;opacity:.5}
    .gt-row{display:flex;justify-content:space-between;gap:10px;padding:7px 0;border-bottom:1px solid var(--line);font-size:13px}
    .gt-row:last-child{border-bottom:0}
    .gt-row span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .gt-knock-row{display:flex;align-items:center;gap:10px;justify-content:space-between;padding:9px 0;border-bottom:1px solid var(--line);flex-wrap:wrap}
    .gt-knock-row:last-child{border-bottom:0}
    .gt-knock-row small{display:block;opacity:.6;font-size:11.5px}
  </style>`;
}
