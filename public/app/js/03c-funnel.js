/* ═══════════ رحلة العميل — /api/admin/funnel ═══════════
   من أوّل زيارة إلى الدفع، يوماً بيوم: الأجهزة ← التسجيل ← الاستخدام بعد
   التسجيل ← بدء الدفع ← الدفع. بدل مراقبة Realtime في GA4 طول اليوم
   (طلب إبراهيم ١١ نوفمبر ٢٠٢٦). الهدف: ٢٠ ألف ريال شهرياً ≈ ٣ اشتراكات جديدة
   يومياً. الخادم: artifacts/api-server/src/routes/admin/funnel.ts (ريبو حروف).
   يستعمل أصناف .hru من تبويب الاستخدام (HRU_CSS) + HRF_CSS هنا.
   تعريفات فقط؛ التسجيل في HR_VIEWS داخل 99-boot.js. */
let HRF_DAYS=14,HRF_DATA=null;
const HRF_GOAL_PER_DAY=3;            // ٣ اشتراكات جديدة يومياً ≈ ٧٠٠ مشترك نشط ≈ ٢٠ ألف ريال
const HRF_GOAL_MONTHLY=20000;
const HRF_STAGES=[
  {k:'devices',  name:'زاروا واستخدموا', note:'أجهزة مختلفة فتحت لعبة أو أداة أو درساً', icon:'monitor-smartphone',color:'#38bdf8'},
  {k:'signups',  name:'سجّلوا حساباً',     note:'حسابات جديدة في المدّة',                    icon:'user-plus',        color:'#a78bfa'},
  {k:'activated',name:'استخدموا بعد التسجيل',note:'من الحسابات الجديدة: فتح شيئاً وهو مسجّل', icon:'mouse-pointer-click',color:'#f5a623'},
  {k:'checkout', name:'بدأوا الدفع',      note:'فتحوا صفحة الدفع في تلر (بأيّ نتيجة)',       icon:'credit-card',      color:'#fb923c'},
  {k:'paid',     name:'دفعوا',            note:'دفع ناجح عبر تلر أو اشتراك آبل جديد',         icon:'badge-check',      color:'#22c55e'},
];
const HRF_CSS=`
.hrf .hf-goal{display:grid;grid-template-columns:1.2fr 1fr 1fr;gap:16px;margin-bottom:16px}
.hrf .hf-prog{height:10px;border-radius:6px;background:var(--hu-soft);overflow:hidden;margin:10px 0 6px}
.hrf .hf-prog i{display:block;height:100%;border-radius:6px;background:linear-gradient(90deg,#f5a623,#22c55e)}
.hrf .hf-st{display:grid;grid-template-columns:44px minmax(0,1fr) auto;gap:14px;align-items:center;padding:14px 0;border-bottom:1px solid var(--hu-bd)}
.hrf .hf-st:last-child{border-bottom:0}
.hrf .hf-st .ic{width:44px;height:44px;border-radius:13px;display:grid;place-items:center}
.hrf .hf-st .ic svg{width:21px;height:21px}
.hrf .hf-st .nm{font-weight:900;font-size:15.5px;display:flex;gap:8px;align-items:center;flex-wrap:wrap}
.hrf .hf-st .nt{font-size:12px;color:var(--muted);font-weight:600;margin-top:2px}
.hrf .hf-st .bar{height:9px;border-radius:6px;background:var(--hu-soft);margin-top:8px;overflow:hidden}
.hrf .hf-st .bar i{display:block;height:100%;border-radius:6px;min-width:3px}
.hrf .hf-st .v{text-align:left;white-space:nowrap}
.hrf .hf-st .v b{display:block;font-size:26px;font-weight:900;line-height:1.1;font-variant-numeric:tabular-nums}
.hrf .hf-st .v span{display:block;font-size:12px;color:var(--muted);font-weight:700;margin-top:2px}
.hrf .hf-step{display:flex;align-items:center;gap:8px;padding:2px 0 2px 58px;font-size:12px;font-weight:800;color:var(--muted)}
.hrf .hf-leak{color:#f87171}
.hrf .hf-tag{display:inline-flex;font-size:11px;font-weight:900;padding:2px 9px;border-radius:999px;background:rgba(248,113,113,.15);color:#f87171}
.hrf .fx{display:flex;flex-direction:column;gap:5px}
.hrf .fx-row{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.5fr);gap:18px;align-items:stretch}
.hrf .fx-info{display:flex;flex-direction:column;justify-content:center;gap:3px;min-width:0;padding:6px 0}
.hrf .fx-nm{font-weight:900;font-size:15.5px;display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.hrf .fx-dot{width:11px;height:11px;border-radius:50%;flex:0 0 11px}
.hrf .fx-nt{font-size:12px;color:var(--muted);font-weight:600;line-height:1.5}
.hrf .fx-cv{display:flex;align-items:center;gap:6px;flex-wrap:wrap;font-size:12.5px;font-weight:700;color:var(--muted);margin-top:4px}
.hrf .fx-cv svg{width:14px;height:14px}
.hrf .fx-cv b{color:var(--ink);font-weight:900}
.hrf .fx-cv.leak,.hrf .fx-cv.leak b{color:#f87171}
.hrf .fx-cv em{font-style:normal;font-size:11px;font-weight:900;padding:2px 9px;border-radius:999px;background:rgba(248,113,113,.15);color:#f87171}
.hrf .fx-col{position:relative;height:96px}
.hrf .fx-slice{position:absolute;inset:0;filter:saturate(1.05)}
.hrf .fx-lbl{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;pointer-events:none;color:#fff;text-shadow:0 1px 2px rgba(0,0,0,.55),0 0 14px rgba(0,0,0,.35)}
.hrf .fx-lbl b{font-size:34px;font-weight:900;line-height:1;font-variant-numeric:tabular-nums}
.hrf .fx-lbl span{font-size:12.5px;font-weight:800;margin-top:4px;opacity:.95}
.hrf .fx-pc{display:none;font-style:normal}
.hrf .fx-sp .fx-col{height:92px}
.hrf .fx-spout{position:absolute;top:0;height:34px;left:50%;transform:translateX(-50%);border-radius:0 0 10px 10px;background:linear-gradient(180deg,#22c55eb3,#16a34a)}
.hrf .fx-sp .fx-lbl{justify-content:flex-start;padding-top:40px;text-shadow:none}
.hrf .fx-sp .fx-lbl b{font-size:28px;color:#4ade80}
.hrf .fx-sp .fx-lbl span{margin-top:2px;color:var(--muted);display:block!important}
.hrf .hf-say{font-size:15px;line-height:1.9;font-weight:600}
.hrf .hf-say b{color:var(--ink);font-weight:900}
.hrf .hf-tbl{width:100%;border-collapse:collapse;font-size:13.5px;font-variant-numeric:tabular-nums}
.hrf .hf-tbl th{font-size:12px;color:var(--muted);font-weight:800;text-align:center;padding:8px 6px;border-bottom:1px solid var(--hu-bd)}
.hrf .hf-tbl th:first-child,.hrf .hf-tbl td:first-child{text-align:right}
.hrf .hf-tbl td{padding:9px 6px;border-bottom:1px solid var(--hu-bd);text-align:center;font-weight:700}
.hrf .hf-tbl tr.paid td{background:rgba(34,197,94,.08)}
.hrf .hf-tbl td.z{color:var(--muted);opacity:.55}
.hrf .hf-tbl td .mini{display:block;height:4px;border-radius:3px;margin-top:4px;background:#38bdf8;opacity:.7}
.hrf .hf-ab{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px;align-items:center;padding:12px 0;border-bottom:1px solid var(--hu-bd)}
.hrf .hf-ab:last-child{border-bottom:0}
.hrf .hf-ab .who{font-weight:900;font-size:14.5px;overflow:hidden;text-overflow:ellipsis}
.hrf .hf-ab .em{font-size:12.5px;color:var(--muted);font-weight:600;direction:ltr;text-align:right;overflow:hidden;text-overflow:ellipsis}
.hrf .hf-ab .mt{font-size:12px;color:var(--muted);font-weight:700;margin-top:3px}
.hrf .hf-src{display:grid;grid-template-columns:minmax(0,1fr) auto auto;gap:12px;align-items:center;padding:10px 0;border-bottom:1px solid var(--hu-bd);font-size:14px;font-weight:700}
.hrf .hf-src:last-child{border-bottom:0}
.hrf .hf-src .n{font-weight:900;text-align:center;min-width:54px}
.hrf .hf-src .n span{display:block;font-size:10.5px;color:var(--muted);font-weight:700}
.hrf .hf-two{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px}
@media (max-width:1100px){.hrf .hf-two{grid-template-columns:1fr}}
@media (max-width:860px){.hrf .hf-goal{grid-template-columns:1fr 1fr}.hrf .hf-goal>.hu-card:first-child{grid-column:1/-1}}
@media (max-width:560px){.hrf .hf-goal{grid-template-columns:1fr}.hrf .fx{gap:4px}.hrf .fx-row{grid-template-columns:1fr;gap:0}.hrf .fx-info{display:none}.hrf .fx-col{height:82px}.hrf .fx-lbl b{font-size:26px}.hrf .fx-lbl span{font-size:11.5px;margin-top:2px}.hrf .fx-pc{display:block;font-size:11px;font-weight:900;margin-top:3px;padding:1px 8px;border-radius:999px;background:rgba(0,0,0,.28)}.hrf .fx-pc.leak{background:#ef4444;text-shadow:none}.hrf .fx-sp .fx-col{height:84px}.hrf .hf-st{grid-template-columns:38px minmax(0,1fr) auto;gap:10px}.hrf .hf-st .ic{width:38px;height:38px}.hrf .hf-st .v b{font-size:21px}.hrf .hf-step{padding-right:0;padding-left:0}
  .hrf .hf-tbl{font-size:12px}.hrf .hf-tbl th,.hrf .hf-tbl td{padding:7px 3px}}
`;
function hrViewFunnel(){hrSet(hrLoading());hrfLoad();}
function hrfSetDays(d){HRF_DAYS=d;hrViewFunnel();}
async function hrfLoad(){try{const f=await hrApi('admin/funnel?days='+HRF_DAYS);HRF_DATA=f;if(hrActive('funnel'))hrfRender(f);}catch(e){if(hrActive('funnel'))hrSet(hrErr(e.message,'hrViewFunnel()'));}}
const hrfN=(n,d)=>Number(n||0).toLocaleString('ar-SA',{maximumFractionDigits:d||0});
function hrfPct(a,b){if(!b)return null;return a/b*100;}
function hrfPctTxt(p){if(p==null)return '—';return hrfN(p,p<10?1:0)+'٪';}
function hrfDelta(cur,prev){if(!prev&&!cur)return '';if(!prev)return `<span class="hu-d hu-new">جديد</span>`;const p=Math.round((cur-prev)/prev*100);if(p===0)return `<span class="hu-d hu-eq">= ثابت</span>`;return `<span class="hu-d ${p>0?'hu-up':'hu-dn'}">${p>0?'▲':'▼'} ${hrfN(Math.abs(p))}٪</span>`;}
function hrfDay(s,o){try{return new Date(s+'T12:00:00Z').toLocaleDateString('ar-SA-u-ca-gregory',Object.assign({timeZone:'UTC'},o||{weekday:'short',day:'numeric',month:'short'}));}catch(e){return s;}}
/* الخادم يعيد timestamptz كما تكتبه Postgres: «2026-11-10 07:52:25.038398+00» */
function hrfTime(ts){const s=String(ts||'').replace(' ','T').replace(/(\.\d{3})\d+/,'$1').replace(/([+-]\d\d)$/,'$1:00');const t=new Date(s).getTime();return isNaN(t)?0:t;}
function hrfAgo(ts){const t=hrfTime(ts);if(!t)return '—';const m=Math.round((Date.now()-t)/60000);if(m<60)return 'قبل '+hrfN(m)+' دقيقة';const h=Math.round(m/60);if(h<24)return 'قبل '+hrfN(h)+' ساعة';const d=Math.round(h/24);return d===1?'أمس':'قبل '+hrfN(d)+(d<=10?' أيّام':' يوماً');}
/* تجميع المصدر الخامّ في قنوات يفهمها إبراهيم. gclid = نقرة إعلان جوجل مهما كان المُحيل. */
function hrfChannel(r){const s=String(r.source||'').toLowerCase(),m=String(r.medium||'').toLowerCase();
  if(r.gclid||s.includes('doubleclick')||s.includes('googlesyndication')||m==='cpc'||m==='paid'){
    if(s.includes('youtube'))return 'إعلان جوجل، يوتيوب';
    if(s.includes('google.com')||s.includes('googlequicksearchbox'))return 'إعلان جوجل، البحث';
    return 'إعلان جوجل';}
  if(s==='ig'||s.includes('instagram'))return 'إنستقرام';
  if(s.includes('tiktok'))return 'تيك توك';
  if(s.includes('chatgpt')||s.includes('openai'))return 'ChatGPT';
  if(s.includes('youtube'))return 'يوتيوب (مجّاني)';
  if(s.includes('google'))return 'بحث جوجل (مجّاني)';
  if(s.includes('bing'))return 'بينق';
  if(s.includes('t.co')||s.includes('twitter')||s==='x')return 'إكس';
  if(s.includes('snap'))return 'سناب';
  if(s.includes('whatsapp')||s==='wa')return 'واتساب';
  if(!s)return 'مباشر أو غير معروف';
  return s;}
function hrfGoalCards(f){
  const st=f.stages,pv=f.prevStages,paying=f.paying||[];
  const paid=paying.filter(p=>p.platform==='telr'||p.platform==='revenuecat').reduce((a,p)=>a+Number(p.n||0),0);
  const gifts=paying.filter(p=>p.platform==='manual').reduce((a,p)=>a+Number(p.n||0),0);
  const orgs=paying.filter(p=>p.platform==='organization').reduce((a,p)=>a+Number(p.n||0),0);
  const perDay=st.paid/f.days,prog=Math.min(perDay/HRF_GOAL_PER_DAY*100,100);
  return `<div class="hf-goal">
    <div class="hu-card hu-hero" style="grid-row:auto">
      <div class="hu-lbl"><i data-lucide="badge-check"></i> يدفعون الآن</div>
      <div class="hu-big">${hrfN(paid)}<small>مشترك</small></div>
      <div class="hu-note">تلر وآبل فقط. ${gifts?`و<b>${hrfN(gifts)}</b> منحة مجّانيّة لا تُحسب`:''}${orgs?` و<b>${hrfN(orgs)}</b> مقعد مدارس`:''}.<br>الهدف ≈ <b>٧٠٠</b> مشترك (${hrfN(HRF_GOAL_MONTHLY)} ريال شهرياً).</div>
      <div class="hf-prog"><i style="width:${Math.max(paid/700*100,1)}%"></i></div>
    </div>
    <div class="hu-card">
      <div class="hu-lbl"><i data-lucide="target"></i> اشتراكات جديدة</div>
      <div class="hu-big">${hrfN(st.paid)}<small>في ${hrfN(f.days)} يوماً</small></div>
      <div class="hf-prog"><i style="width:${Math.max(prog,1)}%"></i></div>
      <div class="hu-note">المعدّل <b>${hrfN(perDay,perDay<1?2:1)}</b> يومياً، والهدف <b>${hrfN(HRF_GOAL_PER_DAY)}</b> يومياً ${hrfDelta(st.paid,pv.paid)}</div>
    </div>
    <div class="hu-card">
      <div class="hu-lbl"><i data-lucide="wallet"></i> حُصِّل عبر تلر</div>
      <div class="hu-big">${hrfN(st.revenue)}<small>ريال</small></div>
      <div class="hu-note">في آخر ${hrfN(f.days)} يوماً ${hrfDelta(st.revenue,pv.revenue)}<br>اشتراكات آبل غير محسوبة هنا (آبل تحوّل لاحقاً).</div>
    </div>
  </div>`;}
/* القمع المرسوم: شرائح فوق بعض تضيق للأسفل. عرض الشريحة بمقياسٍ متدرّج
   (لوغاريتميّ) حتى لا تختفي «دفعوا» بجانب آلاف الأجهزة، ويبقى الهبوط الكبير
   ظاهراً. الأرقام المكتوبة هي المقياس الحقيقيّ. التفاصيل بجانب كلّ شريحة. */
function hrfWidths(st){const mx=Math.max(st.devices,1),L=Math.log(1+mx);let prev=100;
  return HRF_STAGES.map(s=>{const v=Number(st[s.k]||0);let w=v>0?16+84*Math.log(1+v)/L:12;w=Math.min(w,prev);prev=w;return w;});}
function hrfFunnelCard(f){
  const st=f.stages,pv=f.prevStages,W=hrfWidths(st);
  const base={signups:'devices',activated:'signups',checkout:'signups',paid:'checkout'};
  let leak=null,leakRate=101;
  ['signups','checkout','paid'].forEach(k=>{const p=hrfPct(st[k],st[base[k]]);if(p!=null&&p<leakRate){leakRate=p;leak=k;}});
  const rows=HRF_STAGES.map((s,i)=>{
    const v=Number(st[s.k]||0),top=W[i],bot=i<W.length-1?W[i+1]:W[i]*0.72;
    const L1=(50-top/2).toFixed(2),R1=(50+top/2).toFixed(2),L2=(50-bot/2).toFixed(2),R2=(50+bot/2).toFixed(2);
    const clip=`polygon(${L1}% 0,${R1}% 0,${R2}% 100%,${L2}% 100%)`;
    let conv='';
    if(i){const from=st[base[s.k]],p=hrfPct(v,from),out=Math.max(Number(from||0)-v,0),isLeak=leak===s.k;
      conv=`<div class="fx-cv ${isLeak?'leak':''}"><i data-lucide="arrow-down"></i><span><b>${hrfPctTxt(p)}</b> من «${HRF_STAGES.find(x=>x.k===base[s.k]).name}»${out?`، خرج ${hrfN(out)}`:''}</span>${isLeak?'<em>أكبر تسرّب</em>':''}</div>`;}
    return `<div class="fx-row">
      <div class="fx-info">
        <div class="fx-nm"><span class="fx-dot" style="background:${s.color}"></span>${s.name} ${hrfDelta(v,pv[s.k])}</div>
        <div class="fx-nt">${s.note}، قبلها ${hrfN(pv[s.k])}</div>
        ${conv}
      </div>
      <div class="fx-col">
        <div class="fx-slice" style="clip-path:${clip};-webkit-clip-path:${clip};background:linear-gradient(180deg,${s.color},${s.color}b3)"></div>
        <div class="fx-lbl"><b>${hrfN(v)}</b><span>${s.name}</span>${i?`<i class="fx-pc ${leak===s.k?'leak':''}">${hrfPctTxt(hrfPct(v,st[base[s.k]]))}${leak===s.k?'، أكبر تسرّب':''}</i>`:''}</div>
      </div>
    </div>`;}).join('');
  const last=W[W.length-1]*0.72;
  const spout=`<div class="fx-row fx-sp"><div class="fx-info"><div class="fx-nm"><i data-lucide="wallet" style="width:16px;height:16px"></i> النتيجة</div><div class="fx-nt">ما حُصِّل عبر تلر في المدّة (آبل غير محسوبة)</div></div>
    <div class="fx-col"><div class="fx-spout" style="width:${Math.max(last*0.55,8)}%"></div><div class="fx-lbl"><b>${hrfN(st.revenue)}</b><span>ريال</span></div></div></div>`;
  return `<div class="hu-card" style="margin-bottom:16px">
    <div class="hu-h"><h4><i data-lucide="filter"></i> قمع البيع، آخر ${hrfN(f.days)} يوماً</h4><span class="hu-sub">المقارنة بالـ${hrfN(f.days)} يوماً التي قبلها</span></div>
    <div class="fx">${rows}${spout}</div>
    <div class="hu-note" style="margin-top:12px">الشكل يوضّح وين ينزل الناس، والأرقام المكتوبة هي العدد الحقيقيّ.</div>
  </div>`;}
function hrfSay(f){
  const st=f.stages,d=f.days,avgDev=st.devices/d;
  const rate=st.devices?st.paid/st.devices:0;
  let need='';
  if(st.paid>0&&rate>0){
    const devNeed=HRF_GOAL_PER_DAY/rate,x=devNeed/Math.max(avgDev,1);
    need=`بهذه النسبة، لتصل إلى <b>${hrfN(HRF_GOAL_PER_DAY)} اشتراكات يومياً</b> تحتاج تقريباً <b>${hrfN(Math.round(devNeed/10)*10)} جهاز يومياً</b> (الآن ${hrfN(avgDev)}، أي <b>${hrfN(x,1)}×</b>). أو ترفع النسبة نفسها، وهذا أرخص من زيادة الإعلان.`;
  }else need='ما فيه دفع في هذه المدّة، فلا يمكن حساب الطريق إلى الهدف بعد. جرّب مدّة أطول.';
  const sRate=hrfPct(st.signups,st.devices),pRate=hrfPct(st.paid,st.signups);
  return `<div class="hu-card" style="margin-bottom:16px">
    <div class="hu-h"><h4><i data-lucide="message-square-text"></i> وش تقول الأرقام</h4></div>
    <div class="hf-say">من كلّ <b>١٠٠٠ جهاز</b> يستخدم المنصّة: يسجّل <b>${hrfN((sRate||0)*10)}</b>، ويدفع <b>${hrfN(rate*1000,1)}</b>.
      ${pRate!=null?`ومن كلّ <b>١٠٠ مسجّل</b> يدفع <b>${hrfN(pRate,1)}</b>.`:''}<br>${need}</div>
  </div>`;}
function hrfDaily(f){
  const rows=(f.daily||[]).slice().reverse(),mx=Math.max(...rows.map(r=>Number(r.devices||0)),1);
  const td=(v,extra)=>`<td class="${Number(v)?'':'z'}">${hrfN(v)}${extra||''}</td>`;
  return `<div class="hu-card" style="margin-bottom:16px">
    <div class="hu-h"><h4><i data-lucide="calendar-days"></i> يوماً بيوم</h4><span class="hu-sub">بتوقيت الرياض، الأخضر يوم فيه دفع</span></div>
    <div style="overflow-x:auto"><table class="hf-tbl"><thead><tr><th>اليوم</th><th>أجهزة</th><th>تسجيل</th><th>بدء دفع</th><th>دفع</th></tr></thead><tbody>
    ${rows.map(r=>`<tr class="${Number(r.paid)?'paid':''}"><td>${hrfDay(r.day)}</td>${td(r.devices,`<i class="mini" style="width:${Math.max(Number(r.devices)/mx*100,2)}%"></i>`)}${td(r.signups)}${td(r.checkout)}${td(r.paid)}</tr>`).join('')}
    </tbody></table></div></div>`;}
function hrfAbandoned(f){
  const list=f.abandoned||[];
  const body=list.length?list.map(a=>{
    const plan=a.plan==='yearly'?'سنوي':a.plan==='monthly'?'شهري':(a.plan||'');
    const fresh=(Date.now()-hrfTime(a.lastAt))<3600000;
    const mail=`mailto:${encodeURIComponent(a.email||'')}?subject=${encodeURIComponent('اشتراكك في حروف ودروس')}&body=${encodeURIComponent('السلام عليكم'+(a.name?' '+a.name:'')+'،\n\nلاحظنا أنّك بدأت الاشتراك في منصّة حروف ودروس وما اكتمل الدفع. إذا واجهتك أيّ مشكلة في الدفع، ردّ على هذه الرسالة ونساعدك.\n\nفريق حروف ودروس')}`;
    return `<div class="hf-ab"><div style="min-width:0">
      <div class="who">${esc(a.name||'بدون اسم')}</div><div class="em">${esc(a.email||'')}</div>
      <div class="mt">${plan} ${a.amount?hrfN(a.amount)+' ريال':''}، ${hrfAgo(a.lastAt)}${Number(a.attempts)>1?'، '+hrfN(a.attempts)+' محاولات':''}، ${a.status==='failed'?'رُفض الدفع':fresh?'قد يكون ما زال يدفع':'لم يكمل'}</div></div>
      ${a.email?`<a class="btn btn-ghost btn-sm" href="${mail}"><i data-lucide="mail"></i> راسله</a>`:''}</div>`;}).join('')
    :`<div class="hu-empty"><b>ما فيه سلال متروكة</b>كلّ من بدأ الدفع في آخر ٣٠ يوماً أكمله أو عنده اشتراك.</div>`;
  return `<div class="hu-card">
    <div class="hu-h"><h4><i data-lucide="shopping-cart"></i> بدأوا الدفع وما كمّلوا</h4><span class="hu-sub">آخر ٣٠ يوماً، ${hrfN(list.length)}</span></div>
    ${body}</div>`;}
function hrfSources(f){
  const vis={},sig={};
  (f.sources||[]).forEach(r=>{const c=hrfChannel(r);const t=r.event==='sign_up'?sig:vis;t[c]=(t[c]||0)+Number(r.uniq||r.n||0);});
  const keys=Object.keys(Object.assign({},vis,sig)).sort((a,b)=>(vis[b]||0)-(vis[a]||0)||(sig[b]||0)-(sig[a]||0));
  const sigTotal=Object.values(sig).reduce((a,b)=>a+b,0),sigUnknown=sig['مباشر أو غير معروف']||0;
  const body=keys.length?keys.map(k=>`<div class="hf-src"><div>${esc(k)}</div><div class="n">${hrfN(vis[k]||0)}<span>زيارة</span></div><div class="n">${hrfN(sig[k]||0)}<span>تسجيل</span></div></div>`).join('')
    :`<div class="hu-empty">ما فيه زيارات مسجّلة بمصدر في هذه المدّة.</div>`;
  const gap=sigTotal&&sigUnknown/sigTotal>0.5?`<div class="hu-note" style="margin-top:10px">⚠️ ${hrfN(sigUnknown)} من ${hrfN(sigTotal)} تسجيلاً بلا مصدر محفوظ، فلا نعرف بعد كم منها جاء من الإعلان.</div>`:'';
  return `<div class="hu-card">
    <div class="hu-h"><h4><i data-lucide="signpost"></i> من وين جاؤوا</h4><span class="hu-sub">أجهزة مختلفة دخلت برابط له مصدر</span></div>
    ${body}${gap}</div>`;}
function hrfRender(f){
  const seg=[7,14,30,90].map(d=>`<button class="${d===HRF_DAYS?'on':''}" onclick="hrfSetDays(${d})">${hrfN(d)} يوماً</button>`).join('');
  hrSet(`<style>${HRU_CSS}${HRF_CSS}</style><div class="hru hrf">
    <div class="hu-top"><div><h3><i data-lucide="route" style="width:30px;height:30px"></i> رحلة العميل</h3>
      <p>من أوّل زيارة إلى الدفع. الأرقام من قاعدة المنصّة مباشرة، وحسابات الإدارة مستبعدة.</p></div>
      <div class="hu-seg">${seg}</div></div>
    ${hrfFunnelCard(f)}
    ${hrfGoalCards(f)}
    ${hrfSay(f)}
    <div class="hf-two">${hrfAbandoned(f)}${hrfSources(f)}</div>
    ${hrfDaily(f)}
  </div>`);}
