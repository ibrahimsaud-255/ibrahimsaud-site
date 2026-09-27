/*
 * 05-helpers.js — مساعدات عامّة: التفضيلات والأيقونات وربط العملاء
 * ─────────────────────────────────────────────────────────────────────────
 * جزء من لوحة ibrahimsaud.com/app بعد تفكيك الملفّ الواحد (index.html) إلى
 * سكربتات كلاسيكيّة تُحمَّل بالترتيب الرقميّ من index.html.
 * ⚠️ نطاقٌ عامّ واحد: الدوالّ هنا عامّة عمداً (مئات onclick="..." تناديها
 *    بالاسم) — لا تحوّلها إلى وحدات ES ولا تغلّفها بدالّة.
 * ⚠️ هذا الملفّ تعريفات فقط: أيّ جملة تنفّذ شيئاً عند التحميل مكانها
 *    99-boot.js (بترتيبها الأصليّ) — وإلا نادت دالّةً في ملفّ لم يُحمَّل بعد.
 */
/* ===== HELPERS ===== */
function lineTotal(it){return Number(it.qty||0)*Number(it.price||0)*(1-(Number(it.discount||0)/100))}
function docGross(d){return (d.items||[]).reduce((a,it)=>a+Number(it.qty||0)*Number(it.price||0),0)}
function docLineSubtotal(d){return (d.items||[]).reduce((a,it)=>a+lineTotal(it),0)}
function docOverallDisc(d){const sub=docLineSubtotal(d);const t=d.discType||'none';const v=Number(d.discVal||0);if(t==='percent')return Math.max(0,Math.min(sub,sub*v/100));if(t==='amount')return Math.max(0,Math.min(sub,v));return 0}
function docTotal(d){return docLineSubtotal(d)-docOverallDisc(d)} // الصافي قبل الضريبة (بعد خصم البنود والخصم الإجمالي)
function invVat(inv){return inv.vat?docTotal(inv)*(Number(inv.vatRate||0)/100):0}
function invTotal(inv){return docTotal(inv)+invVat(inv)}
function invPaid(inv){return (inv.payments||[]).reduce((a,p)=>a+Number(p.amount||0),0)}
function invDue(inv){return Math.max(0,invTotal(inv)-invPaid(inv))}
function syncInvStatus(inv){const paid=invPaid(inv),tot=invTotal(inv);if(paid<=0)inv.status='unpaid';else if(paid+0.009>=tot)inv.status='paid';else inv.status='partial';if(inv.status==='paid'&&!inv.paidDate)inv.paidDate=today();return inv.status}
const ST={draft:'عرض سعر',sent:'مُرسل للعميل',sale:'أمر بيع',accepted:'مقبول',rejected:'مرفوض',cancel:'ملغى',paid:'مدفوعة',partial:'مدفوعة جزئياً',unpaid:'غير مدفوعة',scheduled:'مجدول',done:'تم',cancelled:'ملغى'};
function pill(s){return `<span class="pill ${s}">${ST[s]||s}</span>`}
/* ===== تفضيلات العرض (مبدّلات/فلاتر محفوظة سحابياً) ===== */
function uiPref(k,d){S.settings.ui=S.settings.ui||{};return S.settings.ui[k]!==undefined?S.settings.ui[k]:d}
function setUiPref(k,v){S.settings.ui=S.settings.ui||{};S.settings.ui[k]=v;save()}
function setView(k,v){setUiPref(k,v);rerender()}
function viewSwitch(k,opts,cur){return `<span class="view-switch"><i data-lucide="layout-grid"></i><select onchange="setView('${k}',this.value)" title="طريقة العرض">${opts.map(o=>`<option value="${o.v}" ${cur===o.v?'selected':''}>${esc(o.t)}</option>`).join('')}</select></span>`}
/* ===== أيقونات بدل الإيموجي (lucide) — مع توافق البيانات القديمة ===== */
const EMOJI2ICON={'🎬':'clapperboard','🎥':'video','✂️':'scissors','✂':'scissors','📸':'camera','🎙️':'mic','🎙':'mic','🚁':'plane','✍️':'pen-line','✍':'pen-line','🎨':'palette','💻':'laptop','📱':'smartphone','🖼️':'image','🖼':'image','📣':'megaphone','🎞️':'film','🎞':'film','📊':'bar-chart-3','📈':'trending-up'};
const ICON_CHOICES=['clapperboard','video','scissors','camera','mic','plane','pen-line','palette','laptop','smartphone'];
function iconName(v,fallback){v=(v||'').trim();if(!v)return fallback||'circle';if(/^[a-z][a-z0-9-]*$/.test(v))return v;return EMOJI2ICON[v]||fallback||'circle'}
function iconHTML(v,fallback,sz){return `<i data-lucide="${iconName(v,fallback)}"${sz?` style="width:${sz}px;height:${sz}px"`:''}></i>`}
function pickFlIcon(n){const h=document.getElementById('f_icon');if(h)h.value=n;document.querySelectorAll('.icon-pick').forEach(b=>b.classList.toggle('on',b.dataset.n===n))}
function pickProjIcon(n){const h=document.getElementById('p_emoji');if(h)h.value=n;document.querySelectorAll('.icon-pick').forEach(b=>b.classList.toggle('on',b.dataset.n===n))}
function miniList(arr,fn,empty){if(!arr.length)return `<p style="color:var(--muted)">${empty}</p>`;return arr.map(x=>`<div style="padding:8px 0;border-bottom:1px solid var(--line)">${fn(x)}</div>`).join('')}
function contactName(id){const c=S.contacts.find(c=>c.id===id);return c?c.name:''}
/* ===== UNIFIED CLIENT LINKING (single source = contacts) ===== */
const DEFAULT_TASK_STAGES=[{key:'todo',label:'قيد الانتظار'},{key:'doing',label:'قيد التنفيذ'},{key:'review',label:'مراجعة'},{key:'done',label:'منجز'}];
// يجد جهة الاتصال بالاسم (دون حساسية حالة) أو ينشئها مرة واحدة، ويرجّع id
function findOrCreateContact(name,type){name=(name||'').trim();if(!name)return '';let c=(S.contacts||[]).find(x=>(x.name||'').trim().toLowerCase()===name.toLowerCase());if(c)return c.id;c={id:uid(),name,type:type||'عميل',phone:'',email:'',company:'',vat:'',address:'',city:'',website:'',logo:'',notes:'',stageKey:S.clientStages[0].key,stageDate:today(),value:0,nextAction:'',nextDate:'',log:[]};S.contacts.push(c);return c.id}
// اسم العميل للعرض: من الـ id المربوط، وإلا النص القديم (توافق)
function resolveClientName(rec){return contactName(rec.contactId)||rec.client||rec.clientName||rec.contact||'—'}
// قائمة datalist للإكمال التلقائي (تُضمَّن داخل المودال)
function contactsDatalist(){return `<datalist id="__contactsDL">${(S.contacts||[]).map(c=>`<option value="${esc(c.name)}">`).join('')}</datalist>`}
// حقل عميل ذكي: يبحث في المسجّلين ويقبل اسماً جديداً (يُسجّل عند الحفظ)
function clientFieldHTML(idAttr,current){return `<input id="${idAttr}" list="__contactsDL" value="${esc(current==='—'?'':current||'')}" placeholder="ابحث باسم عميل أو أضف جديد" autocomplete="off">`+contactsDatalist()}
// روابط عناصر العميل (مواعيد/فواتير/مشاريع) عبر contactId
function clientItems(contactId){if(!contactId)return {appts:[],invoices:[],projects:[]};return {appts:S.appointments.filter(a=>a.contactId===contactId),invoices:S.invoices.filter(i=>i.contactId===contactId),projects:S.projects.filter(p=>p.contactId===contactId)}}
