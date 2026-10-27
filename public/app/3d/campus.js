/*
 * campus.js — «الساحة» وما حولها: كلّ أدوات النظام أماكنُ تمشي إليها
 * ─────────────────────────────────────────────────────────────────────────
 * باب الاستوديو يُفتح على ساحة عند الغروب، حولها ثمانية أماكن، لكلٍّ بوّابة
 * وأعمدة شاشات (totem) تفتح شاشة النظام المقابلة في الإطار:
 *   الساحة (برج المؤشّرات، الإعدادات) · وادي المبيعات (أعمدة ضوء لكلّ شهر/عميل
 *   يُقفز عليها) · الخزنة (المحاسبة) · المجلس (العملاء) · غرفة البثّ (المحتوى)
 *   · أكاديمية حروف · الورشة (الخرائط والمساحة) · الحديقة (العادات والمواعيد)
 * يستلم أدوات البناء من world.js (C) — لا يملك محرّكاً خاصّاً.
 * ما أُخفي من النظام عمداً (الكاشير، الأفكار، الفريق) لا مكان له هنا.
 */
export function buildCampus(C){
const {THREE,scene,mat,box,cyl,ball,grp,plane,rnd,ctex,paint,tmat,rrect,wrap,fmt,solid,block,act,palm,openSys,toast,info,getK,FONT,SERIF,GOLD}=C;
const PC={x:16,z:2}; // مركز الساحة
const face=(x,z,tx=PC.x,tz=PC.z)=>Math.atan2(tx-x,tz-z); // دوران يجعل +z المحلّيّ يواجه نقطة
const glow=c=>new THREE.MeshBasicMaterial({color:c,toneMapped:false});
const DYN=[]; // خامات تُعاد رسمتها مع البيانات
const dyn=(w,h,draw)=>{const t=ctex(w,h,draw);DYN.push(t);return t};
const K=()=>getK()||{};
const money=v=>fmt(v)+' '+(K().cur||'ر.س');

/* ══════════ السماء والأرض ══════════ */
scene.fog=new THREE.Fog(0x2a1f30,38,135);
const skyTex=ctex(8,512,(g,w,h)=>{const gr=g.createLinearGradient(0,0,0,h);[[0,'#060818'],[.3,'#161636'],[.43,'#4a2f52'],[.49,'#d27a45'],[.5,'#f0a35a'],[.52,'#3a2630'],[1,'#120e14']].forEach(([s,c])=>gr.addColorStop(s,c));g.fillStyle=gr;g.fillRect(0,0,w,h)});
const sky=new THREE.Mesh(new THREE.SphereGeometry(190,24,16),new THREE.MeshBasicMaterial({map:skyTex,side:THREE.BackSide,fog:false,depthWrite:false}));sky.position.set(PC.x,-8,PC.z);sky.renderOrder=-1;scene.add(sky);
{const r=rnd(77),pos=[];for(let i=0;i<700;i++){const a=r()*Math.PI*2,e=.12+r()*1.3,R=180;pos.push(PC.x+Math.cos(a)*Math.cos(e)*R,Math.sin(e)*R-8,PC.z+Math.sin(a)*Math.cos(e)*R)}
  const gm=new THREE.BufferGeometry();gm.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));scene.add(new THREE.Points(gm,new THREE.PointsMaterial({color:0xfff6e0,size:1.6,sizeAttenuation:false,fog:false})))}
{const moon=new THREE.Mesh(new THREE.IcosahedronGeometry(7,1),new THREE.MeshBasicMaterial({color:0xf3ead2,fog:false}));moon.position.set(-70,85,-120);scene.add(moon)}
const moonLight=new THREE.DirectionalLight(0x8fa4ff,.45);moonLight.position.set(-70,85,-120);scene.add(moonLight);

const sandTex=ctex(256,256,(g,w,h)=>{g.fillStyle='#b48f62';g.fillRect(0,0,w,h);const r=rnd(5);for(let i=0;i<1400;i++){g.fillStyle=r()<.5?'rgba(90,60,30,.10)':'rgba(255,230,190,.10)';g.fillRect(r()*w,r()*h,2,2)}},{repeat:[36,36]});
{const gr=new THREE.Mesh(new THREE.PlaneGeometry(160,160),tmat(sandTex,{roughness:1}));gr.rotation.x=-Math.PI/2;gr.position.set(PC.x,-.004,PC.z);gr.receiveShadow=true;scene.add(gr)}
// كثبان حول الحدود
{const r=rnd(13);for(let i=0;i<34;i++){const a=i/34*Math.PI*2,R=46+r()*8;const d=new THREE.Mesh(new THREE.IcosahedronGeometry(6+r()*5,1),mat(0xa9845a,{roughness:1}));d.scale.y=.28+r()*.2;d.position.set(PC.x+Math.cos(a)*R*1.05,-.6,PC.z+Math.sin(a)*R*.95);d.rotation.y=r()*3;scene.add(d)}}

/* ══════════ قطع متكرّرة ══════════ */
function lantern(x,z,h=2.4){const g=grp(x,0,z);cyl(.05,.07,h,0x1d1d1d,0,0,0,g,6);box(.24,.3,.24,0x1d1d1d,0,h,0,g);
  const l=new THREE.Mesh(new THREE.BoxGeometry(.18,.22,.18),glow(0xffd28e));l.position.y=h+.15;g.add(l);cyl(0,.2,.14,0x1d1d1d,0,h+.3,0,g,4);block(x,z,.08,.08,h);return g}
// عمود شاشة يفتح شاشة من النظام
function totem(x,z,yaw,view,title,sub,accent){
  const g=grp(x,0,z,yaw);box(.8,.12,.42,0x1b1b1b,0,0,0,g);box(.68,1.9,.24,0x101010,0,.12,0,g);
  const ac=new THREE.Color(accent),hex='#'+ac.getHexString();
  const t=ctex(256,420,(c,w,h)=>{c.fillStyle='#0c0c0c';c.fillRect(0,0,w,h);c.fillStyle=hex;c.fillRect(0,0,w,10);
    c.strokeStyle=hex;c.lineWidth=6;c.beginPath();c.arc(w/2,110,54,0,7);c.stroke();c.fillStyle=hex;c.font='700 60px '+FONT;c.textAlign='center';c.fillText(title.replace(/^ال/,'').slice(0,1),w/2,132);
    c.fillStyle='#FAFAFA';c.font='700 38px '+FONT;wrap(c,title,w-30).slice(0,2).forEach((l,i)=>c.fillText(l,w/2,226+i*44));
    c.fillStyle='#A1A1AA';c.font='400 23px '+FONT;wrap(c,sub,w-36).slice(0,2).forEach((l,i)=>c.fillText(l,w/2,316+i*28));
    rrect(c,w/2-62,366,124,38,19);c.fillStyle=GOLD;c.fill();c.fillStyle='#0a0a0a';c.font='700 22px '+FONT;c.fillText('افتح',w/2,393)});
  const s=new THREE.Mesh(new THREE.PlaneGeometry(.58,.95),new THREE.MeshBasicMaterial({map:t,toneMapped:false}));s.position.set(0,1.3,.122);g.add(s);
  for(const sx of[-.35,.35]){const e=new THREE.Mesh(new THREE.BoxGeometry(.025,1.8,.025),glow(accent));e.position.set(sx,1.05,.11);g.add(e)}
  solid(g);act(g,title,()=>openSys(view,title));return g}
// بوّابة المكان
function gate(x,z,name,sub,accent){const g=grp(x,0,z,face(x,z)),S=0xd9c4a0;
  for(const sx of[-2.1,2.1]){box(.42,3.3,.42,S,sx,0,0,g);box(.56,.2,.56,0xc4ad87,sx,0,0,g)}
  box(4.8,.55,.46,S,0,3.3,0,g);const st=new THREE.Mesh(new THREE.BoxGeometry(4.8,.06,.48),glow(accent));st.position.y=3.3;g.add(st);
  const t=ctex(768,96,(c,w,h)=>{c.fillStyle='#d9c4a0';c.fillRect(0,0,w,h);c.textAlign='center';c.fillStyle='#1c1712';c.font='700 50px '+SERIF;c.fillText(name,w/2,52);c.fillStyle='#5b4a36';c.font='400 24px '+FONT;c.fillText(sub,w/2,84)});
  for(const [zz,ry] of[[.235,0],[-.235,Math.PI]]){const p=new THREE.Mesh(new THREE.PlaneGeometry(4.6,.55),tmat(t,{roughness:1}));p.position.set(0,3.575,zz);p.rotation.y=ry;g.add(p)}
  const L=g.localToWorld.bind(g);g.updateMatrixWorld(true);for(const sx of[-2.1,2.1]){const v=L(new THREE.Vector3(sx,0,0));block(v.x,v.z,.24,.24,3.85)}
  return g}
// لافتة عائمة (Sprite) تواجه الكاميرا دائماً
function tag(draw,w=512,h=200,sc=1.6){const t=dyn(w,h,draw);const s=new THREE.Sprite(new THREE.SpriteMaterial({map:t,toneMapped:false,depthWrite:false}));s.scale.set(sc,sc*h/w,1);scene.add(s);return s}
function tagBox(c,w,h,title,value,accent){rrect(c,6,6,w-12,h-12,26);c.fillStyle='rgba(10,10,10,.82)';c.fill();c.strokeStyle=accent;c.lineWidth=4;c.stroke();c.textAlign='center';c.fillStyle='#A1A1AA';c.font='400 34px '+FONT;c.fillText(title,w/2,70);c.fillStyle='#FAFAFA';c.font='700 58px '+FONT;c.fillText(value,w/2,146)}

/* ══════════ الممشى والساحة ══════════ */
const pathTex=ctex(128,128,(g,w,h)=>{g.fillStyle='#d8c8aa';g.fillRect(0,0,w,h);g.strokeStyle='rgba(90,70,45,.35)';g.lineWidth=3;g.strokeRect(0,0,w,h);g.beginPath();g.moveTo(w/2,0);g.lineTo(w/2,h/2);g.moveTo(0,h/2);g.lineTo(w,h/2);g.moveTo(w/4,h/2);g.lineTo(w/4,h);g.moveTo(w*.75,h/2);g.lineTo(w*.75,h);g.stroke()},{repeat:[4,1]});
{const p=new THREE.Mesh(new THREE.BoxGeometry(6.4,.03,2.2),tmat(pathTex,{roughness:.95}));p.position.set(5.5,.015,1.95);p.receiveShadow=true;scene.add(p)}
const plazaTex=ctex(1024,1024,(g,w,h)=>{g.fillStyle='#ddcdb0';g.fillRect(0,0,w,h);g.strokeStyle='rgba(95,75,50,.35)';g.lineWidth=4;for(let r=80;r<512;r+=72){g.beginPath();g.arc(w/2,h/2,r,0,7);g.stroke()}
  for(let i=0;i<32;i++){const a=i/32*Math.PI*2;g.beginPath();g.moveTo(w/2+Math.cos(a)*80,h/2+Math.sin(a)*80);g.lineTo(w/2+Math.cos(a)*512,h/2+Math.sin(a)*512);g.stroke()}
  g.strokeStyle='rgba(232,199,102,.55)';g.lineWidth=10;g.beginPath();g.arc(w/2,h/2,500,0,7);g.stroke()});
{const p=new THREE.Mesh(new THREE.CylinderGeometry(8.5,8.5,.04,48),[mat(0xc9b896),tmat(plazaTex,{roughness:.9}),mat(0xc9b896)]);p.position.set(PC.x,.02,PC.z);p.receiveShadow=true;scene.add(p)}
for(const x of[3.6,6.2,8.8]){lantern(x,.55);lantern(x,3.35)}
for(let i=0;i<10;i++){const a=i/10*Math.PI*2+.31;const x=PC.x+Math.cos(a)*9.6,z=PC.z+Math.sin(a)*9.6;if(Math.abs(z-PC.z)<2.5&&x<PC.x)continue;i%2?palm(x,z):lantern(x,z,2.8)}

// برج المؤشّرات (لوحات المؤشّرات)
const obTex=dyn(320,760,(c,w,h)=>{const k=K();c.fillStyle='#0b0b0b';c.fillRect(0,0,w,h);c.fillStyle=GOLD;c.fillRect(0,0,w,8);c.textAlign='center';
  c.fillStyle='#FAFAFA';c.font='700 46px '+SERIF;c.fillText('إبراهيم سعود',w/2,76);c.fillStyle='#A1A1AA';c.font='400 22px '+FONT;c.fillText('برج المؤشّرات',w/2,110);
  const rows=k.signed?[['محصّل '+(k.month||''),fmt(k.collected)],['محصّل هذا العام',fmt(k.yearCollected)],['مستحقّ',fmt(k.due)],['عروض مفتوحة',fmt(k.quotes)],['مهام مفتوحة',fmt(k.taskCount)]]:[['سجّل دخولك','—']];
  rows.forEach(([l,v],i)=>{const y=160+i*118;rrect(c,22,y,w-44,100,16);c.fillStyle='rgba(255,255,255,.06)';c.fill();c.fillStyle='#A1A1AA';c.font='400 24px '+FONT;c.fillText(l,w/2,y+34);c.fillStyle=i?'#FAFAFA':GOLD;c.font='700 44px '+FONT;c.fillText(v,w/2,y+82)})});
let obelisk;
{const g=grp(PC.x,0,PC.z);obelisk=g;box(2.2,.35,2.2,0x2a2a2a,0,0,0,g);box(1.7,.35,1.7,0x1e1e1e,0,.35,0,g);box(1.1,5.4,1.1,0x121212,0,.7,0,g);
  for(let i=0;i<4;i++){const s=new THREE.Mesh(new THREE.PlaneGeometry(.9,2.14),new THREE.MeshBasicMaterial({map:obTex,toneMapped:false}));const a=i*Math.PI/2;s.position.set(Math.sin(a)*.556,3.0,Math.cos(a)*.556);s.rotation.y=a;g.add(s)}
  const cap=new THREE.Mesh(new THREE.ConeGeometry(.82,1.1,4),glow(0xe8c766));cap.position.y=6.65;cap.rotation.y=Math.PI/4;g.add(cap);
  const l=new THREE.PointLight(0xe8c766,6,16,1.6);l.position.y=6.4;g.add(l);
  solid(g);act(g,'لوحات المؤشّرات',()=>openSys('dashboards','لوحات المؤشّرات'),[2.2,4,2.2,0,2.6,0])}
// مركز التحكّم: رفّ خوادم + الإعدادات
const leds=[];
{const x=PC.x+5.2,z=PC.z-5.4,g=grp(x,0,z,face(x,z));box(.9,2.1,.7,0x161a1f,0,0,0,g);
  for(let i=0;i<7;i++){box(.8,.05,.02,0x2a3038,0,.3+i*.25,.36,g);for(let j=0;j<5;j++){const d=new THREE.Mesh(new THREE.BoxGeometry(.03,.03,.01),glow(j%3?0x22c55e:0x3b82f6));d.position.set(-.3+j*.05,.4+i*.25,.37);g.add(d);leds.push(d)}}
  solid(g);totem(x-1.2,z+.7,face(x-1.2,z+.7),'settings','الإعدادات','الهويّة · الفوترة · النظام',0x94a3b8)}
// لافتة الاتّجاهات
const DIRS=[['وادي المبيعات',16,-12],['الخزنة',28,2],['المجلس',16,15],['غرفة البثّ',29,-13],['أكاديمية حروف',29,16],['الورشة',5,-14],['الحديقة',5,15],['ممرّ الذكريات',-6,4.4]];
{const x=10.2,z=4.4,g=grp(x,0,z);cyl(.06,.07,3.2,0x5a3e28,0,0,0,g,6);block(x,z,.1,.1,3.2);
  DIRS.forEach(([n,tx,tz],i)=>{const t=ctex(384,72,(c,w,h)=>{c.fillStyle='#e9dcc0';c.beginPath();c.moveTo(0,0);c.lineTo(w-36,0);c.lineTo(w,h/2);c.lineTo(w-36,h);c.lineTo(0,h);c.fill();c.fillStyle='#1c1712';c.font='700 36px '+FONT;c.textAlign='center';c.fillText(n,w/2-14,48)});
    const b=new THREE.Group();b.position.y=1.15+i*.28;b.rotation.y=Math.atan2(tx-x,tz-z)-Math.PI/2;g.add(b);
    for(const [zz,ry,flip] of[[.012,0,1],[-.012,Math.PI,-1]]){const m=new THREE.Mesh(new THREE.PlaneGeometry(1.15,.22),new THREE.MeshStandardMaterial({map:t,roughness:.9}));m.position.set(.62,0,zz);m.rotation.y=ry;if(flip<0){m.position.x=.62;m.scale.x=-1}b.add(m)}})}

/* ══════════ وادي المبيعات ══════════ */
gate(16,-9.2,'وادي المبيعات','الفواتير · العروض · المنتجات · التسعير',0xe8c766);
let valleyMode='months';
const VAL=[];const PILLAR_Z=-21,PAD_Z=-19.1;
const pillarMat=new THREE.MeshStandardMaterial({color:0x1a1814,roughness:.4,metalness:.3,emissive:0x2a2108,flatShading:true});
const beamGeo=new THREE.CylinderGeometry(.42,.42,1,14,1,true);beamGeo.translate(0,.5,0);
for(let i=0;i<12;i++){const x=16+(5.5-i)*1.5; // يمين ← يسار: الأقدم على اليمين كقراءة عربيّة
  const p=new THREE.Mesh(new THREE.BoxGeometry(1.1,1,1.1),pillarMat);p.geometry.translate(0,.5,0);p.position.set(x,0,PILLAR_Z);p.scale.y=.05;p.castShadow=p.receiveShadow=true;scene.add(p);
  const cap=new THREE.Mesh(new THREE.BoxGeometry(1.14,.06,1.14),glow(0xe8c766));cap.position.set(x,.05,PILLAR_Z);scene.add(cap);
  const bm=new THREE.Mesh(beamGeo,new THREE.MeshBasicMaterial({color:0xe8c766,transparent:true,opacity:.18,blending:THREE.AdditiveBlending,depthWrite:false,fog:false,side:THREE.DoubleSide}));bm.position.set(x,0,PILLAR_Z);bm.scale.set(1,70,1);scene.add(bm);
  const pad=new THREE.Mesh(new THREE.CylinderGeometry(.5,.55,.05,24),glow(0x6b5a2a));pad.position.set(x,.025,PAD_Z);scene.add(pad);
  const ring=new THREE.Mesh(new THREE.TorusGeometry(.5,.035,6,28),glow(0xe8c766));ring.rotation.x=Math.PI/2;ring.position.set(x,.06,PAD_Z);scene.add(ring);
  const v={i,x,p,cap,bm,pad,ring,h:.05,target:.35,col:block(x,PILLAR_Z,.55,.55,.05),d:null};
  v.tag=tag((c,w,h)=>{const d=v.d;tagBox(c,w,h,d?d.label:'—',d?fmt(d.value):'—',GOLD)},512,200,1.25);
  VAL.push(v)}
function valleyData(){const k=K();return (valleyMode==='months'?k.months:k.clients)||[]}
function valleyTargets(){const list=valleyData();const max=Math.max(1,...list.map(d=>d.value||0));
  VAL.forEach((v,i)=>{const d=valleyMode==='months'?list[i]:list[i];v.d=d||null;v.target=d?.35+4.1*(d.value||0)/max:.12;v.norm=d?(d.value||0)/max:0;paint(v.tag.material.map)})}
const valleyTitle=dyn(768,120,(c,w,h)=>{c.textAlign='center';c.fillStyle='#FAFAFA';c.font='700 60px '+SERIF;c.fillText(valleyMode==='months'?'المحصّل لكلّ شهر':'أكبر العملاء بالفواتير',w/2,62);c.fillStyle='#A1A1AA';c.font='400 30px '+FONT;c.fillText('قف على الحلقة المضيئة لتقفز فوق العمود',w/2,108)});
{const s=new THREE.Mesh(new THREE.PlaneGeometry(6.4,1),new THREE.MeshBasicMaterial({map:valleyTitle,transparent:true,toneMapped:false}));s.position.set(16,6.9,PILLAR_Z-1.2);scene.add(s)}
['invoicing:الفواتير:إصدار وتحصيل','sales:عروض الأسعار:إنشاء وإرسال العروض','quotedesign:مصمّم العروض:قوالب العرض','products:المنتجات والخدمات:الأسعار والباقات','pricing:مستشار التسعير:كم أسعّر المشروع؟']
  // على جانبي الوادي حتى لا تحجب الأعمدة: ٣ غرباً و٣ شرقاً متقابلة
  .forEach((s,i)=>{const [v,t,sub]=s.split(':');const east=i>=3,x=east?23.6:8.4,z=-12.2-(east?i-3:i)*2.2;totem(x,z,east?-Math.PI/2:Math.PI/2,v,t,sub,0xe8c766)});
{const g=totem(23.6,-12.2-2*2.2,-Math.PI/2,'_','اقلب العرض','شهور ↔ عملاء',0xf5f5f5);
  ACT_OVERRIDE(g,()=>{valleyMode=valleyMode==='months'?'clients':'months';valleyTargets();paint(valleyTitle);toast(valleyMode==='months'?'الأعمدة الآن: المحصّل لكلّ شهر':'الأعمدة الآن: أكبر ١٢ عميلاً بإجماليّ الفواتير')})}
function ACT_OVERRIDE(g,fn){const i=g.userData.act;C.ACTS[i].run=fn}

/* ══════════ الخزنة (المحاسبة) ══════════ */
gate(26,2,'الخزنة','المحاسبة · الاشتراكات · الموردون',0xf0b429);
{const g=grp(33.5,0,2);box(11,.14,11,0x8d7a5f,0,0,0,g);
  // باب الخزنة الدائريّ
  const d=grp(5.2,2.6,0,-Math.PI/2,g);const ring=new THREE.Mesh(new THREE.TorusGeometry(2.1,.32,8,24),mat(0x8b8f96,{metalness:.8,roughness:.35}));d.add(ring);
  const disc=new THREE.Mesh(new THREE.CylinderGeometry(1.8,1.8,.3,24),mat(0x6f747b,{metalness:.8,roughness:.4}));disc.rotation.x=Math.PI/2;d.add(disc);
  for(let i=0;i<6;i++){const s=new THREE.Mesh(new THREE.BoxGeometry(.12,3.2,.1),mat(0xb8bcc2,{metalness:.8,roughness:.3}));s.rotation.z=i*Math.PI/6;s.position.z=.2;d.add(s)}
  const hub=new THREE.Mesh(new THREE.CylinderGeometry(.35,.35,.4,12),glow(0xf0b429));hub.rotation.x=Math.PI/2;hub.position.z=.25;d.add(hub);
  box(.6,5.2,5.2,0x3c3f44,5.6,0,0,g);block(33.5+5.6,2,.3,2.6,5.2);
  const l=new THREE.PointLight(0xf0b429,4,12,1.7);l.position.set(0,4,0);g.add(l)}
const tanks=[];
function tank(x,z,color,title,get){const g=grp(x,0,z);cyl(1.25,1.35,.3,0x2c2c2c,0,.14,0,g,16);cyl(1.25,1.25,.15,0x2c2c2c,0,4.9,0,g,16);
  const glass=new THREE.Mesh(new THREE.CylinderGeometry(1.15,1.15,4.5,20,1,true),new THREE.MeshStandardMaterial({color:0xcfe3ea,transparent:true,opacity:.18,roughness:.05,metalness:.2,side:THREE.DoubleSide,depthWrite:false}));glass.position.y=2.67;g.add(glass);
  const liq=new THREE.Mesh(new THREE.CylinderGeometry(1.08,1.08,1,20),new THREE.MeshStandardMaterial({color,emissive:color,emissiveIntensity:.55,roughness:.3,transparent:true,opacity:.88}));liq.geometry.translate(0,.5,0);liq.position.y=.44;liq.scale.y=.01;g.add(liq);
  block(x,z,1.25,1.25,5.05);
  const t={liq,h:.01,target:.01,get,title,color:'#'+new THREE.Color(color).getHexString()};
  t.tag=tag((c,w,h)=>tagBox(c,w,h,title,K().signed?money(get()):'—',t.color),512,200,1.9);t.tag.position.set(x,6.1,z);tanks.push(t);return t}
tank(33,-1.4,0xe8b631,'محصّل هذا العام',()=>K().yearCollected||0);
tank(33,5.4,0xd9572b,'مستحقّ على العملاء',()=>K().due||0);
totem(29.4,-2.4,-Math.PI/2,'accounting','المحاسبة','اليومية · القوائم المالية',0xf0b429);
totem(29.4,2,-Math.PI/2,'subs','الاشتراكات','اشتراكاتك الشهريّة والسنويّة',0xf0b429);
totem(29.4,6.4,-Math.PI/2,'suppliers','الموردون','الموردون ومشترياتهم',0xf0b429);
const subsTag=tag((c,w,h)=>tagBox(c,w,h,'الاشتراكات شهرياً',K().signed?money(K().subsMonthly)+' · '+fmt(K().subsCount):'—','#f0b429'),512,200,1.5);subsTag.position.set(29.4,2.9,2);
function tankTargets(){const v=tanks.map(t=>t.get());const max=Math.max(1,...v);tanks.forEach((t,i)=>{t.target=.02+4.3*v[i]/max;paint(t.tag.material.map)})}

/* ══════════ المجلس (العملاء) ══════════ */
gate(16,11,'المجلس','العملاء · خطّ المبيعات · جهات الاتصال · الشركاء',0xc2410c);
const saduTex=ctex(512,256,(g,w,h)=>{const cols=['#7a1218','#121212','#efe6d2','#b5651d'];g.fillStyle=cols[0];g.fillRect(0,0,w,h);
  for(let y=0;y<h;y+=64){g.fillStyle=cols[(y/64)%2?1:3];g.fillRect(0,y,w,10);for(let x=0;x<w;x+=48){g.fillStyle=cols[2];g.beginPath();g.moveTo(x,y+18);g.lineTo(x+24,y+42);g.lineTo(x+48,y+18);g.fill();g.fillStyle=cols[1];g.beginPath();g.moveTo(x+12,y+50);g.lineTo(x+24,y+38);g.lineTo(x+36,y+50);g.fill()}}},{repeat:[3,1]});
{const g=grp(16,0,18.6),W=10,D=7;
  const rug=box(W-.4,.03,D-.4,0x7a1218,0,0,0,g);
  const back=new THREE.Mesh(new THREE.PlaneGeometry(W,2.4),tmat(saduTex,{side:THREE.DoubleSide}));back.position.set(0,1.2,D/2);back.rotation.y=Math.PI;g.add(back);
  for(const sx of[-1,1]){const s=new THREE.Mesh(new THREE.PlaneGeometry(D,2.4),tmat(saduTex,{side:THREE.DoubleSide}));s.position.set(sx*W/2,1.2,0);s.rotation.y=sx*Math.PI/2;g.add(s)}
  block(16,18.6+D/2,W/2,.1,2.4);block(16-W/2,18.6,.1,D/2,2.4);block(16+W/2,18.6,.1,D/2,2.4);
  for(const [px,pz] of[[-W/2,-D/2],[W/2,-D/2],[-W/2,D/2],[W/2,D/2],[0,-D/2],[0,D/2]])cyl(.07,.07,3.1,0x3b2a1c,px,0,pz,g,6);
  for(const sz of[-1,1]){const r=box(W+.4,.06,D/2+.6,0x2a1d14,0,0,0,g);r.position.set(0,2.95+(sz<0?-.15:.25)*0,sz*D/4);r.rotation.x=sz*.24;r.position.y=3.25-.5*Math.abs(sz)*.6}
  // جلسة أرضيّة
  for(let i=0;i<9;i++){box(1,.22,.8,0x8b1e1e,-W/2+.7+i*1.07,0,D/2-.55,g);box(1,.5,.22,0x6b1616,-W/2+.7+i*1.07,.22,D/2-.2,g)}
  for(const sx of[-1,1])for(let i=0;i<5;i++){box(.8,.22,1,0x8b1e1e,sx*(W/2-.55),0,-D/2+1.2+i*1.07,g);box(.22,.5,1,0x6b1616,sx*(W/2-.2),.22,-D/2+1.2+i*1.07,g)}
  // دلّة وفناجين
  const dl=grp(0,0,.6,0,g);box(1.2,.05,.8,0xc9a878,0,0,0,dl);const pot=cyl(.1,.16,.3,mat(0xc8a24a,{metalness:.8,roughness:.3}),0,.05,0,dl,10);cyl(.06,.1,.12,mat(0xc8a24a,{metalness:.8,roughness:.3}),0,.35,0,dl,10);cyl(0,.07,.1,mat(0xc8a24a,{metalness:.8,roughness:.3}),0,.47,0,dl,8);
  const sp=cyl(.015,.03,.22,mat(0xc8a24a,{metalness:.8,roughness:.3}),.14,.26,0,dl,6);sp.rotation.z=-.9;
  for(let i=0;i<4;i++)cyl(.03,.022,.04,0xf2efe8,-.35+i*.12,.05,.22,dl,8);
  const l=new THREE.PointLight(0xffb066,4,10,1.6);l.position.set(0,2.4,.5);g.add(l)}
// فوانيس المراحل
const lamps=[];
for(let i=0;i<8;i++){const x=16+(3.5-i)*1.05,z=16.6;const g=grp(x,0,z);box(.5,.05,.5,0x2a1d14,0,0,0,g);
  const stand=cyl(.03,.03,1,0x2a1d14,0,.05,0,g,6);const lan=new THREE.Mesh(new THREE.CylinderGeometry(.16,.13,.34,6),new THREE.MeshStandardMaterial({color:0x2a1d14,emissive:0xffb347,emissiveIntensity:.2,flatShading:true}));lan.position.y=1.2;g.add(lan);
  const top=cyl(0,.17,.12,0x2a1d14,0,1.37,0,g,6);
  const L={g,stand,lan,top,i,d:null,h:1,target:1};L.tag=tag((c,w,h)=>{const d=L.d;tagBox(c,w,h,d?d.label:'—',d?fmt(d.count):'—',d&&d.lost?'#71717a':'#ffb347')},512,200,1);lamps.push(L)}
function lampTargets(){const st=K().stages||[];const max=Math.max(1,...st.map(s=>s.count));lamps.forEach((L,i)=>{const d=st[i];L.d=d||null;L.g.visible=!!d;L.target=d?.6+1.6*d.count/max:.6;L.lan.material.emissiveIntensity=d?(d.lost?.08:.25+2.2*d.count/max):0;paint(L.tag.material.map)})}
[['crm','العملاء','لوحة المراحل'],['pipeline','خطّ المبيعات','الفرص وقيمتها'],['contacts','جهات الاتصال','كلّ من تتعامل معه'],['partners','الشركاء','برنامج الشركاء']]
  .forEach(([v,t,s],i)=>totem(16+(1.5-i)*2.1,13.6,Math.PI,v,t,s,0xc2410c));

/* ══════════ غرفة البثّ (المحتوى) ══════════ */
{const x=30,z=-13.5;gate(24.3,-8.6,'غرفة البثّ','المدوّنة · القائمة البريدية · أعمال الموقع',0xef4444);
  const g=grp(x,0,z,face(x,z));box(7,.15,5,0x2b2b2b,0,0,0,g);box(7,3.4,.2,0x1d1d1d,0,0,-2.4,g);for(const sx of[-3.4,3.4])box(.2,3.4,5,0x1d1d1d,sx,0,0,g);box(7.4,.2,5.4,0x111111,0,3.4,0,g);
  // على الهواء
  const onair=ctex(512,160,(c,w,h)=>{rrect(c,8,8,w-16,h-16,24);c.fillStyle='#b91c1c';c.fill();c.fillStyle='#fff';c.textAlign='center';c.font='700 74px '+FONT;c.fillText('على الهواء',w/2,108)});
  const oa=new THREE.Mesh(new THREE.PlaneGeometry(1.6,.5),new THREE.MeshBasicMaterial({map:onair,toneMapped:false}));oa.position.set(0,2.75,-2.28);g.add(oa);
  box(3,.06,1,0x0f0f0f,0,.9,-.9,g);for(const sx of[-.8,.8]){cyl(.015,.015,.35,0x111111,sx,.96,-.95,g,6);const m=cyl(.05,.05,.16,mat(0x777b80,{metalness:.7,roughness:.4}),sx,1.3,-.95,g,10);m.rotation.x=.3}
  for(const sx of[-.9,0,.9]){const s=new THREE.Mesh(new THREE.PlaneGeometry(.8,.5),glow([0x1d4ed8,0x0f766e,0x7c3aed][sx>0?2:sx<0?0:1]));s.position.set(sx,1.85,-2.28);g.add(s)}
  g.updateMatrixWorld(true);const b=new THREE.Box3().setFromObject(g);block((b.min.x+b.max.x)/2,(b.min.z+b.max.z)/2,0,0,0); // مرجع فقط
  const wl=(lx,lz,hw,hd)=>{const v=g.localToWorld(new THREE.Vector3(lx,0,lz));block(v.x,v.z,hw,hd,3.4)};wl(0,-2.4,2.6,.6);
  const ry=face(x,z);[[-3.4,0],[3.4,0]].forEach(([lx,lz])=>{for(let k=-2;k<=2;k++){const v=g.localToWorld(new THREE.Vector3(lx,0,k));block(v.x,v.z,.25,.25,3.4)}});
  // برج الإرسال
  const tw=grp(x+2.6,0,z-3.6);for(let i=0;i<3;i++){const a=i*Math.PI*2/3;const l=cyl(.04,.05,15,0x9aa0a6,Math.sin(a)*.5,0,Math.cos(a)*.5,tw,5);l.rotation.set(-Math.cos(a)*.03,0,Math.sin(a)*.03)}
  for(let y=1.5;y<15;y+=1.5){const r=new THREE.Mesh(new THREE.TorusGeometry(.5-y*.012,.025,4,3),mat(0x9aa0a6));r.rotation.x=Math.PI/2;r.position.y=y;tw.add(r)}
  const bl=new THREE.Mesh(new THREE.SphereGeometry(.14,8,6),glow(0xff2a2a));bl.position.y=15.1;tw.add(bl);C._blink=bl;block(x+2.6,z-3.6,.55,.55,15);
  const dish=new THREE.Mesh(new THREE.SphereGeometry(.9,12,6,0,Math.PI*2,0,Math.PI/3.2),mat(0xe5e7eb,{side:THREE.DoubleSide}));dish.position.set(x-3.2,3.8,z-1.4);dish.rotation.x=-1.0;scene.add(dish)
  const ft=(i)=>{const a=ry,dx=Math.sin(a),dz=Math.cos(a),px=Math.cos(a),pz=-Math.sin(a);return [x+dx*3.6+px*(i-1)*2.1,z+dz*3.6+pz*(i-1)*2.1]};
  [['blog','المدوّنة','المقالات والنشر'],['newsletter','القائمة البريدية','المشتركون والإرسال'],['sitework','أعمال الموقع','الأعمال والشعارات']].forEach(([v,t,s],i)=>{const [tx,tz]=ft(i);totem(tx,tz,face(tx,tz),v,t,s,0xef4444)})}

/* ══════════ أكاديمية حروف ══════════ */
{const x=30,z=16.5;gate(24.3,11.4,'أكاديمية حروف','منصّة حروف ودروس',0x2dd4bf);
  const g=grp(x,0,z,face(x,z));
  const board=ctex(768,384,(c,w,h)=>{c.fillStyle='#1f4d3a';c.fillRect(0,0,w,h);c.strokeStyle='#8a6a43';c.lineWidth=18;c.strokeRect(0,0,w,h);c.fillStyle='rgba(255,255,255,.88)';c.textAlign='center';c.font='700 130px '+SERIF;c.fillText('حروف ودروس',w/2,200);c.font='400 54px '+FONT;c.fillText('أ  ب  ت  ث  ج  ح  خ',w/2,300)});
  const bd=new THREE.Mesh(new THREE.PlaneGeometry(5,2.5),tmat(board));bd.position.set(0,2.2,-2.6);g.add(bd);box(5.3,2.9,.15,0x5a3e28,0,.95,-2.72,g);
  const wv=g.localToWorld(new THREE.Vector3(0,0,-2.72));block(wv.x,wv.z,2.65,.4,3.9);
  // مكعّبات الحروف: هرم يُتسلّق
  const L=['أ','ب','ت','ث','ج','ح'],CL=['#ef4444','#f59e0b','#22c55e','#3b82f6','#a855f7','#e8c766'];
  const cube=(i,lx,ly,lz)=>{const t=ctex(128,128,(c,w,h)=>{c.fillStyle=CL[i];c.fillRect(0,0,w,h);c.strokeStyle='rgba(0,0,0,.25)';c.lineWidth=8;c.strokeRect(4,4,w-8,h-8);c.fillStyle='#fff';c.font='700 84px '+FONT;c.textAlign='center';c.fillText(L[i],w/2,92)});
    const m=new THREE.Mesh(new THREE.BoxGeometry(.8,.8,.8),tmat(t,{roughness:.7}));m.position.set(lx,ly+.4,lz);m.rotation.y=(i%3-1)*.12;m.castShadow=m.receiveShadow=true;g.add(m);return m};
  [[0,-1.7,0,0],[1,-.85,0,0],[2,0,0,0],[3,-1.3,.8,0],[4,-.45,.8,0],[5,-.9,1.6,0]].forEach(([i,lx,ly,lz])=>{const m=cube(i,lx,ly,lz);g.updateMatrixWorld(true);const v=m.getWorldPosition(new THREE.Vector3());C.COL.push({x0:v.x-.4,x1:v.x+.4,z0:v.z-.4,z1:v.z+.4,y0:ly,top:ly+.8})});
  const tv=g.localToWorld(new THREE.Vector3(2.2,0,.6));totem(tv.x,tv.z,face(tv.x,tv.z),'huroof','حروف ودروس','المنصّة · الطلاب · المحتوى',0x2dd4bf)}

/* ══════════ الورشة (الإبداع) ══════════ */
{const x=5,z=-14;gate(9,-8.3,'الورشة','الخرائط الذهنية · مساحة العمل · المختبر',0xa78bfa);
  const g=grp(x,0,z,face(x,z));
  const mm=ctex(1024,512,(c,w,h)=>{c.fillStyle='#f7f5f0';c.fillRect(0,0,w,h);const N=[['المبيعات',180,110,'#e8c766'],['المحتوى',840,110,'#ef4444'],['حروف',150,400,'#2dd4bf'],['العملاء',860,400,'#c2410c'],['الأفكار',512,450,'#a78bfa']];
    c.lineWidth=6;N.forEach(([t,nx,ny,cl])=>{c.strokeStyle=cl;c.beginPath();c.moveTo(w/2,h/2-20);c.bezierCurveTo((w/2+nx)/2,h/2-20,(w/2+nx)/2,ny,nx,ny);c.stroke()});
    rrect(c,w/2-150,h/2-70,300,90,24);c.fillStyle='#111';c.fill();c.fillStyle='#fff';c.font='700 44px '+SERIF;c.textAlign='center';c.fillText('إبراهيم سعود',w/2,h/2-12);
    N.forEach(([t,nx,ny,cl])=>{rrect(c,nx-100,ny-38,200,76,18);c.fillStyle=cl;c.fill();c.fillStyle='#111';c.font='700 36px '+FONT;c.fillText(t,nx,ny+12)})});
  const bd=new THREE.Mesh(new THREE.PlaneGeometry(6,3),tmat(mm,{roughness:.6}));bd.position.set(0,2.1,-2);g.add(bd);box(6.3,3.4,.12,0xe5e5e5,0,.45,-2.1,g);
  for(const sx of[-2.9,2.9])box(.12,.5,.6,0x9ca3af,sx,0,-2.1,g);
  const wv=g.localToWorld(new THREE.Vector3(0,0,-2.1));block(wv.x,wv.z,3.15,.35,3.85);
  // طاولة عمل
  box(2.4,.06,1,0xb07a45,0,.86,.2,g);for(const [lx,lz] of[[-1.1,-.25],[1.1,-.25],[-1.1,.65],[1.1,.65]])box(.06,.86,.06,0x3a3a3a,lx,0,lz,g);
  box(.5,.02,.35,0xf3e98a,-.6,.92,.2,g).rotation.y=.2;box(.4,.02,.3,0xb9dcf2,.3,.92,.1,g).rotation.y=-.3;cyl(.05,.05,.12,0x7c3aed,.8,.92,.3,g,8);
  const tv=g.localToWorld(new THREE.Vector3(0,0,.2));block(tv.x,tv.z,1.25,.6,.92);
  const pos=[[-2.6,1.6],[-1,2.4],[1,2.4],[2.6,1.6]];
  [['boards','الخرائط الذهنية','لوحات بنمط Freeform'],['workspace','مساحة العمل','المحتوى والحملات'],['desktop','سطح المكتب','كلّ تطبيقاتك'],['lab','المختبر','التجارب والأدوات']].forEach(([v,t,s],i)=>{const p=g.localToWorld(new THREE.Vector3(pos[i][0],0,pos[i][1]));totem(p.x,p.z,face(p.x,p.z),v,t,s,0xa78bfa)})}

/* ══════════ الحديقة (العادات والمواعيد) ══════════ */
const fruits=[];
{const x=5,z=15.5;gate(9,9.2,'الحديقة','العادات · المواعيد · التقويم',0x84cc16);
  const gr=new THREE.Mesh(new THREE.CylinderGeometry(5.2,5.2,.05,32),mat(0x4d7c2a,{roughness:1}));gr.position.set(x,.025,z);gr.receiveShadow=true;scene.add(gr);
  const r=rnd(31);for(let i=0;i<40;i++){const a=r()*Math.PI*2,R=1.8+r()*3;const f=new THREE.Mesh(new THREE.ConeGeometry(.04,.18,3),mat(0x6a9f3a));f.position.set(x+Math.cos(a)*R,.1,z+Math.sin(a)*R);scene.add(f)}
  cyl(.28,.42,3,0x5a3e28,x,0,z,scene,7);block(x,z,.4,.4,3);
  for(let i=0;i<7;i++){const a=i*Math.PI*2/7;ball(1.0+r()*.4,mat(i%2?0x3f7d2a:0x4f8f33),x+Math.cos(a)*1.1,3.4+r()*.6,z+Math.sin(a)*1.1,scene,1)}
  ball(1.4,mat(0x468a30),x,4.3,z,scene,1);
  for(let i=0;i<20;i++){const a=i*2.4,R=1.5+(i%3)*.35,y=3.1+(i%5)*.35;const f=new THREE.Mesh(new THREE.IcosahedronGeometry(.13,0),new THREE.MeshStandardMaterial({color:0x6b6b3a,emissive:0x000000,flatShading:true}));f.position.set(x+Math.cos(a)*R,y,z+Math.sin(a)*R);scene.add(f);fruits.push(f)}
  const ht=tag((c,w,h)=>{const k=K().habits||{};tagBox(c,w,h,'عادات اليوم',k.total?fmt(k.done)+' / '+fmt(k.total):'—','#84cc16')},512,200,1.5);ht.position.set(x,6.3,z);
  for(const [a] of[[.6],[2.2],[3.9]]){const bx=x+Math.cos(a)*3.6,bz=z+Math.sin(a)*3.6;const b=grp(bx,0,bz,face(bx,bz,x,z)+Math.PI);box(1.4,.06,.45,0x8a5a33,0,.42,0,b);box(1.4,.4,.06,0x8a5a33,0,.5,-.2,b);for(const sx of[-.6,.6])box(.06,.42,.4,0x2a2a2a,sx,0,0,b);block(bx,bz,.7,.7,.5)}
  [['habits','العادات','تتبّع يوميّ'],['appointments','المواعيد','حجوزاتك القادمة'],['calendar','التقويم','Google + مواعيدك']].forEach(([v,t,s],i)=>{const a=-.9+i*.45,tx=x+Math.cos(a)*5.9,tz=z+Math.sin(a)*5.9;totem(tx,tz,face(tx,tz),v,t,s,0x84cc16)})}
function fruitTargets(){const h=K().habits||{};fruits.forEach((f,i)=>{f.visible=!h.total||i<h.total;const on=h.total&&i<h.done;f.material.color.set(on?0xe8c766:0x6b6b3a);f.material.emissive.set(on?0x8a6a10:0x000000)})}

/* ══════════ التحديث ══════════ */
const districts=[
  {name:'الاستوديو',desc:'لوحة التحكّم · الفواتير · المشاريع · التقويم',x:.25,z:-.15,yaw:Math.PI-.12},
  {name:'الساحة',desc:'برج المؤشّرات · الإعدادات',x:9.5,z:2,yaw:-Math.PI/2},
  {name:'وادي المبيعات',desc:'أعمدة المبيعات · الفواتير · العروض · التسعير',x:16,z:-7.2,yaw:0},
  {name:'الخزنة',desc:'المحاسبة · الاشتراكات · الموردون',x:24,z:2,yaw:-Math.PI/2},
  {name:'المجلس',desc:'العملاء · خطّ المبيعات · الشركاء',x:16,z:9,yaw:Math.PI},
  {name:'غرفة البثّ',desc:'المدوّنة · القائمة البريدية · الموقع',x:22.8,z:-7,yaw:Math.atan2(-(30-22.8),-(-13.5+7))},
  {name:'أكاديمية حروف',desc:'منصّة حروف ودروس',x:22.8,z:10,yaw:Math.atan2(-(30-22.8),-(16.5-10))},
  {name:'الورشة',desc:'الخرائط الذهنية · مساحة العمل · المختبر',x:10.4,z:-6.6,yaw:Math.atan2(-(5-10.4),-(-14+6.6))},
  {name:'الحديقة',desc:'العادات · المواعيد · التقويم',x:10.4,z:7.8,yaw:Math.atan2(-(5-10.4),-(15.5-7.8))},
];
function refresh(){DYN.forEach(paint);valleyTargets();tankTargets();lampTargets();fruitTargets()}
let active=-1,t=0;
function update(dt,P,G,live=true){
  t+=dt;const k=1-Math.exp(-dt*2.2);
  VAL.forEach(v=>{v.h+=(v.target-v.h)*k;v.p.scale.y=v.h;v.cap.position.y=v.h;v.bm.position.y=v.h+.03;v.col.top=v.h;v.tag.position.set(v.x,v.h+.95,PILLAR_Z);
    const on=v.i===active;v.bm.material.opacity=(on?.55:.1+.3*(v.norm||0))*(.85+.15*Math.sin(t*2+v.i));v.ring.scale.setScalar(1+.08*Math.sin(t*3+v.i))});
  tanks.forEach(tk=>{tk.h+=(tk.target-tk.h)*k;tk.liq.scale.y=Math.max(.01,tk.h)});
  lamps.forEach(L=>{L.h+=(L.target-L.h)*k;L.stand.scale.y=L.h;L.lan.position.y=L.h+.22;L.top.position.y=L.h+.39;L.tag.position.set(L.g.position.x,L.h+1.05,L.g.position.z)});
  if(C._blink)C._blink.visible=Math.sin(t*3.2)>0;
  if(leds.length&&Math.random()<dt*8){const d=leds[Math.random()*leds.length|0];d.visible=!d.visible}
  // منصّات القفز: قفزة محسوبة تهبط بك على سطح العمود
  if(!live)return;
  if(P.ground&&P.y<.1)for(const v of VAL){if(Math.hypot(P.x-v.x,P.z-PAD_Z)<.5){const up=Math.sqrt(2*G*(v.h+.75)),T=up/G+Math.sqrt(2*.75/G);P.vy=up;P.vx=(v.x-P.x)/T;P.vz=(PILLAR_Z-P.z)/T;P.ground=false;P.launch=true;break}}
  // الوقوف على عمود يضيئه ويعرض تفاصيله
  let a=-1;if(P.ground&&P.y>.1)for(const v of VAL)if(Math.abs(P.x-v.x)<.6&&Math.abs(P.z-PILLAR_Z)<.6&&Math.abs(P.y-v.h)<.05){a=v.i;break}
  if(a!==active){active=a;const d=a>=0&&VAL[a].d;
    info(d?`<b>${d.title||d.label}</b><span>محصّل <em>${money(d.collected)}</em></span><span>مفوتر ${money(d.invoiced)} · ${fmt(d.count)} فاتورة</span>`:(a>=0?'<b>لا بيانات</b>':null))}
}
return {districts,refresh,update,bounds:{x0:-13,x1:45,z0:-30,z1:33}};
}
