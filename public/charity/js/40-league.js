/* ═════════════════════════════════════════════════════════════════════════
 * «الدوري» — حقيبة الموسم المرحلة ٥ (من «مدينة القيم»: الدوري الأحبّ للطلاب، وشكوى «ظلم في تقسيم الدوري»)
 *   دوري لكلّ رياضة ومرحلة (كرة قدم، طائرة)، تقسيم متوازن آليّ (بالعمر والصفّ، والإخوة يتفرّقون)،
 *   مراكز اللاعبين على الملعب (يراها كلّ طالب في جوّاله)، جدول المباريات (دوري من دور واحد)، الترتيب والهدّافون،
 *   والنتيجة الحيّة يسجّلها المشرف الرياضيّ من جوّاله (season_league_act) — ومكافأة رجل المباراة والفائزين بالعملات.
 * البيانات: season_leagues · season_matches (db/season-league.sql) · المشترك: season/league.js (LG). ملفّ تعريفات فقط.
 * ═════════════════════════════════════════════════════════════════════════ */

const SN_SPORT = { football: 'كرة القدم', volleyball: 'الطائرة', other: 'لعبة أخرى' };
/* بيانات الدوري بصيغة LG المشتركة (اللاعبون أسماء ثنائيّة) */
function snLg(l) {
  const nm = id => { const m = SN.members.find(x => x.id === id); return m ? { id, n: m.name.split(' ').slice(0, 2).join(' '), av: m.avatar, no: m.no } : null; };
  return Object.assign({}, l, { teams: (l.teams || []).map(t => Object.assign({}, t, { players: (t.players || []).map(nm).filter(Boolean) })),
    matches: (SN.matches || []).filter(m => m.league_id === l.id).map(m => ({ id: m.id, h: m.home, a: m.away, r: m.round, d: m.day, f: m.starts, p: m.place, s: m.status || 'scheduled', hs: m.hs || 0, as: m.aws || 0, sets: m.sets || [], ev: m.events || [], mvp: m.mvp })) });
}
function snLeagueView() {
  const L = SN.leagues || [];
  if (!L.length) return `<div class="card">${rEmpty('trophy', 'الدوري: فرق متوازنة لكلّ مرحلة، ومركز كلّ لاعب يراه في جوّاله، وجدول المباريات، والنتيجة الحيّة من جوّال المشرف الرياضيّ.', `<button class="btn btn-gold" onclick="snLeagueSheet()"><i data-lucide="plus"></i> دوري جديد</button>`)}</div>`;
  const cur = L.find(x => x.id === SN.lgOpen) || L[0]; SN.lgOpen = cur.id; const G = snLg(cur), S = LGE.standings(G), sc = LGE.scorers(G), tm = id => G.teams.find(t => t.id === id) || { name: '؟', color: '#888' };
  const ms = G.matches.slice().sort((a, b) => String(a.d || '9').localeCompare(String(b.d || '9')) || String(a.f).localeCompare(String(b.f)) || a.r - b.r);
  return `<div class="sn-acts"><button class="btn btn-gold" onclick="snLeagueSheet()"><i data-lucide="plus"></i> دوري جديد</button>${L.length > 1 ? `<select class="sn-sel" onchange="SN.lgOpen=this.value;snPaint()">${L.map(l => `<option value="${l.id}"${l.id === cur.id ? ' selected' : ''}>${esc(l.name)}</option>`).join('')}</select>` : ''}
      <button class="btn btn-ghost" onclick="snFixtures('${cur.id}')"><i data-lucide="calendar-range"></i> جدول المباريات</button><button class="btn btn-ghost" onclick="snLeagueBoard('${cur.id}')"><i data-lucide="presentation"></i> شاشة الدوري</button><button class="btn btn-ghost" onclick="snLeagueDel('${cur.id}')"><i data-lucide="trash-2"></i></button></div>
    <div class="card"><div class="sn-sal-h"><h3><i data-lucide="trophy"></i> ${esc(cur.name)}</h3><span class="r-sub">${SN_SPORT[cur.sport] || ''}${cur.stage ? ' · ' + esc(cur.stage) : ''} · ${G.teams.length} فرق</span></div>
      <table class="sn-tbl"><tr><th>#</th><th>الفريق</th><th>لعب</th><th>فاز</th><th>تعادل</th><th>خسر</th><th>${cur.sport === 'volleyball' ? 'أشواط' : 'أهداف'}</th><th>النقاط</th></tr>${S.map((r, i) => `<tr><td>${i + 1}</td><td><i class="sn-zdot" style="--zc:${esc(r.color)}"></i> ${esc(r.name)}</td><td>${r.p}</td><td>${r.w}</td><td>${r.d}</td><td>${r.l}</td><td dir="ltr">${r.gf}:${r.ga}</td><td><b>${r.pts}</b></td></tr>`).join('')}</table>
      ${sc.length ? `<p class="r-sub">الهدّافون: ${sc.map(p => `${esc(p.n)} (${p.g})`).join(' · ')}</p>` : ''}</div>
    <h3 class="sn-h">الفرق والمراكز</h3><div class="sn-lgteams">${G.teams.map(t => `<div class="card sn-lgt" style="--cc:${esc(t.color)}"><div class="sn-sal-h"><b>${esc(t.name)}</b><button class="btn btn-ghost btn-sm" onclick="snLgPosSheet('${cur.id}','${t.id}')">المراكز</button></div>${LGE.pitch(cur.sport, t, { avatar: p => `<span>${esc(String(p.n).charAt(0))}</span>` })}</div>`).join('')}</div>
    <h3 class="sn-h">المباريات</h3><div class="r-list">${ms.map(m => `<div class="r-item"><span class="r-item-t"><b><i class="sn-zdot" style="--zc:${esc(tm(m.h).color)}"></i> ${esc(tm(m.h).name)} <span dir="ltr">${m.s === 'scheduled' ? 'vs' : m.hs + ' – ' + m.as}</span> ${esc(tm(m.a).name)} <i class="sn-zdot" style="--zc:${esc(tm(m.a).color)}"></i></b><small>الجولة ${m.r}${m.d ? ' · ' + esc(fmtD(m.d)) : ''}${m.f ? ' · ' + esc(m.f) : ''}${m.p ? ' · ' + esc(m.p) : ''}${m.s === 'live' ? ' · <b class="sn-live">مباشر</b>' : ''}${m.mvp ? ' · رجل المباراة: ' + esc((SN.members.find(x => x.id === m.mvp) || {}).name || '') : ''}</small></span></div>`).join('') || '<p class="r-sub">لا مباريات — اضغط «جدول المباريات».</p>'}</div>
    <p class="ws-note"><i data-lucide="info"></i> <span>النتائج يسجّلها المشرف الرياضيّ من «الدوري» في جوّاله (صلاحيّة «الدوري» أو عضويّة اللجنة الترفيهيّة/الرياضيّة). رجل المباراة يأخذ ${esc((cur.rules || {}).mvp_coins || 0)} ولكلّ لاعب في الفريق الفائز ${esc((cur.rules || {}).win_coins || 0)}.</span></p>`;
}
/* دوري جديد: الرياضة، المرحلة، عدد الفرق وأسماؤها، ثمّ تقسيم متوازن (العمر/الصفّ بالتناوب الأفعوانيّ، والإخوة يتفرّقون) */
function snLeagueSheet() {
  const stages = [...new Set(SN.members.map(m => m.stage).filter(Boolean))];
  openModal('دوري جديد', `<div class="field"><label>الرياضة</label><select id="lg_s">${Object.entries(SN_SPORT).map(([k, v]) => `<option value="${k}">${v}</option>`).join('')}</select></div>
    <div class="field"><label>المرحلة</label><select id="lg_g"><option value="">كلّ المراحل</option>${stages.map(g => `<option>${esc(g)}</option>`).join('')}</select></div>
    <div class="field"><label>اسم الدوري</label><input id="lg_n" placeholder="مثلاً: دوري المتوسّط"></div>
    <div class="field"><label>عدد الفرق</label><input id="lg_k" type="number" inputmode="numeric" min="2" max="12" value="4"></div>
    <div class="field"><label>أسماء الفرق (اختياريّ — سطر لكلّ فريق)</label><textarea id="lg_t" rows="4" placeholder="النسور&#10;الصقور&#10;الفهود&#10;الذئاب"></textarea></div>
    <div class="field"><label>المكافآت</label><div class="sn-row2"><label>رجل المباراة <input id="lg_mv" type="number" inputmode="numeric" min="0" max="200" value="20"></label><label>كلّ لاعب فائز <input id="lg_w" type="number" inputmode="numeric" min="0" max="100" value="10"></label></div></div>
    <div class="r-hint">التقسيم متوازن: الطلاب يُرتَّبون بالعمر والصفّ ثمّ يُوزَّعون بالتناوب (١-٢-٣-٤-٤-٣-٢-١)، والإخوة في فرق مختلفة — لا «ظلم في التقسيم».</div>`, async () => {
      const sport = fval('lg_s'), stage = fval('lg_g'), k = Math.max(2, Math.min(12, parseInt(fval('lg_k'), 10) || 4));
      const pool = SN.members.filter(m => !stage || m.stage === stage); if (pool.length < k * 2) { rToast('المشاركون قليلون لهذا العدد من الفرق', 1); return; }
      const names = String(fval('lg_t') || '').split('\n').map(s => s.trim()).filter(Boolean), pal = SN_PALETTE;
      const teams = Array.from({ length: k }, (_, i) => ({ id: 't' + (i + 1), name: names[i] || pal[i % pal.length][0], color: pal[i % pal.length][1], players: [], pos: {} }));
      const grade = m => (m.age || 0) * 10 + (parseInt(String(m.grade || '').replace(/\D/g, ''), 10) || 0);
      pool.slice().sort((a, b) => grade(b) - grade(a) || Math.random() - .5).forEach((m, i) => {
        const r = Math.floor(i / k), base = r % 2 ? k - 1 - (i % k) : i % k; let t = teams[base];
        if (m.sibling) { const clash = teams.find(x => x === t && x.players.some(id => (SN.members.find(y => y.id === id) || {}).sibling === m.sibling)); if (clash) t = teams.slice().sort((a, b) => a.players.length - b.players.length).find(x => x !== clash) || t; }
        t.players.push(m.id);
      });
      teams.forEach(t => { t.pos = LGE.autoPos(sport, t.players); });
      const row = { season_id: SN.cur, name: fval('lg_n').trim() || `دوري ${SN_SPORT[sport]}${stage ? ' — ' + stage : ''}`, sport, stage, teams, rules: { win: 3, draw: 1, mvp_coins: Math.max(0, +fval('lg_mv') || 0), win_coins: Math.max(0, +fval('lg_w') || 0) } };
      try { const l = await RDB.insert('season_leagues', row); SN.leagues.push(l); if (!(snSeason().settings || {}).league) await snSaveSeason({ settings: Object.assign({}, snSeason().settings || {}, { league: true }) }); SN.lgOpen = l.id; closeModal(); snPaint(); rToast(`قُسّم ${pool.length} لاعباً على ${k} فرق — راجع المراكز ثمّ ولّد المباريات`); } catch (e) { rToast('تعذّر: ' + (e.message || e), 1); }
    });
}
function snLgPosSheet(lid, tid) {
  const l = SN.leagues.find(x => x.id === lid), t = (l.teams || []).find(x => x.id === tid); if (!t) return; const P = LGE.posList(l.sport);
  openModal('مراكز ' + t.name, `<div class="r-list">${(t.players || []).map(id => { const m = SN.members.find(x => x.id === id) || {}; return `<div class="r-item"><span class="r-item-t"><b>${esc(m.name || '')}</b><small>${esc(m.stage || '')} · رقم ${m.no || ''}</small></span><select class="lgp" data-id="${id}">${P.map(([c, n]) => `<option value="${c}"${(t.pos || {})[id] === c ? ' selected' : ''}>${n}</option>`).join('')}</select><select class="lgm" data-id="${id}" aria-label="نقل لفريق"><option value="">—</option>${l.teams.filter(x => x.id !== tid).map(x => `<option value="${x.id}">إلى ${esc(x.name)}</option>`).join('')}</select></div>`; }).join('')}</div>
    <div class="field"><label>اسم الفريق</label><input id="lgt_n" value="${esc(t.name)}"></div><div class="field"><label>لونه</label><input id="lgt_c" type="color" value="${esc(t.color)}"></div>`, async () => {
      document.querySelectorAll('.lgp').forEach(s => { t.pos[s.dataset.id] = s.value; });
      document.querySelectorAll('.lgm').forEach(s => { if (!s.value) return; const to = l.teams.find(x => x.id === s.value); t.players = t.players.filter(id => id !== s.dataset.id); delete t.pos[s.dataset.id]; to.players.push(s.dataset.id); to.pos = to.pos || {}; to.pos[s.dataset.id] = 'SUB'; });
      t.name = fval('lgt_n').trim() || t.name; t.color = fval('lgt_c') || t.color;
      try { Object.assign(l, await RDB.update('season_leagues', lid, { teams: l.teams })); closeModal(); snPaint(); } catch (e) { rToast('تعذّر: ' + (e.message || e), 1); }
    });
}
/* جدول المباريات: كلّ فريق يلاقي كلّ فريق مرّة — جولة كلّ يوم (أو بأيّام تختارها) */
function snFixtures(lid) {
  const l = SN.leagues.find(x => x.id === lid), s = snSeason(), n = (l.teams || []).length, rounds = n % 2 ? n : n - 1;
  openModal('جدول المباريات', `<p class="r-sub">${n} فرق ← ${rounds} جولات، ${Math.floor(n / 2)} مباريات في كلّ جولة.</p>
    <div class="field"><label>أوّل جولة</label><input id="fx_d" type="date" value="${esc(s.start_date || today())}"></div>
    <div class="field"><label>جولة كلّ</label><select id="fx_e"><option value="1">يوم</option><option value="2">يومين</option><option value="7">أسبوع (البرامج الأسبوعيّة)</option></select></div>
    <div class="field"><label>الوقت</label><input id="fx_t" type="time" value="22:00"></div>
    <div class="field"><label>الملعب</label><input id="fx_p" value="${esc(l.sport === 'volleyball' ? 'ملعب الطائرة' : 'الملعب')}"></div>
    <div class="r-hint">يحذف المباريات التي لم تُلعب بعد ويعيد جدولتها، والمنتهية تبقى.</div>`, async () => {
      const pairs = LGE.roundRobin(l.teams.map(t => t.id)), d0 = fval('fx_d'), ev = +fval('fx_e') || 1, at = fval('fx_t'), pl = fval('fx_p');
      const day = r => { const x = new Date(d0 + 'T12:00:00'); x.setDate(x.getDate() + (r - 1) * ev); return x.toISOString().slice(0, 10); };
      try {
        const old = SN.matches.filter(m => m.league_id === lid && (m.status || 'scheduled') === 'scheduled'); for (const m of old) await RDB.remove('season_matches', m.id); SN.matches = SN.matches.filter(m => !old.includes(m));
        const played = new Set(SN.matches.filter(m => m.league_id === lid).map(m => [m.home, m.away].sort().join('|')));
        for (const p of pairs) if (!played.has([p.home, p.away].sort().join('|'))) SN.matches.push(await RDB.insert('season_matches', { season_id: SN.cur, league_id: lid, home: p.home, away: p.away, round: p.round, day: day(p.round), starts: at, place: pl, status: 'scheduled', hs: 0, aws: 0, sets: [], events: [] }));
        closeModal(); snPaint(); rToast('وُلّد جدول المباريات');
      } catch (e) { rToast('تعذّر: ' + (e.message || e), 1); }
    });
}
async function snLeagueDel(lid) {
  if (!await snAsk('حذف الدوري؟', 'تُحذف فرقه ومبارياته (العملات الممنوحة تبقى).', 'حذف')) return;
  try { await RDB.remove('season_leagues', lid); SN.leagues = SN.leagues.filter(x => x.id !== lid); SN.matches = SN.matches.filter(m => m.league_id !== lid); SN.lgOpen = null; snPaint(); } catch (e) { rToast('تعذّر: ' + (e.message || e), 1); }
}
/* شاشة الدوري للبروجكتر: الترتيب والمباريات القادمة والهدّافون — تتحدّث كلّ ٢٠ ثانية */
function snLeagueBoard(lid) {
  const w = window.open('', '_blank'); if (!w) { rToast('اسمح بالنوافذ المنبثقة', 1); return; }
  const paint = () => {
    const l = SN.leagues.find(x => x.id === lid); if (!l) return; const G = snLg(l), S = LGE.standings(G), sc = LGE.scorers(G), tm = id => G.teams.find(t => t.id === id) || {};
    const live = G.matches.filter(m => m.s === 'live'), next = G.matches.filter(m => m.s === 'scheduled').slice(0, 4);
    w.document.open(); w.document.write(`<!doctype html><html dir="rtl" lang="ar"><meta charset="utf-8"><title>${esc(l.name)}</title><style>body{margin:0;background:#0B0B14;color:#fff;font-family:system-ui,-apple-system,"SF Arabic",sans-serif;padding:4vh 4vw}h1{font-size:5vh;margin:0 0 3vh}.g{display:grid;grid-template-columns:1.3fr 1fr;gap:3vw}table{width:100%;border-collapse:collapse;font-size:3vh}td,th{padding:1.2vh 1vw;border-bottom:1px solid rgba(255,255,255,.12);text-align:right}th{color:#aaa;font-weight:600}.d{display:inline-block;width:2vh;height:2vh;border-radius:50%;vertical-align:middle;margin-inline-end:1vw}.m{background:rgba(255,255,255,.07);border-radius:2vh;padding:2vh;margin-bottom:1.5vh;font-size:3vh;display:flex;justify-content:space-between}.live{border:2px solid #30D158}.s{font-weight:900;direction:ltr}h2{font-size:3vh;color:#aaa}</style>
      <h1>${esc(l.name)}</h1><div class="g"><div><table><tr><th>#</th><th>الفريق</th><th>لعب</th><th>${l.sport === 'volleyball' ? 'أشواط' : 'أهداف'}</th><th>النقاط</th></tr>${S.map((r, i) => `<tr><td>${i + 1}</td><td><i class="d" style="background:${esc(r.color)}"></i>${esc(r.name)}</td><td>${r.p}</td><td dir="ltr">${r.gf}:${r.ga}</td><td><b>${r.pts}</b></td></tr>`).join('')}</table>
      ${sc.length ? `<h2>الهدّافون</h2><p style="font-size:2.6vh">${sc.slice(0, 5).map(p => `${esc(p.n)} <b>${p.g}</b>`).join(' · ')}</p>` : ''}</div>
      <div>${live.map(m => `<div class="m live"><span>${esc(tm(m.h).name)}</span><span class="s">${m.hs} – ${m.as}</span><span>${esc(tm(m.a).name)}</span></div>`).join('')}${next.length ? '<h2>القادمة</h2>' + next.map(m => `<div class="m"><span>${esc(tm(m.h).name)}</span><span>${esc(m.f || '')}</span><span>${esc(tm(m.a).name)}</span></div>`).join('') : ''}</div></div>`); w.document.close();
  };
  paint(); const tk = setInterval(async () => { if (w.closed) { clearInterval(tk); return; } try { SN.matches = await RDB.list('season_matches', { eq: { season_id: SN.cur } }); } catch (e) {} paint(); }, 20000);
}
