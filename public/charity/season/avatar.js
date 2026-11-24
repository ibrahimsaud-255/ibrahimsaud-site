/*
 * الشخصيّة الرمزيّة (الإصدار ٢) — بديل صور المشاركين: رسوم مسطّحة لشباب بزيّ سعوديّ (ثوب، بشت، شماغ/غترة بترسيماتها) أو بدلة أو لبس شبابيّ.
 * المحرّر مستلهم من طريقة دولينجو (أقسام، معاينة تقترب من الوجه، مصغّرات للرأس) — والرسوم كلّها أصليّة.
 * تُحفظ أرقام اختيارات فقط (لا بيانات شخصيّة):
 *   fs شكل الوجه · s البشرة · bd الجسم · e العيون · br الحاجبان · n الأنف · m الفم · h التسريحة · hc لون الشعر
 *   f اللحية · w غطاء الرأس (٠ بلا، ١ شماغ، ٢ غترة، ٣ كاب، ٤ كاب مقلوب، ٥ شتويّة) · ws الترسيمة · wc لون الكاب
 *   g النظّارة · gc لونها · c اللبس · cc لونه · b الخلفيّة
 * AV.svg(cfg, {crop:'head'}) · AV.seed(نصّ) · AV.of(avatar, name) · AV.CATS (أقسام المحرّر ومجموعاتها)
 */
var AV = (function () {
  'use strict';
  const BG = ['#58CC9B', '#7CC4F8', '#FFC85C', '#FF9AA2', '#B79CFF', '#8EE3DD', '#E5E5EA', '#FFB37C', '#00C6FF', '#FF9000', '#1A3365', '#2C2C2E'];
  const SKIN = ['#FFE0C7', '#F7CDA8', '#EDB98F', '#E1A57A', '#CC8E61', '#B47A50', '#97633F', '#7B4D30', '#5F3A24'];
  const HAIR = ['#1C1712', '#2B1D14', '#4A2F1E', '#6B4226', '#8C5A2B', '#B07A48', '#8E8E93', '#D8D4CC'];
  const WEAR = ['#16A34A', '#2563EB', '#DC2626', '#F59E0B', '#7C3AED', '#111827', '#0EA5E9', '#F5F5F5'];
  const GLS = ['#1C1C1E', '#C9A227', '#B8BCC4', '#7A4A2A', '#1E40AF', '#B91C1C'];
  const THOBE = ['#FAFAFA', '#ECE6DA', '#C9C1B1', '#8D8F94', '#4B5059', '#2F3A4F'];
  const SUIT = ['#1F2937', '#0F172A', '#374151', '#1E3A5F', '#4B3621', '#6B7280'];
  const CAS = ['#2563EB', '#16A34A', '#DC2626', '#F59E0B', '#7C3AED', '#111827', '#0EA5E9', '#9CA3AF', '#00C6FF', '#FF9000', '#1A3365', '#F5F5F5'];
  const BISHT = ['#1C1C1E', '#4E3420', '#7A5A3A', '#2F3A4F'];
  // أشكال الوجه: [العرض، أعلى، أسفل، خطّ الوجنة، عرض الفكّ، انحناء الفكّ، استدارة الجبهة]
  const FACE = [[82, 46, 147, 100, 40, .74, 32], [72, 40, 152, 98, 32, .8, 28], [90, 48, 146, 110, 70, .92, 20], [98, 50, 145, 104, 62, .86, 38], [84, 46, 151, 96, 16, .55, 30], [92, 48, 144, 98, 54, .7, 44]];
  const BODY = [150, 164, 180];
  let uid = 0;
  const shade = (hex, k) => { const n = parseInt(hex.slice(1), 16); const f = c => Math.max(0, Math.min(255, Math.round(c * k))); return '#' + [n >> 16, n >> 8 & 255, n & 255].map(f).map(v => v.toString(16).padStart(2, '0')).join(''); };
  const at = (a, i) => a[((i | 0) % a.length + a.length) % a.length];
  const lum = hex => { const n = parseInt(hex.slice(1), 16); return (.299 * (n >> 16) + .587 * (n >> 8 & 255) + .114 * (n & 255)) / 255; };

  function headPath(F) {
    const [W, T, B, CY, J, A, R] = F, L = 100 - W / 2, Rr = 100 + W / 2, j = J / 2, k = (B - CY) * A;
    return `M${L} ${CY}V${T + R}Q${L} ${T} ${L + R} ${T}H${Rr - R}Q${Rr} ${T} ${Rr} ${T + R}V${CY}C${Rr} ${CY + k} ${100 + j + 6} ${B} 100 ${B}C${100 - j - 6} ${B} ${L} ${CY + k} ${L} ${CY}Z`;
  }

  function svg(cfg, o) {
    cfg = Object.assign({ fs: 0, s: 2, bd: 1, e: 0, br: 0, n: 0, m: 0, h: 0, hc: 1, f: 0, w: 0, ws: 0, wc: 0, g: 0, gc: 0, c: 0, cc: 0, b: 0 }, cfg || {});
    o = o || {}; const id = 'av' + (++uid);
    const F = at(FACE, cfg.fs), [W, T, B, CY] = F, sx = W / 84, ty = T - 46, HP = headPath(F);
    const sk = at(SKIN, cfg.s), skD = shade(sk, .88), skDD = shade(sk, .78), hc = at(HAIR, cfg.hc);
    const w = cfg.w % 6, sh = w === 1 || w === 2, red = w === 1, ws = cfg.ws % 8;
    const SW = at(BODY, cfg.bd), eyeY = 99, lx = 100 - W * .19, rx = 100 + W * .19, mY = Math.round((eyeY + B) / 2 + 6), nY = Math.round((eyeY + mY) / 2 + 2);
    const head = s => `<g transform="translate(100 ${ty}) scale(${sx} 1) translate(-100 0)">${s}</g>`;   // ما يتبع الرأس (شعر، غطاء)
    const P = [`<defs><clipPath id="${id}f"><path d="${HP}"/></clipPath><clipPath id="${id}l"><rect x="0" y="${CY + 2}" width="200" height="200"/></clipPath>`];
    if (sh) P.push(red ? `<pattern id="${id}p" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="8" height="8" fill="#FBFBFB"/><rect width="4" height="4" fill="#C8102E"/><rect x="4" y="4" width="4" height="4" fill="#C8102E"/><rect x="1.4" y="1.4" width="1.2" height="1.2" fill="#FBFBFB"/></pattern>`
      : `<pattern id="${id}p" width="10" height="10" patternUnits="userSpaceOnUse"><rect width="10" height="10" fill="#FBFBFB"/><path d="M0 10L10 0" stroke="#ECECEF" stroke-width="1"/></pattern>`);
    P.push('</defs>');
    if (!o.noBg) P.push(`<rect width="200" height="200" fill="${at(BG, cfg.b)}"/>`);
    const cloth = `url(#${id}p)`, edge = red ? '#A50D25' : '#D9D9DE', fold = red ? 'rgba(80,0,10,.16)' : 'rgba(0,0,0,.07)';

    // ── الشماغ/الغترة: الجزء الخلفيّ (يتدلّى خلف الرقبة والكتفين)
    if (sh) {
      const back = ws === 2 ? 'M52 92Q46 130 50 162H150Q154 130 148 92Z' : ws === 1 ? 'M50 92Q40 128 22 170Q100 196 178 170Q160 128 150 92Z' : 'M48 92Q40 132 36 172H164Q160 132 152 92Z';
      P.push(head(`<path d="${back}" fill="${cloth}" stroke="${edge}" stroke-width="1.2"/><path d="${back}" fill="rgba(0,0,0,.12)"/>`));
    }
    // ── الجسم واللبس
    const L = 100 - SW / 2, R = 100 + SW / 2, body = `M${L} 200Q${L + 2} 162 ${L + 36} 154Q84 150 100 150Q116 150 ${R - 36} 154Q${R - 2} 162 ${R} 200Z`;
    P.push(`<path d="M${100 - W * .2} 120H${100 + W * .2}V160H${100 - W * .2}Z" fill="${skD}"/>`);
    const c = cfg.c % 10, cc = cfg.cc;
    const thobe = col => `<path d="${body}" fill="${col}" stroke="${shade(col, .9)}" stroke-width="1.2"/><path d="M${L + 30} 200Q${L + 34} 176 ${L + 38} 160M${R - 30} 200Q${R - 34} 176 ${R - 38} 160" stroke="${shade(col, .88)}" stroke-width="2" fill="none"/>`
      + `<path d="M85 148Q100 156 115 148L116 155Q100 164 84 155Z" fill="${col}" stroke="${shade(col, .82)}" stroke-width="1.5"/><path d="M100 161V200" stroke="${shade(col, .85)}" stroke-width="2"/><circle cx="100" cy="171" r="2" fill="${shade(col, .8)}"/><circle cx="100" cy="183" r="2" fill="${shade(col, .8)}"/>`;
    const jacket = (col, inner) => `<path d="${body}" fill="${col}"/>${inner}<path d="M86 151L100 200L80 200L${L + 30} 162Q${L + 36} 156 86 151Z" fill="${shade(col, 1.12)}"/><path d="M114 151L100 200L120 200L${R - 30} 162Q${R - 36} 156 114 151Z" fill="${shade(col, 1.12)}"/>`
      + `<path d="M86 151L78 168L88 172L80 200M114 151L122 168L112 172L120 200" fill="none" stroke="${shade(col, .7)}" stroke-width="2"/><rect x="${R - 44}" y="176" width="14" height="3" rx="1.5" fill="#fff" opacity=".8"/>`;
    const shirtV = tie => `<path d="M86 151L100 190L114 151Q100 158 86 151Z" fill="#FAFAFA"/><path d="M86 151L94 162L100 156L106 162L114 151" fill="#fff" stroke="#E3E3E8" stroke-width="1.2"/>${tie ? `<path d="M97 157H103L105 162L102 190L100 194L98 190L95 162Z" fill="${tie}"/><path d="M97 157H103L102 162H98Z" fill="${shade(tie, .75)}"/>` : ''}`;
    if (c === 0) P.push(thobe(at(THOBE, cc)));
    if (c === 1) { const bc = at(BISHT, cc); P.push(thobe('#FAFAFA') + `<path d="M${L} 200Q${L + 2} 162 ${L + 36} 154L88 150L80 200Z" fill="${bc}"/><path d="M${R} 200Q${R - 2} 162 ${R - 36} 154L112 150L120 200Z" fill="${bc}"/><path d="M88 150L80 200M112 150L120 200" stroke="#D4A63A" stroke-width="4"/><path d="M88 150Q100 146 112 150" stroke="#D4A63A" stroke-width="3" fill="none"/>`); }
    if (c === 2) P.push(jacket(at(SUIT, cc), shirtV('#7F1D1D')));
    if (c === 3) P.push(jacket(at(SUIT, cc), `<path d="M86 151L100 182L114 151Q100 158 86 151Z" fill="#FAFAFA"/><path d="M86 151L93 160L100 154L107 160L114 151" fill="#fff" stroke="#E3E3E8" stroke-width="1.2"/>`));
    if (c === 4) { const col = at(SUIT, cc); P.push(jacket(col, shirtV('#1E3A8A') + `<path d="M88 160L100 196L112 160L114 200H86Z" fill="${shade(col, .8)}"/><circle cx="100" cy="180" r="1.6" fill="#ddd"/><circle cx="100" cy="190" r="1.6" fill="#ddd"/>`)); }
    if (c === 5) P.push(jacket(at(SUIT, cc), `<path d="M86 151Q100 166 114 151L114 200H86Z" fill="#F5F5F5"/><path d="M86 151Q100 160 114 151" stroke="#DCDCE0" stroke-width="3" fill="none"/>`));
    const cas = at(CAS, cc), ink = lum(cas) > .7 ? '#3A3A3C' : '#fff';
    if (c === 6) P.push(`<path d="${body}" fill="${cas}"/><path d="M70 152Q100 180 130 152Q120 144 100 144Q80 144 70 152Z" fill="${shade(cas, .8)}"/><path d="M93 164V182M107 164V182" stroke="${ink}" stroke-width="3" stroke-linecap="round"/><path d="M84 200V188Q100 182 116 188V200" fill="${shade(cas, .9)}"/>`);
    if (c === 7) P.push(`<path d="${body}" fill="${cas}"/><path d="M84 151Q100 163 116 151" fill="none" stroke="${shade(cas, .78)}" stroke-width="5" stroke-linecap="round"/>`);
    if (c === 8) P.push(`<path d="${body}" fill="${cas}"/><path d="M${L + 22} 158V200M${R - 22} 158V200" stroke="${ink}" stroke-width="6" opacity=".85"/><path d="M86 150L100 167L114 150" fill="none" stroke="${ink}" stroke-width="5" stroke-linejoin="round"/><text x="${R - 42}" y="190" font-family="system-ui,sans-serif" font-weight="900" font-size="16" fill="${ink}" opacity=".9">10</text>`);
    if (c === 9) P.push(`<path d="${body}" fill="${cas}"/><path d="M84 149L100 160L116 149L120 156L100 168L80 156Z" fill="${shade(cas, .85)}"/><path d="M100 162V180" stroke="${shade(cas, .7)}" stroke-width="2"/><circle cx="100" cy="168" r="1.8" fill="${ink}"/><circle cx="100" cy="176" r="1.8" fill="${ink}"/>`);

    // ── الأذنان والرأس
    if (!sh) P.push(`<g fill="${sk}"><ellipse cx="${100 - W / 2 + 1}" cy="102" rx="9" ry="11"/><ellipse cx="${100 + W / 2 - 1}" cy="102" rx="9" ry="11"/></g><g fill="${skDD}" opacity=".6"><ellipse cx="${100 - W / 2 + 1}" cy="102" rx="4" ry="6"/><ellipse cx="${100 + W / 2 - 1}" cy="102" rx="4" ry="6"/></g>`);
    P.push(`<path d="${HP}" fill="${sk}"/>`);
    P.push(`<g clip-path="url(#${id}f)"><path d="M0 ${B - 12}Q100 ${B + 4} 200 ${B - 12}V200H0Z" fill="${skD}" opacity=".5"/></g>`);   // ظلّ الذقن الخفيف

    // ── الشعر (يُخفى تحت الشماغ؛ وتظهر السوالف تحت الكاب)
    const h = cfg.h % 12;
    if (!sh && w === 0) {
      const H = [
        `<path d="M58 80Q56 44 100 40Q144 44 142 80Q140 64 128 60Q100 66 72 60Q60 64 58 80Z"/>`,
        `<path d="M58 86Q52 40 100 37Q148 40 142 78Q132 54 104 58L97 49Q76 58 58 86Z"/>`,
        `<path d="M58 80Q56 46 88 40Q90 22 118 22Q146 28 143 78Q138 58 114 56Q86 62 58 80Z"/><path d="M92 40Q104 30 124 32" stroke="rgba(255,255,255,.18)" stroke-width="3" fill="none"/>`,
        `<path d="M58 82Q56 38 100 35Q144 38 142 82Q134 56 100 53Q66 56 58 82Z"/><path d="M76 46Q100 40 124 46M72 52Q100 46 128 52" stroke="rgba(255,255,255,.16)" stroke-width="2" fill="none"/>`,
        `<path d="M64 66Q66 38 100 36Q134 38 136 66Q120 56 100 56Q80 56 64 66Z"/><path d="M58 88Q57 62 64 62H70V90ZM142 88Q143 62 136 62H130V90Z" opacity=".45"/>`,
        `<path d="M58 78Q58 46 100 44Q142 46 142 78Z"/>${[62, 74, 86, 98, 110, 122, 134].map((x, i) => `<circle cx="${x + 2}" cy="${46 + (i % 2) * 5}" r="10.5"/>`).join('')}`,
        `<path d="M50 92Q40 40 100 26Q160 40 150 92Q146 70 132 64Q100 72 68 64Q54 70 50 92Z"/>`,
        `<path d="M60 74Q60 44 100 42Q140 44 140 74Q100 60 60 74Z" opacity=".55"/>`,
        `<path d="M58 84Q54 40 100 36Q146 40 142 84L138 70L130 78L124 64L114 74L106 62L96 74L88 62L80 76L72 64L64 76Z"/>`,
        `<path d="M86 66Q84 34 100 24Q116 34 114 66Q100 60 86 66Z"/><path d="M60 80Q60 52 84 48V64Q70 66 60 80ZM140 80Q140 52 116 48V64Q130 66 140 80Z" opacity=".4"/>`,
        `<path d="M54 110Q46 42 100 36Q154 42 146 110Q142 84 136 74Q120 58 98 62Q76 58 64 74Q58 86 54 110Z"/><path d="M70 50Q84 44 96 50M104 50Q118 44 130 50" stroke="rgba(255,255,255,.14)" stroke-width="3" fill="none"/>`,
        ''];
      P.push(head(`<g fill="${hc}">${H[h]}</g>`));
    } else if (!sh) P.push(head(`<g fill="${hc}"><rect x="57" y="70" width="7" height="24" rx="3"/><rect x="136" y="70" width="7" height="24" rx="3"/></g>`));

    // ── اللحية والشارب (مقصوصة على شكل الوجه)
    const f = cfg.f % 11, must = th => `<path d="M85 ${mY - 6}Q100 ${mY - 14 - th} 115 ${mY - 6}Q108 ${mY - 3} 100 ${mY - 6}Q92 ${mY - 3} 85 ${mY - 6}Z" fill="${hc}"/>`;
    const lower = (top, op) => `<g clip-path="url(#${id}f)"><path d="M0 ${top}Q70 ${top + 8} 82 ${mY - 4}Q100 ${mY - 12} 118 ${mY - 4}Q130 ${top + 8} 200 ${top}V200H0Z" fill="${hc}" opacity="${op}"/></g>`;
    const chin = len => `<path d="M${100 - W * .34} ${B - 8}Q100 ${B + len} ${100 + W * .34} ${B - 8}Q100 ${B + 4} ${100 - W * .34} ${B - 8}Z" fill="${hc}"/>`;
    if (f === 1) P.push(lower(CY - 4, .22));
    if (f === 2) P.push(`<path d="M87 ${mY - 6}Q100 ${mY - 11} 113 ${mY - 6}" stroke="${hc}" stroke-width="3" fill="none" stroke-linecap="round"/>`);
    if (f === 3) P.push(must(4));
    if (f === 4) P.push(`<path d="M93 ${mY + 7}Q100 ${mY + 4} 107 ${mY + 7}L106 ${B - 2}Q100 ${B + 6} 94 ${B - 2}Z" fill="${hc}"/>`);
    if (f === 5) P.push(must(3) + `<path d="M86 ${mY - 4}Q84 ${mY + 10} 92 ${B - 4}Q100 ${B + 4} 108 ${B - 4}Q116 ${mY + 10} 114 ${mY - 4}L110 ${mY - 2}Q111 ${mY + 9} 100 ${mY + 11}Q89 ${mY + 9} 90 ${mY - 2}Z" fill="${hc}"/>`);
    if (f === 6) P.push(`<g clip-path="url(#${id}f)"><g clip-path="url(#${id}l)"><path d="${HP}" fill="none" stroke="${hc}" stroke-width="13"/></g></g>`);
    if (f === 7) P.push(lower(CY + 6, 1) + must(3));
    if (f === 8) P.push(lower(CY - 2, 1) + chin(8) + must(4));
    if (f === 9) P.push(lower(CY - 4, 1) + chin(26) + must(5));
    if (f === 10) P.push(must(5) + `<path d="M85 ${mY - 6}Q80 ${mY + 4} 83 ${mY + 8}M115 ${mY - 6}Q120 ${mY + 4} 117 ${mY + 8}" stroke="${hc}" stroke-width="4" fill="none" stroke-linecap="round"/>`);

    // ── الحاجبان والعينان والأنف والفم
    const br = cfg.br % 5, bw = [4, 6.5, 5, 4, 2.8][br];
    const BR = [`M${lx - 9} ${eyeY - 12}Q${lx} ${eyeY - 17} ${lx + 9} ${eyeY - 13}M${rx - 9} ${eyeY - 13}Q${rx} ${eyeY - 17} ${rx + 9} ${eyeY - 12}`, `M${lx - 10} ${eyeY - 12}Q${lx} ${eyeY - 17} ${lx + 10} ${eyeY - 13}M${rx - 10} ${eyeY - 13}Q${rx} ${eyeY - 17} ${rx + 10} ${eyeY - 12}`,
      `M${lx - 9} ${eyeY - 16}L${lx + 9} ${eyeY - 11}M${rx - 9} ${eyeY - 11}L${rx + 9} ${eyeY - 16}`, `M${lx - 9} ${eyeY - 14}Q${lx} ${eyeY - 22} ${lx + 9} ${eyeY - 15}M${rx - 9} ${eyeY - 15}Q${rx} ${eyeY - 22} ${rx + 9} ${eyeY - 14}`, `M${lx - 8} ${eyeY - 12}Q${lx} ${eyeY - 16} ${lx + 8} ${eyeY - 13}M${rx - 8} ${eyeY - 13}Q${rx} ${eyeY - 16} ${rx + 8} ${eyeY - 12}`][br];
    P.push(`<path d="${BR}" fill="none" stroke="${shade(hc, .95)}" stroke-width="${bw}" stroke-linecap="round"/>`);
    const e = cfg.e % 8, ink2 = '#1C1C1E';
    const dot = x => `<circle cx="${x}" cy="${eyeY}" r="5.2" fill="${ink2}"/><circle cx="${x + 1.8}" cy="${eyeY - 1.8}" r="1.5" fill="#fff"/>`;
    const arc = (x, up) => `<path d="M${x - 6} ${eyeY + (up ? 2 : -1)}Q${x} ${eyeY + (up ? -6 : 5)} ${x + 6} ${eyeY + (up ? 2 : -1)}" fill="none" stroke="${ink2}" stroke-width="3.6" stroke-linecap="round"/>`;
    if (e === 0) P.push(dot(lx) + dot(rx));
    if (e === 1) P.push([lx, rx].map(x => `<ellipse cx="${x}" cy="${eyeY}" rx="7" ry="4.6" fill="#fff"/><circle cx="${x + .5}" cy="${eyeY}" r="3.9" fill="${ink2}"/><path d="M${x - 7.5} ${eyeY - 2}Q${x} ${eyeY - 7.5} ${x + 7.5} ${eyeY - 2}" stroke="${ink2}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`).join(''));
    if (e === 2) P.push(arc(lx, 1) + arc(rx, 1));
    if (e === 3) P.push(dot(lx) + arc(rx, 1));
    if (e === 4) P.push([lx, rx].map(x => `<circle cx="${x}" cy="${eyeY + 1}" r="5" fill="${ink2}"/><path d="M${x - 7} ${eyeY - 5}H${x + 7}V${eyeY}H${x - 7}Z" fill="${sk}"/><path d="M${x - 7} ${eyeY}H${x + 7}" stroke="${ink2}" stroke-width="2.6" stroke-linecap="round"/>`).join(''));
    if (e === 5) P.push([lx, rx].map(x => `<ellipse cx="${x}" cy="${eyeY}" rx="8" ry="8.8" fill="#fff"/><circle cx="${x + 1}" cy="${eyeY + 1}" r="4.8" fill="${ink2}"/><circle cx="${x + 2.6}" cy="${eyeY - 1}" r="1.5" fill="#fff"/>`).join(''));
    if (e === 6) P.push(dot(lx) + dot(rx) + `<path d="M${lx - 6} ${eyeY + 7}H${lx + 5}M${rx - 5} ${eyeY + 7}H${rx + 6}" stroke="${skDD}" stroke-width="2" stroke-linecap="round"/>`);
    if (e === 7) P.push(arc(lx, 0) + arc(rx, 0));
    const n = cfg.n % 4;
    if (n === 0) P.push(`<ellipse cx="100" cy="${nY}" rx="5.5" ry="4.5" fill="${skDD}" opacity=".75"/>`);
    if (n === 1) P.push(`<path d="M99 ${nY - 12}Q96 ${nY + 2} 98 ${nY + 3}Q103 ${nY + 5} 106 ${nY + 1}" fill="none" stroke="${skDD}" stroke-width="3" stroke-linecap="round"/>`);
    if (n === 2) P.push(`<path d="M92 ${nY + 2}Q100 ${nY - 8} 108 ${nY + 2}Q100 ${nY + 6} 92 ${nY + 2}Z" fill="${skDD}" opacity=".8"/>`);
    if (n === 3) P.push(`<path d="M100 ${nY - 10}L95 ${nY + 3}H103" fill="none" stroke="${skDD}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`);
    const m = cfg.m % 10, lip = '#7A2E1F', dark = '#5B1717';
    const MO = [`<path d="M89 ${mY}Q100 ${mY + 10} 111 ${mY}" fill="none" stroke="${lip}" stroke-width="3.6" stroke-linecap="round"/>`,
      `<path d="M86 ${mY - 2}Q100 ${mY + 18} 114 ${mY - 2}Z" fill="${dark}"/><path d="M88.5 ${mY - 1}H111.5L110.5 ${mY + 3}H89.5Z" fill="#fff"/>`,
      `<path d="M90 ${mY + 3}Q103 ${mY + 7} 112 ${mY - 3}" fill="none" stroke="${lip}" stroke-width="3.6" stroke-linecap="round"/>`,
      `<path d="M91 ${mY + 3}H109" stroke="${lip}" stroke-width="3.6" stroke-linecap="round"/>`,
      `<path d="M86 ${mY - 2}Q100 ${mY + 20} 114 ${mY - 2}Z" fill="${dark}"/><path d="M88.5 ${mY - 1}H111.5L110.5 ${mY + 3}H89.5Z" fill="#fff"/><ellipse cx="100" cy="${mY + 10}" rx="7" ry="4" fill="#E85D6A"/>`,
      `<ellipse cx="100" cy="${mY + 4}" rx="5" ry="6" fill="${dark}"/>`,
      `<path d="M86 ${mY}Q100 ${mY + 11} 114 ${mY}" fill="none" stroke="${lip}" stroke-width="3.6" stroke-linecap="round"/><path d="M84 ${mY - 2}L88 ${mY + 1}M116 ${mY - 2}L112 ${mY + 1}" stroke="${lip}" stroke-width="2.4" stroke-linecap="round"/>`,
      `<path d="M89 ${mY + 4}Q100 ${mY - 4} 111 ${mY + 4}" fill="none" stroke="${lip}" stroke-width="3.6" stroke-linecap="round"/>`,
      `<path d="M88 ${mY}Q100 ${mY + 12} 112 ${mY}Z" fill="${dark}"/><path d="M90 ${mY + 1}H110" stroke="#fff" stroke-width="3"/><path d="M94 ${mY + 6}Q100 ${mY + 9} 106 ${mY + 6}" stroke="#E85D6A" stroke-width="3" fill="none"/>`,
      `<path d="M90 ${mY + 1}Q96 ${mY + 7} 102 ${mY + 2}Q106 ${mY - 1} 111 ${mY + 1}" fill="none" stroke="${lip}" stroke-width="3.6" stroke-linecap="round"/>`];
    P.push(MO[m]);
    P.push(`<circle cx="${lx - 4}" cy="${eyeY + 15}" r="6.5" fill="#FF6B6B" opacity=".13"/><circle cx="${rx + 4}" cy="${eyeY + 15}" r="6.5" fill="#FF6B6B" opacity=".13"/>`);

    // ── الشماغ/الغترة: التاج (بنيته فوق الجبهة) والترسيمة والعقال
    if (sh) {
      // التاج: يرتفع إلى «بنية» مدبّبة فوق الجبهة، والطيّة من الجبهة إلى القمّة، والعقال فوق الجبهة لا عليها
      const crown = 'M48 100Q43 62 53 42Q68 21 100 10Q132 21 147 42Q157 62 152 100L146 100Q142 80 130 74Q112 68 100 81Q88 68 70 74Q58 80 54 100Z';
      const crownL = 'M100 77L100 10Q68 21 53 42Q43 62 48 100L54 100Q58 80 70 74Q88 71 100 77Z';
      const fr = 'M48 96Q40 132 38 180Q58 188 78 182Q66 150 60 118Q57 104 55 98Z', frR = 'M152 96Q160 132 162 180Q142 188 122 182Q134 150 140 118Q143 104 145 98Z';
      const shoulder = 'M50 96Q42 128 54 150Q40 160 16 168Q22 178 40 177Q64 172 76 158Q64 134 58 104Z', shoulderR = 'M150 96Q158 128 146 150Q160 160 184 168Q178 178 160 177Q136 172 124 158Q136 134 142 104Z';
      const narrow = 'M50 96Q48 136 51 184Q59 188 67 184Q64 150 60 118Q57 104 55 98Z', narrowR = 'M150 96Q152 136 149 184Q141 188 133 184Q136 150 140 118Q143 104 145 98Z';
      const tight = 'M48 96Q46 116 52 134Q58 130 60 116Q57 104 55 98Z', tightR = 'M152 96Q154 116 148 134Q142 130 140 116Q143 104 145 98Z';
      const panelL = [fr, shoulder, tight, fr, tight, fr, fr, narrow][ws], panelR = [frR, shoulderR, tightR, null, tightR, null, frR, narrowR][ws];
      const S = [], pan = d => `<path d="${d}" fill="${cloth}" stroke="${edge}" stroke-width="1.3"/><path d="${d}" fill="${fold}"/>`;
      if (panelL) S.push(pan(panelL) + `<path d="M56 112Q58 146 66 176" stroke="${fold}" stroke-width="3" fill="none"/>`);
      if (panelR) S.push(pan(panelR) + `<path d="M144 112Q142 146 134 176" stroke="${fold}" stroke-width="3" fill="none"/>`);
      if (ws === 5) S.push(`<path d="M152 96Q166 120 178 150Q166 162 150 160Q148 128 144 104Z" fill="${cloth}" stroke="${edge}" stroke-width="1.3"/><path d="M152 96Q166 120 178 150Q166 162 150 160Q148 128 144 104Z" fill="rgba(0,0,0,.18)"/>`);
      S.push(`<path d="${crown}" fill="${cloth}" stroke="${edge}" stroke-width="1.4"/><path d="${crownL}" fill="${fold}"/><path d="M100 77L100 11" stroke="${red ? 'rgba(120,0,15,.35)' : 'rgba(0,0,0,.12)'}" stroke-width="1.6"/>`
        + `<path d="M54 100Q58 80 70 74Q88 71 100 77Q112 71 130 74Q142 80 146 100" fill="none" stroke="${edge}" stroke-width="2.6"/>`);
      if (ws === 3) { const d = 'M152 98Q162 52 122 28Q92 14 56 36L60 48Q94 28 120 40Q148 58 146 98Z'; S.push(`<path d="${d}" fill="${cloth}" stroke="${edge}" stroke-width="1.4"/><path d="${d}" fill="rgba(0,0,0,.16)"/>`); }
      if (ws === 4) { const d = 'M54 100Q28 86 32 38Q46 26 62 40Q56 68 62 90ZM146 100Q172 86 168 38Q154 26 138 40Q144 68 138 90Z'; S.push(`<path d="${d}" fill="${cloth}" stroke="${edge}" stroke-width="1.4"/><path d="${d}" fill="rgba(0,0,0,.14)"/>`); }
      if (ws === 6) { const d = 'M40 150Q100 182 160 136L164 154Q100 198 36 168Z'; S.push(`<path d="${d}" fill="${cloth}" stroke="${edge}" stroke-width="1.4"/><path d="${d}" fill="${fold}"/>`); }
      S.push(`<path d="M51 54Q100 34 149 54" stroke="#141414" stroke-width="8.5" fill="none" stroke-linecap="round"/><path d="M52 65Q100 45 148 65" stroke="#141414" stroke-width="8.5" fill="none" stroke-linecap="round"/><path d="M58 52Q100 36 142 52M59 63Q100 47 141 63" stroke="#444" stroke-width="1.6" fill="none"/>`);
      P.push(head(S.join('')));
    }
    // ── الكاب والشتويّة
    const wc = at(WEAR, cfg.wc), wcD = shade(wc, .78);
    if (w === 3) P.push(head(`<path d="M56 74Q56 30 100 28Q144 30 144 74Z" fill="${wc}"/><path d="M100 29V72M78 34Q84 54 82 72M122 34Q116 54 118 72" stroke="${wcD}" stroke-width="2" fill="none"/><circle cx="100" cy="29" r="4" fill="${wcD}"/><path d="M52 74Q100 62 164 76Q166 85 150 85Q100 75 56 82Z" fill="${wcD}"/>`));
    if (w === 4) P.push(head(`<path d="M56 74Q56 30 100 28Q144 30 144 74Z" fill="${wc}"/><path d="M100 29V72" stroke="${wcD}" stroke-width="2"/><circle cx="100" cy="29" r="4" fill="${wcD}"/><path d="M84 64H116V74H84Z" fill="${wcD}"/><path d="M90 66H110" stroke="${shade(wc, 1.2)}" stroke-width="2" stroke-dasharray="2 3"/>`));
    if (w === 5) P.push(head(`<path d="M55 78Q55 24 100 24Q145 24 145 78Z" fill="${wc}"/><path d="M66 40V66M78 32V66M90 28V66M110 28V66M122 32V66M134 40V66" stroke="${wcD}" stroke-width="2" opacity=".5"/><rect x="52" y="62" width="96" height="19" rx="9.5" fill="${wcD}"/>`));
    // ── النظّارة
    const g = cfg.g % 8, gc = at(GLS, cfg.gc), lens = 'rgba(255,255,255,.16)', tint = '#1E1E22';
    const arm = `<path d="M${lx - 13} ${eyeY - 2}L${100 - W / 2} ${eyeY - 5}M${rx + 13} ${eyeY - 2}L${100 + W / 2} ${eyeY - 5}" stroke="${gc}" stroke-width="3" stroke-linecap="round"/>`;
    const glint = `<path d="M${lx - 7} ${eyeY - 4}L${lx - 2} ${eyeY - 6}M${rx - 7} ${eyeY - 4}L${rx - 2} ${eyeY - 6}" stroke="#fff" stroke-width="2.4" opacity=".5" stroke-linecap="round"/>`;
    const trap = x => `<path d="M${x - 14} ${eyeY - 8}H${x + 13}L${x + 11} ${eyeY + 7}Q${x} ${eyeY + 10} ${x - 11} ${eyeY + 7}Z"/>`;
    if (g === 1) P.push(arm + `<g fill="${tint}" stroke="${gc}" stroke-width="2.4">${[lx, rx].map(x => `<path d="M${x - 12} ${eyeY - 7}Q${x} ${eyeY - 10} ${x + 12} ${eyeY - 7}Q${x + 12} ${eyeY + 9} ${x} ${eyeY + 10}Q${x - 12} ${eyeY + 8} ${x - 12} ${eyeY - 7}Z"/>`).join('')}</g><path d="M${lx + 12} ${eyeY - 7}Q100 ${eyeY - 11} ${rx - 12} ${eyeY - 7}M${lx + 11} ${eyeY - 3}H${rx - 11}" stroke="${gc}" stroke-width="2.4" fill="none"/>` + glint);
    if (g === 2) P.push(arm + `<g fill="${tint}" stroke="${gc}" stroke-width="4" stroke-linejoin="round">${trap(lx) + trap(rx)}</g><path d="M${lx + 13} ${eyeY - 5}H${rx - 14}" stroke="${gc}" stroke-width="4"/>` + glint);
    if (g === 3) P.push(arm + `<g fill="${lens}" stroke="${gc}" stroke-width="4" stroke-linejoin="round">${trap(lx) + trap(rx)}</g><path d="M${lx + 13} ${eyeY - 5}H${rx - 14}" stroke="${gc}" stroke-width="4"/>`);
    if (g === 4) P.push(arm + `<g fill="${lens}" stroke="${gc}" stroke-width="2.2">${[lx, rx].map(x => `<circle cx="${x}" cy="${eyeY}" r="10.5"/>`).join('')}</g><path d="M${lx + 10} ${eyeY - 2}Q100 ${eyeY - 6} ${rx - 10} ${eyeY - 2}" stroke="${gc}" stroke-width="2.2" fill="none"/>`);
    if (g === 5) P.push(arm + `<g fill="${lens}" stroke="#C0C4CC" stroke-width="1.6">${[lx, rx].map(x => `<path d="M${x - 12} ${eyeY - 6}H${x + 12}Q${x + 12} ${eyeY + 9} ${x} ${eyeY + 9}Q${x - 12} ${eyeY + 9} ${x - 12} ${eyeY - 6}Z"/>`).join('')}</g><g fill="${gc}">${[lx, rx].map(x => `<path d="M${x - 13} ${eyeY - 9}H${x + 13}V${eyeY - 4}Q${x} ${eyeY - 6} ${x - 13} ${eyeY - 4}Z"/>`).join('')}</g><path d="M${lx + 12} ${eyeY - 5}H${rx - 12}" stroke="#C0C4CC" stroke-width="2"/>`);
    if (g === 6) P.push(arm + `<g fill="${lens}" stroke="${gc}" stroke-width="2.2">${[lx, rx].map(x => `<rect x="${x - 12}" y="${eyeY - 6}" width="24" height="13" rx="3"/>`).join('')}</g><path d="M${lx + 12} ${eyeY - 1}H${rx - 12}" stroke="${gc}" stroke-width="2.2"/>`);
    if (g === 7) { const sp = `M${100 - W / 2 + 2} ${eyeY - 6}Q100 ${eyeY - 14} ${100 + W / 2 - 2} ${eyeY - 6}L${100 + W / 2 - 6} ${eyeY + 6}Q${rx} ${eyeY + 12} 104 ${eyeY + 4}H96Q${lx} ${eyeY + 12} ${100 - W / 2 + 6} ${eyeY + 6}Z`; P.push(`<path d="${sp}" fill="${gc}"/><path d="M${lx - 10} ${eyeY - 3}Q100 ${eyeY - 9} ${rx + 10} ${eyeY - 3}" stroke="#fff" stroke-width="2.6" opacity=".4" fill="none" stroke-linecap="round"/>`); }

    const vb = o.crop === 'head' ? '30 18 140 140' : '0 0 200 200';
    return `<svg class="av" viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${o.label || 'الشخصيّة'}">${P.join('')}</svg>`;
  }
  // شخصيّة افتراضيّة ثابتة لكلّ اسم — بلا لحية (أغلب المشاركين صغار)
  function seed(t) {
    let x = 0; for (const ch of String(t || '')) x = (x * 33 + ch.charCodeAt(0)) >>> 0;
    const r = k => { x = (x * 1103515245 + 12345) >>> 0; return (x >>> 8) % k; };
    return { fs: r(6), s: r(9), bd: 1, e: [0, 0, 1, 2, 5][r(5)], br: r(5), n: r(4), m: [0, 0, 1, 2, 6][r(5)], h: r(11), hc: r(4), f: 0, w: [0, 0, 1, 1, 2, 3][r(6)], ws: [0, 2, 5][r(3)], wc: r(7), g: [0, 0, 0, 3, 4][r(5)], gc: r(3), c: [0, 0, 0, 7, 6, 2][r(6)], cc: r(6), b: r(8) };
  }
  const has = a => a && typeof a === 'object' && Object.keys(a).length;
  // مكتبة الأفاتارات الجاهزة (حزم مرخّصة): avatars/manifest.json — المسار نسبةً لمكان avatar.js (يعمل من «جوّالي» ومن النظام)
  const BASE = ((document.currentScript && document.currentScript.src) || location.href).replace(/[^/]*$/, '') + 'avatars/';
  const PK = /^[a-z0-9]{2,12}\/[0-9]{3}\.webp$/;
  let LIB = null;
  const isPk = av => !!(av && typeof av.pk === 'string' && PK.test(av.pk));
  function pkSvg(av, name, o) {
    // صور المكتبة مربّعة ٢٥٦ تملأ الدائرة كاملة (الأقراص مقصوصة على دائرتها، والنصفيّة قاعدتها على حافّة الدائرة)؛ وجوه «emoji» بهامش
    o = o || {}; const bg = at(BG, seed(name).b), p = /^emoji\//.test(av.pk) ? 16 : 0, s = 200 - 2 * p;
    return `<svg class="av" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${o.label || 'الشخصيّة'}">${o.noBg ? '' : `<rect width="200" height="200" fill="${bg}"/>`}<image href="${BASE + av.pk}" x="${p}" y="${p}" width="${s}" height="${s}" preserveAspectRatio="xMidYMid slice"/></svg>`;
  }
  async function lib() {
    if (LIB) return LIB;
    try { const r = await fetch(BASE + 'manifest.json', { cache: 'force-cache' }); if (!r.ok) throw 0; const m = await r.json(); LIB = (m.groups || []).filter(g => g.items && g.items.length); } catch (e) { LIB = []; }
    return LIB;
  }
  // ملصق Memoji الذي ينشئه صاحبه في جواله ويلصقه (av.mj صورة) — على خلفيّة لونه الثابت
  const MJ = /^data:image\/(webp|png);base64,[A-Za-z0-9+/=]+$/;
  const isMj = av => !!(av && typeof av.mj === 'string' && MJ.test(av.mj));
  function mjSvg(av, name, o) {
    o = o || {}; const bg = at(BG, seed(name).b), vb = o.crop === 'head' ? '18 10 164 164' : '0 0 200 200';
    return `<svg class="av" viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${o.label || 'الشخصيّة'}">${o.noBg ? '' : `<rect width="200" height="200" fill="${bg}"/>`}<image href="${av.mj}" x="14" y="20" width="172" height="172" preserveAspectRatio="xMidYMid meet"/></svg>`;
  }
  // بلا اختيار: أفاتار ثابت من المكتبة لكلّ اسم (إن حُمّلت)، وإلا الرسم
  const pickFor = name => { const all = (LIB || []).flatMap(g => g.items); if (!all.length) return null; let x = 0; for (const ch of String(name || '')) x = (x * 31 + ch.charCodeAt(0)) >>> 0; return { pk: all[x % all.length] }; };
  const of = (av, name, o) => isPk(av) ? pkSvg(av, name, Object.assign({ label: name ? 'شخصيّة ' + name : '' }, o || {})) : !has(av) && pickFor(name) ? pkSvg(pickFor(name), name, Object.assign({ label: name ? 'شخصيّة ' + name : '' }, o || {})) : isMj(av) ? mjSvg(av, name, Object.assign({ label: name ? 'شخصيّة ' + name : '' }, o || {})) : svg(has(av) ? av : seed(name), Object.assign({ label: name ? 'شخصيّة ' + name : '' }, o || {}));
  // أقسام المحرّر: كلّ قسم مجموعات — أشكال (مصغّرات) أو ألوان؛ crop:'head' يقرّب المعاينة على الوجه
  const CATS = [
    { id: 'face', n: 'الوجه', crop: 'head', g: [{ t: 'البشرة', k: 's', cols: SKIN }, { t: 'شكل الوجه', k: 'fs', names: ['بيضاويّ', 'نحيف', 'مربّع', 'عريض', 'حادّ', 'دائريّ'] }] },
    { id: 'body', n: 'الجسم', g: [{ t: 'هيئة الجسم', k: 'bd', names: ['نحيف', 'متوسّط', 'عريض'] }] },
    { id: 'eyes', n: 'العيون', crop: 'head', g: [{ t: 'العيون', k: 'e', names: ['عاديّة', 'لوزيّة', 'مبتسمة', 'غمزة', 'واثقة', 'واسعة', 'سهران', 'مغمضة'] }, { t: 'الحاجبان', k: 'br', names: ['طبيعيّ', 'كثيف', 'حادّ', 'مرفوع', 'خفيف'] }, { t: 'الأنف', k: 'n', names: ['صغير', 'طويل', 'عريض', 'مستقيم'] }] },
    { id: 'mouth', n: 'الفم', crop: 'head', g: [{ t: 'الفم', k: 'm', names: ['ابتسامة', 'ضحكة', 'جانبيّة', 'جادّ', 'قهقهة', 'متفاجئ', 'ابتسامة عريضة', 'مستغرب', 'فرحان', 'ساخر'] }] },
    { id: 'hair', n: 'الشعر', crop: 'head', note: 'تختفي التسريحة تحت الشماغ والغترة.', g: [{ t: 'لون الشعر', k: 'hc', cols: HAIR }, { t: 'التسريحة', k: 'h', names: ['قصير', 'مفروق', 'مرفوع', 'للخلف', 'تدريج', 'مجعّد', 'كثيف', 'خفيف جدّاً', 'مبعثر', 'وسط مرفوع', 'طويل', 'أصلع'] }] },
    { id: 'beard', n: 'اللحية', crop: 'head', g: [{ t: 'اللون', k: 'hc', cols: HAIR }, { t: 'اللحية والشنب', k: 'f', names: ['بلا', 'خفيفة جدّاً', 'شنب رفيع', 'شنب', 'سكسوكة', 'سكسوكة كاملة', 'عارضين', 'قصيرة', 'كاملة', 'طويلة', 'شنب ممتدّ'] }] },
    { id: 'head', n: 'الرأس', crop: 'head', g: [{ t: 'غطاء الرأس', k: 'w', names: ['بلا', 'شماغ', 'غترة', 'كاب', 'كاب مقلوب', 'شتويّة'] },
      { t: 'الترسيمة', k: 'ws', names: ['الملكيّة', 'الشيوخ', 'العمليّة', 'الصقر', 'الكوبرا', 'الشبابيّة', 'الفارس', 'السيفين'], when: c => c.w === 1 || c.w === 2, crop: 'body' }, { t: 'اللون', k: 'wc', cols: WEAR, when: c => c.w >= 3 }] },
    { id: 'glasses', n: 'النظّارة', crop: 'head', g: [{ t: 'النظّارة', k: 'g', names: ['بلا', 'طيّار', 'شمسيّة', 'طبّيّة عريضة', 'دائريّة', 'كلوب ماستر', 'مستطيلة', 'رياضيّة'] }, { t: 'لون الإطار', k: 'gc', cols: GLS, when: c => c.g > 0 }] },
    { id: 'clothes', n: 'اللبس', g: [{ t: 'اللبس', k: 'c', names: ['ثوب', 'ثوب وبشت', 'بدلة وكرافتة', 'بدلة بلا كرافتة', 'بدلة ثلاث قطع', 'جاكيت وتيشيرت', 'هودي', 'تيشيرت', 'رياضيّ', 'بولو'] },
      { t: 'اللون', k: 'cc', cols: c => c.c === 0 ? THOBE : c.c === 1 ? BISHT : c.c <= 5 ? SUIT : CAS }] },
    { id: 'bg', n: 'الخلفيّة', g: [{ t: 'الخلفيّة', k: 'b', cols: BG }] }];
  return { svg, seed, of, has, isMj, isPk, lib, BASE, CATS, BG, SKIN };
})();
