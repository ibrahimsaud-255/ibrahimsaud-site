/*
 * 13-quote-studio.js — استوديو تصميم عروض الأسعار
 * ─────────────────────────────────────────────────────────────────────────
 * جزء من لوحة ibrahimsaud.com/app بعد تفكيك الملفّ الواحد (index.html) إلى
 * سكربتات كلاسيكيّة تُحمَّل بالترتيب الرقميّ من index.html.
 * ⚠️ نطاقٌ عامّ واحد: الدوالّ هنا عامّة عمداً (مئات onclick="..." تناديها
 *    بالاسم) — لا تحوّلها إلى وحدات ES ولا تغلّفها بدالّة.
 * ⚠️ هذا الملفّ تعريفات فقط: أيّ جملة تنفّذ شيئاً عند التحميل مكانها
 *    99-boot.js (بترتيبها الأصليّ) — وإلا نادت دالّةً في ملفّ لم يُحمَّل بعد.
 */
/* ═══════════ تصميم عروض الأسعار — استوديو مرئي بمعاينة حيّة ═══════════ */
let QD={sel:''};
function qdDesign(){const b=brandById(QD.sel);QD.sel=b.id;return b;}
function qdSampleDoc(){
  const dd=new Date();dd.setDate(dd.getDate()+14);const exp=dd.getFullYear()+'-'+_pad2(dd.getMonth()+1)+'-'+_pad2(dd.getDate());
  const doc={id:'__qd_sample',number:1023,client:'شركة نموذجية للتقنية',contactId:'',clientVat:'',date:today(),expiry:exp,
    items:[{desc:'إنتاج فيديو إعلاني قصير',qty:1,price:1500,discount:0,details:'الفكرة والسكربت والتصوير والمونتاج، جاهز للنشر.'},
           {desc:'مقاطع عمودية إضافية',qty:2,price:300,discount:0,details:'نسخ قصيرة جاهزة لتيك توك وريلز وشورتس.'}],
    discType:'none',discVal:0,vat:false,vatRate:15,status:'draft',notes:'',templateId:quoteDef().defaultTemplateId,depositPct:50,notesAuto:true,payments:[]};
  doc.notes=buildInitialQuoteNotes(doc);
  return doc;
}
function qdPreviewHTML(design){
  const doc=qdSampleDoc();S.sales.push(doc);
  let html='';try{html=printDocHTML('sale',doc.id,design);}catch(e){html='<p style="padding:20px;color:#b91c1c">تعذّرت المعاينة: '+esc(e.message)+'</p>';}
  S.sales=S.sales.filter(x=>x.id!=='__qd_sample');
  return html;
}
function qdRenderPreview(){const ifr=document.getElementById('qdPreview');if(!ifr)return;ifr.srcdoc=qdPreviewHTML(qdDesign());setTimeout(qdFitPreview,60);}
function qdFitPreview(){const wrap=document.getElementById('qdPvWrap'),sc=document.getElementById('qdPvScale');if(!wrap||!sc)return;const w=wrap.clientWidth-32;const scale=Math.max(.2,Math.min(1,w/794));sc.style.transform='scale('+scale+')';sc.style.height=(2380*scale)+'px';}
function qdSet(f,v){const b=qdDesign();b[f]=v;save();qdRenderPreview();}
function qdSetNum(f,v){const b=qdDesign();b[f]=Number(v)||0;save();qdRenderPreview();}
function qdSetBool(f,v){const b=qdDesign();b[f]=!!v;save();qdRenderPreview();}
function qdSetOrg(f,v){const b=qdDesign();if(!b.org)b.org={};b.org[f]=v;save();qdRenderPreview();}
function qdPick(id){QD.sel=id;renderQuoteDesign();}
function qdAdd(){const base=qdDesign();const id='b_'+uid();const copy=JSON.parse(JSON.stringify(base));copy.id=id;copy.name=(base.name||'تصميم')+' (نسخة)';brandProfiles().push(copy);save();QD.sel=id;renderQuoteDesign();}
function qdBlank(){const id='b_'+uid();brandProfiles().push({id,name:'تصميم جديد',tagline:'',logo:'',accent:'#f5a623',accent2:'#d97706',ink:'#0a0a0b',pattern:'glow',coverStyle:'classic',showPattern:true,showQR:true,titleSize:82,org:{}});save();QD.sel=id;renderQuoteDesign();}
function qdDel(){const arr=brandProfiles();if(arr.length<=1){alert('لا يمكن حذف آخر تصميم');return}const b=qdDesign();if(!confirm('حذف تصميم «'+b.name+'»؟'))return;S.settings.brandProfiles=arr.filter(x=>x.id!==b.id);if(defaultBrandId()===b.id)S.settings.defaultBrandId=brandProfiles()[0].id;save();QD.sel=brandProfiles()[0].id;renderQuoteDesign();}
function qdSetDefault(){S.settings.defaultBrandId=qdDesign().id;save();renderQuoteDesign();}
function qdUploadLogo(input){const f=input.files[0];if(!f)return;const r=new FileReader();r.onload=e=>{const b=qdDesign();b.logo=e.target.result;save();renderQuoteDesign();};r.readAsDataURL(f);}
function qdClearLogo(){const b=qdDesign();b.logo='';save();renderQuoteDesign();}
function qdPrintSample(){const doc=qdSampleDoc();S.sales.push(doc);printDocDirect('sale','__qd_sample');setTimeout(()=>{S.sales=S.sales.filter(x=>x.id!=='__qd_sample')},1600);}

function renderQuoteDesign(){
  const b=qdDesign();const arr=brandProfiles();const org=designOrg(b);const isDef=defaultBrandId()===b.id;
  const COVERS=[['classic','كلاسيكي — رأس ملوّن'],['minimal','بسيط — أبيض أنيق'],['band','شريط لوني في المنتصف'],['sidebar','شريط جانبي عمودي'],['frame','إطار رسمي أنيق'],['split','قطري عصري']];
  const PATS=[['none','بلا (سادة)'],['lines','خطوط مائلة رفيعة'],['dots','نقاط خافتة'],['grid','شبكة دقيقة'],['arcs','أقواس زاوية'],['glow','توهّج ناعم']];
  const lbl=t=>`<div style="font-size:12px;font-weight:800;color:var(--muted);margin:2px 0 5px">${t}</div>`;
  const sec=(icon,title,inner)=>`<div class="qd-sec"><div class="qd-sec-h"><i data-lucide="${icon}"></i> ${title}</div>${inner}</div>`;
  document.getElementById('main').innerHTML=`
    <style>
      .qd-wrap{display:flex;gap:18px;align-items:flex-start;flex-wrap:wrap}
      .qd-controls{width:430px;flex:0 0 430px;max-width:100%}
      .qd-preview{flex:1;min-width:320px;position:sticky;top:12px;align-self:flex-start}
      @media(max-width:900px){.qd-preview{position:static}}
      /* على الجوال: تصغير معاينة A4 لتناسب الشاشة بلا فيضان */
      @media(max-width:760px){
        .qd-preview{overflow-x:auto;-webkit-overflow-scrolling:touch;max-width:100%}
        .qd-preview .page{
          zoom:calc((100vw - 40px) / 794);
          transform-origin:top right;
        }
      }
      .qd-sec{background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:14px 16px;margin-bottom:12px}
      .qd-sec-h{font-weight:800;font-size:14px;display:flex;align-items:center;gap:7px;margin-bottom:12px}
      .qd-sec-h svg{width:16px;height:16px;color:var(--gold2)}
      .qd-row{display:grid;grid-template-columns:1fr 1fr;gap:10px}
      .qd-field input,.qd-field select,.qd-field textarea{width:100%}
      .qd-color{display:flex;align-items:center;gap:8px}
      .qd-color input[type=color]{width:42px;height:38px;padding:2px;border-radius:9px;border:1px solid var(--line);background:var(--panel2);cursor:pointer}
      .qd-designs{display:flex;flex-direction:column;gap:6px;max-height:180px;overflow:auto}
      .qd-swatch{width:18px;height:18px;border-radius:5px;flex:none}
      @media(max-width:900px){.qd-controls{flex:1 1 100%;width:100%}}
    </style>
    <div class="page-head"><h1><i data-lucide="palette"></i> تصميم عروض الأسعار</h1>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn btn-ghost btn-sm" onclick="qdPrintSample()"><i data-lucide="printer"></i> طباعة نموذج تجريبي</button>
        <button class="btn btn-gold btn-sm" onclick="go('sales')"><i data-lucide="file-text"></i> عروض الأسعار</button>
      </div>
    </div>
    <div class="badge-note" style="margin-bottom:16px"><i data-lucide="wand-2"></i> <div>صمّم شكل عروض أسعارك وفواتيرك هنا. عدّل على اليمين وشاهد المعاينة على اليسار مباشرة. احفظ أكثر من تصميم (لكل شركة/براند تصميم)، واختر تصميماً افتراضياً — ثم عند إنشاء عرض سعر تختار التصميم من قائمة «هويّة الطباعة».</div></div>
    <div class="qd-wrap">
      <!-- عمود التحكم (يمين) -->
      <div class="qd-controls">
        ${sec('layers','التصاميم المحفوظة',`
          <div class="qd-designs">${arr.map((x,i)=>{const on=x.id===b.id;return `<button class="btn ${on?'btn-gold':'btn-ghost'} btn-sm" style="justify-content:flex-start;gap:8px" onclick="qdPick('${esc(x.id)}')"><span class="qd-swatch" style="background:linear-gradient(135deg,${x.accent||'#f5a623'},${x.accent2||x.accent||'#d97706'})"></span> ${esc(x.name&&x.name.trim()?x.name:('تصميم '+(i+1)))}${defaultBrandId()===x.id?' <span style="color:var(--gold2);font-size:11px;margin-inline-start:auto">★ افتراضي</span>':''}</button>`}).join('')}</div>
          <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:10px">
            <button class="btn btn-ghost btn-sm" onclick="qdBlank()"><i data-lucide="plus"></i> جديد</button>
            <button class="btn btn-ghost btn-sm" onclick="qdAdd()"><i data-lucide="copy"></i> نسخ الحالي</button>
            <button class="btn btn-ghost btn-sm" onclick="qdSetDefault()" ${isDef?'disabled':''}><i data-lucide="check-circle"></i> اجعله الافتراضي</button>
            <button class="btn btn-ghost btn-sm" style="color:var(--bad)" onclick="qdDel()" ${arr.length<=1?'disabled':''}><i data-lucide="trash-2"></i> حذف</button>
          </div>`)}

        ${sec('tag','اسم التصميم والهوية',`
          <div class="qd-field" style="margin-bottom:10px">${lbl('اسم الشركة/البراند (يظهر على المستند وفي قائمة الاختيار)')}<input value="${esc(b.name||'')}" oninput="qdSet('name',this.value)" placeholder="مثال: إبراهيم سعود"></div>
          <div class="qd-field">${lbl('وسم تعريفي (سطر صغير تحت الاسم)')}<input value="${esc(b.tagline||'')}" oninput="qdSet('tagline',this.value)" placeholder="مثال: فيديوهات إعلانية تبيع"></div>`)}

        ${sec('image','الشعار',`
          <input type="file" accept="image/*" onchange="qdUploadLogo(this)">
          ${b.logo?`<div style="display:flex;align-items:center;gap:12px;margin-top:10px"><img src="${esc(b.logo)}" style="height:52px;max-width:150px;object-fit:contain;background:#fff;border-radius:8px;padding:6px"><button class="btn btn-ghost btn-sm" style="color:var(--bad)" onclick="qdClearLogo()"><i data-lucide="x"></i> إزالة</button></div>`:`<div style="font-size:12px;color:var(--muted);margin-top:6px">لا شعار — يظهر اسم الشركة نصّاً.</div>`}`)}

        ${sec('paintbrush','الألوان',`
          <div class="qd-row">
            <div class="qd-field">${lbl('اللون الرئيسي')}<div class="qd-color"><input type="color" value="${esc(b.accent||'#f5a623')}" oninput="qdSet('accent',this.value)"><input value="${esc(b.accent||'#f5a623')}" oninput="qdSet('accent',this.value)" dir="ltr" style="flex:1"></div></div>
            <div class="qd-field">${lbl('اللون الثانوي')}<div class="qd-color"><input type="color" value="${esc(b.accent2||b.accent||'#d97706')}" oninput="qdSet('accent2',this.value)"><input value="${esc(b.accent2||b.accent||'#d97706')}" oninput="qdSet('accent2',this.value)" dir="ltr" style="flex:1"></div></div>
          </div>
          <div class="qd-field" style="margin-top:10px">${lbl('لون النصوص الداكنة')}<div class="qd-color"><input type="color" value="${esc(b.ink||'#0a0a0b')}" oninput="qdSet('ink',this.value)"><input value="${esc(b.ink||'#0a0a0b')}" oninput="qdSet('ink',this.value)" dir="ltr" style="flex:1"></div></div>`)}

        ${sec('layout-template','الغلاف والعنوان',`
          <div class="qd-field" style="margin-bottom:10px">${lbl('نمط الغلاف')}<select onchange="qdSet('coverStyle',this.value)">${COVERS.map(c=>`<option value="${c[0]}" ${(b.coverStyle||'classic')===c[0]?'selected':''}>${c[1]}</option>`).join('')}</select></div>
          <div class="qd-field" style="margin-bottom:10px">${lbl('نص العنوان (فارغ = تلقائي «عرض سعر» / «فاتورة»)')}<input value="${esc(b.titleText||'')}" oninput="qdSet('titleText',this.value)" placeholder="عرض سعر"></div>
          <div class="qd-field" style="margin-bottom:10px">${lbl('حجم العنوان: '+(b.titleSize||82)+'px')}<input type="range" min="48" max="110" value="${b.titleSize||82}" oninput="qdSetNum('titleSize',this.value);this.previousElementSibling.textContent='حجم العنوان: '+this.value+'px'" style="width:100%"></div>
          <div class="qd-row">
            <div class="qd-field">${lbl('النقش الزخرفي')}<select onchange="qdSet('pattern',this.value)">${PATS.map(p=>`<option value="${p[0]}" ${(b.pattern||'sun')===p[0]?'selected':''}>${p[1]}</option>`).join('')}</select></div>
            <div class="qd-field">${lbl('إظهار النقش')}<select onchange="qdSetBool('showPattern',this.value==='1')"><option value="1" ${b.showPattern!==false?'selected':''}>نعم</option><option value="0" ${b.showPattern===false?'selected':''}>لا (سادة)</option></select></div>
          </div>
          <div class="qd-field" style="margin-top:10px">${lbl('رمز QR للزكاة (يظهر في الفواتير)')}<select onchange="qdSetBool('showQR',this.value==='1')"><option value="1" ${b.showQR!==false?'selected':''}>مفعّل</option><option value="0" ${b.showQR===false?'selected':''}>مخفي</option></select></div>`)}

        ${sec('building-2','بيانات المؤسسة على المستند',`
          <div style="font-size:11.5px;color:var(--muted);margin-bottom:10px">تظهر أسفل المستند. اتركها فارغة لتُستعمل البيانات الرسمية العامة تلقائياً.</div>
          <div class="qd-field" style="margin-bottom:10px">${lbl('اسم المؤسسة الرسمي')}<input value="${esc((b.org&&b.org.brand)||'')}" oninput="qdSetOrg('brand',this.value)" placeholder="${esc(officialInfo().brand||'مؤسسة حروف ودروس')}"></div>
          <div class="qd-row">
            <div class="qd-field">${lbl('المالك / التوقيع')}<input value="${esc((b.org&&b.org.owner)||'')}" oninput="qdSetOrg('owner',this.value)" placeholder="${esc(officialInfo().owner||'')}"></div>
            <div class="qd-field">${lbl('الجوال / واتساب')}<input value="${esc((b.org&&b.org.phone)||'')}" oninput="qdSetOrg('phone',this.value)" dir="ltr" placeholder="${esc(officialInfo().phone||'')}"></div>
          </div>
          <div class="qd-field" style="margin:10px 0">${lbl('البريد الإلكتروني')}<input value="${esc((b.org&&b.org.email)||'')}" oninput="qdSetOrg('email',this.value)" dir="ltr" placeholder="${esc(officialInfo().email||'')}"></div>
          <div class="qd-field" style="margin-bottom:10px">${lbl('الآيبان (IBAN)')}<input value="${esc((b.org&&b.org.iban)||'')}" oninput="qdSetOrg('iban',this.value)" dir="ltr" placeholder="SA00 0000 0000 0000 0000 0000"></div>
          <div class="qd-row">
            <div class="qd-field">${lbl('السجل التجاري')}<input value="${esc((b.org&&b.org.cr)||'')}" oninput="qdSetOrg('cr',this.value)" dir="ltr"></div>
            <div class="qd-field">${lbl('الرقم الضريبي')}<input value="${esc((b.org&&b.org.vat)||'')}" oninput="qdSetOrg('vat',this.value)" dir="ltr"></div>
          </div>
          <div class="qd-field" style="margin-top:10px">${lbl('العنوان')}<input value="${esc((b.org&&b.org.address)||'')}" oninput="qdSetOrg('address',this.value)" placeholder="${esc(officialInfo().address||'')}"></div>`)}

        <div style="display:flex;align-items:center;gap:8px;color:var(--good);font-size:12.5px;padding:4px 2px"><i data-lucide="check-circle-2" style="width:15px;height:15px"></i> كل تعديل يُحفظ تلقائياً.</div>
      </div>

      <!-- عمود المعاينة (يسار) -->
      <div class="qd-preview">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
          <div style="font-weight:800;font-size:14px"><i class="inl" data-lucide="eye"></i> معاينة حيّة</div>
          <div style="font-size:12px;color:var(--muted)">${esc(b.name)}</div>
        </div>
        <div id="qdPvWrap" style="background:#e5e7eb;border:1px solid var(--line);border-radius:14px;padding:16px;overflow:auto;max-height:82vh">
          <div id="qdPvScale" style="transform-origin:top center;width:794px;margin:0 auto">
            <iframe id="qdPreview" style="width:794px;height:2380px;border:0;background:#fff;display:block"></iframe>
          </div>
        </div>
      </div>
    </div>`;
  applyWallpaper();refreshIcons();
  qdRenderPreview();
  if(!QD._resizeBound){QD._resizeBound=true;window.addEventListener('resize',()=>{if(CUR==='quotedesign')qdFitPreview()});}
}
