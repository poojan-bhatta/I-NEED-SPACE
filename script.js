const $=s=>document.querySelector(s);
const W=1280,H=720;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));

/* ---------- scaling ---------- */
function fit(){const s=Math.min(innerWidth/W,innerHeight/H);$('#stage').style.transform='translate(-50%,-50%) scale('+s+')'}
addEventListener('resize',fit);fit();

/* ---------- photos: drop public-domain NASA images into /assets, fallback to drawn art ---------- */
const PH={};
function photo(name){if(!(name in PH)){PH[name]=null;const i=new Image();i.onload=()=>{PH[name]=i};i.onerror=()=>{PH[name]=false};i.src='assets/'+name}return PH[name]}
function drawPhoto(c,name,x,y,w,h,fallback){const p=photo(name);if(p){c.save();c.beginPath();c.rect(x,y,w,h);c.clip();const s=Math.max(w/p.width,h/p.height);c.drawImage(p,x+(w-p.width*s)/2,y+(h-p.height*s)/2,p.width*s,p.height*s);c.restore()}else if(fallback)fallback()}

/* ---------- input ---------- */
const K={},M={x:0,y:0,down:false};
addEventListener('keydown',e=>{K[e.code]=true;if(e.code==='Space'||e.code==='Enter'){e.preventDefault();advance()}});
addEventListener('keyup',e=>{K[e.code]=false});
addEventListener('pointerup',()=>{M.down=false});

/* ---------- dialogue ---------- */
let adv=null,skipT=null;
function advance(){if(skipT){skipT();return}if(adv)adv()}
$('#dlg').addEventListener('click',advance);
let voiceOn=true;
function pickVoice(){const v=('speechSynthesis' in window)?speechSynthesis.getVoices():[];return v.find(x=>/^en/i.test(x.lang)&&/male|david|daniel|alex|uk english male/i.test(x.name))||v.find(x=>/^en/i.test(x.lang))||null}
function speak(who,text){if(!voiceOn||!('speechSynthesis' in window))return;speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.voice=pickVoice();u.rate=.92;u.pitch=who==='CONTROL'?1.1:.85;u.volume=1;speechSynthesis.speak(u)}
$('#vbtn').addEventListener('click',e=>{e.stopPropagation();voiceOn=!voiceOn;e.target.textContent='Voice: '+(voiceOn?'on':'off');if(!voiceOn&&'speechSynthesis' in window)speechSynthesis.cancel()});
function say(who,text){speak(who,text);return new Promise(res=>{$('#dlg').classList.add('on');$('#dn').textContent=who||'';const t=$('#dt');t.textContent='';let i=0,iv=null;
  const fin=()=>{clearInterval(iv);skipT=null;t.textContent=text;adv=()=>{adv=null;res()}};
  skipT=fin;iv=setInterval(()=>{i++;t.textContent=text.slice(0,i);if(i>=text.length)fin()},22)})}
function choose(opts){return new Promise(res=>{const box=$('#ch');box.innerHTML='';box.style.display='flex';
  opts.forEach(o=>{const b=document.createElement('button');b.className='btn alt';b.textContent=o.t;b.onclick=e=>{e.stopPropagation();box.style.display='none';box.innerHTML='';res(o.id)};box.appendChild(b)})})}

/* ---------- opening scenes: black and white, illustrated, past tense ---------- */
const oc=$('#oc').getContext('2d');
let oscene=null,ot0=0,otNow=0;
const INK='#0b0b0b',G1='#262626',G2='#4d4d4d',G3='#7d7d7d',G4='#aaaaaa',G5='#e4e4e4';
function bwtxt(c,s,x,y,size,col,align){c.fillStyle=col;c.font=size+'px "Bebas Neue",Impact,sans-serif';c.textAlign=align||'left';c.fillText(s,x,y);c.textAlign='left'}
function starsBW(c,n){for(let i=0;i<n;i++){c.fillStyle=i%5?G4:G5;const s=i%7?1:2;c.fillRect((i*311)%W,(i*173)%(H*.7),s,s)}}
function figure(c,x,y,s,col){c.save();c.translate(x,y);c.scale(s,s);c.fillStyle=col;
  c.beginPath();c.arc(0,-60,28,0,7);c.fill();
  c.beginPath();c.moveTo(-50,0);c.quadraticCurveTo(-54,-44,-30,-48);c.lineTo(30,-48);c.quadraticCurveTo(54,-44,50,0);c.closePath();c.fill();c.restore()}
function rocketBW(c,x,y,s){c.save();c.translate(x,y);c.scale(s,s);c.strokeStyle=INK;c.lineWidth=3;
  c.fillStyle=G5;c.beginPath();c.moveTo(-30,0);c.lineTo(-30,-120);c.quadraticCurveTo(0,-190,30,-120);c.lineTo(30,0);c.closePath();c.fill();c.stroke();
  c.fillStyle=G3;c.beginPath();c.moveTo(-30,-40);c.lineTo(-62,10);c.lineTo(-30,10);c.closePath();c.fill();c.stroke();
  c.beginPath();c.moveTo(30,-40);c.lineTo(62,10);c.lineTo(30,10);c.closePath();c.fill();c.stroke();
  c.fillStyle=G2;c.beginPath();c.arc(0,-70,11,0,7);c.fill();c.restore()}
function flameBW(c,x,y,s,t){c.save();c.translate(x,y);c.scale(s,s);const f=40+Math.sin(t*40)*8;
  c.fillStyle=G4;c.beginPath();c.moveTo(-22,0);c.lineTo(22,0);c.lineTo(0,f+40);c.closePath();c.fill();
  c.fillStyle=G5;c.beginPath();c.moveTo(-12,0);c.lineTo(12,0);c.lineTo(0,f);c.closePath();c.fill();c.restore()}
function scEarth(c,t){drawPhoto(c,'scene1.webp',0,0,W,H,()=>scEarthFallback(c,t))}
function scEarthFallback(c,t){c.fillStyle=INK;c.fillRect(0,0,W,H);starsBW(c,160);
  const g=c.createRadialGradient(640,1300,200,640,1300,1020);g.addColorStop(0,G3);g.addColorStop(.55,G1);g.addColorStop(1,INK);
  c.fillStyle=g;c.beginPath();c.arc(640,1300,1020,0,7);c.fill();
  c.strokeStyle=G5;c.lineWidth=5;c.beginPath();c.arc(640,1300,1022,Math.PI*1.25,Math.PI*1.75);c.stroke()}
function scStations(c,t){drawPhoto(c,'scene2.webp',0,0,W,H,()=>scStationsFallback(c,t))}
function scStationsFallback(c,t){c.fillStyle=INK;c.fillRect(0,0,W,H);starsBW(c,110);
  for(let k=0;k<3;k++){const x=180+k*420,y=240+k*40;c.fillStyle=G2;c.fillRect(x-120,y,240,18);c.beginPath();c.arc(x,y-30,60,0,7);c.fill();c.fillRect(x-6,y-120,12,90)}
  c.save();c.translate(640,520);c.rotate(-.12);c.strokeStyle=G5;c.lineWidth=7;c.strokeRect(-260,-70,520,140);
  c.fillStyle=G5;c.font='130px "Bebas Neue",Impact,sans-serif';c.textAlign='center';c.fillText('CLOSED',0,44);c.restore()}
function scHouston(c,t){drawPhoto(c,'scene3.webp',0,0,W,H,()=>scHoustonFallback(c,t))}
function scHoustonFallback(c,t){c.fillStyle=G1;c.fillRect(0,0,W,H);
  c.fillStyle=G2;c.fillRect(0,0,W,380);c.fillStyle=G3;c.fillRect(980,60,220,230);
  c.fillStyle='#1c1c1c';c.fillRect(0,520,W,200);
  c.fillStyle=G4;c.fillRect(440,110,400,220);c.strokeStyle=INK;c.lineWidth=4;c.strokeRect(440,110,400,220);
  c.fillStyle=INK;c.fillRect(640+Math.sin(t*2)*140-5,210,10,10);
  for(let i=0;i<5;i++){const x=180+i*210;c.fillStyle=G3;c.fillRect(x-70,470,140,18);figure(c,x,470,.9,G5)}
  c.strokeStyle=G5;c.lineWidth=4;c.beginPath();c.arc(1120,110,40,0,7);c.stroke()}
function scSignal(c,t,lt){drawPhoto(c,'scene4.webp',0,0,W,H,()=>scSignalFallback(c,t,lt))}
function scSignalFallback(c,t,lt){c.fillStyle=INK;c.fillRect(0,0,W,H);starsBW(c,120);
  c.fillStyle=G1;c.beginPath();c.moveTo(0,720);c.lineTo(0,600);c.lineTo(W,640);c.lineTo(W,720);c.fill();
  c.save();c.translate(260,540);c.rotate(-.5);c.fillStyle=G4;c.beginPath();c.ellipse(0,0,140,80,0,Math.PI,2*Math.PI);c.fill();c.restore();
  const amp=70*Math.min(1,lt/3);c.strokeStyle=G5;c.lineWidth=4;c.beginPath();
  for(let x=0;x<W;x+=6){const y=300+Math.sin(x*.05-t*6)*amp;x?c.lineTo(x,y):c.moveTo(x,y)}c.stroke()}
function scAnalysis(c,t,lt){drawPhoto(c,'scene5.webp',0,0,W,H,()=>scAnalysisFallback(c,t,lt))}
function scAnalysisFallback(c,t,lt){c.fillStyle=INK;c.fillRect(0,0,W,H);
  const rows=['DAY 1 — THE PATTERN REPEATS','DAY 2 — NO TRANSMITTER FOUND','DAY 3 — NO MATCH IN ARCHIVES','DAY 4 — STILL NOTHING'];
  rows.forEach((r,i)=>{if(lt<i*2.2)return;c.fillStyle=G4;c.fillRect(120,120+i*120,1040,80);bwtxt(c,r,150,180+i*120,54,INK)});
  c.strokeStyle=G3;c.lineWidth=3;c.beginPath();for(let x=0;x<W;x+=6){const y=640+Math.sin(x*.08-t*5)*18;x?c.lineTo(x,y):c.moveTo(x,y)}c.stroke()}
function scPrep(c,t){drawPhoto(c,'scene6.webp',0,0,W,H,()=>scPrepFallback(c,t))}
function scPrepFallback(c,t){const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,G2);g.addColorStop(1,INK);c.fillStyle=g;c.fillRect(0,0,W,H);
  c.fillStyle=G3;c.beginPath();c.arc(1000,200,70,0,7);c.fill();
  c.fillStyle='#161616';c.fillRect(0,600,W,120);c.fillStyle=G1;c.fillRect(120,380,220,220);
  rocketBW(c,760,600,1.5);figure(c,330,600,1.1,G5)}
const ROCK={x0:460,y0:40,w:106,h:360};
function plume(c,x,y,t,lt){const f=70+Math.sin(t*30)*6+(lt-5)*4;const g=c.createLinearGradient(0,y,0,y+f);
  g.addColorStop(0,'rgba(240,240,240,.95)');g.addColorStop(1,'rgba(200,200,200,0)');c.fillStyle=g;
  c.beginPath();c.moveTo(x-16,y);c.quadraticCurveTo(x,y+f*1.25,x+16,y);c.closePath();c.fill()}
function launchPuffs(c,lt,padY){for(let i=0;i<46;i++){const age=((lt-5)*.32+i*.0217)%1;const sx=640+Math.sin(i*1.7)*(60+age*240);
    const sy=padY+30-age*300+(i%5)*5;const r=24+age*170;const a=.36*(1-age)*Math.min(1,age*6);
    c.fillStyle='rgba(205,205,205,'+a.toFixed(3)+')';c.beginPath();c.arc(sx,sy,r,0,7);c.fill()}}
function scLaunch(c,t,lt){const bg=photo('launch_bg.webp'),rk=photo('rocket.webp');
  const sx=W/1024,sy=H/572;
  let lift=0,shx=0,shy=0;
  if(lt>5){const k=lt-5;lift=k*k*6;shx=(Math.random()-.5)*3*Math.min(1,k/2);shy=(Math.random()-.5)*2*Math.min(1,k/2)}
  const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'#5d5d5d');g.addColorStop(1,'#cfcbc6');c.fillStyle=g;c.fillRect(0,0,W,H);
  if(bg)c.drawImage(bg,0,0,W,H);
  if(rk)c.drawImage(rk,(ROCK.x0+shx)*sx,(ROCK.y0-lift+shy)*sy,ROCK.w*sx,ROCK.h*sy);
  if(lt>5){const base=(392-lift+shy)*sy;plume(c,512.5*sx+shx,base,t,lt);launchPuffs(c,lt,430*sy)}
  if(lt>5){const q0=Math.max(0,Math.min(1,(lt-5)/7));const cover=q0*q0*(3-2*q0);
    c.fillStyle='rgba(190,190,190,'+(cover*.92).toFixed(3)+')';c.fillRect(0,0,W,H);
    for(let i=0;i<70;i++){const q=((lt-5)*.22+i*.0143)%1;const x=(i*197)%W;const y=H*(.15+.75*((i*.37)%1));const r=140+q*320;
      c.fillStyle='rgba(222,222,222,'+(cover*.22*(1-q*.5)).toFixed(3)+')';c.beginPath();c.arc(x,y,r,0,7);c.fill()}}
  if(lt<5){bwtxt(c,String(5-Math.floor(lt)),640,320,240,'rgba(228,228,228,.9)','center')}
  else if(lt<6.5){bwtxt(c,'LIFTOFF',640,250,120,'rgba(228,228,228,.9)','center')}}
function scOrbit(c,t,lt){const p=photo('orbit.webp');
  if(p){c.drawImage(p,0,0,W,H)}else{scOrbitFallback(c,t)}
  const smoke=Math.max(0,1-(lt||0)/3)*.92;if(smoke>0){c.fillStyle='rgba(190,190,190,'+smoke.toFixed(3)+')';c.fillRect(0,0,W,H)}}
function roundRect(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.lineTo(x+w-r,y);c.quadraticCurveTo(x+w,y,x+w,y+r);c.lineTo(x+w,y+h-r);c.quadraticCurveTo(x+w,y+h,x+w-r,y+h);c.lineTo(x+r,y+h);c.quadraticCurveTo(x,y+h,x,y+h-r);c.lineTo(x,y+r);c.quadraticCurveTo(x,y,x+r,y);c.closePath()}
function cockpitView(c,t){
  // window bezel: dark frame around a rounded glass window
  c.save();c.beginPath();c.rect(0,0,W,H);roundRect(c,58,36,W-116,520,46);c.fillStyle='#0c0c0c';c.fill('evenodd');
  c.strokeStyle='#2a2a2a';c.lineWidth=3;roundRect(c,58,36,W-116,520,46);c.stroke();
  // window struts
  c.fillStyle='#161616';c.fillRect(636,36,8,520);c.fillRect(58,300,W-116,8);
  // console
  const g=c.createLinearGradient(0,556,0,H);g.addColorStop(0,'#1a1a1a');g.addColorStop(1,'#050505');
  c.fillStyle=g;c.beginPath();c.moveTo(0,556);c.lineTo(W,556);c.lineTo(W,H);c.lineTo(0,H);c.closePath();c.fill();
  c.strokeStyle='#3a3a3a';c.lineWidth=2;c.beginPath();c.moveTo(0,556);c.lineTo(W,556);c.stroke();
  // dials and switches
  for(let i=0;i<9;i++){const x=150+i*115;c.fillStyle='#0d0d0d';c.beginPath();c.arc(x,630,30,0,7);c.fill();c.strokeStyle='#4a4a4a';c.lineWidth=3;c.stroke();
    c.strokeStyle='#8a8a8a';c.beginPath();c.moveTo(x,630);c.lineTo(x+Math.cos(i+t*.3)*22,630+Math.sin(i+t*.3)*22);c.stroke()}
  for(let i=0;i<14;i++){c.fillStyle=(i%5===0)?'#e8a33d':'#2a2a2a';c.fillRect(120+i*72,680,26,12)}
  // glass glare
  const gl=c.createLinearGradient(0,36,W*.6,556);gl.addColorStop(0,'rgba(255,255,255,0.10)');gl.addColorStop(.45,'rgba(255,255,255,0)');
  c.fillStyle=gl;roundRect(c,66,44,W-132,504,40);c.fill();
  c.restore()}
function scOrbitFallback(c,t){c.fillStyle=INK;c.fillRect(0,0,W,H);starsBW(c,200);
  const g=c.createRadialGradient(640,1500,300,640,1500,1060);g.addColorStop(0,G3);g.addColorStop(1,INK);c.fillStyle=g;c.beginPath();c.arc(640,1500,1050,0,7);c.fill();
  figure(c,300,700,1.4,G5);
  c.strokeStyle=INK;c.lineWidth=46;c.strokeRect(-23,-23,W+46,H+46)}
function oloop(now){const dt=Math.min(.05,(now-otNow)/1000);otNow=now;const t=now/1000;
  if(oscene){oc.setTransform(1,0,0,1,0,0);oscene(oc,t,t-ot0);for(let i=0;i<420;i++){oc.fillStyle='rgba(255,255,255,'+(Math.random()*.07)+')';oc.fillRect(Math.random()*W,Math.random()*H,1,1)}}requestAnimationFrame(oloop)}
requestAnimationFrame(oloop);
function setOscene(fn){ot0=performance.now()/1000;oscene=fn}
async function shotDissolve(fn,lines,hold){setOscene(fn);for(const l of lines){if(Array.isArray(l))await say(l[0],l[1]);else await say('',l)}if(hold)await sleep(hold)}
async function shot(fn,lines,hold){$('#fade').style.opacity=1;await sleep(800);setOscene(fn);$('#fade').style.opacity=0;await sleep(800);
  for(const l of lines){if(Array.isArray(l))await say(l[0],l[1]);else await say('',l)}if(hold)await sleep(hold)}

/* ---------- opening story ---------- */
async function opening(){
  $('#s-title').classList.remove('on');$('#s-open').classList.add('on');
  await shot(scEarth,[
    ['NARRATOR','Once, people looked up at the sky every night. Children waved at the satellites crossing overhead.'],
    ['NARRATOR','Then they decided there was nothing left out there to find. The stations were closed one by one, and the telescopes were switched off.']
  ],800);
  await shot(scStations,[
    ['NARRATOR','The last stations were emptied. Their lights went out, and nobody came back to check on them.'],
    ['NARRATOR','But the machines were still out there. Rovers on other worlds. Probes still flying away. Nobody remembered to listen.']
  ],800);
  await shot(scHouston,[
    ['NARRATOR','Only one room stayed open in Houston. A few engineers, a few screens, and a coffee machine that never stopped working.'],
    ['NARRATOR','Most days, nothing happened at all.']
  ],600);
  await shot(scSignal,[
    ['NARRATOR','On an ordinary Tuesday, the big dish caught something.'],
    ['NARRATOR','A steady signal, repeating like a heartbeat, from a place where nothing should be sending.'],
    ['CONTROL','Nobody knows what it is.']
  ],800);
  await shot(scAnalysis,[
    ['NARRATOR','For four days they searched every old record they could find. They found nothing. The signal kept repeating, as if it were waiting for someone to answer.']
  ],1200);
  await shot(scPrep,[
    ['NARRATOR','On the fifth morning they made a decision. One person would go out and find out what the signal was.'],
    ['NARRATOR','They picked you.']
  ],800);
  await shot(scLaunch,[
    ['CONTROL','Liftoff.'],
    ['NARRATOR','The ground fell away, and the whole room went quiet.']
  ],8000);
  await shotDissolve(scOrbit,[
    ['NARRATOR','The engines cut off. Silence. Below you, the Earth. Above you, the signal, still waiting.'],
    ['CONTROL','Welcome to orbit. Your mission starts now.'],
    ['NARRATOR','Remember this: every machine out there was built by someone who hoped that someone would come back for it.']
  ],0);
  await beginButton();
  $('#fade').style.opacity=1;
}

/* ---------- begin ---------- */
function beginButton(){return new Promise(res=>{
  const k=document.createElement('div');k.id='beginkick';k.textContent='The mission starts now';
  const b=document.createElement('button');b.id='beginbtn';b.textContent='Begin';
  b.onclick=()=>{b.style.pointerEvents='none';k.remove();b.remove();res()};
  const st=document.getElementById('s-open');st.appendChild(k);st.appendChild(b)})}
$('#go').addEventListener('click',()=>{opening()});
