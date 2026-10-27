/*
 * world.js — «الاستوديو»: واجهة النظام ثلاثيّة الأبعاد (المرحلة الأولى)
 * ─────────────────────────────────────────────────────────────────────────
 * غرفة إبراهيم سعود لو-بولي مبنيّة بالكود (بلا ملفّات موديلات)، مشي بمنظور
 * الشخص الأوّل، وأشياء مضيئة تفتح النظام الحقيقيّ في إطار (index.html?embed=1&view=…).
 * العالم يعرض فقط؛ الكتابة كلّها من النظام نفسه — انظر data.js.
 * الإحداثيّات: x عرض الغرفة، z طولها (‎-z جدار الستائر، +z جدار المكتب)، y للأعلى، بالمتر.
 */
import * as THREE from 'three';
import {Reflector} from 'three/addons/objects/Reflector.js';
import {buildCampus} from './campus.js?v=4';
import {buildMemories} from './memories.js?v=3';
import {buildFun} from './fun.js?v=1';

const W=window.W3D;
const FONT='"Thmanyah Sans","Tajawal",system-ui,sans-serif',SERIF='"Thmanyah Serif","Thmanyah Sans",serif';
const GOLD='#E8C766';
const isTouch=matchMedia('(pointer:coarse)').matches;
if(isTouch)document.documentElement.classList.add('is-touch');
const $=id=>document.getElementById(id);
let K=null; // أرقام النظام (w3dKpis)

/* ── المحرّك ── */
const canvas=$('c');
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance',preserveDrawingBuffer:/[?&]debug/.test(location.search)});
renderer.setPixelRatio(Math.min(devicePixelRatio,isTouch?1.5:1.75));
renderer.setSize(innerWidth,innerHeight);
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.1;
const scene=new THREE.Scene();scene.background=new THREE.Color(0x0a0a0a);
const camera=new THREE.PerspectiveCamera(isTouch?75:70,innerWidth/innerHeight,.05,320);
camera.rotation.order='YXZ';

/* ── أدوات البناء ── */
const MATS={};
function mat(color,o={}){const k=color+'|'+Object.entries(o).join();return MATS[k]||(MATS[k]=new THREE.MeshStandardMaterial({color,roughness:.82,metalness:0,flatShading:true,...o}))}
const M=m=>typeof m==='number'?mat(m):m;
function put(mesh,parent=scene,shadow=true){mesh.castShadow=shadow;mesh.receiveShadow=true;parent.add(mesh);return mesh}
// صندوق قاعدته على y (لا مركزه)
function box(w,h,d,m,x=0,y=0,z=0,parent=scene,shadow){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),M(m));o.position.set(x,y+h/2,z);return put(o,parent,shadow)}
function cyl(rt,rb,h,m,x=0,y=0,z=0,parent=scene,seg=10,shadow){const o=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,seg),M(m));o.position.set(x,y+h/2,z);return put(o,parent,shadow)}
function ball(r,m,x=0,y=0,z=0,parent=scene,det=0){const o=new THREE.Mesh(new THREE.IcosahedronGeometry(r,det),M(m));o.position.set(x,y,z);return put(o,parent)}
function grp(x=0,y=0,z=0,ry=0,parent=scene){const g=new THREE.Group();g.position.set(x,y,z);g.rotation.y=ry;parent.add(g);return g}
function plane(w,h,m,parent=scene){const o=new THREE.Mesh(new THREE.PlaneGeometry(w,h),M(m));parent.add(o);return o}
function rnd(seed){let s=seed>>>0||1;return()=>(s=(s*1664525+1013904223)>>>0)/4294967296}

// أجسام يصطدم بها اللاعب ويقف عليها — تُحسب صناديقها بعد البناء
const SOLIDS=[],COL=[];
function solid(obj,pad=0){SOLIDS.push({obj,pad});return obj}
function block(x,z,hw,hd,top){const c={x0:x-hw,x1:x+hw,z0:z-hd,z1:z+hd,y0:0,top};COL.push(c);return c}
function bakeSolids(){scene.updateMatrixWorld(true);const b=new THREE.Box3();for(const {obj,pad} of SOLIDS){b.setFromObject(obj);COL.push({x0:b.min.x-pad,x1:b.max.x+pad,z0:b.min.z-pad,z1:b.max.z+pad,y0:b.min.y,top:b.max.y})}}

// أشياء تفتح النظام
const ACTS=[];
// zone: منطقة تصويب غير مرئيّة [w,h,d,x,y,z] بإحداثيّات الشيء — تُسهّل إصابة الأشياء الصغيرة
const ZONE=new THREE.MeshBasicMaterial({visible:false});
function act(obj,label,run,zone){if(zone){const [w,h,d,x,y,z]=zone;const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),ZONE);m.position.set(x,y,z);obj.add(m)}obj.traverse(o=>{o.userData.act=ACTS.length});ACTS.push({obj,label,run});return obj}

/* ── خامات مرسومة (canvas) ── */
const TEX=[];
function ctex(w,h,draw,{repeat}={}){const c=document.createElement('canvas');c.width=w;c.height=h;const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;if(repeat){t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(...repeat)}t.userData.draw=draw;paint(t);TEX.push(t);return t}
function paint(t){const c=t.image,g=c.getContext('2d');g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,c.width,c.height);g.direction='rtl';t.userData.draw(g,c.width,c.height);t.needsUpdate=true}
function tmat(t,o={}){return new THREE.MeshStandardMaterial({map:t,roughness:.9,...o})}
function rrect(g,x,y,w,h,r){g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath()}
function wrap(g,text,maxW){const words=String(text).split(/\s+/),lines=[];let l='';for(const w of words){const t=l?l+' '+w:w;if(g.measureText(t).width>maxW&&l){lines.push(l);l=w}else l=t}if(l)lines.push(l);return lines}
const fmt=n=>Math.round(Number(n)||0).toLocaleString('en-US');

/* ══════════════════ الغرفة ══════════════════ */
const RW=4.4,RD=6,RH=2.9,X0=-RW/2,X1=RW/2,Z0=-RD/2,Z1=RD/2;
const WALL=0x55585c,WALNUT=0x6b3a22,OAK=0xa4622e,CREAM=0xe9e2d4,BLACK=0x161616,STEEL=mat(0xc9ccd1,{metalness:.75,roughness:.35});

// الأرضيّة: بلاط رماديّ فاتح ٦٠سم
const floorTex=ctex(512,512,(g,w,h)=>{g.fillStyle='#c2bfb9';g.fillRect(0,0,w,h);const r=rnd(7);for(let i=0;i<900;i++){g.fillStyle=`rgba(0,0,0,${r()*.035})`;g.fillRect(r()*w,r()*h,3,3)}g.strokeStyle='rgba(60,55,50,.18)';g.lineWidth=2;for(let i=0;i<=4;i++){const p=i*w/4;g.beginPath();g.moveTo(p,0);g.lineTo(p,h);g.moveTo(0,p);g.lineTo(w,p);g.stroke()}},{repeat:[RW/2.4,RD/2.4]});
const floor=new THREE.Mesh(new THREE.PlaneGeometry(RW,RD),tmat(floorTex,{roughness:.75}));floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;scene.add(floor);
const ceil=plane(RW,RD,0x37393c);ceil.rotation.x=Math.PI/2;ceil.position.y=RH;
// الجدران الرماديّة الغامقة
solid(box(RW+.24,RH,.12,WALL,0,0,Z0-.06,scene,false));
solid(box(RW+.24,RH,.12,WALL,0,0,Z1+.06,scene,false));
solid(box(.12,RH,RD,WALL,X0-.06,0,0,scene,false));
// الجدار الأيمن بفتحة الباب (z ‎1.46…2.44) — يُفضي إلى «الساحة»
const DOOR={z0:1.46,z1:2.44,h:2.14};
solid(box(.12,RH,DOOR.z0-Z0,WALL,X1+.06,0,(Z0+DOOR.z0)/2,scene,false));
solid(box(.12,RH,Z1-DOOR.z1,WALL,X1+.06,0,(DOOR.z1+Z1)/2,scene,false));
box(.12,RH-DOOR.h,DOOR.z1-DOOR.z0,WALL,X1+.06,DOOR.h,(DOOR.z0+DOOR.z1)/2,scene,false);
box(RW+.6,.22,RD+.6,0x262626,0,RH,0,scene,false);
// وزرة سفليّة
for(const [w,d,x,z] of [[RW,.015,0,Z1-.008],[.015,RD,X0+.008,0],[.015,RD,X1-.008,0]])box(w,.08,d,0x3a3c3f,x,0,z,scene,false);

// ستارة مطويّة (أكورديون) — الطيّات المتناوبة تلتقط الضوء بتظليل مسطّح
function curtain(w,h,folds,depth,color=CREAM){const g=new THREE.PlaneGeometry(w,h,folds*2,1);const p=g.attributes.position,r=rnd(folds*31);const amp=[];for(let j=0;j<=folds*2;j++)amp.push(depth*(.75+r()*.5));for(let i=0;i<p.count;i++){const j=Math.round((p.getX(i)/w+.5)*folds*2);p.setZ(i,(j%2?1:-1)*amp[j])}g.computeVertexNormals();const o=new THREE.Mesh(g,mat(color,{side:THREE.DoubleSide,roughness:.95}));o.receiveShadow=true;return o}
{const c=curtain(RW-.06,RH-.1,30,.05);c.position.set(0,(RH-.1)/2+.03,Z0+.11);scene.add(c);box(RW-.04,.04,.06,0xd8d2c6,0,RH-.06,Z0+.1,scene,false)}
// ستارة النافذة يسار المكتب
{const c=curtain(.42,RH-.12,4,.04,0xf1eee8);c.position.set(X0+.23,(RH-.12)/2+.04,Z1-.12);scene.add(c)}

/* ── الإضاءة ── */
scene.add(new THREE.HemisphereLight(0xfff0dc,0x3b352f,1.15));
const sun=new THREE.DirectionalLight(0xffe7c8,1.35);
sun.position.set(.9,RH-.05,.9);sun.target.position.set(-.4,0,-.8);sun.castShadow=true;
sun.shadow.mapSize.set(isTouch?1024:2048,isTouch?1024:2048);Object.assign(sun.shadow.camera,{left:-3.6,right:3.6,top:3.8,bottom:-3.8,near:.05,far:7});
sun.shadow.bias=-.0005;sun.shadow.normalBias=.025;scene.add(sun,sun.target);
// إنارة سقف خافتة
for(const [x,z] of [[-1,-1.6],[1,-1.6],[-1,1.4],[1,1.4]]){const d=new THREE.Mesh(new THREE.CircleGeometry(.07,12),new THREE.MeshBasicMaterial({color:0xfff3df}));d.rotation.x=Math.PI/2;d.position.set(x,RH-.005,z);scene.add(d)}

/* ══════════════════ ركن الجلسة (جدار الستائر) ══════════════════ */
// سجّادة دائريّة حمراء غامقة بنقش
const rugTex=ctex(512,512,(g,w,h)=>{g.fillStyle='#5c0c12';g.fillRect(0,0,w,h);const r=rnd(3);for(let i=0;i<260;i++){g.fillStyle=r()<.5?'rgba(20,0,4,.35)':'rgba(150,30,40,.25)';g.beginPath();g.arc(r()*w,r()*h,4+r()*16,0,7);g.fill()}g.strokeStyle='rgba(20,0,4,.55)';g.lineWidth=10;g.beginPath();g.arc(w/2,h/2,w/2-24,0,7);g.stroke();g.lineWidth=4;g.beginPath();g.arc(w/2,h/2,w/2-48,0,7);g.stroke()});
{const rug=new THREE.Mesh(new THREE.CylinderGeometry(1.05,1.05,.018,28),[mat(0x4a0a0f),tmat(rugTex,{roughness:1}),mat(0x4a0a0f)]);rug.position.set(-.35,.009,-1.45);rug.receiveShadow=true;scene.add(rug)}

// الكنبة الصفراء
const pillowTex=ctex(256,256,(g,w,h)=>{g.fillStyle='#f3f1ec';g.fillRect(0,0,w,h);g.fillStyle='#1b1b1b';g.beginPath();g.moveTo(0,0);g.lineTo(w*.62,0);g.lineTo(0,h);g.fill();g.fillStyle='#8a8f96';g.beginPath();g.moveTo(w*.62,0);g.lineTo(w,0);g.lineTo(w,h*.45);g.fill();g.fillStyle='#e2ad18';g.beginPath();g.moveTo(w,h*.45);g.lineTo(w,h);g.lineTo(w*.3,h);g.fill()});
function sofa(x,z,ry){const g=grp(x,0,z,ry),Y=0xe3ad17,YD=0xd29e10;
  box(1.6,.1,.84,0x4b3a28,0,0,0,g);box(1.62,.27,.86,Y,0,.08,0,g);
  box(1.32,.13,.66,Y,0,.35,.07,g);box(1.62,.5,.22,YD,0,.35,-.32,g);
  box(.15,.3,.86,YD,-.735,.35,0,g);box(.15,.3,.86,YD,.735,.35,0,g);
  for(const sx of[-.33,.33]){const c=box(.64,.4,.15,Y,sx,.46,-.17,g);c.rotation.x=-.17}
  const pil=new THREE.Mesh(new THREE.BoxGeometry(.42,.42,.1),tmat(pillowTex));pil.position.set(-.28,.7,-.03);pil.rotation.set(-.3,.15,.14);put(pil,g);
  box(.22,.1,.12,0xf4f6f7,.36,.48,.08,g);box(.12,.03,.08,0x9fd6e8,.36,.58,.08,g);
  return solid(g)}
sofa(-1.28,-2.42,0);

// الأباجورة ثلاثيّة الأرجل
const lampLight=new THREE.PointLight(0xffc584,4.2,6.5,1.4);
function floorLamp(x,z){const g=grp(x,0,z);
  for(let i=0;i<3;i++){const a=i*Math.PI*2/3+.4;const l=cyl(.013,.013,1.48,0xcfae84,Math.sin(a)*.13,0,Math.cos(a)*.13,g,5);l.rotation.set(-Math.cos(a)*.15,0,Math.sin(a)*.15)}
  const sh=new THREE.Mesh(new THREE.CylinderGeometry(.19,.26,.3,10,1,true),mat(0x58544f,{side:THREE.DoubleSide,roughness:1}));sh.position.y=1.58;put(sh,g);
  const bulb=new THREE.Mesh(new THREE.SphereGeometry(.05,8,6),new THREE.MeshBasicMaterial({color:0xffe2b0}));bulb.position.y=1.5;g.add(bulb);
  lampLight.position.set(x,1.48,z);scene.add(lampLight);LAMP={group:g,light:lampLight,bulb};return solid(g,-.06)}
let LAMP=null;
floorLamp(-.2,-2.72);

// رفّ السلّم الخشبيّ والمصحف
const quranTex=ctex(128,180,(g,w,h)=>{g.fillStyle='#6e3418';g.fillRect(0,0,w,h);g.strokeStyle='#d9b45a';g.lineWidth=5;g.strokeRect(10,10,w-20,h-20);g.fillStyle='#d9b45a';g.beginPath();g.ellipse(w/2,h/2,28,40,0,0,7);g.fill();g.fillStyle='#6e3418';g.beginPath();g.ellipse(w/2,h/2,18,28,0,0,7);g.fill()});
function ladderShelf(x,z){const g=grp(x,0,z,.25);
  for(const sx of[-.2,.2]){const l=box(.035,1.75,.035,0xc7b49a,sx,0,0,g);l.rotation.x=.1}
  const sh=cyl(.22,.22,.025,0xb9a487,0,.95,-.02,g,14);sh.scale.z=.6;
  const q=new THREE.Mesh(new THREE.BoxGeometry(.17,.24,.05),[mat(0x5c2a12),mat(0x5c2a12),mat(0xe8dcc0),mat(0xe8dcc0),tmat(quranTex),mat(0x5c2a12)]);q.position.set(.02,1.1,.02);q.rotation.x=-.12;put(q,g);
  box(.19,.27,.03,0xd2652f,-.03,.98,-.07,g).rotation.x=-.18;
  return solid(g,-.05)}
ladderShelf(.12,-2.86);

// الطاولة الجانبيّة وما عليها
const clockFace=ctex(128,128,(g,w,h)=>{g.fillStyle='#f6f6f2';g.beginPath();g.arc(64,64,62,0,7);g.fill();g.fillStyle='#222';for(let i=0;i<12;i++){const a=i*Math.PI/6;g.fillRect(64+Math.sin(a)*50-2,64-Math.cos(a)*50-2,4,4)}const d=new Date(),hA=(d.getHours()%12+d.getMinutes()/60)*Math.PI/6,mA=d.getMinutes()*Math.PI/30;g.strokeStyle='#111';g.lineCap='round';g.lineWidth=5;g.beginPath();g.moveTo(64,64);g.lineTo(64+Math.sin(hA)*28,64-Math.cos(hA)*28);g.stroke();g.lineWidth=3;g.beginPath();g.moveTo(64,64);g.lineTo(64+Math.sin(mA)*44,64-Math.cos(mA)*44);g.stroke()});
let papers,clock;
function sideTable(x,z){const g=grp(x,0,z,-.05);
  box(.6,.035,.44,WALNUT,0,.6,0,g);
  for(const sx of[-.25,.25])for(const sz of[-.17,.17]){const l=cyl(.017,.013,.61,WALNUT,sx,0,sz,g,6);l.rotation.set(-sz*.12,0,sx*.12)}
  box(.52,.025,.36,0xcdb68a,0,.2,0,g);
  const cols=[0xf3f0e8,0x1c1c1c,0x8a1f1f,0xe8e3d2,0x2a2a2a,0xd9c37b,0x687038,0xf1eee6,0x3b2a1e,0xe7e4dc];let y=.225;
  cols.forEach((c,i)=>{const h=.026+(i*37%10)/450;const b=box(.32-(i*13%5)/80,h,.23,c,(i*7%5-2)/90,y,0,g);b.rotation.y=(i*11%7-3)/45;y+=h});
  // أوراق + كتب (عروض الأسعار)
  papers=grp(.03,.635,.03,0,g);box(.42,.008,.3,0xf8f8f4,0,0,0,papers);box(.38,.008,.28,0xf1f1ec,.03,.008,-.02,papers).rotation.y=.1;
  const b1=box(.24,.05,.17,0x7b2b27,-.12,.645,.04,g);b1.rotation.y=.28;box(.22,.04,.16,0x5c1e1b,-.08,.695,.03,g).rotation.y=-.1;
  // منبّه فضّيّ (التقويم)
  clock=grp(.1,.635,-.13,-.3,g);const body=cyl(.06,.06,.04,STEEL,0,.07,0,clock,14);body.rotation.x=Math.PI/2;body.position.y=.1;
  const face=new THREE.Mesh(new THREE.CircleGeometry(.052,20),new THREE.MeshBasicMaterial({map:clockFace}));face.position.set(0,.1,.021);clock.add(face);
  for(const sx of[-.04,.04]){ball(.022,STEEL,sx,.165,0,clock,1);cyl(.005,.005,.05,STEEL,sx*.9,0,0,clock,4)}
  // ساعة رمليّة
  const hg=grp(.22,.635,-.1,0,g);box(.07,.012,.07,0xcaa679,0,0,0,hg);box(.07,.012,.07,0xcaa679,0,.15,0,hg);
  for(const [sx,sz] of[[-.03,-.03],[.03,.03],[-.03,.03],[.03,-.03]])cyl(.005,.005,.15,0xcaa679,sx,0,sz,hg,4);
  cyl(.022,.004,.065,mat(0xdfeef5,{transparent:true,opacity:.45}),0,.075,0,hg,8);cyl(.004,.022,.065,mat(0xdfeef5,{transparent:true,opacity:.45}),0,.012,0,hg,8);cyl(.004,.018,.03,0x3d7fd0,0,.012,0,hg,8);
  // نبتة
  const pot=cyl(.065,.05,.12,0x1b1b1b,-.16,.635,-.12,g,10);
  const pr=rnd(5);for(let i=0;i<9;i++)ball(.045+pr()*.03,0x4c7f33,-.16+(pr()-.5)*.12,.8+pr()*.1,-.12+(pr()-.5)*.12,g);
  // المايك الإسفنجيّ
  const mic=grp(.12,.655,.1,.5,g);const foam=cyl(.062,.042,.15,0xece6cf,0,0,0,mic,10);foam.rotation.z=Math.PI/2;foam.position.set(-.04,.05,0);
  const hd=cyl(.017,.017,.22,BLACK,0,0,0,mic,6);hd.rotation.z=Math.PI/2;hd.position.set(.14,.035,0);
  return solid(g)}
sideTable(.42,-2.6);

// الكرسيّ البيج والبطانيّة الرماديّة
function crumple(r,seed,color=0x4b4f56){const geo=new THREE.IcosahedronGeometry(r,2),p=geo.attributes.position,v=new THREE.Vector3();for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i);v.multiplyScalar(1+.2*Math.sin(v.x*19+seed)*Math.cos(v.y*14+v.z*12+seed));p.setXYZ(i,v.x,v.y,v.z)}geo.computeVertexNormals();return new THREE.Mesh(geo,mat(color,{roughness:1}))}
function armchair(x,z,ry,blanket){const g=grp(x,0,z,ry),B=0xcfc6b5;
  for(const sx of[-.35,.35])for(const sz of[-.29,.29]){const l=cyl(.022,.017,.4,WALNUT,sx,0,sz,g,6);l.rotation.x=sz>0?-.08:.12}
  box(.7,.12,.64,B,0,.33,.03,g);
  const back=box(.62,.56,.11,B,0,.42,-.3,g);back.rotation.x=-.17;
  for(const sx of[-.38,.38]){box(.06,.05,.7,WALNUT,sx,.58,.0,g);box(.045,.25,.045,WALNUT,sx,.33,.29,g);box(.045,.18,.045,WALNUT,sx,.4,-.26,g)}
  if(blanket){const b=crumple(.42,1);b.scale.set(.82,.4,.72);b.position.set(.02,.56,-.02);put(b,g);const b2=crumple(.2,4);b2.scale.set(.5,.9,.9);b2.position.set(.36,.5,.06);put(b2,g)}
  return solid(g)}
armchair(1.08,-2.42,-.08,true);

// سجّادة صلاة خضراء + الطاولة البيضاء والعلم
const prayerTex=ctex(256,420,(g,w,h)=>{g.fillStyle='#173426';g.fillRect(0,0,w,h);g.strokeStyle='#c9a85a';g.lineWidth=8;g.strokeRect(14,14,w-28,h-28);g.lineWidth=3;g.strokeRect(30,30,w-60,h-60);g.beginPath();g.moveTo(50,h-50);g.lineTo(50,150);g.quadraticCurveTo(w/2,40,w-50,150);g.lineTo(w-50,h-50);g.stroke();const r=rnd(9);g.fillStyle='rgba(201,168,90,.35)';for(let i=0;i<90;i++)g.fillRect(60+r()*(w-120),160+r()*(h-220),3,3);g.fillStyle='#efe6cf';for(let x=0;x<w;x+=6){g.fillRect(x,0,3,8);g.fillRect(x,h-8,3,8)}});
{const pr=new THREE.Mesh(new THREE.BoxGeometry(.75,.012,1.2),[mat(0x173426),mat(0x173426),tmat(prayerTex),mat(0x173426),mat(0x173426),mat(0x173426)]);pr.position.set(1.75,.006,-1.95);pr.rotation.y=.12;pr.receiveShadow=true;scene.add(pr)}
const flagTex=ctex(192,128,(g,w,h)=>{g.fillStyle='#0b6b3a';g.fillRect(0,0,w,h);g.fillStyle='#fff';g.textAlign='center';g.font='700 22px '+FONT;g.fillText('لا إله إلا الله',w/2,52);g.fillText('محمد رسول الله',w/2,80);g.fillRect(40,96,w-80,5);g.fillRect(w-46,92,6,13)});
function whiteTable(x,z){const g=grp(x,0,z);
  const top=cyl(.33,.33,.03,0xf2f2f0,0,.44,0,g,18);top.scale.z=.85;
  for(let i=0;i<3;i++){const a=i*Math.PI*2/3;const l=cyl(.018,.014,.45,0xd8b88c,Math.sin(a)*.18,0,Math.cos(a)*.15,g,6);l.rotation.set(-Math.cos(a)*.2,0,Math.sin(a)*.2)}
  cyl(.05,.06,.02,STEEL,.05,.47,0,g,10);cyl(.004,.004,.36,STEEL,.05,.49,0,g,4);
  const fl=new THREE.Mesh(new THREE.PlaneGeometry(.2,.13),new THREE.MeshStandardMaterial({map:flagTex,side:THREE.DoubleSide,roughness:.8}));fl.position.set(.15,.76,0);g.add(fl);
  box(.12,.05,.08,0x9b1b1b,-.15,.47,.08,g);box(.1,.04,.07,0x2b4fa0,-.12,.52,.06,g);
  return solid(g)}
whiteTable(1.78,-1.75);

/* ══════════════════ الجدار الأيمن: معدّات التصوير ══════════════════ */
// الطابعة (الفواتير)
let printer;
{const g=grp(1.98,0,-1.0,-Math.PI/2);printer=g;
  box(.46,.27,.4,0xebedee,0,0,0,g);box(.44,.04,.3,0xd9dbdd,0,.27,-.03,g);box(.3,.01,.18,0x2a2a2a,0,.28,.09,g);
  box(.3,.02,.12,0xf9f9f6,0,.17,.24,g);box(.08,.05,.01,0x1f2937,.14,.2,.201,g);
  box(.21,.003,.29,0xffffff,0,.31,-.02,g);
  solid(g)}
// كراتين
solid(box(.42,.36,.36,0xb08a5c,1.95,0,-.42,scene));box(.36,.18,.3,0xc59a68,1.95,.36,-.42,scene).rotation.y=.2;

// ترايبود + رأس
function tripod(x,z,h,ry=0){const g=grp(x,0,z,ry);
  for(let i=0;i<3;i++){const a=i*Math.PI*2/3;const l=cyl(.012,.01,h*.62,0x1a1a1a,Math.sin(a)*.2,0,Math.cos(a)*.2,g,5);l.rotation.set(-Math.cos(a)*.34,0,Math.sin(a)*.34)}
  cyl(.016,.016,h-h*.55,0x1a1a1a,0,h*.55,0,g,6);return g}
{const t=tripod(1.38,-.95,1.45,.3);const hd=grp(0,1.45,0,0,t);const body=cyl(.075,.075,.26,mat(0xb9bec4,{metalness:.6,roughness:.35}),0,0,0,hd,12);body.rotation.z=Math.PI/2;body.position.set(-.06,.06,0);
  const hood=new THREE.Mesh(new THREE.CylinderGeometry(.11,.08,.1,12,1,true),mat(0x111111,{side:THREE.DoubleSide}));hood.rotation.z=Math.PI/2;hood.position.set(-.24,.06,0);put(hood,hd);block(1.38,-.95,.2,.2,1.6)}
{const t=tripod(1.72,-.25,1.7);const arm=cyl(.01,.01,1.0,0x1a1a1a,0,0,0,t,5);arm.rotation.z=1.2;arm.position.set(-.2,1.85,0);
  const m=cyl(.03,.03,.16,0x111111,-.62,1.98,0,t,8);m.rotation.z=.4;ball(.045,0x0d0d0d,-.66,2.0,0,t,1);block(1.72,-.25,.2,.2,2)}
{const t=tripod(1.18,-.1,1.5);cyl(.03,.03,.95,0x111111,0,1.5,0,t,8);box(.04,.04,.04,0xe0e0e0,0,2.4,0,t);block(1.18,-.1,.18,.18,2.4)}
{const t=tripod(2.0,.45,2.1);t.children.forEach(c=>c.material=STEEL);cyl(.01,.01,.6,0x111111,0,2.1,0,t,4);block(2.0,.45,.2,.2,2.6)}

// عقلة السحب على الجدار
{const g=grp(X1-.02,2.25,-1.05,0);for(const sz of[-.42,.42]){box(.36,.05,.05,0xf0f0f0,-.18,0,sz,g);box(.05,.24,.05,0xf0f0f0,-.02,-.22,sz,g)}
  const bar=cyl(.016,.016,1.0,0xe8e8e8,0,0,0,g,8);bar.rotation.x=Math.PI/2;bar.position.set(-.34,.02,0);
  for(const sz of[-.3,.3]){const gp=cyl(.022,.022,.14,0x111111,0,0,0,g,8);gp.rotation.x=Math.PI/2;gp.position.set(-.34,.02,sz)}}

// شعار إبراهيم سعود مؤطّراً على الجدار
{const g=grp(X1-.02,1.25,.95,-Math.PI/2);box(.66,.66,.03,0x0e0e0e,0,-.33,-.015,g);
  const logo=new THREE.Mesh(new THREE.PlaneGeometry(.62,.62),new THREE.MeshBasicMaterial({transparent:true,toneMapped:false}));logo.position.z=.002;g.add(logo);
  new THREE.TextureLoader().load('/logo-ibrahimsaud.png',t=>{t.colorSpace=THREE.SRGBColorSpace;logo.material.map=t;logo.material.needsUpdate=true});
  const glow=new THREE.PointLight(0xe8c766,.6,1.6,2);glow.position.set(0,0,.25);g.add(glow)}

// باب «وادي المبيعات» — المرحلة الثانية
const doorSign=ctex(512,160,(g,w,h)=>{g.fillStyle='#0e0e0e';g.fillRect(0,0,w,h);g.fillStyle=GOLD;g.fillRect(w-14,20,4,h-40);g.textAlign='right';g.fillStyle='#FAFAFA';g.font='700 54px '+SERIF;g.fillText('إلى الساحة',w-36,78);g.fillStyle='#A1A1AA';g.font='400 30px '+FONT;g.fillText('المبيعات · الخزنة · المجلس · الذكريات',w-36,128)});
// الباب: مفصّلة على حافّته، يُفتح للخارج تلقائيّاً حين تقترب
const door=grp(X1-.04,0,DOOR.z1-.04,0);let doorA=0;
{const zc=(DOOR.z0+DOOR.z1)/2;for(const z of[DOOR.z0,DOOR.z1])box(.16,DOOR.h,.06,0x2b2b2b,X1-.02,0,z,scene);box(.16,.06,DOOR.z1-DOOR.z0+.06,0x2b2b2b,X1-.02,DOOR.h-.06,zc,scene);
  box(.05,2.04,.86,0x5a3a24,0,0,-.45,door);for(const y of[.35,1.25])for(const x of[-.03,.03])box(.01,.6,.62,0x4d311e,x,y,-.45,door);
  for(const x of[-.05,.05])ball(.025,STEEL,x,1.0,-.8,door,1);
  const s=new THREE.Mesh(new THREE.PlaneGeometry(.62,.19),new THREE.MeshBasicMaterial({map:doorSign,toneMapped:false}));s.position.set(X1-.012,2.42,zc);s.rotation.y=-Math.PI/2;scene.add(s);
  const out=ctex(512,160,(g,w,h)=>{g.fillStyle='#0e0e0e';g.fillRect(0,0,w,h);g.fillStyle=GOLD;g.fillRect(w-14,20,4,h-40);g.textAlign='right';g.fillStyle='#FAFAFA';g.font='700 62px '+SERIF;g.fillText('الاستوديو',w-36,84);g.fillStyle='#A1A1AA';g.font='400 30px '+FONT;g.fillText('غرفة إبراهيم سعود',w-36,130)});
  const o=new THREE.Mesh(new THREE.PlaneGeometry(1.1,.34),new THREE.MeshBasicMaterial({map:out,toneMapped:false}));o.position.set(X1+.13,2.5,zc);o.rotation.y=Math.PI/2;scene.add(o)}

/* ══════════════════ الجدار الأيسر: المرآة والنخلة ══════════════════ */
let mirror;
if(!isTouch){const mr=mirror=new Reflector(new THREE.PlaneGeometry(1.0,2.15),{clipBias:.003,textureWidth:Math.round(innerWidth*.6),textureHeight:Math.round(innerHeight*.6),color:0xa9b0b0});mr.position.set(X0+.05,1.16,-.55);mr.rotation.y=Math.PI/2;scene.add(mr)}
else{const mr=plane(1.0,2.15,mat(0x8c9696,{metalness:.9,roughness:.08}));mr.position.set(X0+.05,1.16,-.55);mr.rotation.y=Math.PI/2}
box(.04,2.21,1.06,0xdedede,X0+.02,.05,-.55,scene,false);
// كرسيّ ثانٍ بجانب المرآة
armchair(-1.55,.75,Math.PI/2,false);
{const bag=box(.3,.36,.1,0xf4f4f2,-1.62,.39,.66,scene);bag.rotation.set(-.25,Math.PI/2,0)}
// نخلة
function palm(x,z){const g=grp(x,0,z);cyl(.17,.13,.32,0x222222,0,0,0,g,10);const r=rnd(11);
  for(let i=0;i<11;i++){const a=i*2.4,l=.7+r()*.45;const f=new THREE.Mesh(new THREE.ConeGeometry(.12,l,4),mat(i%2?0x6f9a37:0x5d8a2e,{side:THREE.DoubleSide}));f.scale.z=.12;f.geometry.translate(0,l/2,0);f.position.y=.32+r()*.2;f.rotation.set(Math.cos(a)*(.5+r()*.5),a,Math.sin(a)*(.5+r()*.5));put(f,g)}
  block(x,z,.18,.18,.32);return g}
palm(-1.86,1.85);

/* ══════════════════ جدار المكتب (+z) ══════════════════ */
const DZ=Z1-.31; // منتصف عمق المكتب
// المكتب الأسود المعلّق
{const g=grp(-1.02,0,DZ);solid(box(1.38,.035,.62,0x121212,0,.74,0,g));
  for(const sx of[-.6,.6]){const s=box(.03,.5,.03,0x1c1c1c,sx,.25,.26,g);s.rotation.x=.55}
  // ماك بوك مغلق + لوحة مفاتيح + تراكباد + قطع
  box(.31,.016,.22,mat(0xc9ccd0,{metalness:.7,roughness:.35}),-.3,.775,.06,g).rotation.y=.08;
  box(.07,.012,.15,0x111111,-.42,.792,.05,g).rotation.y=.5;
  box(.36,.018,.12,0x2b2d30,.1,.775,-.12,g);
  box(.16,.008,.12,0xeeeeee,-.17,.775,-.15,g);
  box(.08,.04,.05,0xd8c39a,-.6,.775,-.18,g);
  box(.06,.004,.06,0xf3e98a,.25,.775,.12,g);
  box(.08,.08,.08,0x1b1b1b,-.62,.775,.2,g);
  // سمّاعات على الحامل
  const hp=new THREE.Mesh(new THREE.TorusGeometry(.085,.012,6,14,Math.PI),mat(0x1a1a1a));hp.position.set(.56,1.0,.0);hp.rotation.y=Math.PI/2;put(hp,g);
  for(const sz of[-.085,.085]){const cup=cyl(.05,.05,.035,0x1a1a1a,.56,.92,sz,g,10);cup.rotation.x=Math.PI/2;cup.position.y=.98}
  cyl(.008,.008,.24,0x1a1a1a,.56,.775,0,g,4)}

// الشاشة العريضة المنحنية — لوحة التحكّم الحيّة
const SCR={w:1600,h:640};
const screenTex=ctex(SCR.w,SCR.h,drawScreen);screenTex.wrapS=THREE.RepeatWrapping;screenTex.repeat.x=-1;
let monitor;
{const R=1.55,A=.6,cx=-1.02,cz=Z1-.12-R;monitor=grp(cx,1.25,cz);
  const scr=new THREE.Mesh(new THREE.CylinderGeometry(R,R,.38,24,1,true,-A/2,A),new THREE.MeshBasicMaterial({map:screenTex,side:THREE.BackSide,toneMapped:false}));monitor.add(scr);
  const bez=new THREE.Mesh(new THREE.CylinderGeometry(R+.012,R+.012,.41,24,1,true,-A/2-.008,A+.016),mat(0x0c0c0c,{side:THREE.DoubleSide}));put(bez,monitor);
  const back=new THREE.Mesh(new THREE.CylinderGeometry(R+.05,R+.05,.3,24,1,true,-A/2+.03,A-.06),mat(0x151515,{side:THREE.DoubleSide}));put(back,monitor);
  box(.08,.06,.06,0x151515,0,-.03,R+.06,monitor);
  const glow=new THREE.PointLight(0xc8d4ff,1.3,2.6,2);glow.position.set(cx,1.2,Z1-.8);scene.add(glow)}

// ميكروفون البودكاست على الذراع
{const g=grp(-.3,.77,Z1-.05);const a1=cyl(.012,.012,.62,0x141414,0,0,0,g,6);a1.position.set(0,.36,-.12);a1.rotation.x=-.45;
  const a2=cyl(.012,.012,.55,0x141414,0,0,0,g,6);a2.position.set(-.12,.6,-.48);a2.rotation.set(-1.2,0,-.5);
  const mic=cyl(.034,.034,.17,mat(0x2a2a2a,{metalness:.5,roughness:.4}),0,0,0,g,10);mic.position.set(-.3,.46,-.62);mic.rotation.set(.2,0,.25);
  const grill=cyl(.036,.036,.09,mat(0x777b80,{metalness:.7,roughness:.4}),0,0,0,g,10);grill.position.set(-.33,.55,-.64);grill.rotation.set(.2,0,.25)}
// راوترات على الجدار
box(.34,.17,.05,0x111111,.05,1.62,Z1-.03,scene);box(.04,.02,.01,0x34d058,.05,1.7,Z1-.055,scene);
box(.12,.09,.04,0xf2f2f2,-1.98,1.6,Z1-.025,scene);

// وحدة الرفوف الخشبيّة ومعدّات التصوير
let gearShelf,RC;const PADS=[];
{const g=grp(.15,0,Z1-.22);gearShelf=g;const C=OAK,w=.88,d=.42;
  for(const sx of[-w/2,w/2])box(.035,2.05,d,C,sx,0,0,g);box(w+.035,.02,d,C,0,2.03,0,g);
  box(w,2.05,.01,0x3d3f42,0,0,d/2-.005,g,false);
  for(const y of[.06,.48,.9,1.32,1.7])box(w,.025,d,C,0,y,0,g);
  // الرف الأدنى: رودكاستر بأزرار مضيئة
  box(.38,.045,.24,0x141414,-.12,.085,-.02,g).rotation.x=-.06;
  const pads=[0xff3b6b,0xff8a1f,0x2ee66d,0x26c6ff,0xffd22e,0xff4fd8,0x6c7bff,0x2ee6c8];
  RC=grp(0,0,0,0,g); // أزرار تعزف (fun.js)
  pads.forEach((c,i)=>{const p=new THREE.Mesh(new THREE.BoxGeometry(.035,.012,.035),new THREE.MeshBasicMaterial({color:c,toneMapped:false}));p.position.set(-.26+(i%4)*.045,.135,-.06+Math.floor(i/4)*.045);RC.add(p);PADS.push(p)});
  const scr=new THREE.Mesh(new THREE.BoxGeometry(.09,.01,.06),new THREE.MeshBasicMaterial({color:0xd8c79a,toneMapped:false}));scr.position.set(-.02,.137,-.03);g.add(scr);
  box(.32,.12,.24,0x4a4a4a,.22,.085,0,g);
  // الرف الثاني: كانون + زي كام + سمّاعات
  const cam=grp(-.2,.505,0,.3,g);box(.13,.09,.07,0x1b1b1b,0,0,0,cam);const ln=cyl(.035,.035,.08,0x141414,0,0,0,cam,10);ln.rotation.x=Math.PI/2;ln.position.set(0,.045,.07);
  box(.11,.11,.11,0x232323,.06,.505,.02,g);box(.07,.07,.005,0x0e1d2c,.06,.54,-.058,g);
  const hp=new THREE.Mesh(new THREE.TorusGeometry(.08,.02,6,12),mat(0x111111));hp.rotation.x=Math.PI/2;hp.position.set(.29,.53,0);put(hp,g);
  // الرف الثالث: جيمبال + عدسات + علبة
  cyl(.022,.022,.26,0x1a1a1a,-.3,.925,0,g,8);box(.05,.05,.07,0x1a1a1a,-.3,1.18,.02,g);
  for(const [x,r] of[[-.12,.04],[-.02,.035],[.07,.03]]){const l=cyl(r,r,.09,0x141414,x,.925,.04,g,10);l.rotation.x=Math.PI/2;l.position.y=.925+r}
  box(.16,.24,.07,0x9fd0e8,.3,.925,-.05,g);cyl(.06,.06,.12,0xd8c7f0,.18,.925,.05,g,10);
  // الرف الرابع: مرسام التصوير + الكلاكيت + اللوحة والدرع
  const clap=ctex(256,64,(c,w,h)=>{c.fillStyle='#111';c.fillRect(0,0,w,h);c.fillStyle='#f4f4f4';for(let x=-40;x<w;x+=56){c.beginPath();c.moveTo(x,0);c.lineTo(x+28,0);c.lineTo(x+58,h);c.lineTo(x+30,h);c.fill()}});
  const cb=box(.26,.2,.015,0x111111,-.22,1.345,-.06,g);const ct=new THREE.Mesh(new THREE.BoxGeometry(.26,.04,.016),[mat(0x111),mat(0x111),mat(0x111),mat(0x111),tmat(clap),tmat(clap)]);ct.position.set(-.22,1.57,-.06);ct.rotation.z=.12;put(ct,g);
  box(.3,.2,.2,0x1a1a1a,-.08,1.345,.04,g).rotation.y=-.3;
  box(.24,.32,.02,0xd8c6a0,.24,1.345,-.12,g);
  const sh=box(.12,.17,.01,mat(0xd8e6f2,{transparent:true,opacity:.7,roughness:.15}),.26,1.37,-.07,g);
  // الأعلى: لوحة مفاتيح + هاردسكات
  box(.12,.04,.4,0x2b2b2b,-.2,1.725,0,g).rotation.z=.9;
  for(const x of[.1,.18,.26])box(.03,.15,.11,0x707377,x,1.725,0,g);
  solid(g)}

// لوحة الفلّين: مهامك المفتوحة كأوراق لاصقة
const NOTES=['#f7f0a3','#cfe9b4','#bcdcf2','#f8c9da','#fbe3a2','#e3f0b0'];
const DEFAULT_NOTES=['توكّل على الله','الاستمرارية','الشركة = نظام','٣ أيام تسليم','صمّم… ونفّذ','وقّف التخطيط وابدأ'];
const corkTex=ctex(1200,760,drawCork);
let cork;
{const g=grp(1.32,1.6,Z1-.02,Math.PI);cork=g;box(1.22,.78,.03,0xd5d8dc,0,-.39,0,g,false);
  const face=new THREE.Mesh(new THREE.PlaneGeometry(1.16,.73),tmat(corkTex,{roughness:1}));face.position.z=.017;g.add(face);
  // مسابح معلّقة
  const beads=[[0x8a5a33,-.32],[0x1f7a5a,-.12],[0xe8a33a,.02],[0xf1ead9,.3],[0x1c3a70,.4]];
  for(const [c,x] of beads){for(let i=0;i<9;i++){const b=new THREE.Mesh(new THREE.IcosahedronGeometry(.011,0),mat(c));b.position.set(x+Math.sin(i*.5)*.008,-.42-i*.028,.02);g.add(b)}}}
// الخزانة البيضاء والخريطة
const mapTex=ctex(300,400,(g,w,h)=>{g.fillStyle='#efe4c8';g.fillRect(0,0,w,h);g.fillStyle='#6fb2a6';g.beginPath();g.moveTo(0,h*.45);g.lineTo(w*.38,h*.5);g.lineTo(w*.6,h*.95);g.lineTo(0,h);g.fill();g.beginPath();g.moveTo(w,h*.3);g.lineTo(w*.72,h*.42);g.lineTo(w*.85,h*.6);g.lineTo(w,h*.62);g.fill();g.beginPath();g.moveTo(w*.5,h);g.lineTo(w*.8,h*.78);g.lineTo(w,h*.82);g.lineTo(w,h);g.fill();g.strokeStyle='rgba(60,50,40,.35)';g.lineWidth=2;g.strokeRect(10,10,w-20,h-20);g.fillStyle='#4b3b2a';g.font='700 22px '+FONT;g.textAlign='center';g.fillText('الجزيرة العربيّة',w*.55,h*.62)});
{const g=grp(1.32,0,Z1-.2,Math.PI);
  box(.98,.86,.38,0xf4f4f2,0,0,0,g);box(.02,.36,.36,0xe6e6e4,0,.04,-.005,g);box(.9,.02,.36,0xe6e6e4,0,.4,-.005,g);
  for(let i=0;i<7;i++)box(.035,.2,.15,[0x1b1b1b,0xe9e2c6,0x7a2b27,0x2b4fa0,0xe9e2c6,0x1b1b1b,0x7a2b27][i],-.05-i*.04,.44,.05,g);
  box(.28,.35,.02,0xc9a878,.28,.86,.12,g).rotation.x=-.12;
  const mp=new THREE.Mesh(new THREE.PlaneGeometry(.24,.31),tmat(mapTex));mp.position.set(.28,1.04,.1);mp.rotation.x=-.12;mp.rotation.y=Math.PI;put(mp,g,false);
  cyl(.04,.035,.1,mat(0xe8eef2,{transparent:true,opacity:.5,roughness:.1}),-.36,.86,0,g,10);
  const vase=cyl(.035,.05,.16,0xe8e0d0,-.25,.86,.03,g,10);ball(.05,0xe8e0d0,-.25,.9,.03,g,1);
  cyl(.05,.05,.07,0x3b6fd0,-.05,.86,-.02,g,10);
  box(.11,.17,.07,0xf3e7b0,.06,.86,-.05,g).rotation.y=.2;
  solid(g)}

/* ══════════════════ التفاعل ══════════════════ */
act(monitor,'افتح لوحة التحكّم',()=>openSys('home','لوحة التحكّم'),[1.05,.9,.3,0,.1,1.5]);
act(printer,'الفواتير',()=>openSys('invoicing','الفواتير'),[.6,.8,.55,0,.4,0]);
act(papers,'عروض الأسعار',()=>openSys('sales','عروض الأسعار'),[.42,.25,.32,0,.1,0]);
act(cork,'المشاريع والمهام',()=>openSys('projects','المشاريع والمهام'));
act(clock,'التقويم',()=>openSys('calendar','التقويم'),[.22,.3,.2,0,.12,0]);
act(gearShelf,'المنتجات والخدمات',()=>openSys('products','المنتجات والخدمات'));

/* ── رسم الشاشة ── */
function drawScreen(g,w,h){
  const gr=g.createLinearGradient(0,0,w,h);gr.addColorStop(0,'#0b0b0c');gr.addColorStop(.55,'#121110');gr.addColorStop(1,'#2b2210');g.fillStyle=gr;g.fillRect(0,0,w,h);
  g.fillStyle='rgba(255,255,255,.05)';g.fillRect(0,0,w,36);
  const now=new Date();g.textAlign='left';g.direction='ltr';g.fillStyle='#d4d4d8';g.font='400 22px '+FONT;
  g.fillText(now.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'}),28,26);
  g.direction='rtl';g.textAlign='right';
  g.fillStyle='#FAFAFA';g.font='700 70px '+SERIF;g.fillText('أهلاً '+(K&&K.owner||'إبراهيم سعود'),w-80,140);
  g.fillStyle=GOLD;g.fillRect(w-80-120,162,120,4);
  g.fillStyle='#A1A1AA';g.font='400 28px '+FONT;g.fillText(now.toLocaleDateString('ar-EG-u-nu-latn',{weekday:'long',day:'numeric',month:'long'}),w-80,212);
  const signed=K&&K.signed;
  const cards=signed?[
    ['محصّل '+K.month,fmt(K.collected),K.cur],['مستحقّ على العملاء',fmt(K.due),K.cur],['عروض أسعار مفتوحة',fmt(K.quotes),''],['مهام مفتوحة',fmt(K.taskCount),'']
  ]:[['محصّل الشهر','—',''],['مستحقّ','—',''],['عروض مفتوحة','—',''],['مهام','—','']];
  const pad=80,gap=26,cw=(w-pad*2-gap*3)/4,cy=262,ch=210;
  cards.forEach(([l,v,u],i)=>{const x=w-pad-cw-i*(cw+gap);rrect(g,x,cy,cw,ch,22);g.fillStyle='rgba(255,255,255,.055)';g.fill();g.strokeStyle='rgba(255,255,255,.1)';g.lineWidth=2;g.stroke();
    g.fillStyle='#A1A1AA';g.font='400 27px '+FONT;g.fillText(l,x+cw-28,cy+54);
    g.fillStyle=i===0?GOLD:'#FAFAFA';g.font='700 66px '+FONT;g.fillText(v,x+cw-28,cy+140);
    if(u){g.fillStyle='#71717a';g.font='400 24px '+FONT;g.fillText(u,x+cw-28,cy+182)}});
  rrect(g,w/2-210,522,420,58,29);g.fillStyle=GOLD;g.fill();g.fillStyle='#0a0a0a';g.font='700 28px '+FONT;g.textAlign='center';
  g.fillText(signed?(isTouch?'اضغط «افتح» لفتح النظام':'اضغط E لفتح النظام'):'سجّل دخولك — اضغط هنا',w/2,561);
  if(W.demo||(K&&K.guest)){g.textAlign='left';g.fillStyle='#f59e0b';g.font='700 24px '+FONT;g.fillText(K&&K.guest?'وضع العرض · أرقام توضيحيّة':'DEMO',28,620)}
}
/* ── رسم لوحة الفلّين ── */
function drawCork(g,w,h){
  g.fillStyle='#b48552';g.fillRect(0,0,w,h);const r=rnd(21);
  for(let i=0;i<2600;i++){g.fillStyle=r()<.5?'rgba(80,45,15,.22)':'rgba(230,190,140,.18)';g.fillRect(r()*w,r()*h,2+r()*3,2+r()*3)}
  const list=(K&&K.signed&&K.tasks.length)?K.tasks.map(t=>t.title):DEFAULT_NOTES;
  const cols=4,nw=230,nh=188,sx=(w-cols*nw)/(cols+1);
  list.slice(0,12).forEach((t,i)=>{const c=i%cols,rw=Math.floor(i/cols);const x=w-sx-(c+1)*nw-c*sx+(r()-.5)*24,y=26+rw*(nh+38)+(r()-.5)*16;
    g.save();g.translate(x+nw/2,y+nh/2);g.rotate((r()-.5)*.12);
    g.fillStyle='rgba(0,0,0,.25)';g.fillRect(-nw/2+5,-nh/2+7,nw,nh);g.fillStyle=NOTES[i%NOTES.length];g.fillRect(-nw/2,-nh/2,nw,nh);
    g.fillStyle='#1f1f1f';g.font='700 30px '+FONT;g.textAlign='center';g.direction='rtl';
    wrap(g,t,nw-34).slice(0,4).forEach((ln,j,a)=>g.fillText(ln,0,-((a.length-1)*38)/2+j*38+10));
    const pc=['#1d4ed8','#16a34a','#dc2626','#eab308'][i%4];g.fillStyle=pc;g.beginPath();g.arc(0,-nh/2+16,11,0,7);g.fill();g.fillStyle='rgba(255,255,255,.6)';g.beginPath();g.arc(-3,-nh/2+12,3.5,0,7);g.fill();
    g.restore()});
}

/* ══════════════════ اللاعب ══════════════════ */
const C={THREE,scene,mat,M,put,box,cyl,ball,grp,plane,rnd,ctex,paint,tmat,rrect,wrap,fmt,solid,block,act,palm,openSys,openPanel,toast,info:setInfo,getK:()=>K,ACTS,COL,FONT,SERIF,GOLD};
const CAMPUS=buildCampus(C);
Object.assign(C,{bounds:CAMPUS.bounds,PADS,rc:RC,lamp:LAMP});
const FUN=buildFun(C);
bakeSolids();
const P={x:.25,y:0,z:-.15,vx:0,vz:0,vy:0,ground:true,yaw:Math.PI-.12,pitch:-.06};
const R=.24,STEP=.36,EYE=1.62,G=19,JUMP=5.6;
const keys=new Set();let playing=false,sysOpen=false;
function hits(x,z,y){for(const c of COL){if(c.top<=y+STEP||c.y0>=y+1.75)continue;if(x+R>c.x0&&x-R<c.x1&&z+R>c.z0&&z-R<c.z1)return true}return false}
function groundAt(x,z,y){let gnd=0;const r=R*.55;for(const c of COL){if(c.top>y+STEP)continue;if(x+r>c.x0&&x-r<c.x1&&z+r>c.z0&&z-r<c.z1)gnd=Math.max(gnd,c.top)}return gnd}
function jump(){if(P.ground){P.vy=JUMP;P.ground=false}}
const joy={id:null,x0:0,y0:0,dx:0,dy:0},look={id:null,x:0,y:0};
let bob=0;
function step(dt){
  let f=0,s=0;
  if(keys.has('KeyW')||keys.has('ArrowUp'))f++;if(keys.has('KeyS')||keys.has('ArrowDown'))f--;
  if(keys.has('KeyD')||keys.has('ArrowRight'))s++;if(keys.has('KeyA')||keys.has('ArrowLeft'))s--;
  if(joy.id!==null){f-=joy.dy;s+=joy.dx}
  const len=Math.hypot(f,s);if(len>1){f/=len;s/=len}
  const sp=(keys.has('ShiftLeft')||keys.has('ShiftRight'))?4.3:2.5;
  const sn=Math.sin(P.yaw),cs=Math.cos(P.yaw);
    const tx=(-sn*f+cs*s)*sp,tz=(-cs*f-sn*s)*sp,k=1-Math.exp(-dt*(P.ground?12:4));
  if(!P.launch){P.vx+=(tx-P.vx)*k;P.vz+=(tz-P.vz)*k} // أثناء قفزة المنصّة لا نتحكّم في المسار
  let nx=P.x+P.vx*dt;if(!hits(nx,P.z,P.y))P.x=nx;else if(!P.launch)P.vx=0;
  let nz=P.z+P.vz*dt;if(!hits(P.x,nz,P.y))P.z=nz;else if(!P.launch)P.vz=0;
  const B=CAMPUS.bounds;if(P.x<B.x0){P.x=Math.max(B.lane.x0,P.x);P.z=Math.max(B.lane.z0,Math.min(B.lane.z1,P.z))}else P.x=Math.min(B.x1,P.x);if(P.x>=B.x0)P.z=Math.max(B.z0,Math.min(B.z1,P.z));
  P.vy-=G*dt;let ny=P.y+P.vy*dt;const gnd=groundAt(P.x,P.z,P.y);
  if(ny<=gnd){if(!P.ground&&P.vy<-3)bob=-.06;ny=gnd;P.vy=0;P.ground=true;P.launch=false}else P.ground=false;
  if(P.x<X1&&P.x>X0&&P.z>Z0&&P.z<Z1&&ny+1.78>RH){ny=RH-1.78;if(P.vy>0)P.vy=0} // سقف الاستوديو فقط
  P.y=ny;
  const moving=Math.hypot(P.vx,P.vz);bob+=(0-bob)*Math.min(1,dt*10);
  const b=P.ground?Math.sin(performance.now()/1000*(moving>3?12:8.5))*.022*Math.min(1,moving/2.5):0;
  camera.position.set(P.x,P.y+EYE+b+bob,P.z);camera.rotation.set(P.pitch,P.yaw,0);
}

/* ── التصويب على الأشياء ── */
const ray=new THREE.Raycaster();ray.far=2.6;const center=new THREE.Vector2(0,0);
const actObjs=()=>ACTS.map(a=>a.obj);let target=-1;
function aim(){ray.setFromCamera(center,camera);const hit=ray.intersectObjects(actObjs(),true)[0];const t=hit?hit.object.userData.act:-1;
  if(t===target)return;target=t??-1;
  $('cross').classList.toggle('on',target>=0);
  const h=$('hint');if(target>=0&&!isTouch){h.innerHTML='<kbd>E</kbd>'+ACTS[target].label;h.classList.remove('hidden')}else h.classList.add('hidden');
  const ab=$('actBtn');ab.textContent=target>=0?ACTS[target].label:'افتح';ab.classList.toggle('hidden',target<0)}
function interact(){if(target>=0)ACTS[target].run()}

/* ── النظام داخل إطار ── */
// قفل المؤشّر يعيد وعداً في Chrome؛ رفضه (قبل مرور ثانية على Esc مثلاً) يُظهر شاشة الدخول
// وإن مُنع القفل كلّياً (متصفّح مضمَّن) نتحوّل لوضع السحب: اسحب بالماوس للنظر وانقر للفتح
let dragLook=false,dragMoved=0;
function lock(){try{const p=canvas.requestPointerLock();if(p&&p.catch)p.catch(noLock)}catch(_){noLock()}}
function noLock(){if(sysOpen)return;dragLook=true;playing=true;$('start').classList.add('hidden')}
const sys=$('sys'),frame=$('frame');
function pause(title,panel){
  sysOpen=true;playing=false;keys.clear();joy.id=look.id=null;if(document.pointerLockElement)document.exitPointerLock();
  $('sysTitle').textContent=title;sys.classList.remove('hidden');$('start').classList.add('hidden');$('hint').classList.add('hidden');
  sys.classList.toggle('panel',!!panel);setInfo(null);
}
// لوحة HTML داخل الإطار نفسه (الخريطة، معرض الذكريات) — بلا النظام
function openPanel(title,html,onClick){pause(title,true);const b=$('panelBody');b.innerHTML=html;b.scrollTop=0;b.onclick=onClick||null}
// وضع العرض: الشاشة تشرح ما تفعله بدل أن تفتح النظام وبياناته
const GUIDE={home:'لوحة التحكّم: نظرة يوميّة على المحصّل والمستحقّ والعروض والمهام.',invoicing:'الفواتير: إصدار فواتير عاديّة أو ضريبيّة برمز QR، وتسجيل الدفعات والتحصيل.',sales:'عروض الأسعار: إنشاء العرض وإرساله وتحويله إلى فاتورة بنقرة.',quotedesign:'مصمّم العروض: قوالب عروض الأسعار بهويّة المنشأة.',products:'المنتجات والخدمات: الباقات والأسعار التي تُبنى منها العروض.',pricing:'مستشار التسعير: يقترح سعر المشروع من نطاقه ومدّته.',projects:'المشاريع والمهام: لوحات بنمط Trello لكلّ مشروع ومراحله.',calendar:'التقويم: المواعيد مع Google Calendar في مكان واحد.',dashboards:'لوحات المؤشّرات: الأرقام المهمّة في رسوم ولوحات.',settings:'الإعدادات: الهويّة، ونوع الفاتورة، وبيانات المنشأة.',accounting:'المحاسبة: دفتر يوميّة موحّد وقوائم ماليّة متوازنة تلقائيّاً.',subs:'الاشتراكات: كلّ اشتراك شهريّ أو سنويّ وتكلفته.',suppliers:'الموردون: من تشتري منهم وماذا.',crm:'العملاء: كلّ عميل في مرحلته من أوّل تواصل حتى التسليم.',pipeline:'خطّ المبيعات: الفرص وقيمتها المتوقّعة.',contacts:'جهات الاتصال: كلّ من تتعامل معه في مكان واحد.',partners:'الشركاء: برنامج شركاء مؤتمت.',blog:'المدوّنة: كتابة المقالات ونشرها على الموقع.',newsletter:'القائمة البريدية: المشتركون وإرسال الرسائل.',sitework:'أعمال الموقع: الأعمال والشعارات المعروضة في الموقع.',huroof:'حروف ودروس: لوحة إدارة المنصّة التعليميّة.',boards:'الخرائط الذهنية: لوحات حرّة بنمط Freeform تُشارَك برابط.',workspace:'مساحة العمل: تقويم المحتوى والحملات.',desktop:'سطح المكتب: كلّ تطبيقات النظام في شاشة واحدة.',lab:'المختبر: أدوات وتجارب جديدة.',habits:'العادات: تتبّع يوميّ وشجرة تُثمر.',appointments:'المواعيد: الحجوزات القادمة.'};
function openSys(view,title){
  if(W.guest){openPanel(title,`<div class="mem"><div class="yr">وضع العرض</div><h2>${title}</h2><p>${GUIDE[view]||'جزء من نظام إبراهيم سعود.'}</p><p style="color:#A1A1AA;font-size:14px">هذا عرض للزوّار — البيانات الحقيقيّة مخفيّة، والأرقام في العالم توضيحيّة.</p></div>`);return}
  pause(title,false);usedSys=true;
  let done=false;
  try{const w=frame.contentWindow,shell=frame.contentDocument&&frame.contentDocument.getElementById('appShell');
    if(frame.dataset.ready&&w&&typeof w.go==='function'&&shell&&!shell.classList.contains('hidden')){w.go(view);done=true}}catch(_){}
  if(!done)frame.src='../index.html?embed=1&view='+view+(W.demo?'&demo=1':'');
}
frame.addEventListener('load',()=>{frame.dataset.ready='1';try{frame.contentWindow.addEventListener('keydown',e=>{if(e.key==='Escape'){const m=frame.contentDocument.getElementById('modalRoot');if(!m||!m.children.length)closeSys()}})}catch(_){}});
let usedSys=false,MEM=null;
async function closeSys(){
  if(!sysOpen)return;sysOpen=false;sys.classList.add('hidden');
  if(isTouch)playing=true;else lock();
  if(usedSys){usedSys=false;K=await W.reload();refreshData()}
}
/* ── الخريطة: انتقال فوريّ بين الأماكن ── */
function teleport(d){Object.assign(P,{x:d.x,z:d.z,y:0,vx:0,vz:0,vy:0,yaw:d.yaw,pitch:-.05,launch:false});closeSys()}
function openMap(){const L=CAMPUS.districts.concat(MEM?MEM.districts:[]);
  openPanel('الخريطة',`<div class="map">${L.map((d,i)=>`<button data-i="${i}"><b>${d.name}</b><span>${d.desc}</span></button>`).join('')}</div>`,e=>{const b=e.target.closest('button[data-i]');if(b)teleport(L[+b.dataset.i])})}
$('mapBtn').onclick=()=>{if(!sysOpen)openMap()};
let infoOn=false;function setInfo(html){const el=$('info');if(!html){if(infoOn){el.classList.add('hidden');infoOn=false}return}el.innerHTML=html;el.classList.remove('hidden');infoOn=true}
$('sysClose').onclick=closeSys;

/* ── التحكّم ── */
addEventListener('keydown',e=>{
  if(sysOpen){if(e.key==='Escape')closeSys();return}
  if(!playing)return;
  if(dragLook&&e.key==='Escape'){playing=false;keys.clear();$('start').classList.remove('hidden');return}
  keys.add(e.code);
  if(e.code==='Space'){jump();e.preventDefault()}
  if(e.code==='KeyE'||e.code==='Enter')interact();
  if(e.code==='KeyM'){keys.clear();openMap()}
});
addEventListener('keyup',e=>keys.delete(e.code));
addEventListener('blur',()=>keys.clear());
$('enter').onclick=()=>{if(isTouch){$('start').classList.add('hidden');playing=true}else lock()};
document.addEventListener('pointerlockchange',()=>{const on=document.pointerLockElement===canvas;if(on)dragLook=false;if(dragLook)return;playing=on;if(!on)keys.clear();$('start').classList.toggle('hidden',on||sysOpen)});

canvas.addEventListener('mousedown',()=>{if(isTouch||sysOpen)return;dragMoved=0;if(!playing)lock();else if(!dragLook)interact()});
canvas.addEventListener('mouseup',()=>{if(dragLook&&playing&&dragMoved<5)interact()});
document.addEventListener('mousemove',e=>{if(!playing||isTouch)return;if(dragLook){if(!(e.buttons&1))return;dragMoved+=Math.abs(e.movementX)+Math.abs(e.movementY)}P.yaw-=e.movementX*.0022;P.pitch=Math.max(-1.45,Math.min(1.45,P.pitch-e.movementY*.0022))});
// لمس: عصا يساراً، سحب يميناً للنظر
const knob=$('joy').firstElementChild;
canvas.addEventListener('touchstart',e=>{e.preventDefault();if(!playing)return;for(const t of e.changedTouches){
  if(t.clientX<innerWidth*.45&&joy.id===null){joy.id=t.identifier;joy.x0=t.clientX;joy.y0=t.clientY;joy.dx=joy.dy=0}
  else if(look.id===null){look.id=t.identifier;look.x=t.clientX;look.y=t.clientY}}},{passive:false});
canvas.addEventListener('touchmove',e=>{e.preventDefault();for(const t of e.changedTouches){
  if(t.identifier===joy.id){let dx=(t.clientX-joy.x0)/55,dy=(t.clientY-joy.y0)/55;const l=Math.hypot(dx,dy);if(l>1){dx/=l;dy/=l}joy.dx=dx;joy.dy=dy;knob.style.transform=`translate(${dx*36}px,${dy*36}px)`}
  else if(t.identifier===look.id){P.yaw-=(t.clientX-look.x)*.0052;P.pitch=Math.max(-1.3,Math.min(1.3,P.pitch-(t.clientY-look.y)*.0052));look.x=t.clientX;look.y=t.clientY}}},{passive:false});
const tEnd=e=>{for(const t of e.changedTouches){if(t.identifier===joy.id){joy.id=null;joy.dx=joy.dy=0;knob.style.transform=''}if(t.identifier===look.id)look.id=null}};
canvas.addEventListener('touchend',tEnd);canvas.addEventListener('touchcancel',tEnd);
$('jumpBtn').addEventListener('touchstart',e=>{e.preventDefault();jump()},{passive:false});
$('actBtn').addEventListener('click',interact);

let toastT;function toast(m){const t=$('toast');t.textContent=m;t.classList.remove('hidden');clearTimeout(toastT);toastT=setTimeout(()=>t.classList.add('hidden'),3600)}

/* ── البيانات ── */
function refreshData(){paint(screenTex);paint(corkTex);CAMPUS.refresh()}
// زرّ وضع العرض: للمالك فقط، ليعرض العالم على أحد دون بياناته
async function toggleGuest(){W.guest=!W.guest;K=await W.load();refreshData();setStatus();toast(W.guest?'وضع العرض: أرقام توضيحيّة، والشاشات لا تفتح النظام':'رجعت بياناتك الحقيقيّة')}
$('guestBtn').onclick=toggleGuest;
function setStatus(){$('guestBtn').classList.toggle('hidden',!W.signed);$('guestBtn').classList.toggle('on',!!W.guest);if(K&&K.guest){const s=$('status');s.classList.add('ok');s.lastElementChild.textContent=W.signed?'وضع العرض — بياناتك مخفيّة':'جولة زائر — الأرقام توضيحيّة';return}const s=$('status');s.classList.toggle('ok',!!(K&&K.signed));s.lastElementChild.textContent=K&&K.signed?(K.demo?'نسخة تجريبيّة — أرقام محلّيّة':'متّصل ببياناتك'):'غير مسجّل — الأرقام مخفيّة؛ سجّل من شاشة المكتب'}

/* ── الحلقة ── */
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
const clk=new THREE.Clock();let tick=0;
function loop(){requestAnimationFrame(loop);const dt=Math.min(clk.getDelta(),.05);
  if(playing)step(dt);else camera.position.set(P.x,P.y+EYE,P.z),camera.rotation.set(P.pitch,P.yaw,0);
  if(playing)aim();
  CAMPUS.update(dt,P,G,playing);FUN.update(dt,P,playing);
  // الباب يُفتح حين تقترب، والمرآة لا تُرسم وأنت خارج الغرفة
  const near=Math.hypot(P.x-X1,P.z-(DOOR.z0+DOOR.z1)/2)<2.4;doorA+=((near?-1.45:0)-doorA)*Math.min(1,dt*5);door.rotation.y=doorA;
  if(mirror)mirror.visible=P.x<X1+1.5&&P.z>Z0-.5&&P.z<Z1+.5;
  if((tick+=dt)>30){tick=0;paint(screenTex);paint(clockFace)}
  renderer.render(scene,camera)}

if(/[?&]debug/.test(location.search))window.W3DBG={P,camera,scene,step,aim,ACTS,COL,get target(){return target},interact,view:(x,z,yaw,pitch=-.08,y=0)=>{Object.assign(P,{x,z,yaw,pitch,y});camera.position.set(x,y+EYE,z);camera.rotation.set(pitch,yaw,0);renderer.render(scene,camera);return renderer.domElement.toDataURL('image/jpeg',.85)},tick:dt=>{step(dt);CAMPUS.update(dt,P,G,true);FUN.update(dt,P,true)},setPlaying:v=>{playing=v;$('start').classList.add('hidden')}};
/* ── الإقلاع ── */
(async()=>{
  if(isTouch){$('keysDesk').classList.add('hidden');$('keysTouch').classList.remove('hidden')}
  step(0);loop();
  try{await Promise.all([document.fonts.load('700 40px "Thmanyah Sans"'),document.fonts.load('400 40px "Thmanyah Sans"'),document.fonts.load('700 40px "Thmanyah Serif"')])}catch(_){}
  try{K=await W.load()}catch(e){console.warn(e)}
  TEX.forEach(paint);CAMPUS.refresh();setStatus();
  try{MEM=await buildMemories(C)}catch(e){console.warn('memories',e)}
  $('loading').classList.add('hidden');$('start').classList.remove('hidden');
})();
