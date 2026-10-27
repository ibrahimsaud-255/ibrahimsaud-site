/*
 * arena.js — «ساحة الرماية»: لعب فقط، لا يلمس النظام ولا بياناته
 * ─────────────────────────────────────────────────────────────────────────
 * سلاحان بيد اللاعب (1 مسدس · 2 كلاشنكوف · R تعبئة · Q إخفاء)، وفي الساحة جنوب المجلس:
 * روبوتات لو-بولي تقترب منك وتتفكّك قطعاً حين تسقط ثمّ تعود، وأهداف تنقلب، وصناديق
 * وبراميل وقناني تتكسّر — وبعض الصناديق متناثرة في الخريطة. الافتراضيّ: بلا سلاح.
 */
export function buildArena(C){
const {THREE,scene,camera,mat,box,cyl,grp,ctex,act,toast,COL,block,FONT,SERIF,GOLD}=C;
const sfx=C.sfx,glow=c=>new THREE.MeshBasicMaterial({color:c,toneMapped:false});
const AR={x0:7,x1:29,z0:26.5,z1:40,cx:18,cz:33}; // حدود الساحة
const HIT=[];       // شبكات تُصاب: mesh.userData.hit = {kind, ref, head}
let score=0,kills=0;

/* ══════════ الأسلحة (نموذج أمام الكاميرا) ══════════ */
scene.add(camera);
const VM=new THREE.Group();VM.scale.setScalar(1.25);camera.add(VM);
const black=mat(0x1b1b1b,{roughness:.5,metalness:.4}),wood=mat(0x8a4a22,{roughness:.8}),steel=mat(0x5b6066,{roughness:.4,metalness:.7});
const B=(w,h,d,m,x,y,z,p,rx=0)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.rotation.x=rx;p.add(o);return o};
// مسدس
const pistol=new THREE.Group();B(.04,.05,.2,black,0,.03,-.04,pistol);B(.034,.1,.05,black,0,-.04,.03,pistol,-.25);B(.012,.012,.03,steel,0,.035,-.155,pistol);
// كلاشنكوف: أخمص وواقٍ خشبيّان، جسم أسود، مخزن مقوّس، سبطانة
const ak=new THREE.Group();B(.05,.07,.3,black,0,0,-.05,ak);B(.045,.06,.2,wood,0,-.005,-.29,ak);B(.045,.08,.2,wood,0,-.03,.2,ak,.18);
B(.035,.06,.05,wood,0,-.07,.04,ak,-.3);const mag=B(.03,.13,.06,steel,0,-.1,-.1,ak,.35);
const bar=new THREE.Mesh(new THREE.CylinderGeometry(.009,.009,.32,6),black);bar.rotation.x=Math.PI/2;bar.position.set(0,.015,-.52);ak.add(bar);B(.01,.035,.01,black,0,.05,-.6,ak);
const flashM=new THREE.Mesh(new THREE.PlaneGeometry(.12,.12),new THREE.MeshBasicMaterial({color:0xffd27a,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false}));
const flashLight=new THREE.PointLight(0xffb347,0,6,2);camera.add(flashLight);flashLight.position.set(.2,-.15,-.9);
const GUNS={pistol:{name:'مسدس',mesh:pistol,mag:12,dmg:34,rate:.17,auto:false,muzzle:new THREE.Vector3(0,.035,-.18),spread:.004,kick:.06},
            ak:{name:'كلاشنكوف AK-47',mesh:ak,mag:30,dmg:26,rate:.095,auto:true,muzzle:new THREE.Vector3(0,.015,-.7),spread:.012,kick:.04}};
for(const g of Object.values(GUNS)){g.ammo=g.mag;g.mesh.visible=false;VM.add(g.mesh)}
let gun=null,cool=0,firing=false,reloading=0,recoil=0,swayT=0,burst=0;
/* ── أصوات الأسلحة: ملفّات sfx/*.wav (مقصوصة من مكتبة إبراهيم)، تُحمَّل مرّة واحدة عند أوّل تسليح ── */
const SND={},SFILES=['ak','ak_tail','pistol','cock_ak','cock_p','reload_ak','reload_p','dry','rack'];let sndLoading=null;
function loadSnd(){if(sndLoading)return sndLoading;const a=sfx.ac();sndLoading=Promise.all(SFILES.map(n=>fetch('./sfx/'+n+'.wav').then(r=>r.arrayBuffer()).then(b=>new Promise((ok,no)=>a.decodeAudioData(b,ok,no))).then(buf=>{SND[n]=buf}).catch(()=>{})));return sndLoading}
// يشغّل الصوت إن جهز (بتنويع طفيف في الطبقة كي لا تتكرّر الطلقات حرفيّاً)، وإلّا يرجع false لاستعمال البديل المركّب
function play(n,vol=1,jit=0){const b=SND[n];if(!b)return false;const a=sfx.ac(),s=a.createBufferSource(),g=a.createGain();s.buffer=b;s.playbackRate.value=1+(Math.random()*2-1)*jit;g.gain.value=vol;s.connect(g).connect(a.destination);s.start();return true}

/* ── واجهة السلاح ── */
const hud=document.createElement('div');hud.id='weap';hud.className='hidden';document.body.appendChild(hud);
const sc=document.createElement('div');sc.id='score';sc.className='hidden';document.body.appendChild(sc);
const tb=document.createElement('div');tb.className='touch';tb.innerHTML='<button id="gunBtn" class="tbtn">سلاح</button><button id="fireBtn" class="tbtn hidden">نار</button><button id="relBtn" class="tbtn hidden">R</button>';document.body.appendChild(tb);
function hudPaint(){if(!gun){hud.classList.add('hidden');document.getElementById('cross').classList.remove('gun');['fireBtn','relBtn'].forEach(i=>document.getElementById(i).classList.add('hidden'));return}
  const g=GUNS[gun];hud.classList.remove('hidden');hud.innerHTML=`<b>${g.name}</b><span>${reloading>0?'تعبئة…':g.ammo+' / '+g.mag}</span><small>1 مسدس · 2 كلاشنكوف · R تعبئة · Q إخفاء</small>`;
  document.getElementById('cross').classList.add('gun');['fireBtn','relBtn'].forEach(i=>document.getElementById(i).classList.remove('hidden'))}
function scorePaint(){sc.classList.remove('hidden');sc.textContent=`الإصابات ${score} · روبوتات ${kills}`}
function equip(k){if(gun===k)k=null;for(const g of Object.values(GUNS))g.mesh.visible=false;gun=k;firing=false;reloading=0;
  if(k){GUNS[k].mesh.visible=true;recoil=.6;loadSnd().then(()=>{if(gun===k)play(k==='ak'?'cock_ak':'cock_p',.9)});}hudPaint()}
function reload(){if(!gun||reloading>0||GUNS[gun].ammo===GUNS[gun].mag)return;reloading=gun==='ak'?2.25:1.15; // بطول صوت التعبئة
  if(!play(gun==='ak'?'reload_ak':'reload_p',.9)){sfx.tone(320,.05,'square',.1);sfx.tone(240,.06,'square',.1,0,.5)}if(gun==='pistol')setTimeout(()=>{if(gun==='pistol')play('cock_p',.8)},700);hudPaint()}
document.getElementById('gunBtn').addEventListener('touchstart',e=>{e.preventDefault();equip(gun===null?'ak':gun==='ak'?'pistol':null)},{passive:false});
document.getElementById('fireBtn').addEventListener('touchstart',e=>{e.preventDefault();trigger(true)},{passive:false});
document.getElementById('fireBtn').addEventListener('touchend',()=>trigger(false));
document.getElementById('relBtn').addEventListener('touchstart',e=>{e.preventDefault();reload()},{passive:false});

/* ══════════ مؤثّرات: شظايا، شرر، خطّ الطلقة ══════════ */
const FR=[],SP=[];
const fragGeo=new THREE.BoxGeometry(1,1,1);
function shatter(pos,colors,n=12,size=.14,force=4){for(let i=0;i<n&&FR.length<320;i++){const m=new THREE.Mesh(fragGeo,mat(colors[i%colors.length]));const s=size*(.5+Math.random());m.scale.set(s,s*(.6+Math.random()*.8),s);m.position.copy(pos).add(new THREE.Vector3((Math.random()-.5)*.3,(Math.random()-.2)*.3,(Math.random()-.5)*.3));m.castShadow=true;scene.add(m);
  FR.push({m,v:new THREE.Vector3((Math.random()-.5)*force,Math.random()*force*.9+1,(Math.random()-.5)*force),av:new THREE.Vector3(Math.random()*8,Math.random()*8,Math.random()*8),life:3+Math.random(),s})}}
const sparkM=new THREE.SpriteMaterial({color:0xffd27a,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false});
function sparks(p,n=6,c){for(let i=0;i<n;i++){const s=new THREE.Sprite(c?sparkM.clone():sparkM);if(c)s.material.color.set(c);s.scale.setScalar(.07);s.position.copy(p);scene.add(s);SP.push({s,v:new THREE.Vector3((Math.random()-.5)*3,Math.random()*3,(Math.random()-.5)*3),life:.35})}}
function tracer(a,b){const g=new THREE.BufferGeometry().setFromPoints([a,b]);const l=new THREE.Line(g,new THREE.LineBasicMaterial({color:0xffe2a0,transparent:true,opacity:.8,blending:THREE.AdditiveBlending,toneMapped:false}));scene.add(l);SP.push({line:l,life:.05})}

/* ══════════ الساحة ══════════ */
{const g=grp(AR.cx,0,AR.z0-1.2);for(const sx of[-2.4,2.4])box(.5,3.4,.5,0x6b5a45,sx,0,0,g);box(5.4,.6,.5,0x3a2f24,0,3.4,0,g);
  const t=ctex(768,100,(c,w,h)=>{c.fillStyle='#3a2f24';c.fillRect(0,0,w,h);c.textAlign='center';c.fillStyle='#ff6b4a';c.font='700 54px '+SERIF;c.fillText('ساحة الرماية',w/2,58);c.fillStyle='#d6c7b0';c.font='400 24px '+FONT;c.fillText('للّعب فقط — 1 مسدس · 2 كلاشنكوف',w/2,90)});
  for(const [zz,ry] of[[.26,0],[-.26,Math.PI]]){const p=new THREE.Mesh(new THREE.PlaneGeometry(5.2,.6),new THREE.MeshBasicMaterial({map:t,toneMapped:false}));p.position.set(0,3.7,zz);p.rotation.y=ry;g.add(p)}
  block(AR.cx-2.4,AR.z0-1.2,.25,.25,3.6);block(AR.cx+2.4,AR.z0-1.2,.25,.25,3.6)}
// أكياس رمل على الأطراف الثلاثة
const bag=mat(0xb59a6a,{roughness:1});
function bags(x0,z0,x1,z1){const len=Math.hypot(x1-x0,z1-z0),n=Math.floor(len/.62),a=Math.atan2(x1-x0,z1-z0);for(let r=0;r<3;r++)for(let i=0;i<n;i++){const t=(i+(r%2)*.5)/n;if(t>1)continue;const m=new THREE.Mesh(new THREE.BoxGeometry(.58,.26,.34),bag);m.position.set(x0+(x1-x0)*t,.13+r*.26,z0+(z1-z0)*t);m.rotation.y=a+Math.PI/2;m.castShadow=m.receiveShadow=true;scene.add(m)}}
bags(AR.x0-.4,AR.z1+.4,AR.x1+.4,AR.z1+.4);bags(AR.x0-.4,AR.z0,AR.x0-.4,AR.z1+.4);bags(AR.x1+.4,AR.z0,AR.x1+.4,AR.z1+.4);
block(AR.cx,AR.z1+.4,(AR.x1-AR.x0)/2+.6,.2,.8);block(AR.x0-.4,(AR.z0+AR.z1)/2,.2,(AR.z1-AR.z0)/2+.4,.8);block(AR.x1+.4,(AR.z0+AR.z1)/2,.2,(AR.z1-AR.z0)/2+.4,.8);
// حامل السلاح: E يسلّحك
{const g=grp(AR.cx-4.5,0,AR.z0+.6,0);box(1.4,1.1,.25,0x5a3e28,0,0,0,g);const a2=ak.clone();a2.visible=true;a2.scale.setScalar(2.2);a2.rotation.y=Math.PI/2;a2.position.set(.15,.85,.16);g.add(a2);const p2=pistol.clone();p2.visible=true;p2.scale.setScalar(2.4);p2.rotation.y=Math.PI/2;p2.position.set(-.45,.55,.16);g.add(p2);
  block(AR.cx-4.5,AR.z0+.6,.7,.15,1.1);act(g,'خذ الكلاشنكوف',()=>{loadSnd().then(()=>play('rack',.8));if(gun!=='ak')equip('ak');toast('معك الكلاشنكوف — انقر للإطلاق · 1 مسدس · R تعبئة · Q إخفاء')},[1.6,1.4,.8,0,.7,.2])}

/* ── أشياء تتكسّر ── */
const BRK=[];
const crateT=ctex(128,128,(c,w,h)=>{c.fillStyle='#a8743f';c.fillRect(0,0,w,h);c.strokeStyle='#6b4423';c.lineWidth=10;c.strokeRect(5,5,w-10,h-10);c.beginPath();c.moveTo(5,5);c.lineTo(w-5,h-5);c.stroke();c.lineWidth=2;for(let y=20;y<h;y+=22){c.beginPath();c.moveTo(0,y);c.lineTo(w,y);c.stroke()}});
function breakable(kind,x,z,y=0,ry=0){let m,cols,size,top,hp;
  if(kind==='crate'){m=new THREE.Mesh(new THREE.BoxGeometry(.8,.8,.8),new THREE.MeshStandardMaterial({map:crateT,roughness:.9}));m.position.set(x,y+.4,z);cols=[0xa8743f,0x6b4423,0xc08850];size=.18;top=y+.8;hp=2}
  else if(kind==='barrel'){m=new THREE.Mesh(new THREE.CylinderGeometry(.32,.32,.9,12),mat(Math.random()<.5?0xb3261e:0x2b5d9e,{metalness:.3}));m.position.set(x,y+.45,z);cols=[m.material.color.getHex(),0x333333];size=.16;top=y+.9;hp=3}
  else if(kind==='pot'){m=new THREE.Mesh(new THREE.SphereGeometry(.28,8,6),mat(0xb5652f));m.scale.y=1.2;m.position.set(x,y+.32,z);cols=[0xb5652f,0x8a4a22];size=.11;top=y+.62;hp=1}
  else{m=new THREE.Mesh(new THREE.CylinderGeometry(.04,.05,.26,8),new THREE.MeshStandardMaterial({color:0x3fa34d,transparent:true,opacity:.75,roughness:.1}));m.position.set(x,y+.13,z);cols=[0x3fa34d,0xd8f5dc];size=.05;top=null;hp=1}
  m.rotation.y=ry;m.castShadow=m.receiveShadow=true;scene.add(m);
  const o={kind,m,cols,size,hp,hp0:hp,dead:0,col:top?(()=>{const c={x0:x-.42,x1:x+.42,z0:z-.42,z1:z+.42,y0:y,top};COL.push(c);return c})():null,top};
  m.userData.hit={kind:'brk',ref:o};HIT.push(m);BRK.push(o);return o}
function hitBreakable(o,p){o.hp--;sparks(p,4,0xffe2a0);if(o.hp>0){sfx.noise(.05,.2,1200);return}
  o.m.visible=false;o.dead=9;if(o.col)o.col.top=-9;score++;scorePaint();
  shatter(o.m.position,o.cols,o.kind==='bottle'?10:14,o.size,o.kind==='bottle'?2.5:4.5);
  if(o.kind==='bottle'){sfx.noise(.3,.35,4000);sfx.tone(2400,.08,'triangle',.08)}else if(o.kind==='barrel'){sfx.noise(.4,.45,300,'lowpass');sfx.tone(90,.3,'sine',.4,40)}else sfx.noise(.28,.45,600,'lowpass')}
[[10,30],[10.9,30],[10.45,30,.8],[25.5,37.5],[26.3,37.5],[13,38],[22,29.5],[24.5,31]].forEach(([x,z,y])=>breakable('crate',x,z,y||0,Math.random()));
[[11,35],[11.8,35.4],[27,29],[16,38.5],[20.5,38.5]].forEach(([x,z])=>breakable('barrel',x,z));
[[8.5,33],[8.5,34.2],[28,34]].forEach(([x,z])=>breakable('pot',x,z));
{const tx=19,tz=36;box(1.8,.06,.6,0x6b4423,tx,.8,tz);for(const s of[-.8,.8])box(.06,.8,.5,0x6b4423,tx+s,0,tz);block(tx,tz,.9,.3,.86);for(let i=0;i<6;i++)breakable('bottle',tx-.7+i*.28,tz,.86)}
// صناديق متناثرة في الخريطة
[[6.5,-17],[25,-17.5],[3.5,9],[-6.5,0.5],[27.5,8.5],[12,-26]].forEach(([x,z])=>breakable(Math.random()<.6?'crate':'barrel',x,z,0,Math.random()));

/* ── أهداف تنقلب ── */
const TG=[];
const tgT=ctex(128,128,(c,w,h)=>{const R=[['#fff',62],['#d62828',52],['#fff',40],['#d62828',28],['#fff',16],['#d62828',7]];R.forEach(([cl,r])=>{c.fillStyle=cl;c.beginPath();c.arc(64,64,r,0,7);c.fill()})});
for(let i=0;i<5;i++){const x=AR.x0+3+i*4,z=AR.z1-1.2;box(.08,.9,.08,0x3a2f24,x,0,z);const piv=grp(x,.9,z,0);const f=new THREE.Mesh(new THREE.CircleGeometry(.36,24),new THREE.MeshStandardMaterial({map:tgT,side:THREE.DoubleSide,roughness:.8}));f.position.y=.36;piv.add(f);
  const o={piv,f,down:0,a:0};f.userData.hit={kind:'tg',ref:o};HIT.push(f);TG.push(o)}

/* ── الروبوتات ── */
const RB=[];
const rbBody=mat(0x3c4148,{metalness:.5,roughness:.4}),rbDark=mat(0x23262b,{metalness:.5,roughness:.5}),visor=glow(0xff3b3b),stripe=glow(0xe8c766);
function robot(){const g=new THREE.Group();scene.add(g);
  const legs=[-.14,.14].map(x=>{const l=new THREE.Group();l.position.set(x,.62,0);g.add(l);const m=new THREE.Mesh(new THREE.BoxGeometry(.16,.62,.18),rbDark);m.position.y=-.31;l.add(m);return l});
  const body=new THREE.Mesh(new THREE.BoxGeometry(.6,.62,.36),rbBody);body.position.y=.96;g.add(body);const st=new THREE.Mesh(new THREE.BoxGeometry(.61,.06,.37),stripe);st.position.y=1.08;g.add(st);
  const arms=[-.38,.38].map(x=>{const a=new THREE.Mesh(new THREE.BoxGeometry(.14,.55,.16),rbDark);a.position.set(x,.95,0);g.add(a);return a});
  const head=new THREE.Mesh(new THREE.BoxGeometry(.4,.32,.34),rbBody);head.position.y=1.45;g.add(head);const v=new THREE.Mesh(new THREE.BoxGeometry(.32,.08,.02),visor);v.position.set(0,1.47,.18);g.add(v);
  const ant=new THREE.Mesh(new THREE.CylinderGeometry(.01,.01,.2,4),rbDark);ant.position.y=1.71;g.add(ant);const tip=new THREE.Mesh(new THREE.SphereGeometry(.035,6,4),visor);tip.position.y=1.82;g.add(tip);
  const barC=document.createElement('canvas');barC.width=128;barC.height=16;const barT=new THREE.CanvasTexture(barC);const bar=new THREE.Sprite(new THREE.SpriteMaterial({map:barT,toneMapped:false,depthWrite:false}));bar.scale.set(.7,.09,1);bar.position.y=2.0;bar.visible=false;g.add(bar);
  const r={g,legs,arms,body,head,bar,barC,barT,hp:100,dead:0,t:Math.random()*9,tx:0,tz:0,flash:0};
  for(const m of[body,head,v,...arms,...legs.map(l=>l.children[0])]){m.userData.hit={kind:'rb',ref:r,head:m===head||m===v};m.castShadow=true;HIT.push(m)}
  spawnR(r);RB.push(r);return r}
function spawnR(r){r.g.position.set(AR.x0+2+Math.random()*(AR.x1-AR.x0-4),0,AR.z0+5+Math.random()*(AR.z1-AR.z0-7));r.hp=100;r.dead=0;r.g.visible=true;r.bar.visible=false;newGoal(r);sparks(r.g.position.clone().setY(1),10,0x6ad1ff)}
function newGoal(r){r.tx=AR.x0+1+Math.random()*(AR.x1-AR.x0-2);r.tz=AR.z0+3+Math.random()*(AR.z1-AR.z0-4)}
function barPaint(r){const c=r.barC.getContext('2d');c.clearRect(0,0,128,16);c.fillStyle='rgba(0,0,0,.6)';c.fillRect(0,0,128,16);c.fillStyle=r.hp>50?'#22c55e':r.hp>25?'#f59e0b':'#ef4444';c.fillRect(2,2,124*r.hp/100,12);r.barT.needsUpdate=true;r.bar.visible=true}
function hitRobot(r,p,head){if(r.dead)return;const d=GUNS[gun].dmg*(head?2:1);r.hp-=d;r.flash=.08;sparks(p,head?9:5);sfx.tone(head?1300:900,.05,'square',.1);barPaint(r);score++;
  if(r.hp<=0){r.dead=5;r.g.visible=false;kills++;const c=r.g.position.clone().setY(1);shatter(c,[0x3c4148,0x23262b,0xe8c766,0xff3b3b],22,.2,5.5);sparks(c,14,0xff6b3b);sfx.noise(.5,.5,500,'lowpass');sfx.tone(160,.4,'sawtooth',.18,40);toast(head?'ضربة رأس! سقط الروبوت':'سقط الروبوت')}
  scorePaint()}
for(let i=0;i<5;i++)robot();

/* ══════════ الإطلاق ══════════ */
const ray=new THREE.Raycaster(),ndc=new THREE.Vector2(),mw=new THREE.Vector3();ray.far=140;
function shoot(){const g=GUNS[gun];if(g.ammo<=0){if(!play('dry',.9))sfx.tone(180,.04,'square',.08);reload();return}
  g.ammo--;cool=g.rate;recoil=Math.min(1,recoil+.55);
  const s=g.spread*(firing&&g.auto?1.6:1);ndc.set((Math.random()-.5)*s*2,(Math.random()-.5)*s*2);ray.setFromCamera(ndc,camera);
  g.mesh.localToWorld(mw.copy(g.muzzle));flashM.position.copy(g.muzzle);g.mesh.add(flashM);flashM.material.opacity=1;flashM.rotation.z=Math.random()*3;flashLight.intensity=4;
  if(gun==='ak'){burst++;if(!play('ak',.75,.04)){sfx.noise(.09,.42,700);sfx.tone(110,.09,'sine',.35,45)}}else if(!play('pistol',.8,.03)){sfx.noise(.07,.5,1100);sfx.tone(190,.1,'sine',.3,60)}
  const hit=ray.intersectObjects(HIT,false).find(h=>h.object.visible&&(!h.object.userData.hit.ref.dead||h.object.userData.hit.kind==='tg'));
  let end;if(hit){end=hit.point;const H=hit.object.userData.hit;
    if(H.kind==='rb')hitRobot(H.ref,hit.point,H.head);
    else if(H.kind==='brk')hitBreakable(H.ref,hit.point);
    else if(H.kind==='tg'&&!H.ref.down){H.ref.down=3;score++;scorePaint();sparks(hit.point,6);sfx.tone(1500,.07,'triangle',.12)}}
  else{const t=ray.ray.direction.y<-.01?-camera.position.y/ray.ray.direction.y:60;end=ray.ray.at(Math.min(t,60),new THREE.Vector3());if(t<60)sparks(end,3,0xd6b98a)}
  tracer(mw.clone(),end);hudPaint()}
// ترك الزناد بعد رشقة: صدى الكلاشنكوف يتلاشى في الصحراء
function trigger(on){if(!gun)return false;if(on&&!firing&&cool<=0&&reloading<=0)shoot();if(!on&&firing&&gun==='ak'&&burst>=3)play('ak_tail',.55);if(!on)burst=0;firing=on;return true}

/* ══════════ التحديث ══════════ */
function update(dt,P,live){
  // نموذج السلاح: تمايل مع المشي وارتداد
  swayT+=dt*Math.min(1,Math.hypot(P.vx,P.vz)/3)*9;recoil=Math.max(0,recoil-dt*6);
  VM.position.set(.17+Math.sin(swayT)*.01,-.2+Math.abs(Math.cos(swayT))*.01-(reloading>0?.12:0),-.42+recoil*.07);VM.rotation.set(recoil*.18+(reloading>0?.5:0),0,reloading>0?.3:0);
  if(flashM.material.opacity>0){flashM.material.opacity=Math.max(0,flashM.material.opacity-dt*22);flashLight.intensity=flashM.material.opacity*4}
  if(gun){cool-=dt;if(reloading>0){reloading-=dt;if(reloading<=0){GUNS[gun].ammo=GUNS[gun].mag;hudPaint()}}else if(live&&firing&&GUNS[gun].auto&&cool<=0)shoot()}
  // الروبوتات: تقترب حين تكون في الساحة، وإلّا تتجوّل
  const inArena=P.x>AR.x0-2&&P.x<AR.x1+2&&P.z>AR.z0-3&&P.z<AR.z1+1;
  for(const r of RB){if(r.dead){r.dead-=dt;if(r.dead<=0)spawnR(r);continue}
    r.t+=dt;const gp=r.g.position;let tx=r.tx,tz=r.tz;const dp=Math.hypot(P.x-gp.x,P.z-gp.z);if(inArena&&dp<16){tx=P.x;tz=P.z}
    const dx=tx-gp.x,dz=tz-gp.z,d=Math.hypot(dx,dz),stop=inArena&&dp<16?1.6:.3;
    if(d>stop){const sp=inArena?1.5:.8;gp.x+=dx/d*sp*dt;gp.z+=dz/d*sp*dt;r.g.rotation.y=Math.atan2(dx,dz);const w=Math.sin(r.t*7);r.legs[0].rotation.x=w*.5;r.legs[1].rotation.x=-w*.5;r.arms[0].rotation.x=-w*.4;r.arms[1].rotation.x=w*.4}
    else{if(!(inArena&&dp<16))newGoal(r);r.g.rotation.y=Math.atan2(P.x-gp.x,P.z-gp.z);r.arms[0].rotation.x=-1.2+Math.sin(r.t*4)*.2;r.arms[1].rotation.x=-1.2+Math.cos(r.t*4)*.2}
    gp.x=Math.max(AR.x0,Math.min(AR.x1,gp.x));gp.z=Math.max(AR.z0+1,Math.min(AR.z1,gp.z));
    if(r.flash>0){r.flash-=dt;r.body.material=r.flash>0?visor:rbBody}}
  for(const o of BRK)if(o.dead>0){o.dead-=dt;if(o.dead<=0){o.m.visible=true;o.hp=o.hp0;if(o.col)o.col.top=o.top}}
  for(const t of TG){const tgt=t.down>0?-Math.PI/2:0;t.a+=(tgt-t.a)*Math.min(1,dt*10);t.piv.rotation.x=t.a;if(t.down>0)t.down-=dt}
  for(let i=FR.length-1;i>=0;i--){const f=FR[i];f.life-=dt;f.v.y-=19*dt;f.m.position.addScaledVector(f.v,dt);f.m.rotation.x+=f.av.x*dt;f.m.rotation.y+=f.av.y*dt;
    if(f.m.position.y<f.s/2){f.m.position.y=f.s/2;f.v.y*=-.3;f.v.x*=.7;f.v.z*=.7;f.av.multiplyScalar(.7)}
    if(f.life<.6)f.m.scale.multiplyScalar(Math.max(.01,1-dt*4));if(f.life<=0){scene.remove(f.m);f.m.material.dispose();FR.splice(i,1)}}
  for(let i=SP.length-1;i>=0;i--){const s=SP[i];s.life-=dt;if(s.s){s.v.y-=9*dt;s.s.position.addScaledVector(s.v,dt);s.s.scale.multiplyScalar(1-dt*3)}
    if(s.life<=0){if(s.s){scene.remove(s.s);if(s.s.material!==sparkM)s.s.material.dispose()}else{scene.remove(s.line);s.line.geometry.dispose();s.line.material.dispose()}SP.splice(i,1)}}
}
return {update,equip,trigger,reload,armed:()=>!!gun,
  districts:[{name:'ساحة الرماية',desc:'مسدس وكلاشنكوف، روبوتات وأهداف وصناديق تتكسّر — للّعب',x:AR.cx,z:AR.z0-3.2,yaw:Math.PI}]};
}
