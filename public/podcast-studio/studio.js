/*
 * studio.js — استوديو البودكاست ثلاثيّ الأبعاد على مخطط EX.OF.KSA.5024
 * ─────────────────────────────────────────────────────────────────────────
 * المحرّك والمشي والكاميرا والتحكّم منسوخة من /app/3d/world.js كما هي (نفس الإحساس).
 * الجدران من plan.json (مستخرجة من خطوط ملفّ المخطط PDF، ١ نقطة = ٢٫٣٦٦ سم).
 * الأثاث نماذج أمازون ABO مضغوطة في models/، والمعدّات مجسّمات لو-بولي بالكود.
 * المنتجات والروابط والتوزيع كلّها في products.js.
 */
import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {MeshoptDecoder} from 'three/addons/libs/meshopt_decoder.module.js';
import {MapControls} from 'three/addons/controls/MapControls.js';
import {AMAZON,ITEMS,CATS,ROOMS,LAYOUT,EXTRA} from './products.js?v=4';

const FONT='"Thmanyah Sans","Tajawal",system-ui,sans-serif';
const GOLD='#E8C766';
const isTouch=matchMedia('(pointer:coarse)').matches;
if(isTouch)document.documentElement.classList.add('is-touch');
const $=id=>document.getElementById(id);

/* ── المحرّك (من world.js) ── */
const canvas=$('c');
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance',preserveDrawingBuffer:/[?&]debug/.test(location.search)});
renderer.setPixelRatio(Math.min(devicePixelRatio,isTouch?1.5:1.75));
renderer.setSize(innerWidth,innerHeight);
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.1;
const scene=new THREE.Scene();scene.background=new THREE.Color(0x0a0a0a);
const camera=new THREE.PerspectiveCamera(isTouch?75:70,innerWidth/innerHeight,.05,320);
camera.rotation.order='YXZ';

/* ── أدوات البناء (من world.js) ── */
const MATS={};
function mat(color,o={}){const k=color+'|'+Object.entries(o).join();return MATS[k]||(MATS[k]=new THREE.MeshStandardMaterial({color,roughness:.82,metalness:0,flatShading:true,...o}))}
const M=m=>typeof m==='number'?mat(m):m;
function put(mesh,parent=scene,shadow=true){mesh.castShadow=shadow;mesh.receiveShadow=true;parent.add(mesh);return mesh}
function box(w,h,d,m,x=0,y=0,z=0,parent=scene,shadow){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),M(m));o.position.set(x,y+h/2,z);return put(o,parent,shadow)}
function cyl(rt,rb,h,m,x=0,y=0,z=0,parent=scene,seg=10,shadow){const o=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,seg),M(m));o.position.set(x,y+h/2,z);return put(o,parent,shadow)}
function ball(r,m,x=0,y=0,z=0,parent=scene,det=0){const o=new THREE.Mesh(new THREE.IcosahedronGeometry(r,det),M(m));o.position.set(x,y,z);return put(o,parent)}
function grp(x=0,y=0,z=0,ry=0,parent=scene){const g=new THREE.Group();g.position.set(x,y,z);g.rotation.y=ry;parent.add(g);return g}
function plane(w,h,m,parent=scene){const o=new THREE.Mesh(new THREE.PlaneGeometry(w,h),M(m));parent.add(o);return o}
function rnd(seed){let s=seed>>>0||1;return()=>(s=(s*1664525+1013904223)>>>0)/4294967296}
const COL=[];
function block(x,z,hw,hd,top){const c={x0:x-hw,x1:x+hw,z0:z-hd,z1:z+hd,y0:0,top};COL.push(c);return c}
const ACTS=[];
const ZONE=new THREE.MeshBasicMaterial({visible:false});
function act(obj,label,run,zone){if(zone){const [w,h,d,x,y,z]=zone;const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),ZONE);m.position.set(x,y,z);obj.add(m)}obj.traverse(o=>{o.userData.act=ACTS.length});ACTS.push({obj,label,run});return obj}
const TEX=[];
function ctex(w,h,draw,{repeat}={}){const c=document.createElement('canvas');c.width=w;c.height=h;const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;if(repeat){t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(...repeat)}t.userData.draw=draw;paint(t);TEX.push(t);return t}
function paint(t){const c=t.image,g=c.getContext('2d');g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,c.width,c.height);g.direction='rtl';t.userData.draw(g,c.width,c.height);t.needsUpdate=true}
function tmat(t,o={}){return new THREE.MeshStandardMaterial({map:t,roughness:.9,...o})}

/* ══════════════════ المخطط ══════════════════ */
const PLAN=await fetch('plan.json?v=2').then(r=>r.json());
const WH=3.0,[BX0,BZ0,BX1,BZ1]=PLAN.bounds,PW=BX1-BX0,PD=BZ1-BZ0;
const floorTex=ctex(512,512,(g,w,h)=>{g.fillStyle='#c2bfb9';g.fillRect(0,0,w,h);const r=rnd(7);for(let i=0;i<900;i++){g.fillStyle=`rgba(0,0,0,${r()*.035})`;g.fillRect(r()*w,r()*h,3,3)}g.strokeStyle='rgba(60,55,50,.18)';g.lineWidth=2;for(let i=0;i<=4;i++){const p=i*w/4;g.beginPath();g.moveTo(p,0);g.lineTo(p,h);g.moveTo(0,p);g.lineTo(w,p);g.stroke()}},{repeat:[PW/2.4,PD/2.4]});
const floor=new THREE.Mesh(new THREE.PlaneGeometry(PW,PD),tmat(floorTex,{roughness:.75}));floor.rotation.x=-Math.PI/2;floor.position.set(BX0+PW/2,0,BZ0+PD/2);floor.receiveShadow=true;scene.add(floor);
// أرضيّة الاستوديوهات: موكيت غامق يمتصّ الصوت
for(const k of['A','B']){const R=ROOMS[k];const f=plane(R.x1-R.x0,R.z1-R.z0,mat(0x2c2d30,{roughness:1}));f.rotation.x=-Math.PI/2;f.position.set((R.x0+R.x1)/2,.003,(R.z0+R.z1)/2);f.receiveShadow=true}
const ceil=plane(PW,PD,0x232427);ceil.rotation.x=Math.PI/2;ceil.position.set(BX0+PW/2,WH,BZ0+PD/2);
const WALLM=mat(0xe7e3db),SKIRT=mat(0x3a3936),ALU=mat(0x8d9196,{metalness:.6,roughness:.4}),GLASS=new THREE.MeshStandardMaterial({color:0x9fc3d6,transparent:true,opacity:.22,roughness:.1,metalness:.2});
// الجدران موصولة الأطراف (plan.json)، ووزرة غامقة أسفل كلّ جدار
for(const [x0,z0,x1,z1] of PLAN.walls){const w=x1-x0,d=z1-z0,cx=(x0+x1)/2,cz=(z0+z1)/2;box(w,WH,d,WALLM,cx,0,cz);box(w+.02,.1,d+.02,SKIRT,cx,0,cz,scene,false);block(cx,cz,w/2,d/2,WH)}
// الزجاج بإطار ألمنيوم سفليّ وعلويّ
for(const [x0,z0,x1,z1] of PLAN.glass){const w=Math.max(x1-x0,.03),d=Math.max(z1-z0,.03),cx=(x0+x1)/2,cz=(z0+z1)/2;box(w,WH,d,GLASS,cx,0,cz,scene,false);
  box(w+.01,.08,d+.03,ALU,cx,0,cz,scene,false);box(w+.01,.06,d+.03,ALU,cx,2.2,cz,scene,false);block(cx,cz,w/2,d/2,WH)}
// لافتة فوق باب
function sign(text,sub,x,z,ry=0){const t=ctex(512,128,(g,w,h)=>{g.fillStyle='#0e0e0e';g.fillRect(0,0,w,h);g.fillStyle=GOLD;g.fillRect(w-14,18,4,h-36);g.textAlign='right';g.fillStyle='#fafafa';g.font='700 46px '+FONT;g.fillText(text,w-36,62);g.fillStyle='#a1a1aa';g.font='400 26px '+FONT;g.fillText(sub,w-36,102)});
  const m=new THREE.Mesh(new THREE.PlaneGeometry(.9,.225),new THREE.MeshBasicMaterial({map:t,toneMapped:false}));m.position.set(x,2.45,z);m.rotation.y=ry;scene.add(m)}
// الأبواب: مفصّلة على حافّتها، تُفتح تلقائيّاً حين تقترب (من world.js)، بإطار وعتبة علويّة
const DH=2.1,DOORS=[];
const SUB={'استوديو A':'طاولة البودكاست','استوديو B':'جلسة الضيوف','المخزن':'معدّات التصوير','المطبخ':'','المدخل':''};
for(const d of PLAN.doors){
  const X=d.axis==='x',len=d.b-d.a,mid=(d.a+d.b)/2,at=(u,v)=>X?[u,v]:[v,u];
  const [mx,mz]=at(mid,d.c);
  box(X?len+.02:.14,WH-DH,X?.14:len+.02,WALLM,mx,DH,mz);                                   // العتبة فوق الباب
  for(const e of[d.a,d.b]){const [jx,jz]=at(e,d.c);box(X?.06:.16,DH,X?.16:.06,0x2b2b2b,jx,0,jz,scene,false)}
  box(X?len:.16,.06,X?.16:len,0x2b2b2b,mx,DH-.06,mz,scene,false);
  const studio=/استوديو/.test(d.name),col=studio?0x2b2d31:0x8a6a4c;
  const sw=X?[0,d.swing]:[d.swing,0];
  const leaves=d.hinge==='ab'?[[d.a,1,len/2],[d.b,-1,len/2]]:[[d.hinge==='a'?d.a:d.b,d.hinge==='a'?1:-1,len]];
  for(const [h,dir,w] of leaves){
    const [hx,hz]=at(h,d.c),dv=X?[dir,0]:[0,dir];                                          // اتّجاه الضلفة وهي مغلقة
    const ry0=Math.atan2(-dv[1],dv[0]);                                                      // يجعل x المحلّيّ على اتّجاه الضلفة
    const sg=(dv[1]===sw[0]&&-dv[0]===sw[1])?1:-1;                                       // تدوير +٩٠° يوجّهها نحو جهة الفتح؟
    const g=grp(hx,0,hz,ry0);box(w-.04,DH-.08,.045,col,w/2,0,0,g);
    for(const s of[-1,1])ball(.022,ALU,w-.1,1.0,.04*s,g,1);
    DOORS.push({g,ry0,open:sg*Math.PI*.48,a:0,x:mx,z:mz})}
  if(d.name&&studio)sign(d.name,SUB[d.name],mx,d.c+.1);
  else if(d.name==='المخزن')sign('المخزن','معدّات التصوير',mx,d.c+.1);
}
// ألواح إضاءة السقف
const CEIL=new THREE.Group();scene.add(CEIL);CEIL.add(ceil);
{const geo=new THREE.PlaneGeometry(.6,.6),m=new THREE.MeshBasicMaterial({color:0xfff6e6,toneMapped:false});
  for(let x=BX0+1.2;x<BX1-.6;x+=2.4)for(let z=BZ0+1.2;z<BZ1-.6;z+=2.4){const p=new THREE.Mesh(geo,m);p.rotation.x=Math.PI/2;p.position.set(x,WH-.005,z);CEIL.add(p)}}

/* ── الإضاءة ── */
scene.add(new THREE.HemisphereLight(0xfff0dc,0x3b352f,1.25));
const sun=new THREE.DirectionalLight(0xffe7c8,1.1);
sun.position.set(13,WH-.05,1.5);sun.target.position.set(12,0,3);sun.castShadow=true;
sun.shadow.mapSize.set(isTouch?1024:2048,isTouch?1024:2048);Object.assign(sun.shadow.camera,{left:-8,right:8,top:4,bottom:-4,near:.05,far:6});
sun.shadow.bias=-.0005;sun.shadow.normalBias=.025;scene.add(sun,sun.target);
for(const k of['A','B']){const R=ROOMS[k],cx=(R.x0+R.x1)/2;for(const dx of[-1.6,1.6]){const l=new THREE.PointLight(0xffe2c0,2.2,7,1.6);l.position.set(cx+dx,WH-.3,2.2);scene.add(l)}}
for(const [x,z] of[[9.9,8],[9.9,13],[3,8],[17,8]]){const l=new THREE.PointLight(0xffffff,2,10,1.4);l.position.set(x,WH-.2,z);scene.add(l)}

/* ══════════════════ المعدّات (لو-بولي بالكود — أسلوب world.js) ══════════════════ */
const BLK=0x161616,STEEL=mat(0xc9ccd1,{metalness:.75,roughness:.35});
const glow=c=>new THREE.MeshBasicMaterial({color:c,toneMapped:false});
function tripod(x,z,h,ry=0,parent=scene){const g=grp(x,0,z,ry,parent);
  for(let i=0;i<3;i++){const a=i*Math.PI*2/3;const l=cyl(.012,.01,h*.62,0x1a1a1a,Math.sin(a)*.2,0,Math.cos(a)*.2,g,5);l.rotation.set(-Math.cos(a)*.34,0,Math.sin(a)*.34)}
  cyl(.016,.016,h-h*.55,0x1a1a1a,0,h*.55,0,g,6);return g}
// SM7B: جسم + شبك، يتّجه نحو ‎-z المحلّيّ
function sm7b(g,x,y,z){const m=cyl(.034,.034,.17,mat(0x2a2a2a,{metalness:.5,roughness:.4}),x,y,z,g,10);m.rotation.x=Math.PI/2-.25;
  const gr=cyl(.036,.036,.09,mat(0x777b80,{metalness:.7,roughness:.4}),x,y+.02,z-.1,g,10);gr.rotation.x=Math.PI/2-.25}
const BUILD={
  rodecaster(g){box(.38,.045,.24,BLK,0,0,0,g).rotation.x=-.06;
    [0xff3b6b,0xff8a1f,0x2ee66d,0x26c6ff,0xffd22e,0xff4fd8,0x6c7bff,0x2ee6c8].forEach((c,i)=>{const p=new THREE.Mesh(new THREE.BoxGeometry(.035,.012,.035),glow(c));p.position.set(-.14+(i%4)*.045,.05,-.04+Math.floor(i/4)*.045);g.add(p)});
    const s=new THREE.Mesh(new THREE.BoxGeometry(.09,.01,.06),glow(0xd8c79a));s.position.set(.1,.052,-.03);g.add(s);
    for(let i=0;i<4;i++)box(.012,.012,.07,0x9a9a9a,.04+i*.03,.045,.06,g)},
  psa1(g){box(.06,.08,.06,BLK,0,-.08,0,g);cyl(.012,.012,.45,BLK,0,0,0,g,6);
    const a=new THREE.Mesh(new THREE.CylinderGeometry(.011,.011,.33,6),M(BLK));a.position.set(0,.5,-.15);a.rotation.x=-1.25;put(a,g);sm7b(g,0,.47,-.34)},
  floorstand(g){tripod(0,0,1.1,0,g);const a=cyl(.011,.011,.8,BLK,0,0,0,g,6);a.position.set(0,1.2,-.25);a.rotation.x=-1.1;sm7b(g,0,1.02,-.6)},
  headphones(g){const h=new THREE.Mesh(new THREE.TorusGeometry(.08,.018,6,14,Math.PI),mat(0x111111));h.rotation.x=-Math.PI/2;put(h,g);
    for(const s of[-1,1])cyl(.045,.045,.03,0x1b1b1b,.08*s,0,0,g,12)},
  tube(g){box(.18,.03,.18,BLK,0,0,0,g);cyl(.012,.012,.25,BLK,0,.03,0,g,6);const t=new THREE.Mesh(new THREE.CylinderGeometry(.025,.025,1.2,10),glow(0x7a5cff));t.position.y=.9;g.add(t);
    const l=new THREE.PointLight(0x7a5cff,1.2,3,1.6);l.position.y=.9;g.add(l)},
  keylight(g){const t=tripod(0,0,1.75,0,g);t.children.forEach(c=>c.material=STEEL);
    const hd=grp(0,1.85,0,0,g);hd.rotation.x=.25;box(.16,.16,.2,BLK,0,-.08,-.12,hd);
    const dome=new THREE.Mesh(new THREE.CylinderGeometry(.42,.12,.45,16,1,true),mat(0x101010,{side:THREE.DoubleSide}));dome.rotation.x=Math.PI/2;dome.position.z=.2;put(dome,hd);
    const face=new THREE.Mesh(new THREE.CircleGeometry(.41,16),glow(0xfff6e8));face.position.z=.425;hd.add(face);
    const l=new THREE.PointLight(0xfff3e0,3.2,6,1.5);l.position.set(0,0,.6);hd.add(l)},
  cam(g,big){tripod(0,0,1.35,0,g);const hd=grp(0,1.38,0,0,g);box(big?.14:.12,big?.1:.075,.09,BLK,0,0,0,hd);
    const ln=cyl(.035,.035,.1,0x141414,0,0,0,hd,12);ln.rotation.x=Math.PI/2;ln.position.set(0,big?.05:.04,.1);
    if(big){box(.06,.04,.04,0x2a2a2a,0,.1,-.02,hd);const r=new THREE.Mesh(new THREE.SphereGeometry(.008,6,4),glow(0xff2a2a));r.position.set(.06,.08,.04);hd.add(r)}},
  fx30(g){BUILD.cam(g,true)},zve10(g){BUILD.cam(g,false)},
  atem(g){box(.5,.72,.4,0x2a2b2e,0,0,0,g);box(.32,.04,.12,BLK,0,.72,.05,g);
    for(let i=0;i<4;i++){const b=new THREE.Mesh(new THREE.BoxGeometry(.03,.01,.03),glow(i?0x2ee66d:0xff3b3b));b.position.set(-.1+i*.05,.765,.08);g.add(b)}
    const sc=box(.42,.26,.02,BLK,0,.78,-.1,g);sc.rotation.x=-.2;const s=new THREE.Mesh(new THREE.PlaneGeometry(.38,.22),glow(0x203048));s.position.set(0,.92,-.085);s.rotation.x=-.2;g.add(s)},
  panels(g){const C=[0x2f3237,0x3a3d42,0x2f3237];for(let i=0;i<3;i++)box(.6,1.2,.05,C[i],(i-1)*.65,-.6,.025,g)},
  case(g){box(.6,.26,.42,0x1d1e20,0,0,0,g);for(const x of[-.2,.2])box(.06,.27,.43,0x2a2b2e,x,0,0,g);box(.16,.03,.03,0x111,0,.27,0,g)},
  greenscreen(g){cyl(.11,.11,1.25,0x1f1f1f,0,0,0,g,12);cyl(.115,.115,.04,0x2ee66d,0,1.2,0,g,12)},
  // رفّ مستودع: قوائم زرقاء مثقّبة، عوارض وأرفف برتقاليّة، تقاطع جانبيّ — وعليه صناديق المعدّات
  rack(g,L=1.5){const BL=mat(0x1f5fbf,{metalness:.35,roughness:.5}),OR=mat(0xff5a1f,{metalness:.3,roughness:.5}),D=.6,Hh=2.0;
    for(const x of[-L/2,L/2])for(const z of[-D/2,D/2])box(.055,Hh,.04,BL,x,0,z,g);
    for(const x of[-L/2,L/2]){for(const y of[.12,1.0,1.85])box(.03,.03,D,BL,x,y,0,g,false);
      for(const [y0,s] of[[.15,1],[1.0,-1]]){const b=new THREE.Mesh(new THREE.BoxGeometry(.025,.92,.025),BL);b.position.set(x,y0+.43,0);b.rotation.x=s*.55;put(b,g,false)}}
    for(const y of[.1,.68,1.26,1.86]){for(const z of[-D/2,D/2])box(L+.03,.08,.05,OR,0,y,z,g);box(L-.04,.015,D-.04,OR,0,y+.065,0,g)}
    const r=rnd(Math.round(L*10)+g.id),C=[0xc9a77c,0x1d1e20,0xb8946a,0x2a2b2e];
    for(const y of[.18,.76,1.34,1.94])for(let x=-L/2+.12;x<L/2-.2;){const w=.18+r()*.28,h=.15+r()*.3;if(r()<.8)box(w,h,.3+r()*.2,C[Math.floor(r()*4)],x+w/2,y,0,g);x+=w+.05}},
  rack100(g){BUILD.rack(g,1.0)},
  // ── المكاتب والقاعة ──
  trainingtable(g){box(1.48,.03,.68,0xf1efea,0,.71,0,g);box(1.3,.3,.02,0xd9d6cf,0,.38,-.3,g,false);
    for(const x of[-.68,.68])for(const z of[-.28,.28])box(.035,.71,.035,STEEL,x,0,z,g,false)},
  ovaltable(g){const t=cyl(.5,.5,.045,0xf1efea,0,.7,0,g,32);t.scale.set(4.3,1,1.35);
    for(const x of[-1.1,1.1]){cyl(.06,.06,.7,STEEL,x,0,0,g,8);box(.7,.03,.5,0x2b2b2b,x,0,0,g,false)}},
  receptiondesk(g){box(1.6,.74,.6,0xe9e6e0,0,0,0,g);box(1.72,1.08,.06,0x6b4a33,0,0,.33,g);box(1.76,.035,.3,0xf1efea,0,1.08,.28,g);
    const l=new THREE.Mesh(new THREE.BoxGeometry(1.6,.015,.02),glow(0xffe9c4));l.position.set(0,.06,.37);g.add(l)},
  plant(g){cyl(.2,.15,.42,0x2a2a2a,0,0,0,g,10);const r=rnd(5);
    for(let i=0;i<9;i++){const a=r()*7,d=r()*.18;ball(.13+r()*.1,i%2?0x2f6b3a:0x3d7f45,Math.cos(a)*d,.6+r()*.9,Math.sin(a)*d,g,0)}
    cyl(.015,.02,1.2,0x4a3a28,0,.4,0,g,5)},
};
// تجهيزات ثابتة (بلا روابط): دورات المياه والمغاسل والمطبخ
const WHITE=mat(0xf4f4f2,{roughness:.35});
for(const x of[.59,1.56,2.54,3.51]){const g=grp(x,0,.42);box(.38,.4,.5,WHITE,0,0,0,g);box(.4,.06,.52,WHITE,0,.4,0,g);box(.36,.4,.16,WHITE,0,.4,-.2,g)}
for(const [x,z,ry] of[[.42,2.75,Math.PI/2],[3.62,2.75,-Math.PI/2]]){const g=grp(x,0,z,ry);box(.5,.82,.45,0x8a6a4c,0,0,0,g);box(.54,.04,.48,WHITE,0,.82,0,g);cyl(.16,.12,.06,WHITE,0,.8,0,g,14)}
{const g=grp(2.62,0,15.5,Math.PI/2);box(1.1,.88,.6,0x8a6a4c,-.3,0,0,g);box(1.14,.04,.64,0x2b2b2b,-.3,.88,0,g);box(1.1,.7,.35,0x8a6a4c,-.3,1.5,-.12,g);
  box(.65,1.85,.62,0xd9d9d6,.55,0,0,g);block(2.62,15.5,.32,.9,1.9)}

/* ══════════════════ المنتجات ══════════════════ */
const link=it=>it.url||`https://${AMAZON.store}/s?k=${encodeURIComponent(it.q||it.en)}${AMAZON.tag?'&tag='+encodeURIComponent(AMAZON.tag):''}`;
const imgURL=it=>!it.img?'':/^https?:/.test(it.img)?it.img:`https://m.media-amazon.com/images/I/${encodeURIComponent(it.img)}._AC_SL500_.jpg`;
const roomOf=(x,z)=>{for(const k in ROOMS){const R=ROOMS[k];if(x>=R.x0&&x<=R.x1&&z>=R.z0&&z<=R.z1)return R.name}return 'المكاتب والقاعة'};
const loader=new GLTFLoader();loader.setMeshoptDecoder(MeshoptDecoder);
const GLB={};
const loadGLB=id=>GLB[id]||(GLB[id]=loader.loadAsync(`models/${id}.glb?v=2`).then(g=>{g.scene.traverse(o=>{if(o.isMesh){o.castShadow=!ITEMS[id].flat;o.receiveShadow=true}});return g.scene}));
const SAVE='podStudioLayout:v1';
let saved=null;try{saved=JSON.parse(localStorage.getItem(SAVE)||'null')}catch(_){}
const PLACED=[];
function colFor(p){if(p.it.flat||p.it.wall||p.y>.05)return;const b=new THREE.Box3().setFromObject(p.obj);if(!p.col){p.col={y0:0};COL.push(p.col)}Object.assign(p.col,{x0:b.min.x,x1:b.max.x,z0:b.min.z,z1:b.max.z,top:b.max.y})}
async function place(row,i){
  const [key,x0,z0,ry0,y=0]=row,it=ITEMS[key];const s=saved&&saved[i];const [x,z,ry]=s||[x0,z0,ry0];
  const g=grp(x,y,z,ry);const p={i,key,it,obj:g,y,home:[x0,z0,ry0]};
  if(it.model)g.add((await loadGLB(key)).clone());else BUILD[key](g);
  if(it.flat)g.position.y=.006;
  colFor(p);PLACED.push(p);
  act(g,it.name,()=>openCard(p),it.flat?[1.2,.08,1.2,0,.04,0]:key==='headphones'||key==='rodecaster'?[.4,.15,.3,0,.05,0]:null);ACTS[ACTS.length-1].p=p;
}

/* ══════════════════ اللاعب (من world.js) ══════════════════ */
const P={x:7.6,y:0,z:6.4,vx:0,vz:0,vy:0,ground:true,yaw:-.45,pitch:-.06};
const R=.24,STEP=.36,EYE=1.62,G=19,JUMP=5.6;
const keys=new Set();let playing=false,sysOpen=false;
function hits(x,z,y){for(const c of COL){if(c.top<=y+STEP||c.y0>=y+1.75)continue;if(x+R>c.x0&&x-R<c.x1&&z+R>c.z0&&z-R<c.z1)return true}return false}
function groundAt(x,z,y){let gnd=0;const r=R*.55;for(const c of COL){if(c.top>y+STEP)continue;if(x+r>c.x0&&x-r<c.x1&&z+r>c.z0&&z-r<c.z1)gnd=Math.max(gnd,c.top)}return gnd}
function jump(){if(P.ground){P.vy=JUMP;P.ground=false}}
const joy={id:null,x0:0,y0:0,dx:0,dy:0},look={id:null,x:0,y:0};
let bob=0,phase=0,roll=0,fovK=0,landK=0;const FOV0=camera.fov;
function step(dt){
  let f=0,s=0;
  if(keys.has('KeyW')||keys.has('ArrowUp'))f++;if(keys.has('KeyS')||keys.has('ArrowDown'))f--;
  if(keys.has('KeyD')||keys.has('ArrowRight'))s++;if(keys.has('KeyA')||keys.has('ArrowLeft'))s--;
  if(joy.id!==null){f-=joy.dy;s+=joy.dx}
  const len=Math.hypot(f,s);if(len>1){f/=len;s/=len}
  const run=keys.has('ShiftLeft')||keys.has('ShiftRight')||(joy.id!==null&&Math.hypot(joy.dx,joy.dy)>.92),sp=run?9.5:3.6;
  const sn=Math.sin(P.yaw),cs=Math.cos(P.yaw);
  const tx=(-sn*f+cs*s)*sp,tz=(-cs*f-sn*s)*sp,k=1-Math.exp(-dt*(P.ground?12:4));
  P.vx+=(tx-P.vx)*k;P.vz+=(tz-P.vz)*k;
  let nx=P.x+P.vx*dt;if(!hits(nx,P.z,P.y))P.x=nx;else P.vx=0;
  let nz=P.z+P.vz*dt;if(!hits(P.x,nz,P.y))P.z=nz;else P.vz=0;
  P.x=Math.max(BX0+.3,Math.min(BX1-.3,P.x));P.z=Math.max(BZ0+.3,Math.min(BZ1-.3,P.z));
  P.vy-=G*dt;let ny=P.y+P.vy*dt;const gnd=groundAt(P.x,P.z,P.y);
  if(ny<=gnd){if(!P.ground&&P.vy<-3)landK=Math.min(1,-P.vy/12);ny=gnd;P.vy=0;P.ground=true}else P.ground=false;
  if(ny+1.78>WH){ny=WH-1.78;if(P.vy>0)P.vy=0}
  P.y=ny;
  const moving=Math.hypot(P.vx,P.vz),spk=Math.min(1,moving/9.5),sprint=run&&moving>5;
  if(P.ground)phase+=dt*(5.5+moving*1.05);
  const amp=P.ground?Math.min(1,moving/3.6):0;
  const bobY=Math.abs(Math.sin(phase))*(.03+.05*spk)*amp-(.015+.03*spk)*amp;
  const swayX=Math.sin(phase)*(.018+.03*spk)*amp;
  const strafe=(cs*P.vx-sn*P.vz)/9.5;
  roll+=((-strafe*.06)+Math.sin(phase)*.012*amp*(sprint?1.6:1)-roll)*Math.min(1,dt*8);
  fovK+=((sprint?1:0)-fovK)*Math.min(1,dt*(sprint?4:6));
  landK=Math.max(0,landK-dt*3.5);bob=-Math.sin(Math.min(1,landK)*Math.PI)*.14*landK;
  camera.position.set(P.x+cs*swayX,P.y+EYE+bobY+bob,P.z-sn*swayX);
  camera.rotation.set(P.pitch-bob*.6-(sprint?.03*Math.abs(Math.sin(phase*.5)):0),P.yaw+Math.sin(phase*.5)*.004*amp,roll);
  const fv=FOV0+fovK*12;if(Math.abs(camera.fov-fv)>.01){camera.fov=fv;camera.updateProjectionMatrix()}
}

/* ── التصويب على الأشياء (من world.js) ── */
const ray=new THREE.Raycaster();ray.far=2.6;const center=new THREE.Vector2(0,0);
const actObjs=()=>ACTS.map(a=>a.obj);let target=-1;
function aim(){if(MOVE)return;ray.setFromCamera(center,camera);const hit=ray.intersectObjects(actObjs(),true)[0];const t=hit?hit.object.userData.act:-1;
  if(t===target)return;target=t??-1;
  $('cross').classList.toggle('on',target>=0);
  const h=$('hint');if(target>=0&&!isTouch){h.innerHTML='<kbd>E</kbd>'+ACTS[target].label+'<kbd class="q">Q</kbd>انقل';h.classList.remove('hidden')}else h.classList.add('hidden');
  const ab=$('actBtn');ab.textContent=target>=0?ACTS[target].label:'افتح';ab.classList.toggle('hidden',target<0)}
function interact(){if(MOVE)return drop();if(target>=0)ACTS[target].run()}

/* ── اللوحات (من world.js) ── */
let dragLook=false,dragMoved=0;
function lock(){try{const p=canvas.requestPointerLock();if(p&&p.catch)p.catch(noLock)}catch(_){noLock()}}
function noLock(){if(sysOpen)return;dragLook=true;playing=true;$('start').classList.add('hidden')}
const sys=$('sys');
function pause(title,mini){
  sysOpen=true;playing=false;keys.clear();joy.id=look.id=null;if(document.pointerLockElement)document.exitPointerLock();
  $('sysTitle').textContent=title;sys.classList.remove('hidden');$('start').classList.add('hidden');$('hint').classList.add('hidden');sys.classList.toggle('mini',!!mini);
}
function openPanel(title,html,onClick,mini){pause(title,mini);const b=$('panelBody');b.innerHTML=html;b.scrollTop=0;b.onclick=onClick||null}
function closeSys(){sys.classList.add('hidden');sysOpen=false;$('panelBody').onclick=null;if(TOP)return;if(isTouch||dragLook)playing=true;else lock()}
$('sysClose').onclick=closeSys;

/* ── بطاقة المنتج ── */
const ICON={audio:'🎙️',video:'🎥',light:'💡',furniture:'🛋️',decor:'🪴',storage:'📦'};
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function media(it){const u=imgURL(it);return u?`<img src="${esc(u)}" alt="" loading="lazy">`:`<div class="noimg">${ICON[it.cat]||'🛒'}</div>`}
function openCard(p){const it=p.it,n=qty()[p.key]||1;
  openPanel(it.name,`<div class="mp">${media(it)}<div><b>${esc(it.name)}</b><small>${CATS[it.cat]} · ${esc(roomOf(p.obj.position.x,p.obj.position.z))} · ×${n}</small></div><button class="mx" data-a="x">✕</button></div>
    <div class="btns"><a class="buy" href="${esc(link(it))}" target="_blank" rel="sponsored noopener">${esc(it.shop||'أمازون')} ↗</a><button data-a="move">انقل <kbd>Q</kbd></button><button data-a="rot">دوّر</button><button data-a="home">مكانها الأصليّ</button></div>`,
    e=>{const a=e.target.closest('[data-a]')?.dataset.a;if(a==='x')closeSys();if(a==='rot'){p.obj.rotation.y+=Math.PI/4;colFor(p);persist()}if(a==='move'){if(TOP){closeSys();toast(isTouch?'اسحب القطعة بإصبعك لمكانها الجديد':'اسحب القطعة بالماوس لمكانها الجديد')}else{startMove(p);closeSys()}}if(a==='home'){Object.assign(p.obj.position,{x:p.home[0],z:p.home[1]});p.obj.rotation.y=p.home[2];colFor(p);persist();closeSys()}},true)}

/* ── قائمة المشتريات ── */
function qty(){const q={};for(const [k] of LAYOUT)q[k]=(q[k]||0)+1;for(const k in EXTRA)q[k]=(q[k]||0)+EXTRA[k];return q}
function openList(){const q=qty();let h=`<p class="lead">كلّ قطعة في الاستوديو برابطها — اضغط الاسم لتفتحه في أمازون. ${AMAZON.tag||!/[?&]debug/.test(location.search)?'':'<b class="warn">(لم يُضبط معرّف المسوّق بعد — products.js)</b>'}</p>`;
  for(const c in CATS){const ks=Object.keys(ITEMS).filter(k=>ITEMS[k].cat===c&&q[k]);if(!ks.length)continue;
    h+=`<h3>${CATS[c]}</h3><div class="list">`+ks.map(k=>{const it=ITEMS[k];return `<a href="${esc(link(it))}" target="_blank" rel="sponsored noopener">${media(it)}<span><b>${esc(it.name)}</b><small>${esc(it.en)}</small></span><em>×${q[k]}</em></a>`}).join('')+'</div>'}
  h+=`<div class="btns"><button data-a="copy">نسخ الترتيب الحاليّ</button><button data-a="reset">إرجاع الترتيب الأصليّ</button></div>
  <p class="credit">النماذج ثلاثيّة الأبعاد للأثاث: Amazon.com — Amazon Berkeley Objects (CC BY 4.0). المخطط: EXPENDEX ARCH.</p>`;
  openPanel('قائمة المشتريات',h,e=>{const a=e.target.dataset.a;
    if(a==='copy'){const rows=PLACED.slice().sort((a,b)=>a.i-b.i).map(p=>[p.key,+p.obj.position.x.toFixed(2),+p.obj.position.z.toFixed(2),+p.obj.rotation.y.toFixed(2),...(p.y?[p.y]:[])]);navigator.clipboard.writeText(JSON.stringify(rows)).then(()=>toast('نُسخ الترتيب — أرسله ليُعتمد'),()=>toast('تعذّر النسخ'))}
    if(a==='reset'){try{localStorage.removeItem(SAVE)}catch(_){}for(const p of PLACED){Object.assign(p.obj.position,{x:p.home[0],z:p.home[1]});p.obj.rotation.y=p.home[2];colFor(p)}toast('رجع كلّ شيء لمكانه')}})}
$('listBtn').onclick=()=>{if(!sysOpen)openList()};

/* ── نقل القطع ── */
let MOVE=null;const FLOOR=new THREE.Plane(new THREE.Vector3(0,1,0),0),hitP=new THREE.Vector3();
function startMove(p){MOVE={p,from:[p.obj.position.x,p.obj.position.z,p.obj.rotation.y]};if(p.col)p.col.top=-1;
  $('cross').classList.add('on');const h=$('hint');h.innerHTML=isTouch?'حرّك النظر لتحديد المكان':'<kbd>نقرة</kbd>ثبّت · <kbd>R</kbd>دوّر · <kbd>Esc</kbd>إلغاء';h.classList.remove('hidden');
  $('actBtn').textContent='ثبّت هنا';$('actBtn').classList.remove('hidden');$('rotBtn').classList.remove('hidden')}
function moveTick(){FLOOR.constant=-MOVE.p.y;ray.setFromCamera(center,camera);ray.far=6;const ok=ray.ray.intersectPlane(FLOOR,hitP);ray.far=2.6;
  if(!ok)return;const dx=hitP.x-P.x,dz=hitP.z-P.z,d=Math.hypot(dx,dz),m=Math.min(d,4)/Math.max(d,1e-3);
  MOVE.p.obj.position.x=Math.round((P.x+dx*m)*20)/20;MOVE.p.obj.position.z=Math.round((P.z+dz*m)*20)/20}
function rotate(){if(MOVE)MOVE.p.obj.rotation.y+=Math.PI/8}
function endMove(){$('hint').classList.add('hidden');$('rotBtn').classList.add('hidden');$('actBtn').classList.add('hidden');target=-1;MOVE=null}
function drop(){const p=MOVE.p;colFor(p);if(p.col)p.col.top=Math.max(p.col.top,0);endMove();persist();toast('ثُبّتت القطعة')}
function cancelMove(){const p=MOVE.p;p.obj.position.x=MOVE.from[0];p.obj.position.z=MOVE.from[1];p.obj.rotation.y=MOVE.from[2];colFor(p);endMove()}
function persist(){try{const a=[];for(const p of PLACED)a[p.i]=[p.obj.position.x,p.obj.position.z,p.obj.rotation.y];localStorage.setItem(SAVE,JSON.stringify(a))}catch(_){}}
$('rotBtn').addEventListener('click',rotate);

/* ── الخريطة ── */
const SPOTS=[{name:'الاستقبال',desc:'المدخل ومكتب الاستقبال',x:2.6,z:7.6,yaw:-1.9},{name:'القاعة الكبرى',desc:'طاولات التدريب على شكل U',x:10.1,z:9.6,yaw:-1.6},{name:'غرفة الاجتماعات',desc:'طاولة لـ١٤ شخصاً',x:12.35,z:17.6,yaw:Math.PI},{name:'القاعة',desc:'أمام بابَي الاستوديوهين',x:7.6,z:6.4,yaw:-.45},{name:ROOMS.A.name,desc:'ثلاثة متحدّثين، ٣ كاميرات',x:9.93,z:4.2,yaw:0},{name:ROOMS.B.name,desc:'كنبة وكرسيّان، ٤ مايكات',x:16.61,z:4.1,yaw:0},{name:ROOMS.S.name,desc:'رفوف وخزانة وحقائب',x:5.6,z:3.2,yaw:.6}];
function teleport(d){Object.assign(P,{x:d.x,z:d.z,y:0,vx:0,vz:0,vy:0,yaw:d.yaw,pitch:-.05});if(TOP){closeSys();setTop(false)}else closeSys()}
function openMap(){openPanel('الخريطة',`<div class="map">${SPOTS.map((d,i)=>`<button data-i="${i}"><b>${d.name}</b><span>${d.desc}</span></button>`).join('')}</div>`,e=>{const b=e.target.closest('button[data-i]');if(b)teleport(SPOTS[+b.dataset.i])})}
$('mapBtn').onclick=()=>{if(!sysOpen)openMap()};

/* ── التحكّم (من world.js) ── */
addEventListener('keydown',e=>{
  if(sysOpen){if(e.key==='Escape')closeSys();return}
  if(MOVE&&e.key==='Escape'){cancelMove();return}
  if(e.code==='KeyV'){keys.clear();setTop(!TOP);return}
  if(e.code==='KeyM'){keys.clear();openMap();return}
  if(e.code==='KeyL'){keys.clear();openList();return}
  if(!playing)return;
  if(dragLook&&e.key==='Escape'){playing=false;keys.clear();$('start').classList.remove('hidden');return}
  keys.add(e.code);
  if(e.code==='Space'){jump();e.preventDefault()}
  if(e.code==='KeyE'||e.code==='Enter')interact();
  if(e.code==='KeyR')rotate();
  if(e.code==='KeyQ'&&!MOVE&&target>=0&&ACTS[target].p)startMove(ACTS[target].p);
});
addEventListener('keyup',e=>keys.delete(e.code));
addEventListener('blur',()=>keys.clear());
addEventListener('wheel',e=>{if(MOVE){MOVE.p.obj.rotation.y+=Math.sign(e.deltaY)*Math.PI/16}},{passive:true});
$('enter').onclick=()=>{if(isTouch){$('start').classList.add('hidden');playing=true}else lock()};
document.addEventListener('pointerlockchange',()=>{const on=document.pointerLockElement===canvas;if(on)dragLook=false;if(dragLook)return;playing=on;if(!on)keys.clear();$('start').classList.toggle('hidden',on||sysOpen)});
canvas.addEventListener('mousedown',()=>{if(TOP||isTouch||sysOpen)return;dragMoved=0;if(!playing)lock();else if(!dragLook)interact()});
addEventListener('mouseup',()=>{if(TOP||isTouch)return;if(dragLook&&playing&&dragMoved<5)interact()});
document.addEventListener('mousemove',e=>{if(!playing||isTouch)return;if(dragLook){if(!(e.buttons&1))return;dragMoved+=Math.abs(e.movementX)+Math.abs(e.movementY)}P.yaw-=e.movementX*.0022;P.pitch=Math.max(-1.45,Math.min(1.45,P.pitch-e.movementY*.0022))});
const knob=$('joy').firstElementChild;
canvas.addEventListener('touchstart',e=>{if(TOP)return;e.preventDefault();if(!playing)return;for(const t of e.changedTouches){
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

/* ── المنظور العلويّ: ثلاثيّ الأبعاد بلا سقف، سحب/قرص/تدوير بالإصبعين أو الماوس ── */
let TOP=false;
const ctl=new MapControls(camera,canvas);ctl.enabled=false;ctl.enableDamping=true;ctl.dampingFactor=.12;ctl.screenSpacePanning=false;
ctl.minDistance=3;ctl.maxDistance=40;ctl.maxPolarAngle=1.3;
function setTop(on){TOP=on;if(MOVE)cancelMove();document.documentElement.classList.toggle('top',on);CEIL.visible=!on;$('viewBtn').classList.toggle('on',on);$('viewLbl').textContent=on?'امشِ':'من فوق';
  if(on){playing=false;keys.clear();joy.id=look.id=null;if(document.pointerLockElement)document.exitPointerLock();$('start').classList.add('hidden');$('hint').classList.add('hidden');
    camera.fov=50;camera.updateProjectionMatrix();ctl.target.set(BX0+PW/2,0,BZ0+PD/2);camera.position.set(BX0+PW/2,25,BZ0+PD/2+15);ctl.enabled=true;ctl.update()}
  else{ctl.enabled=false;camera.fov=FOV0;camera.updateProjectionMatrix();camera.rotation.order='YXZ';if(isTouch)playing=true;else $('start').classList.remove('hidden')}}
$('viewBtn').onclick=()=>{if(!sysOpen)setTop(!TOP)};$('enterTop').onclick=()=>setTop(true);
// من فوق: انقر/المس القطعة لبطاقتها، واسحبها لتنقلها
const ptr=new THREE.Vector2();let drag=null;
function pick(e){const r=canvas.getBoundingClientRect();ptr.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(ptr,camera);ray.far=200;const h=ray.intersectObjects(actObjs(),true)[0];ray.far=2.6;return h}
canvas.addEventListener('pointerdown',e=>{if(!TOP||sysOpen||!e.isPrimary)return;const h=pick(e),a=h&&ACTS[h.object.userData.act];if(!a||!a.p)return;
  e.stopImmediatePropagation();drag={p:a.p,x:e.clientX,y:e.clientY,moved:false};ctl.enabled=false},{capture:true});
addEventListener('pointermove',e=>{if(!drag)return;if(!drag.moved&&Math.hypot(e.clientX-drag.x,e.clientY-drag.y)<7)return;
  if(!drag.moved){drag.moved=true;if(drag.p.col)drag.p.col.top=-1}
  pick(e);FLOOR.constant=-drag.p.y;if(ray.ray.intersectPlane(FLOOR,hitP)){drag.p.obj.position.x=Math.round(hitP.x*20)/20;drag.p.obj.position.z=Math.round(hitP.z*20)/20}});
addEventListener('pointerup',()=>{if(!drag)return;const d=drag;drag=null;ctl.enabled=TOP;if(d.moved){colFor(d.p);persist();toast('ثُبّتت القطعة')}else openCard(d.p)});

/* ── الحلقة ── */
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
const clk=new THREE.Clock();
function loop(){requestAnimationFrame(loop);const dt=Math.min(clk.getDelta(),.05);
  if(TOP)ctl.update();else if(playing)step(dt);else camera.position.set(P.x,P.y+EYE,P.z),camera.rotation.set(P.pitch,P.yaw,0);
  if(playing&&!TOP){if(MOVE)moveTick();else aim()}
  for(const d of DOORS){const near=Math.hypot(P.x-d.x,P.z-d.z)<1.9;d.a+=((near?d.open:0)-d.a)*Math.min(1,dt*5);d.g.rotation.y=d.ry0+d.a}
  renderer.render(scene,camera)}

if(/[?&]debug/.test(location.search))window.PSDBG={P,camera,scene,ACTS,COL,PLACED,openCard,startMove,drop,aim,DOORS,get target(){return target},get moving(){return MOVE},setPlaying:v=>{playing=v;$('start').classList.add('hidden')},view:(x,z,yaw,pitch=-.08,y=0)=>{Object.assign(P,{x,z,yaw,pitch,y});camera.position.set(x,y+EYE,z);camera.rotation.set(pitch,yaw,0);renderer.render(scene,camera);return renderer.domElement.toDataURL('image/jpeg',.8)}};

/* ── الإقلاع ── */
if(isTouch){$('keysDesk').classList.add('hidden');$('keysTouch').classList.remove('hidden')}
step(0);loop();
try{await document.fonts.load('700 40px "Thmanyah Sans"')}catch(_){}
TEX.forEach(paint);
await Promise.all(LAYOUT.map((r,i)=>place(r,i).catch(e=>console.warn('place',r[0],e))));
$('loading').classList.add('hidden');
// ?shot=x,z,yaw,pitch[,y] لقطة نظيفة من الداخل، أو ?shot=top,cx,cy,cz,tx,tz من فوق — للصور والعروض (مثل world.js)
const SHOT=new URLSearchParams(location.search).get('shot');
if(SHOT){document.documentElement.classList.add('shot');const v=SHOT.split(',');
  if(v[0]==='top'){setTop(true);scene.background=new THREE.Color(0xf2f4f8);const [cx,cy,cz,tx,tz]=v.slice(1).map(Number);if(!isNaN(cx)){camera.position.set(cx,cy,cz);ctl.target.set(tx,0,tz)}ctl.enableDamping=false;ctl.update()}
  else{const [x,z,yaw,pitch,y]=v.map(Number);Object.assign(P,{x,z,yaw,pitch:pitch||0,y:y||0});if(v[5])camera.fov=+v[5],camera.updateProjectionMatrix()}
  window.SHOT_READY=true}
else $('start').classList.remove('hidden');
