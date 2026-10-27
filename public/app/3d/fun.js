/*
 * fun.js — أشياء تفاعليّة بسيطة للزوّار (لا تلمس بيانات النظام)
 * ─────────────────────────────────────────────────────────────────────────
 * كرة تُركل في الساحة · زرّ احتفال يطلق ألعاباً ناريّة · أزرار RØDECaster تعزف إيقاعاً
 * · الأباجورة تُطفأ وتُضاء · الدلّة في المجلس تصبّ قهوة ببخار.
 * الأصوات مولَّدة بـ WebAudio (بلا ملفّات).
 */
export function buildFun(C){
const {THREE,scene,mat,box,cyl,grp,ctex,act,toast,COL,GOLD,FONT}=C;
const FX=[]; // مؤثّرات مؤقّتة: {t,life,step(dt,k),done()}

/* ── صوت ── */
let AC=null;const ac=()=>{if(!AC)AC=new (window.AudioContext||window.webkitAudioContext)();if(AC.state==='suspended')AC.resume();return AC};
function tone(f,d=.15,type='sine',v=.2,to=0,at=0){const a=ac(),t=a.currentTime+at,o=a.createOscillator(),g=a.createGain();o.type=type;o.frequency.setValueAtTime(f,t);if(to)o.frequency.exponentialRampToValueAtTime(to,t+d);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(g).connect(a.destination);o.start(t);o.stop(t+d+.02)}
function noise(d=.2,v=.3,freq=800,type='highpass',at=0){const a=ac(),t=a.currentTime+at,b=a.createBuffer(1,Math.ceil(a.sampleRate*d),a.sampleRate),c=b.getChannelData(0);for(let i=0;i<c.length;i++)c[i]=(Math.random()*2-1)*(1-i/c.length);
  const s=a.createBufferSource();s.buffer=b;const f=a.createBiquadFilter();f.type=type;f.frequency.value=freq;const g=a.createGain();g.gain.value=v;s.connect(f).connect(g).connect(a.destination);s.start(t)}
const kick=at=>tone(150,.22,'sine',.5,45,at),snare=at=>{noise(.16,.35,1500,'highpass',at);tone(190,.08,'triangle',.18,0,at)},hat=at=>noise(.05,.18,7000,'highpass',at);

/* ── RØDECaster: إيقاع من ٨ خطوات وأزرار تومض ── */
const PADS=C.PADS||[];PADS.forEach(p=>p.userData.base=p.material.color.clone());
const flash=i=>{const p=PADS[i%PADS.length];if(p){p.material.color.set(0xffffff);p.userData.f=1}};
let beatBusy=false;
function beat(){if(beatBusy)return;beatBusy=true;const S=.13,pat=[[kick,hat],[hat],[snare,hat],[hat],[kick,hat],[kick],[snare,hat],[hat,hat]];
  pat.forEach((st,i)=>{st.forEach(fn=>fn(i*S));setTimeout(()=>{flash(i);flash(i+3)},i*S*1000)});setTimeout(()=>beatBusy=false,pat.length*S*1000)}
if(C.rc)act(C.rc,'اعزف إيقاعاً',beat,[.42,.25,.32,-.12,.12,-.02]);

/* ── الأباجورة ── */
let lampOn=true;
if(C.lamp)act(C.lamp.group,'شغّل / أطفئ الأباجورة',()=>{lampOn=!lampOn;C.lamp.light.intensity=lampOn?4.2:0;C.lamp.bulb.visible=lampOn;tone(lampOn?1400:900,.04,'square',.08)},[.6,1.9,.6,0,.95,0]);

/* ── الكرة في الساحة ── */
const ballTex=ctex(256,128,(g,w,h)=>{g.fillStyle='#f4f4f4';g.fillRect(0,0,w,h);g.fillStyle='#161616';for(const [x,y] of[[30,30],[100,64],[170,26],[230,80],[60,100],[140,110],[205,10]]){g.beginPath();for(let k=0;k<5;k++){const a=k/5*Math.PI*2;g.lineTo(x+Math.cos(a)*16,y+Math.sin(a)*16)}g.fill()}});
const R=.3,ball=new THREE.Mesh(new THREE.IcosahedronGeometry(R,1),new THREE.MeshStandardMaterial({map:ballTex,roughness:.6,flatShading:true}));ball.castShadow=true;scene.add(ball);
const B={x:13,z:6.2,y:R,vx:0,vz:0,vy:0};ball.position.set(B.x,B.y,B.z);
let lastP=null;
act(ball,'اركل الكرة',()=>{if(!lastP)return;const fx=-Math.sin(lastP.yaw),fz=-Math.cos(lastP.yaw);B.vx=fx*9;B.vz=fz*9;B.vy=4.2;tone(90,.12,'sine',.45,50);noise(.05,.2,2000)});
const axis=new THREE.Vector3();
function ballStep(dt,P){
  const dx=B.x-P.x,dz=B.z-P.z,d=Math.hypot(dx,dz);
  if(d<R+.3&&P.y<B.y+.4&&d>1e-4){const nx=dx/d,nz=dz/d,pv=Math.max(0,P.vx*nx+P.vz*nz),push=pv*1.5+1;B.vx=nx*push+P.vx*.25;B.vz=nz*push+P.vz*.25;B.x=P.x+nx*(R+.31);B.z=P.z+nz*(R+.31);if(pv>2.5){B.vy=1.6;tone(100,.07,'sine',.25,55)}}
  B.vy-=19*dt;B.y+=B.vy*dt;if(B.y<R){B.y=R;if(B.vy<-1.2){B.vy*=-.45}else B.vy=0}
  const onG=B.y<=R+.01,fr=Math.exp(-dt*(onG?1.1:.15));B.vx*=fr;B.vz*=fr;
  let nx=B.x+B.vx*dt,nz=B.z+B.vz*dt;
  for(const c of COL){if(c.top<.35||B.y-R>c.top)continue;
    if(nx+R>c.x0&&nx-R<c.x1&&B.z+R>c.z0&&B.z-R<c.z1){B.vx*=-.6;nx=B.x;tone(140,.05,'triangle',.12)}
    if(B.x+R>c.x0&&B.x-R<c.x1&&nz+R>c.z0&&nz-R<c.z1){B.vz*=-.6;nz=B.z}}
  const bx=C.bounds;if(nx<bx.x0+R||nx>bx.x1-R){B.vx*=-.6;nx=Math.max(bx.x0+R,Math.min(bx.x1-R,nx))}if(nz<bx.z0+R||nz>bx.z1-R){B.vz*=-.6;nz=Math.max(bx.z0+R,Math.min(bx.z1-R,nz))}
  const mv=Math.hypot(nx-B.x,nz-B.z);if(mv>1e-5){axis.set(nz-B.z,0,-(nx-B.x)).normalize();ball.rotateOnWorldAxis(axis,mv/R)}
  B.x=nx;B.z=nz;ball.position.set(B.x,B.y,B.z)}

/* ── زرّ الاحتفال: ألعاب ناريّة ── */
{const x=20.6,z=7.6,g=grp(x,0,z,Math.atan2(16-x,2-z));box(.7,.95,.7,0x1b1b1b,0,0,0,g);box(.78,.06,.78,0xe8c766,0,.95,0,g);
  const btn=cyl(.2,.22,.1,new THREE.MeshBasicMaterial({color:0xd62828,toneMapped:false}),0,1.0,0,g,18);
  const t=ctex(256,96,(c,w,h)=>{c.fillStyle='#1b1b1b';c.fillRect(0,0,w,h);c.fillStyle=GOLD;c.textAlign='center';c.font='700 46px '+FONT;c.fillText('احتفال!',w/2,64)});
  const lb=new THREE.Mesh(new THREE.PlaneGeometry(.66,.25),new THREE.MeshBasicMaterial({map:t,toneMapped:false}));lb.position.set(0,.7,.352);g.add(lb);
  C.COL.push({x0:x-.4,x1:x+.4,z0:z-.4,z1:z+.4,y0:0,top:1});
  act(g,'اضغط للاحتفال',()=>{btn.position.y=.95;setTimeout(()=>btn.position.y=1.0,160);tone(600,.06,'square',.1);for(let i=0;i<3;i++)setTimeout(()=>rocket(16+(i-1)*4,-1.5+i*1.2),i*380)},[.8,1.3,.8,0,.6,0])}
const COLORS=[0xe8c766,0xffffff,0x2dd4bf,0xff5a5f,0xa78bfa];
function rocket(x,z){const head=new THREE.Mesh(new THREE.SphereGeometry(.08,6,4),new THREE.MeshBasicMaterial({color:0xffe8a8,toneMapped:false,fog:false}));head.position.set(x,1,z);scene.add(head);
  const top=13+Math.random()*6;noise(.7,.12,3000,'bandpass');
  FX.push({t:0,step(dt){head.position.y+=dt*22;return head.position.y<top},end(){scene.remove(head);burst(x,top,z)}})}
function burst(x,y,z){const n=170,pos=new Float32Array(n*3),vel=[];for(let i=0;i<n;i++){pos.set([x,y,z],i*3);const u=Math.random()*2-1,a=Math.random()*Math.PI*2,s=Math.sqrt(1-u*u),sp=6+Math.random()*3;vel.push([Math.cos(a)*s*sp,u*sp,Math.sin(a)*s*sp])}
  const gm=new THREE.BufferGeometry();gm.setAttribute('position',new THREE.BufferAttribute(pos,3));
  const m=new THREE.PointsMaterial({color:COLORS[Math.random()*COLORS.length|0],size:.32,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,fog:false,toneMapped:false});
  const pts=new THREE.Points(gm,m);scene.add(pts);noise(.5,.45,400,'lowpass');tone(70,.35,'sine',.35,40);
  FX.push({t:0,step(dt){this.t+=dt;const p=gm.attributes.position.array;for(let i=0;i<n;i++){vel[i][1]-=4*dt;const k=Math.exp(-dt*1.2);vel[i][0]*=k;vel[i][2]*=k;p[i*3]+=vel[i][0]*dt;p[i*3+1]+=vel[i][1]*dt;p[i*3+2]+=vel[i][2]*dt}gm.attributes.position.needsUpdate=true;m.opacity=Math.max(0,1-this.t/2.2);return this.t<2.2},end(){scene.remove(pts);gm.dispose();m.dispose()}})}

/* ── الدلّة في المجلس: قهوة ببخار ── */
{const x=16,z=19.2,zone=new THREE.Mesh(new THREE.BoxGeometry(1.2,1.1,.9),new THREE.MeshBasicMaterial({visible:false}));zone.position.set(x,.5,z);scene.add(zone);
  act(zone,'قهوة؟',()=>{toast('تفضّل قهوتك — حيّاك الله في المجلس');noise(1.1,.12,600,'lowpass');
    for(let i=0;i<14;i++){const s=new THREE.Sprite(new THREE.SpriteMaterial({color:0xffffff,transparent:true,opacity:0,depthWrite:false}));s.scale.setScalar(.08);s.position.set(x+.14+(Math.random()-.5)*.05,.62,z);scene.add(s);
      const d=i*.12;FX.push({t:-d,step(dt){this.t+=dt;if(this.t<0)return true;const k=this.t/1.6;s.position.y+=dt*.35;s.position.x+=Math.sin(this.t*4+i)*dt*.05;s.scale.setScalar(.08+k*.18);s.material.opacity=.5*(1-k)*Math.min(1,this.t*5);return k<1},end(){scene.remove(s);s.material.dispose()}})}})}

function update(dt,P,live){lastP=P;if(live)ballStep(dt,P);
  for(let i=FX.length-1;i>=0;i--){if(!FX[i].step(dt)){FX[i].end();FX.splice(i,1)}}
  PADS.forEach(p=>{if(p.userData.f>0){p.userData.f=Math.max(0,p.userData.f-dt*5);p.material.color.copy(p.userData.base).lerp(new THREE.Color(0xffffff),p.userData.f)}})}
return {update};
}
