/*
 * memories.js — «ممرّ الذكريات»: استوديوهات إبراهيم وسيت أباته عبر السنين
 * ─────────────────────────────────────────────────────────────────────────
 * ممشى خلف الاستوديو (غرب الساحة)، لكلّ سنة محطّة: جدار عليه السنة وأوّل ٣ صور،
 * ومنصّة معلومات، وE يفتح معرضاً كاملاً بكلّ الصور والتفاصيل.
 * المحتوى من memories/memories.json (الأحدث أوّلاً) — إضافة مكان = مجلّد صور + عنصر.
 */
export async function buildMemories(C){
const {THREE,scene,mat,box,cyl,grp,ctex,tmat,rrect,wrap,block,act,openPanel,FONT,SERIF,GOLD}=C;
let items=[];
try{const r=await fetch('./memories/memories.json',{cache:'no-cache'});items=(await r.json()).items||[]}catch(_){}
const list=items.slice(0,5).concat([{placeholder:true,year:'؟',title:'استوديوهاتك السابقة',period:'أضف ذكرى',text:'أرسل صور كلّ مكان أو سيت أب اشتغلت منه، وسنته، وشيئاً عنه (المدينة، ماذا صوّرت فيه، المعدّات، أيّ قصّة)، ويُضاف هنا محطّةً جديدة بصورها.'}]);
const LX=-7.6,Z_TOP=10,STEP=6.5,WX=-10.6;
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

// الممشى + الوصلة من الساحة (جنوب الاستوديو)
const stone=mat(0xcdbb98,{roughness:1});
const zEnd=Z_TOP-STEP*(list.length-1)-3;
{const m=new THREE.Mesh(new THREE.BoxGeometry(2.4,.03,Z_TOP+3-zEnd),stone);m.position.set(LX,.015,(Z_TOP+3+zEnd)/2);m.receiveShadow=true;scene.add(m)}
{const m=new THREE.Mesh(new THREE.BoxGeometry(2.6-LX,.03,2),stone);m.position.set((2.6+LX)/2,.016,4.4);m.receiveShadow=true;scene.add(m)}
// قوس المدخل
{const g=grp(-4.6,0,4.4,Math.PI/2);for(const sx of[-1.5,1.5])box(.3,3,.3,0x2a2622,sx,0,0,g);box(3.4,.4,.34,0x2a2622,0,3,0,g);
  const t=ctex(640,96,(c,w,h)=>{c.fillStyle='#2a2622';c.fillRect(0,0,w,h);c.textAlign='center';c.fillStyle=GOLD;c.font='700 52px '+SERIF;c.fillText('ممرّ الذكريات',w/2,64)});
  for(const [zz,ry] of[[.18,0],[-.18,Math.PI]]){const p=new THREE.Mesh(new THREE.PlaneGeometry(3.3,.4),new THREE.MeshBasicMaterial({map:t,toneMapped:false}));p.position.set(0,3.2,zz);p.rotation.y=ry;g.add(p)}
  block(-4.6,4.4-1.5,.18,.18,3.4);block(-4.6,4.4+1.5,.18,.18,3.4)}

const loader=new THREE.TextureLoader();
// صورة تغطّي إطار ١٦:٩ دون تمطيط
function photo(src,w,h){const m=new THREE.MeshBasicMaterial({color:0x222222,toneMapped:false});
  loader.load('./memories/'+src,t=>{t.colorSpace=THREE.SRGBColorSpace;const a=t.image.width/t.image.height,f=w/h;if(a>f){t.repeat.set(f/a,1);t.offset.set((1-f/a)/2,0)}else{t.repeat.set(1,a/f);t.offset.set(0,(1-a/f)/2)}m.map=t;m.color.set(0xffffff);m.needsUpdate=true});
  return new THREE.Mesh(new THREE.PlaneGeometry(w,h),m)}

function station(i,it){const z=Z_TOP-i*STEP;const g=grp(WX,0,z,Math.PI/2); // ‎+z المحلّيّ يواجه الممشى (+x)
  box(5.2,.12,3.4,0x3a332b,0,0,0,g);box(5.2,2.9,.16,0x1b1b1b,0,.12,-1.55,g);
  const strip=new THREE.Mesh(new THREE.BoxGeometry(5.2,.04,.05),new THREE.MeshBasicMaterial({color:0xe8c766,toneMapped:false}));strip.position.set(0,3.0,-1.45);g.add(strip);
  const head=ctex(1024,180,(c,w,h)=>{c.textAlign='right';c.fillStyle=it.placeholder?'#71717a':GOLD;c.font='700 120px '+SERIF;c.fillText(it.year,w-20,128);
    const yw=c.measureText(it.year).width;c.fillStyle='#FAFAFA';c.font='700 50px '+SERIF;c.fillText(it.title||'',w-60-yw,96);c.fillStyle='#A1A1AA';c.font='400 32px '+FONT;c.fillText(it.period||'',w-60-yw,146)});
  const hp=new THREE.Mesh(new THREE.PlaneGeometry(4.8,.84),new THREE.MeshBasicMaterial({map:head,transparent:true,toneMapped:false}));hp.position.set(0,2.45,-1.46);g.add(hp);
  const ph=(it.photos||[]).slice(0,3);
  for(let k=0;k<3;k++){const x=(1-k)*1.62;box(1.5,.88,.04,0x0b0b0b,x,1.0,-1.47,g);
    if(ph[k]){const m=photo(ph[k],1.42,.8);m.position.set(x,1.44,-1.445);g.add(m)}
    else{const t=ctex(320,180,(c,w,h)=>{c.fillStyle='#141414';c.fillRect(0,0,w,h);c.strokeStyle='#3f3f46';c.setLineDash([10,8]);c.lineWidth=4;c.strokeRect(10,10,w-20,h-20);c.fillStyle='#71717a';c.textAlign='center';c.font='400 30px '+FONT;c.fillText('صورة المكان',w/2,100)});
      const m=new THREE.Mesh(new THREE.PlaneGeometry(1.42,.8),new THREE.MeshBasicMaterial({map:t,toneMapped:false}));m.position.set(x,1.44,-1.445);g.add(m)}}
  // منصّة المعلومات
  const lec=grp(0,0,.55,0,g);box(.7,.95,.36,0x2a2622,0,0,0,lec);
  const info=ctex(512,320,(c,w,h)=>{c.fillStyle='#efe6d2';c.fillRect(0,0,w,h);c.textAlign='right';c.fillStyle='#1c1712';c.font='700 40px '+SERIF;c.fillText(it.title||'',w-24,56);
    c.fillStyle='#5b4a36';c.font='400 24px '+FONT;wrap(c,it.text||'',w-48).slice(0,6).forEach((l,j)=>c.fillText(l,w-24,100+j*34));
    c.fillStyle='#8a6a43';c.font='700 24px '+FONT;c.fillText(it.placeholder?'E · كيف أضيف مكاناً؟':'E · افتح المعرض',w-24,h-22)});
  const ip=new THREE.Mesh(new THREE.PlaneGeometry(.78,.49),tmat(info,{roughness:.9}));ip.position.set(0,1.0,.02);ip.rotation.x=-.55;lec.add(ip);
  const L=new THREE.PointLight(0xffd9a0,1.6,5,1.8);L.position.set(0,2.6,0);g.add(L);
  block(WX-1.55,z,.12,2.6,3);block(WX+.55,z,.2,.36,.95);
  act(g,it.placeholder?'أضف ذكرى':'ذكريات '+it.year,()=>open(it),[5,2.6,2.8,0,1.4,-.1])}
list.forEach((it,i)=>station(i,it));
// فوانيس الممشى
for(let i=0;i<list.length;i++){const z=Z_TOP-i*STEP+STEP/2,g=grp(LX+1.5,0,z);cyl(.04,.05,1.6,0x1d1d1d,0,0,0,g,6);const l=new THREE.Mesh(new THREE.BoxGeometry(.16,.2,.16),new THREE.MeshBasicMaterial({color:0xffd28e,toneMapped:false}));l.position.y=1.7;g.add(l);block(LX+1.5,z,.06,.06,1.6)}

function open(it){
  if(it.placeholder){openPanel('ممرّ الذكريات',`<div class="mem"><div class="yr">أضف ذكرى</div><h2>استوديوهاتك السابقة</h2><p>${esc(it.text)}</p>
    <dl><dt>السنة</dt><dd>مثلاً ٢٠٢٢</dd><dt>الاسم</dt><dd>مثلاً «أوّل استوديو — غرفة البيت»</dd><dt>الصور</dt><dd>ما تريد، وأوّل ٣ تُعلَّق على الجدار</dd><dt>المعلومات</dt><dd>المدينة، ماذا صوّرت، المعدّات، قصّة المكان</dd></dl></div>`);return}
  const facts=(it.facts||[]).map(([k,v])=>`<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('');
  const imgs=(it.photos||[]).map(p=>`<img src="./memories/${esc(p)}" alt="" loading="lazy">`).join('');
  openPanel('ذكريات '+it.year,`<div class="mem"><div class="yr">${esc(it.year)} · ${esc(it.period||'')}</div><h2>${esc(it.title)}</h2><p>${esc(it.text)}</p>${facts?`<dl>${facts}</dl>`:''}<div class="ph">${imgs}</div></div>`,
    e=>{const im=e.target.closest('img');if(im)im.classList.toggle('big')})}

return {districts:[{name:'ممرّ الذكريات',desc:'استوديوهاتك وسيت أباتك عبر السنين',x:LX,z:Z_TOP,yaw:Math.PI/2}]};
}
