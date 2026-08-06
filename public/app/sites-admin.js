/* ============================================================================
   بوابة المواقع — مواقعك كبضاعة: تصنعها، تعرضها، تبيعها، تؤرشفها
   • كل موقع بطاقة واحدة: إجمالي الزيارات + قفل/فتح + معاينة.
   • مراحل: تحت التصميم ← أُرسل ← تواصل ← مباع ← الأرشيف.
   • طلبات التواصل تصلك هنا من زر واتساب في شاشة العدسة.
   الجداول: client_sites · site_visits · site_knocks · site_stats
   ============================================================================ */

let GT_SITES = null, GT_STATS = null, GT_KNOCKS = null, GT_VISITS = null;
let GT_SEL = null, GT_TAB = 'live', GT_LOADING = false, GT_ERR = null;

/* المراحل */
const GT_STAGES = [
  { k: 'draft',    n: 'تحت التصميم', c: '#64748b' },
  { k: 'sent',     n: 'أُرسل للشركة', c: '#0ea5e9' },
  { k: 'talking',  n: 'تواصل معي',   c: '#f59e0b' },
  { k: 'sold',     n: 'مباع',        c: '#22c55e' },
  { k: 'archived', n: 'الأرشيف',     c: '#475569' }
];
const gtStage = k => GT_STAGES.find(x => x.k === k) || GT_STAGES[0];

/* ------------------------------------------------------------------ أدوات */
function gtNow() { return Date.now(); }

function gtIsOpen(s) {
  if (!s || s.status !== 'open') return false;
  return !(s.expires_at && new Date(s.expires_at).getTime() <= gtNow());
}

function gtLeft(iso) {
  const ms = new Date(iso).getTime() - gtNow();
  if (ms <= 0) return 'انتهت';
  const m = Math.floor(ms / 60000), h = Math.floor(m / 60), d = Math.floor(h / 24);
  if (d > 0) return d + ' ي';
  if (h > 0) return h + ' س';
  return m + ' د';
}

function gtAgo(iso) {
  if (!iso) return 'لا زيارات';
  const s = (gtNow() - new Date(iso).getTime()) / 1000;
  if (s < 3600) return 'قبل ' + Math.max(1, Math.floor(s / 60)) + ' د';
  if (s < 86400) return 'قبل ' + Math.floor(s / 3600) + ' س';
  return 'قبل ' + Math.floor(s / 86400) + ' يوم';
}

function gtStatsOf(slug) {
  return (GT_STATS || {})[slug] || { total: 0, visitors: 0, today: 0, week: 0, last_at: null };
}

/* ------------------------------------------------------------ تحميل البيانات */
async function gtLoad(force) {
  if (GT_LOADING) return;
  if (GT_SITES && !force) return;
  GT_LOADING = true; GT_ERR = null;
  try {
    const [sites, stats, knocks] = await Promise.all([
      sb.from('client_sites').select('*').order('created_at', { ascending: false }),
      sb.from('site_stats').select('*'),
      sb.from('site_knocks').select('*').eq('seen', false).order('at', { ascending: false }).limit(40)
    ]);
    if (sites.error) throw new Error(sites.error.message);
    GT_SITES = sites.data || [];
    GT_STATS = {};
    (stats.data || []).forEach(r => { GT_STATS[r.slug] = r; });
    GT_KNOCKS = knocks.error ? [] : (knocks.data || []);
  } catch (e) {
    GT_ERR = e.message || 'تعذّر الاتصال';
  }
  GT_LOADING = false;
  renderSites();
}

/* ------------------------------------------------------------------ الواجهة */
function renderSites() {
  const el = document.getElementById('main');

  if (!GT_SITES && !GT_ERR) {
    el.innerHTML = `<div class="page-head"><h1><i data-lucide="layout-template"></i> مواقعي</h1></div>
      <div class="card" style="text-align:center;padding:30px;opacity:.7">جارٍ التحميل…</div>`;
    refreshIcons(); gtLoad(); return;
  }
  if (GT_ERR) {
    el.innerHTML = `<div class="page-head"><h1><i data-lucide="layout-template"></i> مواقعي</h1></div>
      <div class="card"><h3><i data-lucide="shield-alert"></i> تعذّر التحميل</h3>
        <div style="opacity:.85;margin-bottom:10px">${esc(GT_ERR)}</div>
        <div style="opacity:.6;font-size:13px">نفّذ «تحديث ٢» في ملف <code>supabase/client_sites.sql</code>.</div>
        <button class="btn btn-ghost btn-sm" style="margin-top:12px" onclick="gtLoad(true)">إعادة المحاولة</button></div>`;
    refreshIcons(); return;
  }
  if (GT_SEL) { gtDetail(GT_SEL); return; }

  const all = GT_SITES || [];
  const live = all.filter(s => ['draft', 'sent', 'talking'].indexOf(s.stage || 'draft') > -1);
  const sold = all.filter(s => s.stage === 'sold');
  const arch = all.filter(s => s.stage === 'archived');
  const rows = GT_TAB === 'sold' ? sold : GT_TAB === 'archived' ? arch : live;

  const totalVisits = Object.keys(GT_STATS || {}).reduce((n, k) => n + Number(gtStatsOf(k).total || 0), 0);
  const knocks = GT_KNOCKS || [];

  el.innerHTML = `
    <div class="page-head"><h1><i data-lucide="layout-template"></i> مواقعي</h1>
      <div style="display:flex;gap:6px">
        <button class="btn btn-ghost btn-sm" onclick="gtLoad(true)"><i data-lucide="refresh-cw"></i></button>
        <button class="btn btn-gold btn-sm" onclick="gtSiteForm()"><i data-lucide="plus"></i> موقع جديد</button>
      </div>
    </div>

    ${gtStyle()}

    <div class="stats">
      <div class="stat"><span class="ic" style="color:#0ea5e9"><i data-lucide="layout-template"></i></span>
        <div class="v">${live.length}</div><div class="l">معروض للبيع</div></div>
      <div class="stat"><span class="ic" style="color:#a855f7"><i data-lucide="eye"></i></span>
        <div class="v">${totalVisits}</div><div class="l">إجمالي الزيارات</div></div>
      <div class="stat"><span class="ic" style="color:${knocks.length ? '#f59e0b' : ''}"><i data-lucide="message-circle"></i></span>
        <div class="v">${knocks.length}</div><div class="l">طلبات تواصل</div></div>
      <div class="stat"><span class="ic" style="color:#22c55e"><i data-lucide="badge-check"></i></span>
        <div class="v">${sold.length}</div><div class="l">مباع</div></div>
    </div>

    ${knocks.length ? `<div class="card gt-knocks">
      ${knocks.slice(0, 4).map(k => {
        const site = all.find(s => s.slug === k.slug);
        return `<div class="gt-krow">
          <span><b>${esc(site ? site.name : k.slug)}</b> — طلب تواصل · ${esc(gtAgo(k.at))}</span>
          <span style="display:flex;gap:6px">
            <button class="btn btn-gold btn-sm" onclick="gtOpenFor('${esc(k.slug)}',24)">افتح يوم</button>
            <button class="btn btn-ghost btn-sm" onclick="gtSeen(${k.id})"><i data-lucide="check"></i></button>
          </span></div>`;
      }).join('')}
    </div>` : ''}

    <div class="gt-tabs">
      ${[['live', 'معروضة', live.length], ['sold', 'مباعة', sold.length], ['archived', 'الأرشيف', arch.length]]
        .map(t => `<button class="${GT_TAB === t[0] ? 'on' : ''}" onclick="GT_TAB='${t[0]}';renderSites()">${t[1]} <span>${t[2]}</span></button>`).join('')}
    </div>

    ${rows.length ? `<div class="gt-grid">${rows.map(gtCard).join('')}</div>`
      : `<div class="card" style="text-align:center;padding:34px;opacity:.65">لا يوجد شيء هنا بعد</div>`}`;
  refreshIcons();
}

/* بطاقة موقع — أبسط ما يمكن */
function gtCard(s) {
  const st = gtStatsOf(s.slug);
  const open = gtIsOpen(s);
  const stage = gtStage(s.stage || 'draft');
  return `<div class="card gt-card">
    <div class="gt-top">
      <span class="gt-dot" style="background:${stage.c}"></span>
      <div style="min-width:0;flex:1">
        <b>${esc(s.name)}</b>
        <small>${esc(s.company || s.client_name || 'بلا شركة')} · ${esc(s.url)}</small>
      </div>
      <span class="gt-lock ${open ? 'on' : ''}">${open ? (s.expires_at ? gtLeft(s.expires_at) : 'مفتوح') : 'مقفل'}</span>
    </div>

    <div class="gt-big">
      <b>${st.total || 0}</b>
      <span>زيارة إجمالاً · اليوم ${st.today || 0} · ${esc(gtAgo(st.last_at))}</span>
    </div>

    <div class="gt-btns">
      <button class="btn btn-sm ${open ? 'gt-danger' : 'btn-gold'}"
        onclick="gtSetStatus('${esc(s.slug)}','${open ? 'locked' : 'open'}')">
        <i data-lucide="${open ? 'lock' : 'unlock'}"></i> ${open ? 'إقفال' : 'فتح'}</button>
      <button class="btn btn-ghost btn-sm" onclick="gtPreviewOpen('${esc(s.slug)}')"><i data-lucide="eye"></i> معاينة</button>
      <button class="btn btn-ghost btn-sm" onclick="gtMore('${esc(s.slug)}')"><i data-lucide="more-horizontal"></i></button>
    </div>
  </div>`;
}

/* قائمة «المزيد» — كل التفاصيل هنا بدل ازدحام البطاقة */
function gtMore(slug) {
  const s = (GT_SITES || []).find(x => x.slug === slug);
  if (!s) return;
  const cur = s.stage || 'draft';
  openModal(s.name,
    `<div style="font-size:12.5px;opacity:.6;margin-bottom:10px">${esc(s.url)}</div>

     <label>المرحلة</label>
     <div class="gt-stages">
       ${GT_STAGES.map(g => `<button type="button" class="${cur === g.k ? 'on' : ''}"
          style="--c:${g.c}" onclick="gtSetStage('${esc(slug)}','${g.k}')">${g.n}</button>`).join('')}
     </div>

     <label style="margin-top:12px">فتح مؤقّت</label>
     <div class="gt-stages">
       ${[[2, 'ساعتان'], [6, '٦ ساعات'], [24, 'يوم'], [72, '٣ أيام'], [168, 'أسبوع']]
         .map(o => `<button type="button" onclick="gtOpenFor('${esc(slug)}',${o[0]});closeModal()">${o[1]}</button>`).join('')}
     </div>

     <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:16px">
       <button type="button" class="btn btn-ghost btn-sm" onclick="closeModal();GT_SEL='${esc(slug)}';renderSites()"><i data-lucide="bar-chart-3"></i> الإحصاءات</button>
       <button type="button" class="btn btn-ghost btn-sm" onclick="closeModal();gtSiteForm('${esc(slug)}')"><i data-lucide="settings-2"></i> الإعدادات</button>
       <button type="button" class="btn btn-ghost btn-sm" onclick="gtPreviewCopy('${esc(slug)}')"><i data-lucide="copy"></i> نسخ رابط المعاينة</button>
     </div>`,
    null);
  refreshIcons();
}

/* ------------------------------------------------------------------ التفاصيل */
async function gtDetail(slug) {
  const s = (GT_SITES || []).find(x => x.slug === slug);
  if (!s) { GT_SEL = null; renderSites(); return; }
  const st = gtStatsOf(slug);

  if (!GT_VISITS || GT_VISITS.slug !== slug) {
    document.getElementById('main').innerHTML =
      `<div class="page-head"><h1>${esc(s.name)}</h1></div>
       <div class="card" style="text-align:center;padding:30px;opacity:.7">جارٍ التحميل…</div>`;
    const since = new Date(gtNow() - 30 * 864e5).toISOString();
    const { data } = await sb.from('site_visits').select('path,ref,device,at')
      .eq('slug', slug).gte('at', since).order('at', { ascending: false }).limit(3000);
    GT_VISITS = { slug: slug, rows: data || [] };
  }
  const rows = GT_VISITS.rows;

  const series = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(gtNow() - i * 864e5), key = d.toISOString().slice(0, 10);
    series.push({ label: d.getDate(), value: rows.filter(r => String(r.at).slice(0, 10) === key).length });
  }
  const max = Math.max(1, ...series.map(x => x.value));
  const top = (field, n) => {
    const m = {}; rows.forEach(r => { const k = r[field] || '—'; m[k] = (m[k] || 0) + 1; });
    return Object.keys(m).map(k => ({ k, v: m[k] })).sort((a, b) => b.v - a.v).slice(0, n);
  };

  document.getElementById('main').innerHTML = `
    <div class="page-head"><h1>${esc(s.name)}</h1>
      <button class="btn btn-ghost btn-sm" onclick="GT_SEL=null;GT_VISITS=null;renderSites()"><i data-lucide="arrow-right"></i> رجوع</button>
    </div>
    ${gtStyle()}
    <div class="stats">
      <div class="stat"><div class="v">${st.total || 0}</div><div class="l">إجمالي الزيارات</div></div>
      <div class="stat"><div class="v">${st.visitors || 0}</div><div class="l">زائر مختلف</div></div>
      <div class="stat"><div class="v">${st.week || 0}</div><div class="l">آخر ٧ أيام</div></div>
      <div class="stat"><div class="v">${st.today || 0}</div><div class="l">اليوم</div></div>
    </div>
    <div class="card"><h3>آخر ١٤ يوماً</h3>
      <div class="gt-bars">${series.map(x =>
        `<div class="gt-bar"><span style="height:${Math.round(x.value / max * 100)}%"></span><small>${x.label}</small></div>`).join('')}</div>
    </div>
    <div class="gt-grid" style="margin-top:14px">
      <div class="card"><h3>أكثر الصفحات</h3>
        ${top('path', 6).map(r => `<div class="gt-row"><span>${esc(r.k)}</span><b>${r.v}</b></div>`).join('') || '<div style="opacity:.6">لا بيانات</div>'}</div>
      <div class="card"><h3>مصدر الزيارة</h3>
        ${top('ref', 6).map(r => `<div class="gt-row"><span>${esc(r.k === '—' ? 'رابط مباشر' : r.k)}</span><b>${r.v}</b></div>`).join('') || '<div style="opacity:.6">لا بيانات</div>'}</div>
    </div>`;
  refreshIcons();
}

/* ------------------------------------------------------------------ إجراءات */
async function gtSetStatus(slug, status, expires) {
  const { error } = await sb.from('client_sites').update({ status, expires_at: expires || null }).eq('slug', slug);
  if (error) { alert('تعذّر الحفظ: ' + error.message); return; }
  const s = (GT_SITES || []).find(x => x.slug === slug);
  if (s) { s.status = status; s.expires_at = expires || null; }
  renderSites();
}

function gtOpenFor(slug, hours) {
  gtSetStatus(slug, 'open', new Date(gtNow() + hours * 3600e3).toISOString());
}

async function gtSetStage(slug, stage) {
  const patch = { stage };
  if (stage === 'sent') patch.sent_at = new Date().toISOString();
  const { error } = await sb.from('client_sites').update(patch).eq('slug', slug);
  if (error) { alert('تعذّر الحفظ: ' + error.message); return; }
  const s = (GT_SITES || []).find(x => x.slug === slug);
  if (s) s.stage = stage;
  closeModal();
  renderSites();
}

async function gtSeen(id) {
  await sb.from('site_knocks').update({ seen: true }).eq('id', id);
  GT_KNOCKS = (GT_KNOCKS || []).filter(k => k.id !== id);
  renderSites();
}

/* ------------------------------------------------------------ رابط المعاينة */
async function gtLink(slug) {
  const { data, error } = await sb.from('client_sites').select('url,owner_key').eq('slug', slug).single();
  if (error) { alert('تعذّر جلب المفتاح: ' + error.message); return null; }
  return location.origin + data.url + (data.url.indexOf('?') > -1 ? '&' : '?') + 'k=' + data.owner_key;
}

async function gtPreviewOpen(slug) {
  const w = window.open('', '_blank');
  const link = await gtLink(slug);
  if (!link) { if (w) w.close(); return; }
  if (w) { w.opener = null; w.location = link; } else window.location.href = link;
}

async function gtPreviewCopy(slug) {
  const link = await gtLink(slug);
  if (!link) return;
  try { await navigator.clipboard.writeText(link); } catch (e) { /* تجاهل */ }
  alert('نُسخ رابط معاينتك. يفتح لك الموقع حتى وهو مقفل — لا تشاركه مع أحد.');
}

async function gtPreviewRenew(slug) {
  if (!confirm('ستتوقّف روابط المعاينة القديمة لهذا الموقع. متابعة؟')) return;
  const key = (Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2)).slice(0, 18);
  const { error } = await sb.from('client_sites').update({ owner_key: key }).eq('slug', slug);
  if (error) { alert('تعذّر التجديد: ' + error.message); return; }
  gtPreviewCopy(slug);
}

/* ------------------------------------------------------- إضافة / تعديل موقع */
function gtSiteForm(slug) {
  const s = slug ? (GT_SITES || []).find(x => x.slug === slug) : null;
  const contacts = (S.contacts || []).slice().sort((a, b) => (a.name || '').localeCompare(b.name || '', 'ar'));
  openModal(s ? 'إعدادات ' + s.name : 'موقع جديد',
    `<label>المعرّف (يظهر في الرابط)</label>
     <input id="gt_slug" value="${esc(s ? s.slug : '')}" ${s ? 'disabled' : ''} placeholder="alriyadh-clinic">
     <label>اسم الموقع</label>
     <input id="gt_name" value="${esc(s ? s.name : '')}" placeholder="عيادة الرياض — الموقع الجديد">
     <label>المسار</label>
     <input id="gt_url" value="${esc(s ? s.url : '')}" placeholder="/alriyadh-clinic/">
     <label>الشركة المستهدفة</label>
     <input id="gt_company" value="${esc(s ? (s.company || '') : '')}" placeholder="اسم الشركة">
     <label>السعر المعروض</label>
     <input id="gt_price" type="number" value="${esc(s && s.price != null ? s.price : '')}" placeholder="3000">
     <label>ربط بعميل في النظام</label>
     <select id="gt_client">
       <option value="">— بلا ربط —</option>
       ${contacts.map(c => `<option value="${esc(c.id)}" ${s && s.client_id === c.id ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}
     </select>
     <label>رقم واتساب زر التواصل</label>
     <input id="gt_wa" value="${esc(s ? (s.wa_phone || '966504895213') : '966504895213')}">
     <label>رسالة تظهر في شاشة العدسة</label>
     <textarea id="gt_note" rows="2" placeholder="هذه معاينة — للنسخة الكاملة تواصل معي.">${esc(s ? (s.note || '') : '')}</textarea>
     ${s ? `<div style="margin-top:12px;padding-top:12px;border-top:1px solid var(--line);display:flex;gap:6px;flex-wrap:wrap">
       <button type="button" class="btn btn-ghost btn-sm" onclick="gtPreviewRenew('${esc(s.slug)}')"><i data-lucide="refresh-cw"></i> تجديد مفتاح المعاينة</button>
     </div>` : ''}`,
    async () => {
      const g = id => (document.getElementById(id).value || '').trim();
      const slugV = g('gt_slug'), name = g('gt_name'), url = g('gt_url');
      if (!slugV || !name || !url) { alert('المعرّف والاسم والمسار مطلوبة'); return; }
      const cid = document.getElementById('gt_client').value;
      const row = {
        slug: slugV, name, url,
        company: g('gt_company') || null,
        price: g('gt_price') ? Number(g('gt_price')) : null,
        client_id: cid || null,
        client_name: cid ? ((S.contacts || []).find(c => c.id === cid) || {}).name || '' : '',
        wa_phone: g('gt_wa').replace(/[^0-9]/g, '') || '966504895213',
        note: document.getElementById('gt_note').value
      };
      const { error } = s
        ? await sb.from('client_sites').update(row).eq('slug', slugV)
        : await sb.from('client_sites').insert(row);
      if (error) { alert('تعذّر الحفظ: ' + error.message); return; }
      closeModal(); gtLoad(true);
    });
  refreshIcons();
}

/* ------------------------------------------------------------------- التنسيق */
function gtStyle() {
  return `<style>
    .gt-tabs{display:flex;gap:6px;margin:14px 0}
    .gt-tabs button{border:1px solid var(--line);background:transparent;color:inherit;cursor:pointer;
      padding:7px 14px;border-radius:999px;font-size:13px;font-weight:600;opacity:.7}
    .gt-tabs button span{opacity:.5;font-size:11.5px}
    .gt-tabs button.on{opacity:1;background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.2)}
    .gt-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:12px}
    .gt-card{display:flex;flex-direction:column;gap:14px}
    .gt-top{display:flex;align-items:center;gap:10px}
    .gt-top b{display:block;font-size:14.5px}
    .gt-top small{display:block;opacity:.55;font-size:11.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .gt-dot{width:9px;height:9px;border-radius:50%;flex:none}
    .gt-lock{font-size:11px;font-weight:700;padding:3px 9px;border-radius:999px;white-space:nowrap;
      background:rgba(239,68,68,.16);color:#f87171}
    .gt-lock.on{background:rgba(34,197,94,.16);color:#4ade80}
    .gt-big b{display:block;font-size:32px;font-weight:800;line-height:1}
    .gt-big span{display:block;font-size:11.5px;opacity:.55;margin-top:4px}
    .gt-btns{display:flex;gap:6px}
    .gt-btns .btn{flex:1}
    .gt-btns .btn:last-child{flex:none}
    .gt-danger{background:rgba(239,68,68,.16);border-color:rgba(239,68,68,.3);color:#f87171}
    .gt-knocks{margin-bottom:14px;border-color:#f59e0b55}
    .gt-krow{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;
      padding:8px 0;border-bottom:1px solid var(--line);font-size:13px}
    .gt-krow:last-child{border-bottom:0}
    .gt-stages{display:flex;gap:6px;flex-wrap:wrap;margin-top:6px}
    .gt-stages button{border:1px solid var(--line);background:transparent;color:inherit;cursor:pointer;
      padding:7px 13px;border-radius:999px;font-size:12.5px;font-weight:600;opacity:.7}
    .gt-stages button.on{opacity:1;border-color:var(--c);color:var(--c);background:color-mix(in srgb,var(--c) 14%,transparent)}
    .gt-bars{display:flex;align-items:flex-end;gap:4px;height:70px;margin-top:10px}
    .gt-bar{flex:1;display:flex;flex-direction:column;justify-content:flex-end;align-items:center;gap:3px;height:100%}
    .gt-bar span{width:100%;border-radius:3px;background:linear-gradient(180deg,#38bdf8,#0369a1);min-height:2px}
    .gt-bar small{font-size:8.5px;opacity:.45}
    .gt-row{display:flex;justify-content:space-between;gap:10px;padding:7px 0;border-bottom:1px solid var(--line);font-size:13px}
    .gt-row:last-child{border-bottom:0}
    .gt-row span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  </style>`;
}
