/*
 * rooms.js — غرف «ممرّ الذكريات» كسيتات تصوير لو-بولي، مبنيّة من صور كلّ مكان
 * ─────────────────────────────────────────────────────────────────────────
 * كلّ غرفة «سيت»: ثلاثة جدران وأرضيّة، مفتوحة من الأمام على الطريق، وظهر جدرانها خشب
 * سيتات. الإحداثيّات محلّيّة: x ∈ [-2.5, 2.5]، والعمق z ∈ [-4.2, 0] (الأمام عند 0)، y للأعلى.
 * ROOMS[key](g, K) يبني داخل المجموعة g؛ K أدوات البناء + solidL للتصادم بإحداثيّات محلّيّة.
 */
export const RW=5,RD=4.2,RH=2.7;
export function makeRooms(C){
const {THREE,mat,box,cyl,ball,grp,ctex,tmat,rnd,FONT}=C;
const glow=c=>new THREE.MeshBasicMaterial({color:c,toneMapped:false});
const TX={};const tex=(k,w,h,draw,rep)=>TX[k]||(TX[k]=ctex(w,h,draw,rep?{repeat:rep}:undefined));

/* ── خامات الجدران والأرضيّات ── */
const T={
  sadu:()=>tex('sadu',256,512,(g,w,h)=>{g.fillStyle='#ece0c8';g.fillRect(0,0,w,h);
    const band=(x,bw,c)=>{g.fillStyle=c;g.fillRect(x,0,bw,h)};band(0,70,'#9e1c2c');band(70,8,'#6d6142');band(150,8,'#6d6142');band(158,70,'#9e1c2c');
    g.fillStyle='#ece0c8';for(let y=0;y<h;y+=64){for(const cx of[35,193]){g.beginPath();g.moveTo(cx,y+8);g.lineTo(cx+22,y+32);g.lineTo(cx,y+56);g.lineTo(cx-22,y+32);g.fill();g.fillStyle='#9e1c2c';g.beginPath();g.moveTo(cx,y+20);g.lineTo(cx+10,y+32);g.lineTo(cx,y+44);g.lineTo(cx-10,y+32);g.fill();g.fillStyle='#ece0c8'}}
    g.fillStyle='#9e1c2c';for(let y=0;y<h;y+=32){g.fillRect(96,y+6,18,6);g.fillRect(96,y+6,6,18);g.fillRect(122,y+20,14,6)}},[3,1.2]),
  pixel:()=>tex('pixel',1024,512,(g,w,h)=>{g.fillStyle='#efe3b4';g.fillRect(0,0,w,h);const px=(ox,oy,s,rows,pal)=>rows.forEach((r,j)=>[...r].forEach((ch,i)=>{if(ch!=='.'){g.fillStyle=pal[ch];g.fillRect(ox+i*s,oy+j*s,s,s)}}));
    const mario=['..rrrr..','.rrrrrr.','.bbsss..','bsbssss.','.ssssss.','..rbbr..','.rrbbrr.','.bb..bb.'],apple=['...k....','..yyyy..','.yyyyyy.','yyywyyyy','yyyyyyyy','yyyyyyyy','.yyyyyy.','..yyyy..'],man=['.bbb.','.sss.','.sss.','ggggg','.ggg.','.ggg.','.c.c.','.c.c.'],girl=['.yyy.','yssy.','.sss.','ttttt','.ttt.','.ttt.','.c.c.','.c.c.'];
    const P={r:'#d0312d',b:'#5b3a1e',s:'#f1c08d',y:'#f5c518',w:'#fff8d6',k:'#3a2a12',g:'#7a7a7a',c:'#2d4f8e',t:'#4aa3df'};
    px(560,60,14,apple,P);px(820,150,12,mario,P);px(700,260,14,man,P);px(860,270,14,girl,P);px(640,270,10,man,P);px(400,90,10,mario,P);
    g.fillStyle='#fafafa';g.fillRect(880,30,110,130);g.strokeStyle='#777';g.lineWidth=3;g.beginPath();g.arc(935,90,30,0,7);g.stroke();g.beginPath();g.moveTo(915,85);g.lineTo(925,85);g.moveTo(945,85);g.lineTo(955,85);g.moveTo(920,105);g.quadraticCurveTo(935,112,950,105);g.stroke();
    g.fillStyle='#3554a5';g.fillRect(760,40,60,50);g.fillStyle='#e9e2c7';g.fillRect(768,48,44,34)}),
  drawings:()=>tex('draw',1024,512,(g,w,h)=>{g.fillStyle='#e7c862';g.fillRect(0,0,w,h);const paper=(x,y,pw,ph)=>{g.fillStyle='#fbfaf4';g.fillRect(x,y,pw,ph)};
    paper(120,40,180,140);g.strokeStyle='#111';g.lineWidth=6;g.beginPath();g.moveTo(210,60);g.bezierCurveTo(150,70,150,140,210,165);g.bezierCurveTo(270,140,270,70,210,60);g.stroke();
    paper(330,150,150,120);g.fillStyle='#fff';g.beginPath();g.arc(405,210,48,0,7);g.fill();g.strokeStyle='#c22';g.lineWidth=3;for(let i=0;i<12;i++){const a=i/12*7;g.beginPath();g.moveTo(405+Math.cos(a)*48,210+Math.sin(a)*48);g.lineTo(405+Math.cos(a)*30,210+Math.sin(a)*30);g.stroke()}g.fillStyle='#2b6fd6';g.beginPath();g.arc(405,210,20,0,7);g.fill();g.fillStyle='#000';g.beginPath();g.arc(405,210,9,0,7);g.fill();
    paper(560,80,110,130);g.strokeStyle='#2b6fd6';g.lineWidth=4;g.strokeRect(590,110,40,40);g.strokeRect(605,98,40,40);
    paper(700,70,120,150);g.strokeStyle='#111';g.beginPath();g.moveTo(760,90);g.lineTo(720,200);g.lineTo(790,190);g.closePath();g.moveTo(760,90);g.lineTo(790,190);g.stroke();
    paper(850,60,140,140);g.strokeStyle='#d33';g.lineWidth=8;g.beginPath();g.moveTo(920,80);g.lineTo(870,180);g.lineTo(970,180);g.closePath();g.stroke();
    g.fillStyle='#fff';g.fillRect(620,300,40,60);g.fillStyle='#bbb';g.fillRect(628,310,24,14)}),
  chroma:()=>tex('chroma',64,64,(g,w,h)=>{g.fillStyle='#38c24a';g.fillRect(0,0,w,h)}),
  marble:()=>tex('marble',512,512,(g,w,h)=>{g.fillStyle='#41506a';g.fillRect(0,0,w,h);const r=rnd(4);for(let i=0;i<70;i++){g.fillStyle=r()<.5?'rgba(200,215,235,.28)':'rgba(15,20,35,.4)';g.beginPath();g.ellipse(r()*w,r()*h,10+r()*50,6+r()*22,r()*3,0,7);g.fill()}}),
  navy:()=>tex('navy',128,128,(g,w,h)=>{g.fillStyle='#1d2a44';g.fillRect(0,0,w,h);const r=rnd(8);for(let i=0;i<300;i++){g.fillStyle='rgba(255,255,255,.04)';g.fillRect(r()*w,r()*h,2,2)}}),
  abstract:()=>tex('abs',512,512,(g,w,h)=>{g.fillStyle='#8f969d';g.fillRect(0,0,w,h);const r=rnd(6);for(let i=0;i<14;i++){g.fillStyle=['#5d6670','#c5cbd0','#3e4852','#a8b3bc'][i%4];g.beginPath();g.moveTo(r()*w,0);g.bezierCurveTo(r()*w,h*.3,r()*w,h*.7,r()*w,h);g.lineTo(r()*w,h);g.bezierCurveTo(r()*w,h*.6,r()*w,h*.3,r()*w,0);g.fill()}}),
  tile:()=>tex('tile',256,256,(g,w,h)=>{g.fillStyle='#d9d6cf';g.fillRect(0,0,w,h);g.strokeStyle='rgba(0,0,0,.12)';g.lineWidth=3;for(let i=0;i<=2;i++){g.beginPath();g.moveTo(i*w/2,0);g.lineTo(i*w/2,h);g.moveTo(0,i*h/2);g.lineTo(w,i*h/2);g.stroke()}},[3,3]),
  sadoFloor:()=>tex('sadoF',256,256,(g,w,h)=>{g.fillStyle='#8c1a26';g.fillRect(0,0,w,h);for(let y=0;y<h;y+=64)for(let x=0;x<w;x+=64){g.fillStyle=((x+y)/64)%2?'#f1ead6':'#2a7d4a';g.beginPath();g.moveTo(x+32,y+6);g.lineTo(x+58,y+32);g.lineTo(x+32,y+58);g.lineTo(x+6,y+32);g.fill();g.fillStyle='#1d3f8a';g.fillRect(x+27,y+27,10,10)}},[3,2.5]),
  majlis:()=>tex('majlis',256,256,(g,w,h)=>{g.fillStyle='#8a6a3e';g.fillRect(0,0,w,h);g.strokeStyle='#2f3a4f';g.lineWidth=14;for(let y=-20;y<h+40;y+=56){g.beginPath();for(let x=0;x<=w;x+=8)g.lineTo(x,y+Math.sin(x/22)*14);g.stroke()}g.strokeStyle='#e8d6a8';g.lineWidth=4;for(let y=8;y<h+40;y+=56){g.beginPath();for(let x=0;x<=w;x+=8)g.lineTo(x,y+Math.sin(x/22)*14);g.stroke()}},[3,2.5]),
  floral:()=>tex('floral',256,256,(g,w,h)=>{g.fillStyle='#6b1420';g.fillRect(0,0,w,h);const r=rnd(12);for(let i=0;i<26;i++){const x=r()*w,y=r()*h;g.fillStyle=['#c99b4a','#1f2c4d','#e7d3a1'][i%3];for(let k=0;k<5;k++){const a=k/5*7;g.beginPath();g.arc(x+Math.cos(a)*9,y+Math.sin(a)*9,6,0,7);g.fill()}}}),
  greyCarpet:()=>tex('greyC',64,64,(g,w,h)=>{g.fillStyle='#3a3d42';g.fillRect(0,0,w,h)}),
  greenCarpet:()=>tex('greenC',64,64,(g,w,h)=>{g.fillStyle='#1f3b30';g.fillRect(0,0,w,h)}),
  wood:()=>tex('wood',256,64,(g,w,h)=>{g.fillStyle='#b98a52';g.fillRect(0,0,w,h);g.strokeStyle='rgba(90,55,25,.25)';g.lineWidth=2;for(let y=4;y<h;y+=7){g.beginPath();g.moveTo(0,y);g.bezierCurveTo(w*.3,y+3,w*.6,y-3,w,y);g.stroke()}}),
};

/* ── الهيكل: جدران السيت والأرضيّة ── */
function shell(g,o){const WALL=o.wall||0xe9e4da;
  const fl=new THREE.Mesh(new THREE.PlaneGeometry(RW,RD),o.floor?tmat(o.floor(),{roughness:1}):mat(o.floorColor||0xcfcac0));fl.rotation.x=-Math.PI/2;fl.position.set(0,.065,-RD/2);fl.receiveShadow=true;g.add(fl);
  const ply=mat(0x8a6f4d,{roughness:1});
  const wall=(w,x,z,ry,t,color)=>{const back=new THREE.Mesh(new THREE.BoxGeometry(w,RH,.08),ply);back.position.set(x,RH/2+.06,z);back.rotation.y=ry;g.add(back);
    const f=new THREE.Mesh(new THREE.PlaneGeometry(w,RH),t?tmat(t(),{roughness:.95}):mat(color));f.position.set(x,RH/2+.06,z);f.rotation.y=ry;f.translateZ(.045);f.receiveShadow=true;g.add(f)};
  wall(RW,0,-RD,0,o.back,o.backColor||WALL);wall(RD,-RW/2,-RD/2,Math.PI/2,o.left,o.leftColor||WALL);wall(RD,RW/2,-RD/2,-Math.PI/2,o.right,o.rightColor||WALL);
  // دعامات خلفيّة كسيت تصوير حقيقيّ
  for(const x of[-1.6,1.6]){const b=box(.06,2.2,.06,0x6f5a3e,x,.06,-RD-.6,g);b.rotation.x=.42}
  g.userData.solidL(0,-RD,RW/2,.08,RH);g.userData.solidL(-RW/2,-RD/2,.08,RD/2,RH);g.userData.solidL(RW/2,-RD/2,.08,RD/2,RH)}

/* ── قطع أثاث ── */
const S=(g,lx,lz,hw,hd,top)=>g.userData.solidL(lx,lz,hw,hd,top);
function desk(g,x,z,w,d,h,top,leg,ry=0){const k=grp(x,0,z,ry,g);box(w,.04,d,top,0,h-.04,0,k);for(const sx of[-w/2+.05,w/2-.05])for(const sz of[-d/2+.05,d/2-.05])box(.05,h-.04,.05,leg,sx,.06,sz,k);return k}
function monitor(g,x,y,z,w,h,ry=0,scr=0x1a2a55,stand=true){const k=grp(x,y,z,ry,g);box(w,h,.04,0x111111,0,stand?.12:0,0,k);const s=new THREE.Mesh(new THREE.PlaneGeometry(w-.04,h-.04),glow(scr));s.position.set(0,(stand?.12:0)+h/2,.021);k.add(s);if(stand){box(.05,.12,.05,0x151515,0,0,-.04,k);box(.22,.015,.16,0x151515,0,0,-.04,k)}return k}
function laptop(g,x,y,z,ry=0,c=0xc9ccd0,open=true){const k=grp(x,y,z,ry,g);box(.32,.015,.22,c,0,0,0,k);if(open){const l=box(.32,.21,.012,c,0,.015,-.11,k);l.rotation.x=-.25;const s=new THREE.Mesh(new THREE.PlaneGeometry(.29,.18),glow(0x2b4a8a));s.position.set(0,.12,-.085);s.rotation.x=-.25;k.add(s)}return k}
function keyboard(g,x,y,z,ry=0,c=0x1c1c1c){return box(.42,.02,.14,c,x,y,z,g).rotation.y=ry}
function pad(g,x,y,z,w,d,c){box(w,.006,d,c,x,y,z,g)}
function chairOffice(g,x,z,ry,c=0x1b1b1b){const k=grp(x,0,z,ry,g);for(let i=0;i<5;i++){const a=i/5*Math.PI*2;const l=box(.3,.03,.04,0x9a9a9a,Math.sin(a)*.15,.06,Math.cos(a)*.15,k);l.rotation.y=a+Math.PI/2}
  cyl(.03,.03,.35,0x9a9a9a,0,.08,0,k,6);box(.48,.08,.46,c,0,.43,0,k);const b=box(.44,.55,.06,c,0,.52,-.22,k);b.rotation.x=-.1;for(const sx of[-.25,.25])box(.04,.04,.3,c,sx,.66,0,k);S(g,x,z,.28,.28,1.1);return k}
function chairGaming(g,x,z,ry){const k=chairOffice(g,x,z,ry,0x1b1b1b);const b=box(.5,.85,.08,0xb3171f,0,.55,-.25,k);b.rotation.x=-.12;box(.42,.75,.09,0x161616,0,.6,-.24,k).rotation.x=-.12;box(.2,.12,.08,0x161616,0,1.25,-.2,k);return k}
function pcTower(g,x,y,z,ry,inside=0xe2731c,ledC=null){const k=grp(x,y,z,ry,g);box(.22,.48,.48,0x141414,0,0,0,k);const w=new THREE.Mesh(new THREE.PlaneGeometry(.38,.36),ledC?glow(ledC):mat(inside,{emissive:inside,emissiveIntensity:.25}));w.position.set(.111,.25,0);w.rotation.y=Math.PI/2;k.add(w);
  if(ledC){const s=new THREE.Mesh(new THREE.BoxGeometry(.01,.02,.46),glow(ledC));s.position.set(.115,.02,0);k.add(s)}return k}
function books(g,x,y,z,w,h,d,seed,ry=0){const k=grp(x,y,z,ry,g),r=rnd(seed),C=[0x8a1f1f,0x1f3d6b,0xe8e2cf,0x2f5d3a,0x6b4b2a,0x9a7ac9,0xd8b84a,0x222222];let cx=-w/2;while(cx<w/2-.03){const bw=.025+r()*.035,bh=h*(.65+r()*.33);box(bw,bh,d*.85,C[r()*C.length|0],cx+bw/2,0,0,k);cx+=bw+.003}return k}
function bookcase(g,x,z,w,h,ry,c=0xd9d9d9,shelves=4,fill=true,depth=.32,seed=1){const k=grp(x,0,z,ry,g);for(const sx of[-w/2,w/2])box(.03,h,depth,c,sx,.06,0,k);for(let i=0;i<=shelves;i++)box(w,.025,depth,c,0,.06+i*h/shelves,0,k);box(w,h,.01,c,0,.06,-depth/2,k);
  if(fill)for(let i=0;i<shelves;i++)books(k,0,.09+i*h/shelves,0,w-.06,h/shelves-.06,depth-.04,seed+i);
  return k}
function sofa(g,x,z,ry,c,w=1.6,d=.85){const k=grp(x,0,z,ry,g);box(w,.38,d,c,0,.06,0,k);box(w,.45,.2,c,0,.44,-d/2+.1,k);for(const sx of[-w/2+.08,w/2-.08])box(.16,.28,d,c,sx,.44,0,k);return k}
function majlisRun(g,x,z,len,ry,c=0x7a1b22,c2=0xb88b4a){const k=grp(x,0,z,ry,g);box(len,.1,.7,c2,0,.06,0,k);const n=Math.floor(len/.8);for(let i=0;i<n;i++){const b=box(.72,.42,.16,c,-len/2+.4+i*.8,.16,-.27,k);b.rotation.x=-.12}return k}
function rug(g,x,z,w,d,t,ry=0){const m=new THREE.Mesh(new THREE.PlaneGeometry(w,d),tmat(t(),{roughness:1}));m.rotation.set(-Math.PI/2,0,ry);m.position.set(x,.072,z);m.receiveShadow=true;g.add(m)}
function tripod(g,x,z,h,c=0x1a1a1a){const k=grp(x,0,z,0,g);for(let i=0;i<3;i++){const a=i*2.1;const l=cyl(.01,.01,h*.6,c,Math.sin(a)*.18,.06,Math.cos(a)*.18,k,5);l.rotation.set(-Math.cos(a)*.32,0,Math.sin(a)*.32)}cyl(.014,.014,h*.5,c,0,h*.5,0,k,5);S(g,x,z,.15,.15,h);return k}
function softbox(g,x,z,h,ry,octa=false){const k=tripod(g,x,z,h,0x9aa0a6);const s=grp(0,h,0,ry,k);const sb=new THREE.Mesh(new THREE.CylinderGeometry(octa?.55:.35,.08,.35,octa?8:4,1,true),mat(0x161616,{side:THREE.DoubleSide}));sb.rotation.x=Math.PI/2;sb.rotation.y=octa?0:Math.PI/4;sb.position.z=.17;s.add(sb);
  const f=new THREE.Mesh(octa?new THREE.CircleGeometry(.54,8):new THREE.PlaneGeometry(.48,.48),glow(0xfff6e6));f.position.z=.35;s.add(f);return k}
function ringLight(g,x,z,h){const k=tripod(g,x,z,h);const r=new THREE.Mesh(new THREE.TorusGeometry(.2,.025,6,24),glow(0xffffff));r.position.y=h+.2;k.add(r);return k}
function ledPanel(g,x,z,h,ry,c=0x3b82f6){const k=tripod(g,x,z,h);const p=new THREE.Mesh(new THREE.BoxGeometry(.4,.3,.05),glow(c));p.position.y=h+.1;p.rotation.y=ry;k.add(p);return k}
function ledStick(g,x,z,h){const k=tripod(g,x,z,h*.8);const s=new THREE.Mesh(new THREE.CylinderGeometry(.025,.025,.6,8),glow(0xfff1d6));s.position.y=h*.8+.3;k.add(s);return k}
function floorLamp(g,x,z,shade=0x6d6a66,shadeLight=false){const k=grp(x,0,z,0,g);for(let i=0;i<3;i++){const a=i*2.1;const l=cyl(.012,.012,1.45,0xcfae84,Math.sin(a)*.12,.06,Math.cos(a)*.12,k,5);l.rotation.set(-Math.cos(a)*.14,0,Math.sin(a)*.14)}
  const sh=new THREE.Mesh(new THREE.CylinderGeometry(.18,.24,.3,10,1,true),shadeLight?glow(0xfff4e0):mat(shade,{side:THREE.DoubleSide}));sh.position.y=1.62;k.add(sh);S(g,x,z,.2,.2,1.8);return k}
function frame(g,x,y,z,w,h,ry,draw,border=0xc9a878){const k=grp(x,y,z,ry,g);box(w+.06,h+.06,.03,border,0,-(h+.06)/2,0,k);const t=ctex(256,Math.round(256*h/w),draw);const p=new THREE.Mesh(new THREE.PlaneGeometry(w,h),tmat(t));p.position.z=.017;k.add(p);return k}
function windowAC(g,x,y,z,ry){const k=grp(x,y,z,ry,g);box(.62,.42,.05,0xf3f3f3,0,0,0,k);box(.52,.32,.04,0xd9d9d9,0,.05,.02,k);for(let i=0;i<5;i++)box(.46,.012,.01,0x9a9a9a,0,.1+i*.05,.045,k);return k}
function curtain(g,x,z,w,ry,c=0xcfcac2){const k=grp(x,0,z,ry,g);const geo=new THREE.PlaneGeometry(w,2.2,10,1),p=geo.attributes.position;for(let i=0;i<p.count;i++){const j=Math.round((p.getX(i)/w+.5)*10);p.setZ(i,(j%2?1:-1)*.04)}geo.computeVertexNormals();const m=new THREE.Mesh(geo,mat(c,{side:THREE.DoubleSide}));m.position.y=1.25;k.add(m);return k}
function bed(g,x,z,ry,c=0x4b5563){const k=grp(x,0,z,ry,g);box(1.5,.35,2,0x9aa0a6,0,.06,0,k);box(1.45,.15,1.9,c,0,.41,.03,k);box(1.5,.8,.1,0xbfb8ad,0,.06,-1,k);for(const sx of[-.38,.38])box(.55,.12,.32,0xe5e7eb,sx,.56,-.75,k);S(g,x,z,.75,1,.6);return k}
function vine(g,x,z,ry,h=2){const k=grp(x,.35,z,ry,g);const r=rnd(3);for(let i=0;i<20;i++){const b=new THREE.Mesh(new THREE.IcosahedronGeometry(.05,0),mat(i%2?0x3f6b2a:0x55802f));b.position.set((r()-.5)*.25,i*h/20,0);k.add(b)}return k}
function plant(g,x,y,z,s=1){cyl(.06*s,.05*s,.1*s,0xf2f2f2,x,y,z,g,8);const r=rnd(9);for(let i=0;i<5;i++)ball(.05*s,0x4c7f33,x+(r()-.5)*.08*s,y+.14*s+r()*.06,z+(r()-.5)*.08*s,g)}
function headset(g,x,y,z,ry,c=0xb3171f){const k=grp(x,y,z,ry,g);const h=new THREE.Mesh(new THREE.TorusGeometry(.08,.012,6,12,Math.PI),mat(0x161616));h.position.y=.08;k.add(h);for(const sx of[-.08,.08]){const e=cyl(.045,.045,.03,c,sx,.04,0,k,10);e.rotation.z=Math.PI/2}return k}
function printer(g,x,y,z,ry,c=0xf2f2f2,accent=0xc3d93b){const k=grp(x,y,z,ry,g);box(.42,.16,.32,c,0,0,0,k);box(.4,.02,.3,accent,0,.16,0,k);box(.3,.12,.02,0xfafafa,0,.12,-.16,k);return k}
function fishTank(g,x,y,z){box(.28,.18,.18,mat(0xaee3f2,{transparent:true,opacity:.45}),x,y,z,g);box(.28,.04,.18,0x5fd35f,x,y,z,g);box(.3,.04,.2,0xff5fa2,x,y+.18,z,g)}
function teleprompterCam(g,x,z,ry,h=1.15){const k=tripod(g,x,z,h);const c=grp(0,h,0,ry,k);box(.16,.18,.36,0x161616,0,0,0,c);const l=cyl(.06,.06,.16,0x111111,0,0,0,c,10);l.rotation.x=Math.PI/2;l.position.set(0,.09,.24);box(.1,.07,.005,glow(0x2fbf4a),.12,.12,.05,c);box(.09,.06,.12,0x161616,0,.2,-.05,c);return k}

/* ══════════ الغرف ══════════ */
const ROOMS={
  // ٢٠٢٤ — الرياض: استوديو الشاشة الخضراء
  greenscreen(g){shell(g,{wall:0x1a1a1c,floor:T.marble});
    const cove=new THREE.Mesh(new THREE.PlaneGeometry(3.4,2.4),new THREE.MeshBasicMaterial({map:T.chroma(),toneMapped:false}));cove.position.set(.3,1.3,-RD+.06);g.add(cove);
    const fl=new THREE.Mesh(new THREE.PlaneGeometry(3.4,1.1),new THREE.MeshBasicMaterial({color:0x36b847,toneMapped:false}));fl.rotation.x=-Math.PI/2;fl.position.set(.3,.075,-RD+.6);g.add(fl);
    box(3.5,.06,.1,0x2a2a2a,.3,2.5,-RD+.08,g);
    desk(g,.3,-2.6,1.3,.65,.78,0x161616,0x161616);chairOffice(g,.3,-3.2,0,0xf2f2f2);box(.32,.22,.02,0xf0f0f0,-.1,.78,-2.6,g).rotation.x=-.3;box(.4,.01,.3,0xffffff,.45,.78,-2.55,g);S(g,.3,-2.6,.65,.33,.8);
    teleprompterCam(g,.2,-1.3,Math.PI);softbox(g,-1.4,-1.2,2.1,Math.PI*.85,true);ledStick(g,1.8,-2.9,1.5);floorLamp(g,-2.05,-3.7,0,true);
    bookcase(g,-2.1,-2.5,.5,.9,Math.PI/2,0x1c2a1f,2,true,.3,5);
    const L=new THREE.PointLight(0xffffff,2.2,6,1.6);L.position.set(-.6,2.2,-1.6);g.add(L)},
  // ٢٠٢٤ — الرياض: أوّل مكتب
  riyadh(g){shell(g,{wall:0xebe3d4,floor:T.navy});
    desk(g,0,-3.65,1.4,.7,.78,0xc8a676,0xe8e8e8);monitor(g,.15,.78,-3.85,.62,.38,0,0x3b2a7a);laptop(g,-.2,.86,-3.6,0,0xc9ccd0);box(.3,.08,.2,0x2a2a2a,-.2,.78,-3.62,g);
    pad(g,-.15,.78,-3.5,.62,.42,0x1f4d3a);pad(g,.05,.785,-3.35,.35,.22,0x8a2a22);
    const rc=box(.4,.05,.24,0x141414,.5,.79,-3.45,g);rc.rotation.x=-.1;['#ff3b6b','#ff8a1f','#2ee66d','#26c6ff','#ffd22e','#a855f7'].forEach((c,i)=>{const p=new THREE.Mesh(new THREE.BoxGeometry(.035,.012,.035),glow(new THREE.Color(c)));p.position.set(.62+(i%3)*.045,.85,-3.5+Math.floor(i/3)*.045);g.add(p)});
    const arm=cyl(.012,.012,.6,0x161616,-.6,.8,-3.8,g,6);arm.rotation.z=.5;cyl(.03,.03,.14,0x222222,-.82,1.25,-3.55,g,8);
    S(g,0,-3.65,.7,.35,.8);chairOffice(g,0,-2.8,Math.PI,0x2b2b2b);
    frame(g,-.6,2.15,-RD+.06,.38,.5,0,(c,w,h)=>{c.fillStyle='#e9e2c7';c.fillRect(0,0,w,h);c.fillStyle='#1c1712';c.font='700 40px '+FONT;c.textAlign='center';c.fillText('ألا عِم',w/2,h*.45);c.fillText('صباحاً',w/2,h*.7)});
    frame(g,0,2.3,-RD+.06,.4,.55,0,(c,w,h)=>{c.fillStyle='#efe4c8';c.fillRect(0,0,w,h);c.fillStyle='#6fb2a6';c.beginPath();c.moveTo(0,h*.4);c.lineTo(w*.4,h*.5);c.lineTo(w*.55,h);c.lineTo(0,h);c.fill()});
    frame(g,.6,2.15,-RD+.06,.38,.5,0,(c,w,h)=>{c.fillStyle='#e9e2c7';c.fillRect(0,0,w,h);c.fillStyle='#1c1712';c.font='700 40px '+FONT;c.textAlign='center';c.fillText('قِفا نَبكِ',w/2,h*.55)});
    const ck=new THREE.Mesh(new THREE.PlaneGeometry(.34,.12),new THREE.MeshBasicMaterial({map:ctex(256,90,(c,w,h)=>{c.fillStyle='#111';c.fillRect(0,0,w,h);c.fillStyle='#fff';c.font='700 70px monospace';c.textAlign='center';c.fillText('23:01',w/2,70)}),toneMapped:false}));ck.position.set(.2,1.68,-RD+.06);g.add(ck);
    floorLamp(g,-1.9,-3.6);rug(g,0,-2.4,3.6,2.6,T.navy)},
  // ٢٠٢٣ — الأحساء: غرفة الاستوديو
  ahsa2023(g){shell(g,{wall:0xeceae6,backColor:0x8e9399,floor:T.tile});
    windowAC(g,-.3,2.1,-RD+.06,0);curtain(g,.65,-RD+.12,.8,0,0xc9cdd2);curtain(g,-1.15,-RD+.12,.6,0,0xc9cdd2);
    desk(g,-2.05,-1.8,.7,1.6,.76,0xf4f4f4,0xd9c3a0,0);monitor(g,-2.25,.76,-2.2,.58,.34,Math.PI/2,0x2a3a6a);monitor(g,-2.25,.76,-1.45,.58,.34,Math.PI/2,0xeeeeee);laptop(g,-1.95,.76,-1.85,Math.PI/2,0x9aa0a6);plant(g,-2.2,.76,-2.65);S(g,-2.05,-1.8,.35,.8,.8);
    chairOffice(g,-1.4,-1.9,-Math.PI/2);chairOffice(g,-1.2,-.9,-Math.PI/2.4,0x222222);
    vine(g,-2.42,-2.95,Math.PI/2,2.1);frame(g,2.43,1.95,-2.2,.7,.5,-Math.PI/2,(c,w,h)=>{c.fillStyle='#e6e6e6';c.fillRect(0,0,w,h);c.strokeStyle='#333';c.lineWidth=3;for(let i=0;i<9;i++){c.beginPath();c.moveTo(20+i*26,h);c.lineTo(24+i*26,30);c.stroke()}},0x111111);
    softbox(g,-.6,-.9,1.9,-.7);ringLight(g,-1.5,-3.6,1.4);ledPanel(g,.3,-1.3,1.3,.6);
    sofa(g,1.4,-3.6,0,0x2c3e8f,1.6);box(.35,.3,.12,0xf2f2f2,1.7,.5,-3.55,g).rotation.z=.3;S(g,1.4,-3.6,.8,.43,.9);
    bookcase(g,2.2,-1.2,.6,.95,-Math.PI/2,0xf2f2f2,2,true,.3,7);S(g,2.2,-1.2,.17,.3,1);
    rug(g,.3,-2.3,2.6,2,T.abstract,.3);
    const L=new THREE.PointLight(0x39c6ff,1.4,4,1.8);L.position.set(1.6,1.6,-3.2);g.add(L)},
  // ٢٠١٩–٢٠٢١ — الأحساء: الخيمة الصغيرة
  tent(g){shell(g,{left:T.sadu,back:T.sadu,right:T.sadu,floor:T.sadoFloor});
    const top=0xc49a6c;desk(g,-.4,-3.75,2.6,.65,.76,top,0x8a6a45);desk(g,-1.95,-2.6,.65,1.8,.76,top,0x8a6a45);S(g,-.4,-3.75,1.3,.33,.8);S(g,-1.95,-2.6,.33,.9,.8);
    monitor(g,0,.76,-3.9,.78,.45,0,0x0d1a12);monitor(g,-.9,.76,-3.9,.6,.36,0,0x18301f);keyboard(g,-.3,.78,-3.55);
    const led=new THREE.Mesh(new THREE.BoxGeometry(2.6,.02,.02),glow(0x2fff7a));led.position.set(-.4,.74,-3.42);g.add(led);
    const led2=new THREE.Mesh(new THREE.BoxGeometry(2.4,.02,.02),glow(0x2fff7a));led2.position.set(-.4,1.15,-RD+.07);g.add(led2);
    chairGaming(g,-.6,-2.85,Math.PI);
    bookcase(g,2.05,-2.2,.75,2.1,-Math.PI/2,0x7a5634,5,false,.4);S(g,2.05,-2.2,.2,.38,2.2);
    softbox(g,1.2,-1.0,1.8,-.9);monitor(g,-1.95,.76,-2.3,.5,.3,Math.PI/2,0x111111);
    const door=box(.9,2.05,.05,0xf6f6f2,-2.45,.06,-1.0,g);door.rotation.y=Math.PI/2;
    const L=new THREE.PointLight(0x33ff88,2.4,5.5,1.5);L.position.set(-.4,1.0,-3.2);g.add(L)},
  // ٢٠١٨–٢٠١٩ — قرية العليا: المكتب الأبيض والمجلس
  qaryaWhite(g){shell(g,{wall:0xf3f1ec,floor:T.majlis});
    desk(g,-.9,-3.8,1.2,.6,.75,0xf7f7f7,0xf7f7f7);box(1.2,.69,.03,0xf7f7f7,-.9,.06,-4.08,g);S(g,-.9,-3.8,.6,.3,.8);
    monitor(g,-.9,.75,-3.95,.55,.33,0,0x2e5fae);keyboard(g,-1.05,.76,-3.62);pad(g,-.5,.75,-3.6,.32,.26,0x3a2a7a);ball(.03,0xf08a1c,-.5,.78,-3.6,g);headset(g,-1.35,.75,-3.75,0);
    chairOffice(g,-.9,-3.05,Math.PI);const cu=box(.4,.08,.4,0xe84393,-.9,.5,-3.05,g);box(.38,.32,.06,0x9ec5f2,-.9,.6,-2.84,g);
    bookcase(g,-2.15,-3.75,.5,.85,Math.PI/2,0x8a1f1f,2,true,.28,4);fishTank(g,-2.15,.94,-3.75);
    majlisRun(g,1.1,-3.95,2.6,0);majlisRun(g,2.15,-2.2,2.6,-Math.PI/2);
    windowAC(g,.3,2.05,-RD+.06,0);frame(g,-1.7,2.1,-RD+.06,.4,.5,0,(c,w,h)=>{c.fillStyle='#ddd';c.fillRect(0,0,w,h);c.fillStyle='#777';c.fillRect(20,h*.5,w-40,h*.4)},0x111111);
    const clock=new THREE.Mesh(new THREE.TorusGeometry(.18,.02,6,16),mat(0x111111));clock.position.set(1.7,2.0,-RD+.07);g.add(clock);
    const door=box(.85,2.05,.05,0xb5401f,2.43,.06,-.6,g);door.rotation.y=Math.PI/2},
  // ٢٠١٨ — قرية العليا: الإضاءة الزرقاء
  blue(g){shell(g,{wall:0xe9e1c6,floor:T.greyCarpet});
    desk(g,-.6,-3.75,1.4,.6,.75,0xf4f4f4,0xf4f4f4);box(.03,.69,.6,0xf4f4f4,-1.28,.06,-3.75,g);desk(g,.5,-3.55,1.0,.45,1.05,0xf4f4f4,0xf4f4f4);S(g,-.6,-3.75,.7,.3,.8);S(g,.5,-3.55,.5,.23,1.1);
    monitor(g,-.95,.75,-3.9,.55,.33,0,0x0f2f4a);keyboard(g,-.75,.76,-3.6);pad(g,-.55,.75,-3.6,.6,.3,0x1d1d1d);ball(.035,0xd0312d,-.3,.78,-3.6,g);headset(g,.45,1.05,-3.6,0);
    pcTower(g,-.2,.06,-3.75,Math.PI/2,0x0,0x2fa8ff);chairOffice(g,.6,-2.9,Math.PI);
    const L=new THREE.PointLight(0x2fd0ff,3,5,1.4);L.position.set(-.3,.6,-3.5);g.add(L);const L2=new THREE.PointLight(0x2fb8ff,3.2,4.5,1.3);L2.position.set(-.4,1.9,-3.7);g.add(L2);
    const strip=new THREE.Mesh(new THREE.BoxGeometry(1.4,.02,.02),glow(0x2fd0ff));strip.position.set(-.6,.72,-3.47);g.add(strip)},
  // ٢٠١٧ — الأحساء: مكتب المكتبة
  library(g){shell(g,{wall:0xefece4,floor:T.floral});
    bookcase(g,-1.05,-3.95,1.5,2.0,0,0xd9d9d9,5,true,.36,11);bookcase(g,.55,-3.95,1.5,2.0,0,0xd9d9d9,5,true,.36,21);S(g,-.25,-3.95,1.55,.2,2.1);
    sofa(g,-1.4,-2.4,Math.PI/2,0x5a4636,1.1,.95);const em=new THREE.Mesh(new THREE.SphereGeometry(.22,10,8),mat(0xf3c623));em.scale.z=.5;em.position.set(-1.9,.72,-1.9);g.add(em);box(.18,.04,.01,0x111111,-1.9,.78,-1.79,g);S(g,-1.4,-2.4,.48,.55,.9);
    desk(g,1.3,-2.1,.9,1.3,.72,0x3a1d14,0x2a140e,0);pcTower(g,1.35,.72,-2.35,-Math.PI/2,0x333333);monitor(g,1.55,.72,-1.75,.48,.3,-Math.PI/2,0x1f2a40);S(g,1.3,-2.1,.45,.65,.8);
    box(.42,.3,.32,0xd0312d,.3,.06,-3.4,g);box(.3,.32,.28,0x2f9e7a,-.35,.06,-3.4,g)},
  // ٢٠١٦–٢٠١٧ — قرية العليا: جدار البكسل آرت
  pixel(g){shell(g,{back:T.pixel,wall:0xefe3b4,floor:T.greenCarpet});
    desk(g,-.3,-3.75,2.4,.65,.74,0xc79a5a,0xc79a5a);S(g,-.3,-3.75,1.2,.33,.8);
    pcTower(g,.45,.74,-3.85,0,0xe2731c);box(.22,.1,.12,0xf2f2f2,.45,1.22,-3.8,g);monitor(g,-.2,.74,-3.85,.5,.32,.2,0x6a2a8a);keyboard(g,.1,.75,-3.55);pad(g,.15,.74,-3.55,.6,.32,0x1f7a3a);ball(.035,0xd0312d,.35,.77,-3.55,g);
    printer(g,-1.15,.74,-3.7,.3);box(.32,.14,.12,0x161616,-1.0,.74,-3.4,g);plant(g,-.75,.74,-3.9,.6);
    chairOffice(g,.2,-2.9,Math.PI);headset(g,1.7,1.4,-RD+.12,0,0x161616);
    const L=new THREE.PointLight(0xff4fd8,1.2,4,1.8);L.position.set(1.4,1.8,-3);g.add(L)},
  // ٢٠١٥ — قرية العليا: البداية
  beginning(g){shell(g,{back:T.drawings,wall:0xe7c862,floor:T.floral});
    const d=desk(g,.6,-3.7,1.3,.7,.8,0x3a1810,0x2a0f0a);box(1.2,.72,.62,0x4a1f14,.6,.06,-3.7,g);S(g,.6,-3.7,.65,.35,.85);
    laptop(g,.75,.8,-3.75,0,0x161616);const ap=new THREE.Mesh(new THREE.CircleGeometry(.025,10),glow(0xffffff));ap.position.set(.75,.98,-3.86);ap.rotation.x=-.25;ap.rotation.y=Math.PI;g.add(ap);
    ball(.045,0xe6b34a,.35,.84,-3.55,g,1);box(.08,.03,.05,0x111111,.45,.8,-3.5,g);
    const ch=grp(-.2,0,-3.3,.4,g);box(.45,.45,.45,0x3b2414,0,.06,0,ch);const bl=box(.48,.7,.1,0x4a2e1c,0,.5,-.2,ch);
    majlisRun(g,-1.3,-3.95,2.2,0,0x6b1420,0xc99b4a);majlisRun(g,-2.15,-2.2,2.8,Math.PI/2,0x6b1420,0xc99b4a)},
};
return {ROOMS,shell};
}
