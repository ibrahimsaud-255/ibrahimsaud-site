/*
 * 15-calendar.js — المواعيد والتقويم ولوحات المعلومات
 * ─────────────────────────────────────────────────────────────────────────
 * جزء من لوحة ibrahimsaud.com/app بعد تفكيك الملفّ الواحد (index.html) إلى
 * سكربتات كلاسيكيّة تُحمَّل بالترتيب الرقميّ من index.html.
 * ⚠️ نطاقٌ عامّ واحد: الدوالّ هنا عامّة عمداً (مئات onclick="..." تناديها
 *    بالاسم) — لا تحوّلها إلى وحدات ES ولا تغلّفها بدالّة.
 * ⚠️ هذا الملفّ تعريفات فقط: أيّ جملة تنفّذ شيئاً عند التحميل مكانها
 *    99-boot.js (بترتيبها الأصليّ) — وإلا نادت دالّةً في ملفّ لم يُحمَّل بعد.
 */
/* ===== APPOINTMENTS ===== */
function apptStatusSelect(a){const cur=a.status||'scheduled';const opts=[['scheduled','مجدول'],['done','تم'],['cancelled','ملغى']];return `<select class="status-select pill ${cur}" onchange="setApptStatus('${a.id}',this.value)" title="غيّر الحالة">${opts.map(([k,t])=>`<option value="${k}" ${cur===k?'selected':''}>${t}</option>`).join('')}</select>`}
function setApptStatus(id,val){const a=(S.appointments||[]).find(x=>x.id===id);if(a){a.status=val;save();renderAppointments()}}
const APPT_FILTER_DEFAULT={scheduled:true,done:true,cancelled:false};
function apptFilter(){return Object.assign({},APPT_FILTER_DEFAULT,uiPref('apptFilter',{}))}
function toggleApptFilter(k){const f=apptFilter();f[k]=!f[k];setUiPref('apptFilter',f);renderAppointments()}
function renderAppointments(){
  const all=S.appointments.slice().sort((a,b)=>(a.datetime||'').localeCompare(b.datetime||''));
  const f=apptFilter();
  const counts={scheduled:0,done:0,cancelled:0};all.forEach(a=>{const s=a.status||'scheduled';if(counts[s]!=null)counts[s]++});
  const list=all.filter(a=>f[a.status||'scheduled']!==false);
  const chips=[['scheduled','مجدول'],['done','تم'],['cancelled','ملغى']].map(([k,t])=>
    `<button class="fchip ${f[k]?'on':''}" onclick="toggleApptFilter('${k}')"><i class="inl" data-lucide="${f[k]?'eye':'eye-off'}"></i> ${t} <span class="cnt">${counts[k]||0}</span></button>`).join('');
  document.getElementById('main').innerHTML=`
    <div class="page-head"><h1>المواعيد</h1><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn btn-ghost btn-sm" onclick="exportICS()"><i data-lucide="download"></i> تصدير الكل .ics</button><button class="btn btn-gold" onclick="apptModal()">+ موعد</button></div></div>
    <div class="badge-note"><i data-lucide="smartphone"></i> <div>اضغط «.ics» أو «Google» لكل موعد لإضافته إلى تقويم جوالك. استخدم الفلاتر لإظهار/إخفاء الحالات — يبقى اختيارك محفوظاً.</div></div>
    <div class="filterbar"><span class="flabel"><i class="inl" data-lucide="filter"></i> الفلاتر:</span>${chips}</div>
    ${!all.length?emptyBox('calendar-x','لا توجد مواعيد بعد.'):(!list.length?emptyBox('eye-off','كل المواعيد مخفية بالفلاتر الحالية.'):
    `<table><thead><tr><th>الموعد</th><th>العنوان</th><th>مع</th><th>المدة</th><th>الحالة</th><th>التقويم</th><th></th></tr></thead><tbody>
    ${list.map(a=>`<tr><td>${(a.datetime||'').replace('T',' ')}</td><td>${esc(a.title)}</td><td>${esc(resolveClientName(a))}</td><td>${esc(a.duration||'')} د</td><td>${apptStatusSelect(a)}</td>
    <td style="white-space:nowrap"><a class="link-btn" href="${gcal(a)}" target="_blank">Google</a><button class="link-btn" onclick="exportICS('${a.id}')">.ics</button></td>
    <td style="white-space:nowrap"><button class="link-btn" onclick="apptModal('${a.id}')">تعديل</button><button class="link-btn del" onclick="delItem('appointments','${a.id}',renderAppointments)">حذف</button></td></tr>`).join('')}
    </tbody></table>`)}`;
  refreshIcons();
}
function apptModal(id,presetDate){
  let a=id?{...S.appointments.find(x=>x.id===id)}:{id:'',title:'',contact:'',datetime:(presetDate?presetDate+'T10:00':new Date().toISOString().slice(0,16)),duration:60,status:'scheduled',notes:''};
  openModal(id?'تعديل موعد':'موعد جديد',`
    <div class="field"><label>العنوان</label><input id="a_title" value="${esc(a.title)}" placeholder="مثال: تصوير في موقع العميل"></div>
    <div class="row2"><div class="field"><label>التاريخ والوقت</label><input type="datetime-local" id="a_dt" value="${a.datetime}"></div>
    <div class="field"><label>المدة (دقائق)</label><input type="number" id="a_dur" value="${a.duration}"></div></div>
    <div class="row2"><div class="field"><label>مع (العميل)</label>${clientFieldHTML('a_contact',resolveClientName(a))}</div>
    <div class="field"><label>الحالة</label><select id="a_status">${['scheduled','done','cancelled'].map(s=>`<option value="${s}" ${a.status===s?'selected':''}>${ST[s]}</option>`).join('')}</select></div></div>
    <div class="field"><label>ملاحظات</label><textarea id="a_notes" rows="2">${esc(a.notes)}</textarea></div>`,
  ()=>{const g=i=>document.getElementById(i).value;a.title=g('a_title');a.datetime=g('a_dt');a.duration=g('a_dur');const cn=g('a_contact').trim();a.contactId=findOrCreateContact(cn);a.contact=cn;a.status=g('a_status');a.notes=g('a_notes');if(!a.title.trim()){alert('أدخل العنوان');return}if(id){const i=S.appointments.findIndex(x=>x.id===id);S.appointments[i]=a}else{a.id=uid();S.appointments.push(a)}save();closeModal();rerender()},id?()=>delItem('appointments',id,rerender):null);
}
function gcal(a){const st=new Date(a.datetime);const en=new Date(st.getTime()+(Number(a.duration)||60)*60000);const f=d=>d.toISOString().replace(/[-:]/g,'').slice(0,15)+'Z';return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(a.title)}&dates=${f(st)}/${f(en)}&details=${encodeURIComponent(a.notes||'')}`}
function icsLocal(d){const p=n=>String(n).padStart(2,'0');return d.getFullYear()+p(d.getMonth()+1)+p(d.getDate())+'T'+p(d.getHours())+p(d.getMinutes())+'00'}
function exportICS(id){
  const arr=id?S.appointments.filter(a=>a.id===id):S.appointments;
  if(!arr.length){alert('لا توجد مواعيد للتصدير');return}
  let L=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//IbrahimSaud//Cowork//AR','CALSCALE:GREGORIAN'];
  arr.forEach(a=>{const st=new Date(a.datetime);const en=new Date(st.getTime()+(Number(a.duration)||60)*60000);
    L.push('BEGIN:VEVENT','UID:'+a.id+'@ibrahimsaud','DTSTAMP:'+icsLocal(new Date()),'DTSTART:'+icsLocal(st),'DTEND:'+icsLocal(en),'SUMMARY:'+(a.title||'موعد'));
    if(a.notes)L.push('DESCRIPTION:'+a.notes.replace(/\n/g,'\\n'));if(a.contact)L.push('LOCATION:'+a.contact);L.push('END:VEVENT')});
  L.push('END:VCALENDAR');
  const b=new Blob([L.join('\r\n')],{type:'text/calendar'});const aa=document.createElement('a');aa.href=URL.createObjectURL(b);aa.download=(id?'موعد':'مواعيد')+'-'+today()+'.ics';aa.click();
}

/* ===== CALENDAR (interactive) ===== */
;/* ⤷ جملة تنفيذيّة نُقلت إلى 99-boot.js بترتيبها: let calRef=new Date(); */
function fcFmt(d){const p=n=>String(n).padStart(2,'0');return d.getFullYear()+'-'+p(d.getMonth()+1)+'-'+p(d.getDate())+'T'+p(d.getHours())+':'+p(d.getMinutes())}
let FC=null;
function renderCalendar(){
  if(!window.FullCalendar){return renderCalendarGrid();}
  if(FC){try{FC.destroy()}catch(e){}FC=null;}
  document.getElementById('main').innerHTML=`
    <div class="page-head"><h1>التقويم</h1><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn btn-ghost btn-sm" onclick="exportICS()"><i data-lucide="download"></i> تصدير .ics</button><button class="btn btn-gold" onclick="apptModal()">+ موعد</button></div></div>
    <div class="badge-note"><i data-lucide="calendar-days"></i> <div>اسحب أي موعد لتغيير وقته، اسحب حافته لتمديد المدة، وبدّل بين العرض الشهري/الأسبوعي/اليومي/السنوي من الأعلى. اضغط على أي يوم/وقت لإضافة موعد.</div></div>
    <div class="card" id="fcal" style="padding:14px"></div>`;
  const events=[];
  (S.appointments||[]).forEach(a=>{const st=new Date(a.datetime);if(isNaN(st))return;const en=new Date(st.getTime()+(Number(a.duration)||60)*60000);
    events.push({id:a.id,title:a.title||'موعد',start:fcFmt(st),end:fcFmt(en),backgroundColor:a.status==='done'?'#22c55e':(a.status==='cancelled'?'#6b6b73':'#f5a623'),borderColor:'transparent',textColor:'#1a1205'})});
  (S.invoices||[]).forEach(i=>{if(invDue(i)>0&&i.date){events.push({id:'inv_'+i.id,title:'فاتورة #'+i.number,start:i.date,allDay:true,editable:false,backgroundColor:'rgba(239,68,68,.18)',borderColor:'#ef4444',textColor:'#fca5a5',extendedProps:{inv:i.id}})}});
  FC=new FullCalendar.Calendar(document.getElementById('fcal'),{
    initialView:'dayGridMonth',direction:'rtl',locale:'ar',height:'auto',firstDay:6,nowIndicator:true,
    headerToolbar:{start:'prev,next today',center:'title',end:'multiMonthYear,dayGridMonth,timeGridWeek,timeGridDay'},
    buttonText:{today:'اليوم',month:'شهر',week:'أسبوع',day:'يوم',year:'سنة'},
    editable:true,eventDurationEditable:true,eventResizableFromStart:true,eventDisplay:'block',selectable:true,slotMinTime:'06:00:00',slotMaxTime:'24:00:00',
    events,
    dateClick:info=>apptModal(null,info.dateStr.slice(0,10)),
    eventClick:info=>{const pr=info.event.extendedProps;if(pr&&pr.inv){docModal('invoice',pr.inv,null,()=>go('calendar'))}else{apptModal(info.event.id)}},
    eventDrop:info=>updateApptTime(info.event),
    eventResize:info=>updateApptTime(info.event)
  });
  FC.render();
}
function updateApptTime(ev){const a=(S.appointments||[]).find(x=>x.id===ev.id);if(!a||!ev.start)return;a.datetime=fcFmt(ev.start);if(ev.end)a.duration=Math.max(15,Math.round((ev.end-ev.start)/60000));save();}
function renderCalendarGrid(){
  const y=calRef.getFullYear(),m=calRef.getMonth();
  const first=new Date(y,m,1);const start=new Date(first);start.setDate(1-first.getDay());
  const dows=['أحد','اثنين','ثلاثاء','أربعاء','خميس','جمعة','سبت'];
  const evs={};
  S.appointments.forEach(a=>{const k=(a.datetime||'').slice(0,10);(evs[k]=evs[k]||[]).push({t:a.title,c:'',click:`apptModal('${a.id}')`})});
  S.invoices.forEach(i=>{if(i.status==='unpaid'){(evs[i.date]=evs[i.date]||[]).push({t:'فاتورة #'+i.number,c:'inv',click:`docModal('invoice','${i.id}')`})}});
  let cells='';const tk=today();
  for(let i=0;i<42;i++){const d=new Date(start);d.setDate(start.getDate()+i);const k=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;const other=d.getMonth()!==m;
    const ev=(evs[k]||[]).slice(0,3).map(e=>`<div class="cal-ev ${e.c}" onclick="event.stopPropagation();${e.click}">${esc(e.t)}</div>`).join('');
    const more=(evs[k]||[]).length>3?`<div style="font-size:10px;color:var(--muted)">+${(evs[k]||[]).length-3}</div>`:'';
    cells+=`<div class="cal-cell ${other?'other':''} ${k===tk?'today':''}" onclick="apptModal(null,'${k}')"><div class="d">${d.getDate()}</div>${ev}${more}</div>`;}
  document.getElementById('main').innerHTML=`
    <div class="page-head"><h1>التقويم</h1><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn btn-ghost btn-sm" onclick="exportICS()"><i data-lucide="download"></i> تصدير .ics</button><button class="btn btn-gold" onclick="apptModal()">+ موعد</button></div></div>
    <div class="badge-note"><i data-lucide="calendar-days"></i> <div>اضغط على أي يوم لإضافة موعد، واضغط على أي حدث لتعديله. صدّر .ics لاستيراد المواعيد في تقويم Apple/Google على جوالك.</div></div>
    <div class="cal-head"><button class="btn btn-ghost btn-sm" onclick="calMove(-1)">‹ السابق</button>
    <h3 style="margin:0">${calRef.toLocaleDateString('ar',{month:'long',year:'numeric'})}</h3>
    <button class="btn btn-ghost btn-sm" onclick="calMove(1)">التالي ›</button></div>
    <div class="cal-grid">${dows.map(d=>`<div class="cal-dow">${d}</div>`).join('')}${cells}</div>`;
}
function calMove(n){calRef.setMonth(calRef.getMonth()+n);renderCalendarGrid()}

/* ===== DASHBOARDS ===== */
function renderDashboards(){
  const allInv=S.invoices||[];
  const collected=allInv.reduce((a,i)=>a+invPaid(i),0);
  const due=allInv.reduce((a,i)=>a+invDue(i),0);
  const invoicedTotal=allInv.reduce((a,i)=>a+invTotal(i),0);
  const quotes=S.sales||[];const openQuotes=quotes.filter(q=>q.status==='draft'||q.status==='sent').length;
  const months=[];const now=new Date();
  for(let i=5;i>=0;i--){const d=new Date(now.getFullYear(),now.getMonth()-i,1);months.push({k:ymKey(d),lbl:d.toLocaleDateString('ar',{month:'short'}),v:0})}
  allInv.forEach(inv=>{const pays=(inv.payments&&inv.payments.length)?inv.payments:(inv.status==='paid'?[{date:inv.paidDate||inv.date,amount:invTotal(inv)}]:[]);pays.forEach(p=>{const k=(p.date||'').slice(0,7);const mm=months.find(x=>x.k===k);if(mm)mm.v+=Number(p.amount||0)})});
  const maxM=Math.max(1,...months.map(m=>m.v));
  const byC={};allInv.forEach(i=>{const n=resolveClientName(i);byC[n]=(byC[n]||0)+invTotal(i)});
  const top=Object.entries(byC).sort((a,b)=>b[1]-a[1]).slice(0,6);const maxC=Math.max(1,...top.map(t=>t[1]));
  const qStages=[{k:'draft',l:'عرض سعر'},{k:'sent',l:'مُرسل'},{k:'sale',l:'أمر بيع'},{k:'cancel',l:'ملغى'}];
  // ملخّص مسار العملاء: عدد وقيمة كل مرحلة + نسبة التحويل إلى «تم الاعتماد»
  const pipeAll=(S.contacts||[]).filter(inPipeline);
  const pipeRows=S.clientStages.map(st=>{const g=pipeAll.filter(c=>c.stageKey===st.key);return {label:st.label,n:g.length,v:g.reduce((a,c)=>a+Number(c.value||0),0)}});
  const pipeMax=Math.max(1,...pipeRows.map(r=>r.n));
  const pipeOpen=pipeAll.filter(c=>!clientStage(c).final).reduce((a,c)=>a+Number(c.value||0),0);
  const wonIdx=stageIdx('won');
  const pipeConv=pipeAll.length?Math.round(pipeAll.filter(c=>wonIdx>=0&&stageIdx(c.stageKey)>=wonIdx&&!clientStage(c).lost).length/pipeAll.length*100):0;
  document.getElementById('main').innerHTML=`
    <div class="page-head"><h1>لوحة البيانات والتحليلات</h1><span style="color:var(--muted)">${today()}</span></div>
    <div class="stats">
      <div class="stat"><span class="ic"><i data-lucide="wallet"></i></span><div class="v">${money(collected)}</div><div class="l">إجمالي المحصّل</div></div>
      <div class="stat"><span class="ic"><i data-lucide="hourglass"></i></span><div class="v">${money(due)}</div><div class="l">المستحقات (المتبقّي)</div></div>
      <div class="stat"><span class="ic"><i data-lucide="receipt-text"></i></span><div class="v">${money(invoicedTotal)}</div><div class="l">إجمالي مفوتر</div></div>
      <div class="stat"><span class="ic"><i data-lucide="file-text"></i></span><div class="v">${openQuotes}</div><div class="l">عروض أسعار مفتوحة</div></div>
    </div>
    <div class="grid">
      <div class="card" style="grid-column:span 2;min-width:300px"><h3><i data-lucide="trending-up"></i> الإيرادات المحصّلة — آخر 6 أشهر</h3>
        <div style="display:flex;align-items:flex-end;gap:14px;height:170px;padding-top:10px">
        ${months.map(m=>`<div style="flex:1;text-align:center"><div style="height:${Math.round(m.v/maxM*130)}px;background:linear-gradient(180deg,var(--gold2),var(--gold));border-radius:7px 7px 0 0;min-height:3px"></div><div style="font-size:11px;color:var(--muted);margin-top:6px">${m.lbl}</div><div style="font-size:11px">${m.v?Math.round(m.v):''}</div></div>`).join('')}</div></div>
      <div class="card" style="grid-column:span 2;min-width:300px"><h3><i data-lucide="users"></i> المبيعات حسب العميل</h3>
        ${top.length?top.map(([n,v])=>`<div style="margin:10px 0"><div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:4px"><span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:70%">${esc(n)}</span><span style="font-weight:700">${money(v)}</span></div><div style="height:11px;background:var(--panel3);border-radius:6px;overflow:hidden"><i style="display:block;height:100%;width:${Math.round(v/maxC*100)}%;background:linear-gradient(90deg,var(--gold),var(--gold2))"></i></div></div>`).join(''):'<p style="color:var(--muted)">لا مبيعات بعد.</p>'}</div>
      <div class="card" style="grid-column:span 2;min-width:300px"><h3><i data-lucide="git-branch"></i> مسار العملاء
        <span style="color:var(--muted);font-weight:400;font-size:13px">· خط مفتوح ${money(pipeOpen)} · تحويل ${pipeConv}%</span></h3>
        ${pipeRows.map(r=>`<div style="margin:9px 0"><div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:4px"><span>${esc(r.label)} <span style="color:var(--muted)">(${r.n})</span></span><span style="font-weight:700">${r.v?money(r.v):'—'}</span></div>
          <div style="height:11px;background:var(--panel3);border-radius:6px;overflow:hidden"><i style="display:block;height:100%;width:${Math.round(r.n/pipeMax*100)}%;background:linear-gradient(90deg,var(--gold),var(--gold2))"></i></div></div>`).join('')}
        <button class="btn btn-ghost btn-sm" onclick="go('pipeline')" style="margin-top:8px"><i data-lucide="arrow-left-to-line"></i> افتح اللوحة</button></div>
      <div class="card"><h3><i data-lucide="eye"></i> زيارات الموقع</h3><div id="visitsBox"><p style="color:var(--muted)">…جارٍ التحميل</p></div></div>
      <div class="card" style="grid-column:span 2;min-width:300px"><h3><i data-lucide="file-text"></i> عروض الأسعار — تفصيل شهري</h3>
        ${(function(){
          // آخر ٦ أشهر
          const ms=[];const nn=new Date();for(let i=5;i>=0;i--){const d=new Date(nn.getFullYear(),nn.getMonth()-i,1);ms.push({k:ymKey(d),lbl:d.toLocaleDateString('ar',{month:'long',year:'numeric'})})}
          const rows=ms.map(m=>{const g=quotes.filter(q=>(q.date||'').slice(0,7)===m.k);const c={draft:0,sent:0,sale:0,cancel:0};g.forEach(q=>{if(c[q.status]!==undefined)c[q.status]++});const sum=g.reduce((a,q)=>a+docTotal(q),0);return {m,g,c,sum}}).reverse();
          const tot={draft:0,sent:0,sale:0,cancel:0,sum:0,n:0};rows.forEach(r=>{tot.draft+=r.c.draft;tot.sent+=r.c.sent;tot.sale+=r.c.sale;tot.cancel+=r.c.cancel;tot.sum+=r.sum;tot.n+=r.g.length});
          return `<table style="margin-top:8px"><thead><tr><th>الشهر</th><th>عرض</th><th>مُرسل</th><th>أمر بيع</th><th>ملغى</th><th>إجمالي القيمة</th></tr></thead><tbody>
            ${rows.map(r=>`<tr><td><b>${esc(r.m.lbl)}</b></td><td>${r.c.draft||'—'}</td><td>${r.c.sent||'—'}</td><td style="color:#86efac">${r.c.sale||'—'}</td><td style="color:#fca5a5">${r.c.cancel||'—'}</td><td><b>${r.sum?money(r.sum):'—'}</b></td></tr>`).join('')}
            <tr style="background:rgba(245,166,35,.08);font-weight:800"><td>الإجمالي (٦ أشهر)</td><td>${tot.draft}</td><td>${tot.sent}</td><td>${tot.sale}</td><td>${tot.cancel}</td><td>${money(tot.sum)}</td></tr>
          </tbody></table>`;
        })()}
      </div>
      <div class="card"><h3><i data-lucide="receipt-text"></i> آخر الفواتير</h3>${miniList(allInv.slice(-5).reverse(),i=>`${esc(resolveClientName(i))} — ${money(invTotal(i))} ${pill(i.status)}`,'لا فواتير')}</div>
      <div class="card"><h3><i data-lucide="calendar-clock"></i> مواعيد قادمة</h3>${miniList(S.appointments.filter(a=>a.datetime>=new Date().toISOString()).sort((a,b)=>a.datetime.localeCompare(b.datetime)).slice(0,5),a=>`${esc(a.title)} — ${a.datetime.replace('T',' ')}`,'لا مواعيد')}</div>
    </div>`;
  loadVisits();refreshIcons();
}
async function loadVisits(){const box=document.getElementById('visitsBox');if(!box)return;try{
  const since30=new Date(Date.now()-30*864e5).toISOString();const since1=new Date(Date.now()-864e5).toISOString();
  const t=await sb.from('pageviews').select('*',{count:'exact',head:true});if(t.error)throw t.error;
  const m=await sb.from('pageviews').select('*',{count:'exact',head:true}).gte('created_at',since30);
  const day=await sb.from('pageviews').select('*',{count:'exact',head:true}).gte('created_at',since1);
  const fmt=n=>Number(n||0).toLocaleString('en-US');
  box.innerHTML=`<div style="display:flex;gap:22px;flex-wrap:wrap">
    <div><div style="font-size:26px;font-weight:800">${fmt(t.count)}</div><div style="color:var(--muted);font-size:13px">إجمالي الزيارات</div></div>
    <div><div style="font-size:26px;font-weight:800">${fmt(m.count)}</div><div style="color:var(--muted);font-size:13px">آخر ٣٠ يوم</div></div>
    <div><div style="font-size:26px;font-weight:800">${fmt(day.count)}</div><div style="color:var(--muted);font-size:13px">آخر ٢٤ ساعة</div></div></div>`;
}catch(e){box.innerHTML='<p style="color:var(--muted);font-size:13px">لتفعيل العدّاد: شغّل ملف <b>supabase/analytics.sql</b> في Supabase (جدول ziyarat/pageviews). يبدأ العدّ بعدها تلقائياً.</p>'}}
