/* الدوري — مشترك بين «جوّالي» والنظام: المراكز وإحداثيّاتها على الملعب، الترتيب، الهدّافون، رسم الملعب بشخصيّات اللاعبين.
 * البيانات من season_league_data (db/season-league.sql): league = {sport, teams:[{id,name,color,players:[{id,n,av}],pos:{id:code}}], matches:[…]}
 * ملفّ تعريفات فقط. */
window.LGE = (function () {
  /* المراكز: الإحداثيّات نسبة من عرض الملعب وطوله (الفريق يهاجم إلى الأعلى) */
  const POS = {
    football: [['GK', 'حارس', 50, 90], ['RB', 'ظهير أيمن', 82, 72], ['CB', 'قلب دفاع', 50, 74], ['LB', 'ظهير أيسر', 18, 72], ['DM', 'وسط دفاعيّ', 50, 58],
      ['RM', 'وسط أيمن', 80, 46], ['CM', 'وسط', 50, 44], ['LM', 'وسط أيسر', 20, 46], ['RW', 'جناح أيمن', 80, 24], ['ST', 'مهاجم', 50, 18], ['LW', 'جناح أيسر', 20, 24], ['SUB', 'احتياط', 0, 0]],
    volleyball: [['P1', 'خلفيّ أيمن (المُرسل)', 80, 78], ['P2', 'أماميّ أيمن', 80, 34], ['P3', 'أماميّ وسط', 50, 34], ['P4', 'أماميّ أيسر', 20, 34], ['P5', 'خلفيّ أيسر', 20, 78], ['P6', 'خلفيّ وسط', 50, 78], ['SUB', 'احتياط', 0, 0]],
  };
  /* توزيع تلقائيّ للمراكز حسب عدد اللاعبين (خماسيّ، سباعيّ، أحد عشر) */
  const AUTO = { football: { 5: ['GK', 'CB', 'RM', 'LM', 'ST'], 6: ['GK', 'RB', 'LB', 'CM', 'RW', 'LW'], 7: ['GK', 'RB', 'CB', 'LB', 'CM', 'RW', 'LW'], 8: ['GK', 'RB', 'CB', 'LB', 'RM', 'LM', 'CM', 'ST'],
      9: ['GK', 'RB', 'CB', 'LB', 'RM', 'CM', 'LM', 'RW', 'LW'], 11: ['GK', 'RB', 'CB', 'LB', 'DM', 'RM', 'CM', 'LM', 'RW', 'ST', 'LW'] }, volleyball: { 6: ['P1', 'P2', 'P3', 'P4', 'P5', 'P6'] } };
  const posList = sport => POS[sport] || POS.football;
  const posName = (sport, code) => (posList(sport).find(p => p[0] === code) || [0, ''])[1];
  function autoPos(sport, players) {
    const ids = players.map(p => typeof p === 'string' ? p : p.id), A = AUTO[sport] || AUTO.football, keys = Object.keys(A).map(Number).sort((a, b) => a - b);
    const k = keys.filter(n => n <= ids.length).pop() || keys[0], lay = A[k] || [], out = {};
    ids.forEach((id, i) => { out[id] = lay[i] || 'SUB'; }); return out;
  }
  /* الترتيب: كرة القدم ٣/١/٠ بفارق الأهداف — والطائرة بالفوز ثمّ فارق الأشواط */
  function standings(L) {
    const R = {}, rules = L.rules || {}; (L.teams || []).forEach(t => { R[t.id] = { id: t.id, name: t.name, color: t.color, p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 }; });
    (L.matches || []).filter(m => m.s === 'done').forEach(m => {
      const h = R[m.h], a = R[m.a]; if (!h || !a) return; h.p++; a.p++; h.gf += m.hs; h.ga += m.as; a.gf += m.as; a.ga += m.hs;
      if (m.hs > m.as) { h.w++; a.l++; h.pts += +rules.win || 3; } else if (m.as > m.hs) { a.w++; h.l++; a.pts += +rules.win || 3; } else { h.d++; a.d++; h.pts += +rules.draw || 1; a.pts += +rules.draw || 1; }
    });
    return Object.values(R).sort((x, y) => y.pts - x.pts || (y.gf - y.ga) - (x.gf - x.ga) || y.gf - x.gf || x.name.localeCompare(y.name, 'ar'));
  }
  function scorers(L) {
    const c = {}, P = {}; (L.teams || []).forEach(t => (t.players || []).forEach(p => { P[p.id] = Object.assign({ team: t }, p); }));
    (L.matches || []).forEach(m => (m.ev || []).forEach(e => { if (e.t === 'goal' && e.m && P[e.m]) c[e.m] = (c[e.m] || 0) + 1; }));
    return Object.entries(c).map(([id, g]) => Object.assign({ g }, P[id])).sort((a, b) => b.g - a.g).slice(0, 10);
  }
  /* جولات دوري من دور واحد (طريقة الدائرة): كلّ فريق يلاقي كلّ فريق مرّة */
  function roundRobin(ids) {
    const t = ids.slice(); if (t.length % 2) t.push(null); const n = t.length, out = [];
    for (let r = 0; r < n - 1; r++) { for (let i = 0; i < n / 2; i++) { const a = t[i], b = t[n - 1 - i]; if (a && b) out.push({ round: r + 1, home: r % 2 ? b : a, away: r % 2 ? a : b }); } t.splice(1, 0, t.pop()); }
    return out;
  }
  /* الملعب بشخصيّات اللاعبين في مراكزهم (avatar = دالّة ترسم الشخصيّة: AV.of في جوّالي) */
  function pitch(sport, team, opts) {
    const o = opts || {}, pos = team.pos || {}, esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const on = (team.players || []).filter(p => pos[p.id] && pos[p.id] !== 'SUB'), subs = (team.players || []).filter(p => !pos[p.id] || pos[p.id] === 'SUB');
    const xy = code => { const r = posList(sport).find(p => p[0] === code); return r ? [r[2], r[3]] : [50, 50]; };
    return `<div class="lg-pitch ${sport === 'volleyball' ? 'vb' : 'fb'}" style="--tc:${esc(team.color || '#16A34A')}"><i class="lg-lines" aria-hidden="true"></i>
      ${on.map(p => { const [x, y] = xy(pos[p.id]); return `<span class="lg-pl${p.id === o.me ? ' me' : ''}" style="left:${x}%;top:${y}%"><span class="lg-av">${o.avatar ? o.avatar(p) : ''}</span><b>${esc(String(p.n || '').split(' ')[0])}</b></span>`; }).join('')}</div>
      ${subs.length ? `<p class="lg-subs">احتياط: ${subs.map(p => esc(p.n)).join('، ')}</p>` : ''}`;
  }
  return { POS, posList, posName, autoPos, standings, scorers, roundRobin, pitch };
})();
