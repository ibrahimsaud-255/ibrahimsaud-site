/*
 * memories.js — «ممرّ الذكريات»: استوديوهات إبراهيم وسيت أباته عبر السنين
 * ─────────────────────────────────────────────────────────────────────────
 * طريق يبدأ من قوس جنوب الاستوديو ويمتدّ غرباً: كلّما مشيت رجعت في الزمن.
 * المحطّات على جانبي الطريق بالتناوب، لكلٍّ جدار (السنة + أوّل ٣ صور) ومنصّة
 * معلومات، وE يفتح معرضاً كاملاً بكلّ الصور والتفاصيل.
 * المحتوى من memories/memories.json (الأحدث أوّلاً) — إضافة مكان = مجلّد صور + عنصر.
 */
export const LANE={z:4.4,x0:-6.5,step:6.2,max:14}; // تقرؤه campus.js لحدود العالم والكثبان
export async function buildMemories(C){
const {THREE,scene,mat,box,cyl,grp,ctex,tmat,rrect,wrap,block,act,openPanel,FONT,SERIF,GOLD}=C;
let items=[];
try{const r=await fetch('./memories/memories.json',{cache:'no-cache'});items=(await r.json()).items||[]}catch(_){}
const list=items.slice(0,LANE.max-1).concat([{placeholder:true,year:'؟',title:'مكان آخر؟',period:'أضف ذكرى',text:'أرسل صور أيّ مكان أو سيت أب اشتغلت منه ولم يُضَف بعد، مع سنته وشيئاً عنه، ويُضاف هنا محطّةً جديدة بصورها.'}]);
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const SX=i=>LANE.x0-2.5-i*LANE.step; // موضع المحطّة على الطريق
const xEnd=SX(list.length-1)-4;

// الطريق: من الساحة جنوب الاستوديو حتى آخر محطّة
{const len=2.6-xEnd,m=new THREE.Mesh(new THREE.BoxGeometry(len,.03,2.4),mat(0xcdbb98,{roughness:1}));m.position.set((2.6+xEnd)/2,.016,LANE.z);m.receiveShadow=true;scene.add(m)}
// قوس المدخل
{const g=grp(-4.6,0,LANE.z,Math.PI/2);for(const sx of[-1.5,1.5])box(.3,3,.3,0x2a2622,sx,0,0,g);box(3.4,.4,.34,0x2a2622,0,3,0,g);
  const t=ctex(640,96,(c,w,h)=>{c.fillStyle='#2a2622';c.fillRect(0,0,w,h);c.textAlign='center';c.fillStyle=GOLD;c.font='700 52px '+SERIF;c.fillText('ممرّ الذكريات',w/2,64)});
  for(const [zz,ry] of[[.18,0],[-.18,Math.PI]]){const p=new THREE.Mesh(new THREE.PlaneGeometry(3.3,.4),new THREE.MeshBasicMaterial({map:t,toneMapped:false}));p.position.set(0,3.2,zz);p.rotation.y=ry;g.add(p)}
  block(-4.6,LANE.z-1.5,.18,.18,3.4);block(-4.6,LANE.z+1.5,.18,.18,3.4)}
// اتّجاه الزمن مكتوباً على الطريق
{const t=ctex(640,96,(c,w,h)=>{c.textAlign='center';c.fillStyle='rgba(28,23,18,.6)';c.font='700 46px '+FONT;c.fillText('كلّما مشيت رجعت في الزمن ←',w/2,62)});
  const p=new THREE.Mesh(new THREE.PlaneGeometry(2.3,.36),new THREE.MeshBasicMaterial({map:t,transparent:true,depthWrite:false}));p.rotation.set(-Math.PI/2,0,Math.PI/2);p.position.set(-6.4,.035,LANE.z);scene.add(p)}

const loader=new THREE.TextureLoader();
// صورة تغطّي إطار ١٦:٩ دون تمطيط
function photo(src,w,h){const m=new THREE.MeshBasicMaterial({color:0x222222,toneMapped:false});
  loader.load('./memories/'+src,t=>{t.colorSpace=THREE.SRGBColorSpace;const a=t.image.width/t.image.height,f=w/h;if(a>f){t.repeat.set(f/a,1);t.offset.set((1-f/a)/2,0)}else{t.repeat.set(1,a/f);t.offset.set(0,(1-a/f)/2)}m.map=t;m.color.set(0xffffff);m.needsUpdate=true});
  return new THREE.Mesh(new THREE.PlaneGeometry(w,h),m)}

function station(i,it){
  const north=i%2===0,x=SX(i),z=north?LANE.z-3.1:LANE.z+3.1,ry=north?0:Math.PI; // ‎+z المحلّيّ يواجه الطريق
  const g=grp(x,0,z,ry);
  box(5.2,.12,3.4,0x3a332b,0,0,0,g);box(5.2,2.9,.16,0x1b1b1b,0,.12,-1.55,g);
  const strip=new THREE.Mesh(new THREE.BoxGeometry(5.2,.04,.05),new THREE.MeshBasicMaterial({color:0xe8c766,toneMapped:false}));strip.position.set(0,3.0,-1.45);g.add(strip);
  // رأس الجدار: السنة كبيرة، والعنوان والفترة بجانبها
  const head=ctex(1024,180,(c,w,h)=>{c.textAlign='right';c.fillStyle=it.placeholder?'#71717a':GOLD;c.font='700 120px '+SERIF;c.fillText(it.year,w-20,128);
    const yw=c.measureText(it.year).width,mx=w-80-yw;c.fillStyle='#FAFAFA';c.font='700 50px '+SERIF;c.fillText(it.title||'',w-60-yw,90,mx);c.fillStyle='#A1A1AA';c.font='400 32px '+FONT;c.fillText(it.period||'',w-60-yw,142,mx)});
  const hp=new THREE.Mesh(new THREE.PlaneGeometry(4.8,.84),new THREE.MeshBasicMaterial({map:head,transparent:true,toneMapped:false}));hp.position.set(0,2.45,-1.46);g.add(hp);
  const ph=(it.photos||[]).slice(0,3);
  for(let k=0;k<3;k++){const px=(1-k)*1.62;box(1.5,.88,.04,0x0b0b0b,px,1.0,-1.47,g);
    if(ph[k]){const m=photo(ph[k],1.42,.8);m.position.set(px,1.44,-1.445);g.add(m)}
    else{const t=ctex(320,180,(c,w,h)=>{c.fillStyle='#141414';c.fillRect(0,0,w,h);c.strokeStyle='#3f3f46';c.setLineDash([10,8]);c.lineWidth=4;c.strokeRect(10,10,w-20,h-20);c.fillStyle='#71717a';c.textAlign='center';c.font='400 30px '+FONT;c.fillText('صورة المكان',w/2,100)});
      const m=new THREE.Mesh(new THREE.PlaneGeometry(1.42,.8),new THREE.MeshBasicMaterial({map:t,toneMapped:false}));m.position.set(px,1.44,-1.445);g.add(m)}}
  // منصّة المعلومات: لوحة مائلة تستقرّ فوق القاعدة (لا تخترقها) بخطّ كبير مقروء
  const lec=grp(0,0,.6,0,g);box(.8,.92,.42,0x2a2622,0,0,0,lec);
  const info=ctex(768,480,(c,w,h)=>{c.fillStyle='#efe6d2';c.fillRect(0,0,w,h);c.strokeStyle='#c9b48a';c.lineWidth=6;c.strokeRect(10,10,w-20,h-20);
    c.textAlign='right';c.fillStyle='#1c1712';c.font='700 50px '+SERIF;c.fillText(it.title||'',w-40,78,w-80);
    c.fillStyle='#8a6a43';c.font='700 28px '+FONT;c.fillText(it.period||'',w-40,122,w-80);
    c.fillStyle='#3b3024';c.font='400 30px '+FONT;const L=wrap(c,it.text||'',w-80),n=Math.min(L.length,6);
    L.slice(0,n).forEach((l,j)=>c.fillText(j===n-1&&L.length>n?l+' …':l,w-40,172+j*40));
    rrect(c,40,h-66,250,44,22);c.fillStyle='#1c1712';c.fill();c.fillStyle=GOLD;c.textAlign='center';c.font='700 24px '+FONT;c.fillText(it.placeholder?'E · كيف أضيف؟':'E · افتح المعرض',165,h-36)});
  const tilt=.6,PW=.84,PH=.525,ip=new THREE.Mesh(new THREE.PlaneGeometry(PW,PH),tmat(info,{roughness:.9}));
  ip.rotation.x=-tilt;ip.position.set(0,.93+Math.cos(tilt)*PH/2,-.02);lec.add(ip);
  box(PW+.04,.03,.05,0x2a2622,0,.92,.19,lec); // حافّة تسند اللوحة
  const L=new THREE.PointLight(0xffd9a0,1.6,5,1.8);L.position.set(0,2.6,0);g.add(L);
  // التصادم: الجدار والمنصّة بإحداثيّات العالم
  const wz=z+(north?-1.55:1.55),lz=z+(north?.6:-.6);block(x,wz,2.6,.12,3);block(x,lz,.42,.24,.95);
  act(g,it.placeholder?'أضف ذكرى':'ذكريات '+it.year+' · '+it.title,()=>open(it),[5,2.6,2.8,0,1.4,-.1])}
list.forEach((it,i)=>station(i,it));
// فوانيس بين المحطّات
for(let i=0;i<list.length;i++){const x=SX(i)-LANE.step/2,z=LANE.z+(i%2?-1.5:1.5),g=grp(x,0,z);cyl(.04,.05,1.6,0x1d1d1d,0,0,0,g,6);const l=new THREE.Mesh(new THREE.BoxGeometry(.16,.2,.16),new THREE.MeshBasicMaterial({color:0xffd28e,toneMapped:false}));l.position.y=1.7;g.add(l);block(x,z,.06,.06,1.6)}

function open(it){
  if(it.placeholder){openPanel('ممرّ الذكريات',`<div class="mem"><div class="yr">أضف ذكرى</div><h2>مكان آخر؟</h2><p>${esc(it.text)}</p>
    <dl><dt>السنة</dt><dd>تُقرأ من بيانات الصور</dd><dt>الاسم</dt><dd>مثلاً «أوّل استوديو — غرفة البيت»</dd><dt>الصور</dt><dd>ما تريد، وأوّل ٣ تُعلَّق على الجدار</dd><dt>المعلومات</dt><dd>المدينة، ماذا صوّرت، المعدّات، قصّة المكان</dd></dl></div>`);return}
  const facts=(it.facts||[]).map(([k,v])=>`<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('');
  const imgs=(it.photos||[]).map(p=>`<img src="./memories/${esc(p)}" alt="" loading="lazy">`).join('');
  openPanel('ذكريات '+it.year,`<div class="mem"><div class="yr">${esc(it.period||it.year)}</div><h2>${esc(it.title)}</h2><p>${esc(it.text)}</p>${facts?`<dl>${facts}</dl>`:''}<div class="ph">${imgs}</div></div>`,
    e=>{const im=e.target.closest('img');if(im)im.classList.toggle('big')})}

const first=items.length?items[items.length-1].year:'',last=items.length?items[0].year:'';
return {districts:[{name:'ممرّ الذكريات',desc:`${items.length} أماكن · من ${first} إلى ${last}`,x:-5.4,z:LANE.z,yaw:Math.PI/2}],xEnd};
}
