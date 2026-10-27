/*
 * memories.js — «ممرّ الذكريات»: استوديوهات إبراهيم وسيت أباته عبر السنين
 * ─────────────────────────────────────────────────────────────────────────
 * طريق يبدأ من قوس جنوب الاستوديو ويمتدّ غرباً: كلّما مشيت رجعت في الزمن.
 * كلّ محطّة «سيت» تدخله (rooms.js) يعيد بناء المكان من صوره، فوقه لافتة السنة،
 * وعلى جداره الخارجيّ ٣ صور، وعند مدخله منصّة معلومات — وE يفتح المعرض الكامل.
 * المحتوى من memories/memories.json (الأحدث أوّلاً، و"room" مفتاح الغرفة في rooms.js).
 */
import {makeRooms,RW,RD,RH} from './rooms.js?v=2';
export const LANE={z:4.4,x0:-6.5,step:8,max:14}; // حدود الطريق في campus.js تتبعه
export async function buildMemories(C){
const {THREE,scene,mat,box,cyl,grp,ctex,tmat,rrect,wrap,block,act,openPanel,FONT,SERIF,GOLD}=C;
const {ROOMS,shell}=makeRooms(C);
let items=[];
try{const r=await fetch('./memories/memories.json',{cache:'no-cache'});items=(await r.json()).items||[]}catch(_){}
const list=items.slice(0,LANE.max-1).concat([{placeholder:true,year:'؟',title:'مكان آخر؟',period:'أضف ذكرى',text:'أرسل صور أيّ مكان أو سيت أب اشتغلت منه ولم يُضَف بعد، مع سنته وشيئاً عنه، ويُضاف هنا سيتاً جديداً بصورها.'}]);
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const SX=i=>LANE.x0-4.5-i*LANE.step; // مركز السيت على الطريق
const xEnd=SX(list.length-1)-4.5;

// الطريق: من الساحة جنوب الاستوديو حتى آخر سيت
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
// صورة تغطّي إطاراً بنسبة ثابتة دون تمطيط
function photo(src,w,h){const m=new THREE.MeshBasicMaterial({color:0x222222,toneMapped:false});
  loader.load('./memories/'+src,t=>{t.colorSpace=THREE.SRGBColorSpace;const a=t.image.width/t.image.height,f=w/h;if(a>f){t.repeat.set(f/a,1);t.offset.set((1-f/a)/2,0)}else{t.repeat.set(1,a/f);t.offset.set(0,(1-a/f)/2)}m.map=t;m.color.set(0xffffff);m.needsUpdate=true});
  return new THREE.Mesh(new THREE.PlaneGeometry(w,h),m)}

// السيت الحاليّ (٢٠٢٦): باب يأخذك إلى الاستوديو نفسه
function portal(g){shell(g,{wall:0x4f5256,floorColor:0xc2bfb9});
  const d=grp(0,0,-RD+.08,0,g);box(1.3,2.3,.1,0x2b2b2b,0,.06,0,d);
  const t=ctex(512,900,(c,w,h)=>{const gr=c.createLinearGradient(0,0,0,h);gr.addColorStop(0,'#f6dc8e');gr.addColorStop(1,'#a8862f');c.fillStyle=gr;c.fillRect(0,0,w,h);c.fillStyle='#1c1712';c.textAlign='center';c.font='700 74px '+SERIF;c.fillText('ادخل',w/2,h*.42);c.fillText('الاستوديو',w/2,h*.52);c.font='400 44px '+FONT;c.fillText('٢٠٢٦ — الآن',w/2,h*.62)});
  const p=new THREE.Mesh(new THREE.PlaneGeometry(1.1,2.1),new THREE.MeshBasicMaterial({map:t,toneMapped:false}));p.position.set(0,1.18,.06);d.add(p);
  act(d,'ادخل الاستوديو الحالي',()=>C.teleport({x:.25,z:-.15,yaw:Math.PI-.12}),[1.4,2.4,1.2,0,1.2,.5])}
// السيت الفارغ: لمكان لم يُضَف بعد
function emptySet(g){shell(g,{wall:0x2c2c2e,floorColor:0x2c2c2e});
  const t=ctex(512,256,(c,w,h)=>{c.strokeStyle='#e8c766';c.setLineDash([18,12]);c.lineWidth=6;c.strokeRect(12,12,w-24,h-24);c.fillStyle='#e8c766';c.textAlign='center';c.font='700 64px '+SERIF;c.fillText('مكانك القادم',w/2,h/2+20)});
  const p=new THREE.Mesh(new THREE.PlaneGeometry(2.4,1.2),new THREE.MeshBasicMaterial({map:t,transparent:true,toneMapped:false}));p.position.set(0,1.5,-RD+.06);g.add(p)}

function station(i,it){
  const north=i%2===0,x=SX(i),z=north?LANE.z-2:LANE.z+2,ry=north?0:Math.PI,east=north?1:-1; // ‎+z المحلّيّ نحو الطريق؛ east = جهة الشرق محلّيّاً
  const g=grp(x,0,z,ry);g.updateMatrixWorld(true);
  const v=new THREE.Vector3();g.userData.solidL=(lx,lz,hw,hd,top)=>{v.set(lx,0,lz);g.localToWorld(v);block(v.x,v.z,hw,hd,top)}; // الدوران ٠ أو π فالحدود متناظرة
  box(RW+.3,.06,RD+.25,0x3a332b,0,0,-RD/2+.1,g);
  if(it.placeholder)emptySet(g);else if(it.room==='portal')portal(g);else if(ROOMS[it.room])ROOMS[it.room](g);else shell(g,{});
  // لافتة السيت فوق المدخل
  box(RW+.16,.82,.12,0x161616,0,RH+.06,0,g);
  const head=ctex(1024,150,(c,w,h)=>{c.textAlign='right';c.fillStyle=it.placeholder?'#71717a':GOLD;c.font='700 110px '+SERIF;c.fillText(it.year,w-24,112);
    const yw=c.measureText(it.year).width,mx=w-90-yw;c.fillStyle='#FAFAFA';c.font='700 48px '+SERIF;c.fillText(it.title||'',w-64-yw,72,mx);c.fillStyle='#A1A1AA';c.font='400 30px '+FONT;c.fillText(it.period||'',w-64-yw,122,mx)});
  const hp=new THREE.Mesh(new THREE.PlaneGeometry(RW,.74),new THREE.MeshBasicMaterial({map:head,transparent:true,toneMapped:false}));hp.position.set(0,RH+.47,.065);g.add(hp);
  const strip=new THREE.Mesh(new THREE.BoxGeometry(RW+.16,.03,.03),new THREE.MeshBasicMaterial({color:0xe8c766,toneMapped:false}));strip.position.set(0,RH+.06,.07);g.add(strip);
  // ٣ صور على الجدار الخارجيّ الشرقيّ — تراها وأنت قادم من القوس
  const pg=grp(east*(RW/2+.06),0,0,east*Math.PI/2,g);const ph=(it.photos||[]).slice(0,3);
  for(let k=0;k<3;k++){const pz=(1-k)*1.28-RD/2,px=-east*pz; // px محلّيّ للوح ⇐ عمق الغرفة pz
    box(1.2,.72,.03,0x0b0b0b,px,1.08,0,pg);if(ph[k]){const m=photo(ph[k],1.12,.64);m.position.set(px,1.44,.02);pg.add(m)}}
  // منصّة المعلومات عند ركن المدخل الغربيّ
  const lec=grp(-east*1.85,0,.45,0,g);box(.8,.92,.42,0x2a2622,0,0,0,lec);
  const info=ctex(768,480,(c,w,h)=>{c.fillStyle='#efe6d2';c.fillRect(0,0,w,h);c.strokeStyle='#c9b48a';c.lineWidth=6;c.strokeRect(10,10,w-20,h-20);
    c.textAlign='right';c.fillStyle='#1c1712';c.font='700 50px '+SERIF;c.fillText(it.title||'',w-40,78,w-80);
    c.fillStyle='#8a6a43';c.font='700 28px '+FONT;c.fillText(it.period||'',w-40,122,w-80);
    c.fillStyle='#3b3024';c.font='400 30px '+FONT;const L=wrap(c,it.text||'',w-80),n=Math.min(L.length,6);
    L.slice(0,n).forEach((l,j)=>c.fillText(j===n-1&&L.length>n?l+' …':l,w-40,172+j*40));
    rrect(c,40,h-66,250,44,22);c.fillStyle='#1c1712';c.fill();c.fillStyle=GOLD;c.textAlign='center';c.font='700 24px '+FONT;c.fillText(it.placeholder?'E · كيف أضيف؟':'E · افتح المعرض',165,h-36)});
  const tilt=.6,PW=.84,PH=.525,ip=new THREE.Mesh(new THREE.PlaneGeometry(PW,PH),tmat(info,{roughness:.9}));
  ip.rotation.x=-tilt;ip.position.set(0,.93+Math.cos(tilt)*PH/2,-.02);lec.add(ip);box(PW+.04,.03,.05,0x2a2622,0,.92,.19,lec);
  g.userData.solidL(-east*1.85,.45,.42,.24,.95);
  const label=it.placeholder?'أضف ذكرى':'ذكريات '+it.year+' · '+it.title;
  act(lec,label,()=>open(it),[.9,1.4,.8,0,.7,0]);if(ph.length)act(pg,label,()=>open(it),[RD,1,.3,east*RD/2,1.44,.1])}
list.forEach((it,i)=>station(i,it));
// فوانيس بين السيتات
for(let i=0;i<list.length;i++){const x=SX(i)-LANE.step/2,z=LANE.z+(i%2?-1.5:1.5),g=grp(x,0,z);cyl(.04,.05,1.6,0x1d1d1d,0,0,0,g,6);const l=new THREE.Mesh(new THREE.BoxGeometry(.16,.2,.16),new THREE.MeshBasicMaterial({color:0xffd28e,toneMapped:false}));l.position.y=1.7;g.add(l);block(x,z,.06,.06,1.6)}

function open(it){
  if(it.placeholder){openPanel('ممرّ الذكريات',`<div class="mem"><div class="yr">أضف ذكرى</div><h2>مكان آخر؟</h2><p>${esc(it.text)}</p>
    <dl><dt>السنة</dt><dd>تُقرأ من بيانات الصور</dd><dt>الاسم</dt><dd>مثلاً «أوّل استوديو — غرفة البيت»</dd><dt>الصور</dt><dd>ما تريد، ومنها يُبنى السيت</dd><dt>المعلومات</dt><dd>المدينة، ماذا صوّرت، المعدّات، قصّة المكان</dd></dl></div>`);return}
  const facts=(it.facts||[]).map(([k,v])=>`<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('');
  const imgs=(it.photos||[]).map(p=>`<img src="./memories/${esc(p)}" alt="" loading="lazy">`).join('');
  openPanel('ذكريات '+it.year,`<div class="mem"><div class="yr">${esc(it.period||it.year)}</div><h2>${esc(it.title)}</h2><p>${esc(it.text)}</p>${facts?`<dl>${facts}</dl>`:''}<div class="ph">${imgs}</div></div>`,
    e=>{const im=e.target.closest('img');if(im)im.classList.toggle('big')})}

const first=items.length?items[items.length-1].year:'',last=items.length?items[0].year:'';
return {districts:[{name:'ممرّ الذكريات',desc:`${items.length} سيتات تدخلها · من ${first} إلى ${last}`,x:-5.4,z:LANE.z,yaw:Math.PI/2}],xEnd};
}
