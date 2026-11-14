const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
const W = 1280, H = 720;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const dist = (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1);
const lerp = (a, b, t) => a + (b - a) * t;

/* ---------- scaling ---------- */
function fit() {
  const s = Math.min(innerWidth / W, innerHeight / H);
  $('#stage').style.transform = 'translate(-50%,-50%) scale(' + s + ')';
}
addEventListener('resize', fit);
fit();

/* ---------- photos & assets ---------- */
const PH = {};
function photo(name) {
  if (!(name in PH)) {
    PH[name] = null;
    const i = new Image();
    i.onload = () => { PH[name] = i; };
    i.onerror = () => { PH[name] = false; };
    i.src = 'assets/' + name;
  }
  return PH[name];
}
function drawPhoto(c, name, x, y, w, h, fallback) {
  const p = photo(name);
  if (p) {
    c.save();
    c.beginPath();
    c.rect(x, y, w, h);
    c.clip();
    const s = Math.max(w / p.width, h / p.height);
    c.drawImage(p, x + (w - p.width * s) / 2, y + (h - p.height * s) / 2, p.width * s, p.height * s);
    c.restore();
  } else if (fallback) fallback();
}

/* ---------- Web Audio Procedural Synthesizer ---------- */
let audioCtx = null;
let soundOn = true;
let ambientNodes = null;

function initAudio() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

function playPing(freq, distRatio) {
  if (!soundOn || !audioCtx) return;
  try {
    const t = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const f = freq || (600 + (1 - clamp(distRatio || 0.5, 0, 1)) * 400);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(f, t);
    osc.frequency.exponentialRampToValueAtTime(f * 0.7, t + 0.15);
    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(t);
    osc.stop(t + 0.36);
  } catch(e) {}
}

function playStatic() {
  if (!soundOn || !audioCtx) return;
  try {
    const t = audioCtx.currentTime;
    const bufferSize = audioCtx.sampleRate * 0.12;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1600;
    filter.Q.value = 2;
    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.06, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);
    noise.start(t);
  } catch(e) {}
}

function playClick() {
  if (!soundOn || !audioCtx) return;
  try {
    const t = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.04);
    gain.gain.setValueAtTime(0.09, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(t);
    osc.stop(t + 0.06);
  } catch(e) {}
}

function playLaserChirp() {
  if (!soundOn || !audioCtx) return;
  try {
    const t = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(1400, t);
    osc.frequency.exponentialRampToValueAtTime(260, t + 0.38);
    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(t);
    osc.stop(t + 0.42);
  } catch(e) {}
}

function playFootstep() {
  if (!soundOn || !audioCtx) return;
  try {
    const t = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(90, t);
    osc.frequency.exponentialRampToValueAtTime(30, t + 0.06);
    gain.gain.setValueAtTime(0.04, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(t);
    osc.stop(t + 0.08);
  } catch(e) {}
}

let roverOsc = null, roverGain = null;
function updateRoverSound(speedRatio) {
  if (!soundOn || !audioCtx) return;
  try {
    if (speedRatio > 0.05) {
      if (!roverOsc) {
        roverOsc = audioCtx.createOscillator();
        roverGain = audioCtx.createGain();
        roverOsc.type = 'triangle';
        roverGain.gain.setValueAtTime(0.001, audioCtx.currentTime);
        roverOsc.connect(roverGain);
        roverGain.connect(audioCtx.destination);
        roverOsc.start();
      }
      const t = audioCtx.currentTime;
      roverOsc.frequency.setTargetAtTime(65 + speedRatio * 85, t, 0.05);
      roverGain.gain.setTargetAtTime(0.04 * speedRatio, t, 0.05);
    } else if (roverGain) {
      roverGain.gain.setTargetAtTime(0.0001, audioCtx.currentTime, 0.08);
    }
  } catch(e) {}
}

function playChime() {
  if (!soundOn || !audioCtx) return;
  try {
    const notes = [440, 554.37, 659.25, 880];
    notes.forEach((f, idx) => {
      setTimeout(() => {
        if (!audioCtx) return;
        const t = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, t);
        gain.gain.setValueAtTime(0.07, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(t);
        osc.stop(t + 0.55);
      }, idx * 90);
    });
  } catch(e) {}
}

function playSeismicRumble() {
  if (!soundOn || !audioCtx) return;
  try {
    const t = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(55, t);
    osc.frequency.exponentialRampToValueAtTime(32, t + 1.2);
    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 1.3);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(t);
    osc.stop(t + 1.4);
  } catch(e) {}
}

function startAmbientDrone() {
  if (!soundOn || !audioCtx || ambientNodes) return;
  try {
    const t = audioCtx.currentTime;
    const freqs = [73.42, 110.0, 146.83]; // D2, A2, D3 chord
    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.025, t);
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(280, t);
    gain.connect(filter);
    filter.connect(audioCtx.destination);

    const oscs = freqs.map((f, i) => {
      const osc = audioCtx.createOscillator();
      osc.type = i === 1 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(f, t);
      osc.connect(gain);
      osc.start();
      return osc;
    });
    ambientNodes = { oscs, gain, filter };
  } catch(e) {}
}

$('#sfxbtn').addEventListener('click', e => {
  e.stopPropagation();
  soundOn = !soundOn;
  e.target.textContent = 'Sound: ' + (soundOn ? 'on' : 'off');
  if (soundOn) { initAudio(); startAmbientDrone(); }
  else if (ambientNodes) {
    ambientNodes.oscs.forEach(o => { try { o.stop(); } catch(err){} });
    ambientNodes = null;
  }
});

/* ---------- Dialogue & Speech Engine ---------- */
let adv = null, skipT = null;
function advance() {
  if (skipT) { skipT(); return; }
  if (adv) adv();
}
$('#dlg').addEventListener('click', advance);
let voiceOn = true;

function pickVoice() {
  const v = ('speechSynthesis' in window) ? speechSynthesis.getVoices() : [];
  return v.find(x => /^en/i.test(x.lang) && /male|david|daniel|alex|uk english male/i.test(x.name)) ||
         v.find(x => /^en/i.test(x.lang)) || null;
}

function speak(who, text) {
  if (!voiceOn || !('speechSynthesis' in window)) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.voice = pickVoice();
  u.rate = 0.92;
  u.pitch = who === 'CONTROL' ? 1.08 : (who === 'EXPLORER' ? 0.95 : 0.88);
  u.volume = 1;
  speechSynthesis.speak(u);
}

$('#vbtn').addEventListener('click', e => {
  e.stopPropagation();
  voiceOn = !voiceOn;
  e.target.textContent = 'Voice: ' + (voiceOn ? 'on' : 'off');
  if (!voiceOn && 'speechSynthesis' in window) speechSynthesis.cancel();
});

function say(who, text) {
  if (who === 'CONTROL') playStatic();
  speak(who, text);
  return new Promise(res => {
    $('#dlg').classList.add('on');
    $('#dn').textContent = who || '';
    const t = $('#dt');
    t.textContent = '';
    let i = 0, iv = null;
    const fin = () => {
      clearInterval(iv);
      skipT = null;
      t.textContent = text;
      adv = () => {
        adv = null;
        $('#dlg').classList.remove('on');
        res();
      };
    };
    skipT = fin;
    iv = setInterval(() => {
      i++;
      t.textContent = text.slice(0, i);
      if (i >= text.length) fin();
    }, 20);
  });
}

function choose(opts) {
  return new Promise(res => {
    const box = $('#ch');
    box.innerHTML = '';
    box.style.display = 'flex';
    opts.forEach(o => {
      const b = document.createElement('button');
      b.className = 'btn alt';
      b.textContent = o.t;
      b.onclick = e => {
        e.stopPropagation();
        box.style.display = 'none';
        box.innerHTML = '';
        playClick();
        res(o.id);
      };
      box.appendChild(b);
    });
  });
}

/* ---------- Input System ---------- */
const K = {};
const M = { x: 0, y: 0, down: false };
addEventListener('keydown', e => {
  initAudio();
  K[e.code] = true;
  if (e.code === 'Space' || e.code === 'Enter') {
    if ($('#dlg').classList.contains('on')) {
      e.preventDefault();
      advance();
    } else if (e.code === 'Space') {
      e.preventDefault();
      toggleRover();
    }
  }
  if (e.code === 'KeyE') {
    handleInteract();
  }
  if (e.code === 'KeyB') {
    toggleWorkshop();
  }
  if (e.code === 'KeyL') {
    toggleCodex();
  }
  if (e.code === 'KeyR') {
    radioHouston();
  }
  if (e.code === 'Escape') {
    closeAllModals();
  }
});
addEventListener('keyup', e => { K[e.code] = false; });

/* ---------- Opening Scenes (Cutscenes) ---------- */
const oc = $('#oc').getContext('2d');
let oscene = null, ot0 = 0, otNow = 0;
const INK = '#0b0b0b', G1 = '#262626', G2 = '#4d4d4d', G3 = '#7d7d7d', G4 = '#aaaaaa', G5 = '#e4e4e4';

function bwtxt(c, s, x, y, size, col, align) {
  c.fillStyle = col;
  c.font = size + 'px "Bebas Neue",Impact,sans-serif';
  c.textAlign = align || 'left';
  c.fillText(s, x, y);
  c.textAlign = 'left';
}
function starsBW(c, n) {
  for (let i = 0; i < n; i++) {
    c.fillStyle = i % 5 ? G4 : G5;
    const s = i % 7 ? 1 : 2;
    c.fillRect((i * 311) % W, (i * 173) % (H * 0.7), s, s);
  }
}
function figure(c, x, y, s, col) {
  c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = col;
  c.beginPath(); c.arc(0, -60, 28, 0, 7); c.fill();
  c.beginPath(); c.moveTo(-50, 0); c.quadraticCurveTo(-54, -44, -30, -48);
  c.lineTo(30, -48); c.quadraticCurveTo(54, -44, 50, 0); c.closePath(); c.fill();
  c.restore();
}
function rocketBW(c, x, y, s) {
  c.save(); c.translate(x, y); c.scale(s, s); c.strokeStyle = INK; c.lineWidth = 3;
  c.fillStyle = G5; c.beginPath(); c.moveTo(-30, 0); c.lineTo(-30, -120);
  c.quadraticCurveTo(0, -190, 30, -120); c.lineTo(30, 0); c.closePath(); c.fill(); c.stroke();
  c.fillStyle = G3; c.beginPath(); c.moveTo(-30, -40); c.lineTo(-62, 10); c.lineTo(-30, 10); c.closePath(); c.fill(); c.stroke();
  c.beginPath(); c.moveTo(30, -40); c.lineTo(62, 10); c.lineTo(30, 10); c.closePath(); c.fill(); c.stroke();
  c.fillStyle = G2; c.beginPath(); c.arc(0, -70, 11, 0, 7); c.fill(); c.restore();
}
function scEarth(c, t) { drawPhoto(c, 'scene1.webp', 0, 0, W, H, () => scEarthFallback(c, t)); }
function scEarthFallback(c, t) {
  c.fillStyle = INK; c.fillRect(0, 0, W, H); starsBW(c, 160);
  const g = c.createRadialGradient(640, 1300, 200, 640, 1300, 1020);
  g.addColorStop(0, G3); g.addColorStop(0.55, G1); g.addColorStop(1, INK);
  c.fillStyle = g; c.beginPath(); c.arc(640, 1300, 1020, 0, 7); c.fill();
  c.strokeStyle = G5; c.lineWidth = 5; c.beginPath(); c.arc(640, 1300, 1022, Math.PI * 1.25, Math.PI * 1.75); c.stroke();
}
function scStations(c, t) { drawPhoto(c, 'scene2.webp', 0, 0, W, H, () => scStationsFallback(c, t)); }
function scStationsFallback(c, t) {
  c.fillStyle = INK; c.fillRect(0, 0, W, H); starsBW(c, 110);
  for (let k = 0; k < 3; k++) {
    const x = 180 + k * 420, y = 240 + k * 40;
    c.fillStyle = G2; c.fillRect(x - 120, y, 240, 18);
    c.beginPath(); c.arc(x, y - 30, 60, 0, 7); c.fill(); c.fillRect(x - 6, y - 120, 12, 90);
  }
  c.save(); c.translate(640, 520); c.rotate(-0.12); c.strokeStyle = G5; c.lineWidth = 7; c.strokeRect(-260, -70, 520, 140);
  c.fillStyle = G5; c.font = '130px "Bebas Neue",Impact,sans-serif'; c.textAlign = 'center'; c.fillText('CLOSED', 0, 44); c.restore();
}
function scHouston(c, t) { drawPhoto(c, 'scene3.webp', 0, 0, W, H, () => scHoustonFallback(c, t)); }
function scHoustonFallback(c, t) {
  c.fillStyle = G1; c.fillRect(0, 0, W, H);
  c.fillStyle = G2; c.fillRect(0, 0, W, 380); c.fillStyle = G3; c.fillRect(980, 60, 220, 230);
  c.fillStyle = '#1c1c1c'; c.fillRect(0, 520, W, 200);
  c.fillStyle = G4; c.fillRect(440, 110, 400, 220); c.strokeStyle = INK; c.lineWidth = 4; c.strokeRect(440, 110, 400, 220);
  c.fillStyle = INK; c.fillRect(640 + Math.sin(t * 2) * 140 - 5, 210, 10, 10);
  for (let i = 0; i < 5; i++) {
    const x = 180 + i * 210; c.fillStyle = G3; c.fillRect(x - 70, 470, 140, 18); figure(c, x, 470, 0.9, G5);
  }
}
function scSignal(c, t, lt) { drawPhoto(c, 'scene4.webp', 0, 0, W, H, () => scSignalFallback(c, t, lt)); }
function scSignalFallback(c, t, lt) {
  c.fillStyle = INK; c.fillRect(0, 0, W, H); starsBW(c, 120);
  c.fillStyle = G1; c.beginPath(); c.moveTo(0, 720); c.lineTo(0, 600); c.lineTo(W, 640); c.lineTo(W, 720); c.fill();
  const amp = 70 * Math.min(1, lt / 3);
  c.strokeStyle = G5; c.lineWidth = 4; c.beginPath();
  for (let x = 0; x < W; x += 6) {
    const y = 300 + Math.sin(x * 0.05 - t * 6) * amp;
    x ? c.lineTo(x, y) : c.moveTo(x, y);
  }
  c.stroke();
}
function scAnalysis(c, t, lt) { drawPhoto(c, 'scene5.webp', 0, 0, W, H, () => scAnalysisFallback(c, t, lt)); }
function scAnalysisFallback(c, t, lt) {
  c.fillStyle = INK; c.fillRect(0, 0, W, H);
  const rows = ['DAY 1 — THE PATTERN REPEATS', 'DAY 2 — NO TRANSMITTER FOUND', 'DAY 3 — NO MATCH IN ARCHIVES', 'DAY 4 — STILL NOTHING'];
  rows.forEach((r, i) => {
    if (lt < i * 2.2) return;
    c.fillStyle = G4; c.fillRect(120, 120 + i * 120, 1040, 80);
    bwtxt(c, r, 150, 180 + i * 120, 54, INK);
  });
}
function scPrep(c, t) { drawPhoto(c, 'scene6.webp', 0, 0, W, H, () => scPrepFallback(c, t)); }
function scPrepFallback(c, t) {
  const g = c.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, G2); g.addColorStop(1, INK); c.fillStyle = g; c.fillRect(0, 0, W, H);
  c.fillStyle = '#161616'; c.fillRect(0, 600, W, 120);
  rocketBW(c, 760, 600, 1.5); figure(c, 330, 600, 1.1, G5);
}
const ROCK = { x0: 460, y0: 40, w: 106, h: 360 };
function plume(c, x, y, t, lt) {
  const f = 70 + Math.sin(t * 30) * 6 + (lt - 5) * 4;
  const g = c.createLinearGradient(0, y, 0, y + f);
  g.addColorStop(0, 'rgba(240,240,240,.95)'); g.addColorStop(1, 'rgba(200,200,200,0)');
  c.fillStyle = g; c.beginPath(); c.moveTo(x - 16, y); c.quadraticCurveTo(x, y + f * 1.25, x + 16, y); c.closePath(); c.fill();
}
function scLaunch(c, t, lt) {
  const bg = photo('launch_bg.webp'), rk = photo('rocket.webp');
  const sx = W / 1024, sy = H / 572;
  let lift = 0, shx = 0, shy = 0;
  if (lt > 5) {
    const k = lt - 5; lift = k * k * 6;
    shx = (Math.random() - 0.5) * 3 * Math.min(1, k / 2);
    shy = (Math.random() - 0.5) * 2 * Math.min(1, k / 2);
  }
  const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#5d5d5d'); g.addColorStop(1, '#cfcbc6');
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  if (bg) c.drawImage(bg, 0, 0, W, H);
  if (rk) c.drawImage(rk, (ROCK.x0 + shx) * sx, (ROCK.y0 - lift + shy) * sy, ROCK.w * sx, ROCK.h * sy);
  if (lt > 5) {
    const base = (392 - lift + shy) * sy;
    plume(c, 512.5 * sx + shx, base, t, lt);
  }
  if (lt < 5) bwtxt(c, String(5 - Math.floor(lt)), 640, 320, 240, 'rgba(228,228,228,.9)', 'center');
  else if (lt < 6.5) bwtxt(c, 'LIFTOFF', 640, 250, 120, 'rgba(228,228,228,.9)', 'center');
}
function scOrbit(c, t, lt) {
  const p = photo('orbit.webp');
  if (p) c.drawImage(p, 0, 0, W, H);
  else scEarthFallback(c, t);
}

function oloop(now) {
  otNow = now; const t = now / 1000;
  if (oscene) {
    oc.setTransform(1, 0, 0, 1, 0, 0);
    oscene(oc, t, t - ot0);
    for (let i = 0; i < 300; i++) {
      oc.fillStyle = 'rgba(255,255,255,' + (Math.random() * 0.05) + ')';
      oc.fillRect(Math.random() * W, Math.random() * H, 1, 1);
    }
  }
  requestAnimationFrame(oloop);
}
requestAnimationFrame(oloop);

function setOscene(fn) { ot0 = performance.now() / 1000; oscene = fn; }
let cutsceneCancelled = false;

async function shot(fn, lines, hold) {
  if (cutsceneCancelled) return;
  $('#fade').style.opacity = 1; await sleep(600);
  if (cutsceneCancelled) return;
  setOscene(fn); $('#fade').style.opacity = 0; await sleep(600);
  for (const l of lines) {
    if (cutsceneCancelled) return;
    if (Array.isArray(l)) await say(l[0], l[1]);
    else await say('', l);
  }
  if (hold && !cutsceneCancelled) await sleep(hold);
}
async function shotDissolve(fn, lines, hold) {
  if (cutsceneCancelled) return;
  setOscene(fn);
  for (const l of lines) {
    if (cutsceneCancelled) return;
    if (Array.isArray(l)) await say(l[0], l[1]);
    else await say('', l);
  }
  if (hold && !cutsceneCancelled) await sleep(hold);
}

function beginButton() {
  return new Promise(res => {
    if (cutsceneCancelled) { res(); return; }
    const k = document.createElement('div'); k.id = 'beginkick'; k.textContent = 'The mission starts now';
    const b = document.createElement('button'); b.id = 'beginbtn'; b.textContent = 'Begin';
    b.onclick = () => {
      b.style.pointerEvents = 'none'; k.remove(); b.remove();
      playClick(); res();
    };
    const st = document.getElementById('s-open');
    st.appendChild(k); st.appendChild(b);
  });
}

async function opening() {
  cutsceneCancelled = false;
  $('#s-title').classList.remove('on');
  $('#s-open').classList.add('on');
  await shot(scEarth, [
    ['NARRATOR', 'Once, people looked up at the sky every night. Children waved at satellites crossing overhead.'],
    ['NARRATOR', 'Then they decided there was nothing left out there to find. Stations were closed, and telescopes were switched off.']
  ], 600);
  await shot(scStations, [
    ['NARRATOR', 'The last stations were emptied. Their lights went out, and nobody came back to check on them.'],
    ['NARRATOR', 'But the machines were still out there. Rovers on other worlds. Probes still flying away. Nobody remembered to listen.']
  ], 600);
  await shot(scHouston, [
    ['NARRATOR', 'Only one room stayed open in Houston. A few engineers, a few screens, and a coffee machine that never stopped.'],
    ['NARRATOR', 'Most days, nothing happened at all.']
  ], 600);
  await shot(scSignal, [
    ['NARRATOR', 'On an ordinary Tuesday, the big dish caught something.'],
    ['NARRATOR', 'A steady signal, repeating like a heartbeat, from a place where nothing should be transmitting.'],
    ['CONTROL', 'Nobody knows what it is.']
  ], 600);
  await shot(scAnalysis, [
    ['NARRATOR', 'For four days they searched every old record they could find. They found nothing. The signal kept repeating, as if waiting for someone to answer.']
  ], 800);
  await shot(scPrep, [
    ['NARRATOR', 'On the fifth morning they made a decision. One person would go out and find out what the signal was.'],
    ['NARRATOR', 'They picked you.']
  ], 600);
  await shot(scLaunch, [
    ['CONTROL', 'Liftoff.'],
    ['NARRATOR', 'The ground fell away, and the whole room went quiet.']
  ], 7000);
  await shotDissolve(scOrbit, [
    ['NARRATOR', 'The engines cut off. Silence. Below you, the Earth. Above you, the signal, still waiting.'],
    ['CONTROL', 'Welcome to orbit. Your mission starts now.'],
    ['NARRATOR', 'Remember this: every machine out there was built by someone who hoped that someone would come back for it.']
  ], 0);
  if (!cutsceneCancelled) {
    await beginButton();
  }
  transitionToGame();
}

function skipIntro() {
  cutsceneCancelled = true;
  if (adv) adv();
  if (skipT) skipT();
  const b = $('#beginbtn'), k = $('#beginkick');
  if (b) b.remove();
  if (k) k.remove();
  transitionToGame();
}

$('#go').addEventListener('click', () => { initAudio(); startAmbientDrone(); opening(); });
$('#skip-to-moon').addEventListener('click', () => { initAudio(); startAmbientDrone(); skipIntro(); });
$('#skip-intro-btn').addEventListener('click', () => { initAudio(); startAmbientDrone(); skipIntro(); });

/* ---------- Lunar Exploration Game Engine (Opus style) ---------- */
const gc = $('#gc').getContext('2d');
const WORLD_W = 3600, WORLD_H = 2400;

// Game State
const GAME = {
  active: false,
  camX: 1800,
  camY: 1200,
  targetCamX: 1800,
  targetCamY: 1200,
  zoom: 1.0,
  targetZoom: 1.0,
  o2: 100,
  sync: 0,
  discoveredCount: 0,
  inRover: false,
  boostUnlocked: false,
  sbandUnlocked: false,
  relayCrafted: false,
  relayInstalled: false,
  currentModal: null,
  activeTarget: null,
  discoveredHw: new Set(),
  toasts: [],       // { msg, t } active toast notifications
  objective: 'Find and inspect the Apollo 11 Descent Stage \u00bb Activate Long-Listen Detector',
  invOpen: false
};

// Scavenged Inventory
const INV = {
  'battery': { name: 'Silver-Zinc Battery', count: 0, icon: '🔋', desc: 'Auxiliary silver-zinc battery cell for the Lunar Rover.' },
  'mylar': { name: 'Mylar Thermal Blanket', count: 0, icon: '🛡️', desc: 'Multi-layer insulation foil resisting extreme lunar temperatures.' },
  'valve': { name: 'Aerozine-50 Valve', count: 0, icon: '⚙️', desc: 'Titanium bi-propellant flow valve from the LM descent engine.' },
  'rtg_wire': { name: 'SNAP-27 Thermopile', count: 0, icon: '⚡', desc: 'Lead telluride thermocouple wire converting Pu-238 heat to electricity.' },
  'prism': { name: 'Suprasil Quartz Prism', count: 0, icon: '💎', desc: 'Ultra-pure corner-cube retroreflector prism reflecting laser beams at 180°.' },
  'tape': { name: 'Apollo 11 Flight Tape', count: 0, icon: '📼', desc: 'Magnetic tape recording Armstrong & Aldrin guidance telemetry during the 1202 alarm.' },
  'gyro': { name: 'Delco Inertial Gyro', count: 0, icon: '🧭', desc: 'Solid-state directional gyroscope from the Lunar Rover navigation system.' }
};

// Player Astronaut Object
const PLAYER = {
  x: 1800,
  y: 1250,
  vx: 0,
  vy: 0,
  angle: -Math.PI / 2,
  speed: 180,
  hopPhase: 0,
  isMoving: false,
  footstepTimer: 0
};

// Lunar Rover (LRV) Object
const ROVER = {
  x: 2500,
  y: 1100,
  vx: 0,
  vy: 0,
  angle: 0.2,
  speed: 0,
  maxSpeed: 380,
  repaired: false,
  driverInside: false
};

// Persistent footprints & tracks
const TRACKS = [];
function addTrack(x, y, angle, isRover) {
  TRACKS.push({ x, y, angle, isRover, time: performance.now() });
  if (TRACKS.length > 500) TRACKS.shift();
}

// Procedural Craters
const CRATERS = [];
function initCraters() {
  const seed = 42;
  for (let i = 0; i < 48; i++) {
    const x = 150 + ((i * 733 + 120) % (WORLD_W - 300));
    const y = 150 + ((i * 491 + 250) % (WORLD_H - 300));
    const r = 24 + ((i * 97) % 110);
    CRATERS.push({ x, y, r });
  }
}
initCraters();

// Procedural Boulders
const BOULDERS = [];
function initBoulders() {
  for (let i = 0; i < 75; i++) {
    const x = 100 + ((i * 449 + 310) % (WORLD_W - 200));
    const y = 100 + ((i * 617 + 170) % (WORLD_H - 200));
    const r = 8 + ((i * 23) % 20);
    BOULDERS.push({ x, y, r });
  }
}
initBoulders();

// Historical NASA Hardware Registry (Verified NSSDCA Data)
const HARDWARE = [
  {
    id: 'base',
    name: 'Lunar Base Camp (Ascent Stage)',
    nssdca: '1969-059C-HAB',
    coords: '0.674° N, 23.473° E · Base Camp',
    x: 1800,
    y: 1250,
    radius: 90,
    synced: true,
    scavenged: true,
    icon: '⛺',
    desc: 'The explorer habitat module equipped with high-gain comms, an oxygen replenishing station, and the engineering workbench.',
    howItWorked: 'The Apollo Lunar Module cabin provided life support, pressure suits, and flight computers in 1/6th gravity. In Sunset Orbit, the habitat acts as your home base where your suit oxygen and power recharge automatically.',
    whatItDiscovered: 'Proved humans could live, work, and sleep on another celestial body for up to three days while conducting continuous surface EVAs.',
    signalConnection: 'Connected via S-band telemetry to Houston Control. The base workshop allows fabrication of the Long-Listen Optical Relay Array.'
  },
  {
    id: 'apollo11',
    name: 'Apollo 11 Descent Stage "Eagle"',
    nssdca: '1969-059C',
    coords: '0.67408° N, 23.47297° E · Mare Tranquillitatis',
    nasaPhoto: 'https://www.hq.nasa.gov/alsj/a11/AS11-40-5931HR.jpg',
    nasaPhotoCredit: 'Credit: NASA / Apollo 11 Hasselblad Camera',
    source: 'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1969-059C',
    verified: true,
    verifiedNote: 'NSSDCA confirmed · 0.67408°N 23.47297°E · Apollo 11 primary site',
    x: 1800,
    y: 740,
    radius: 80,
    synced: false,
    scavenged: false,
    icon: '🚀',
    desc: 'The gold-foil octagonal descent stage of the LM Eagle, left behind as a launch platform. Features the historic commemorative plaque.',
    howItWorked: 'The Lunar Module Descent Stage used the TRW Lunar Module Descent Engine (LMDE), the first throttleable rocket engine in human spaceflight (4,500 to 45,000 N thrust). It burned hypergolic bipropellants: Aerozine 50 (fuel) and Nitrogen Tetroxide (oxidizer). Hypergolic propellants ignite spontaneously upon contact without needing spark plugs—guaranteeing 100% ignition reliability in the vacuum of space. The four landing legs contained crushable aluminum honeycomb cartridges that absorbed landing impact without rebounding.',
    whatItDiscovered: 'Neil Armstrong had to take manual control of the LMDE during the famous 1202 program alarm, dodging a boulder field around West Crater with only 30 seconds of propellant remaining. Proved humans could soft-land on alien regolith safely. Left behind the historic plaque: "Here men from the planet Earth first set foot upon the Moon July 1969, A.D. We came in peace for all mankind."',
    signalConnection: 'The descent stage\'s telemetry recorder contains the original S-band mission data. Installing the crafted Long-Listen Relay here allows optical transmission back to Earth and deep space!',
    rewards: [
      { id: 'valve', count: 1, name: 'Aerozine-50 Valve' },
      { id: 'tape', count: 1, name: 'Apollo 11 Flight Tape' }
    ]
  },
  {
    id: 'rtg',
    name: 'SNAP-27 RTG & ALSEP Central Station',
    nssdca: '1969-099C',
    coords: '0.669° N, 23.421° E · Western Baseline, Tranquillity Base',
    nasaPhoto: 'https://www.hq.nasa.gov/alsj/a11/AS11-40-5952HR.jpg',
    nasaPhotoCredit: 'Credit: NASA / ALSEP Deployment, Apollo 11',
    source: 'https://nssdc.gsfc.nasa.gov/nmc/experiment/display.action?id=1969-099C',
    verified: true,
    verifiedNote: 'NSSDCA confirmed · Apollo 11 ALSEP central station + SNAP-27 RTG · 0.669°N 23.421°E',
    x: 1200,
    y: 1050,
    radius: 65,
    synced: false,
    scavenged: false,
    icon: '⚡',
    desc: 'The Apollo Lunar Surface Experiments Package (ALSEP) central station and the finned SNAP-27 Radioisotope Thermoelectric Generator.',
    howItWorked: 'The lunar surface endures 14 days of intense sun (+120°C) followed by 14 days of cryogenic night (-173°C). Solar panels freeze and fail during the two-week darkness. NASA solved this with the SNAP-27 RTG. The astronauts inserted a 3.8 kg capsule of Plutonium-238 into the generator on the Moon. As the Plutonium decayed via alpha radiation, it produced 1,480 Watts of heat. Lead telluride thermocouples converted this heat directly into 73 Watts of steady electrical power via the Seebeck effect (generating voltage across a temperature gradient of dissimilar metals) with zero moving parts!',
    whatItDiscovered: 'Designed to operate for just 1 year, the SNAP-27 RTGs operated continuously for up to EIGHT years, transmitting lunar seismic, solar wind, and atmospheric data until NASA finally shut off the receiver stations on September 30, 1977 to save budget.',
    signalConnection: 'Residual thermal decay still produces micro-volts. Calibrating the thermocouple tuner reveals the signal\'s pulse interval matches the half-life curve of Plutonium-238!',
    rewards: [
      { id: 'rtg_wire', count: 1, name: 'SNAP-27 Thermopile' }
    ]
  },
  {
    id: 'lrrr',
    name: 'Laser Ranging Retroreflector (LRRR)',
    nssdca: '1969-059E',
    coords: '0.6726° N, 23.4722° E · Tranquillity Base',
    nasaPhoto: 'https://www.hq.nasa.gov/alsj/a11/AS11-40-5952HR.jpg',
    nasaPhotoCredit: 'Credit: NASA / Apollo 11 LRRR deployment photo',
    source: 'https://nssdc.gsfc.nasa.gov/nmc/experiment/display.action?id=1969-059E',
    verified: true,
    verifiedNote: 'NSSDCA confirmed · Still active · Laser ranging 532 nm green pulses from Earth observatories',
    x: 1100,
    y: 600,
    radius: 65,
    synced: false,
    scavenged: false,
    icon: '💎',
    desc: 'A pallet holding 100 high-purity suprasil quartz corner-cube prisms angled precisely toward Earth.',
    howItWorked: 'A corner-cube retroreflector consists of three mutually perpendicular reflecting surfaces (like the inside corner of a cube). Due to total internal reflection, an incoming light ray reflects three times and exits along a path EXACTLY parallel to its incoming vector (a 180° return), regardless of the angle at which it hit the mirror! Because it requires ZERO electricity and has zero moving parts, it has survived the harsh space environment with zero degradation for over 50 years!',
    whatItDiscovered: 'Earth-based observatories (like McDonald Observatory in Texas and Apache Point in New Mexico) fire 532 nm green laser pulses at the LRRR and measure the ~2.5 second round-trip time down to picoseconds. This measured Earth-Moon distance to millimeter precision, proved the Moon is spiraling away from Earth at 3.8 cm per year, confirmed Einstein\'s general relativity, and proved the Moon has a liquid outer core.',
    signalConnection: 'The mysterious heartbeat signal detected in Houston has the exact optical dispersion and frequency of a green laser reflected off these corner-cube prisms! Someone used our own lunar mirror as an interplanetary relay!',
    rewards: [
      { id: 'prism', count: 1, name: 'Suprasil Quartz Prism' }
    ]
  },
  {
    id: 'lrv',
    name: 'Lunar Roving Vehicle (LRV "Moon Buggy")',
    nssdca: '1971-063C',
    coords: '26.132° N, 3.633° E · Hadley-Apennine (Apollo 15 site)',
    nasaPhoto: 'https://www.hq.nasa.gov/alsj/a15/AS15-88-11901HR.jpg',
    nasaPhotoCredit: 'Credit: NASA / Apollo 15, Hadley-Apennine',
    source: 'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1971-063C',
    verified: true,
    differentSite: true,
    siteNote: '⚠ DIFFERENT MISSION SITE: Apollo 15 LRV is at Hadley-Apennine (26.1°N, 3.6°E), approximately 1,100 km from Tranquillity Base. Represented here as a reference artifact recovered by the Long-Listen archive.',
    verifiedNote: 'NSSDCA confirmed · Apollo 15 Hadley-Apennine · 26.132°N 3.633°E — NOT at Tranquillity Base',
    x: 2500,
    y: 1100,
    radius: 75,
    synced: false,
    scavenged: false,
    icon: '🏎',
    desc: 'The electric four-wheel rover driven by Apollo astronauts. Features woven piano-wire mesh tires and a remote-controlled TV camera.',
    howItWorked: 'Standard pneumatic rubber tires would explode or shatter in the extreme temperatures and vacuum of the Moon. Instead, Boeing and Delco built tires from zinc-coated woven steel piano wire with titanium chevrons riveted on for traction in soft regolith. Each wheel had an independent 0.25-horsepower DC electric motor with an 80:1 harmonic drive. Steering was controlled with an aircraft-style T-handle. Powered by two 36-volt silver-zinc non-rechargeable batteries (121 Ah capacity).',
    whatItDiscovered: 'Allowed Apollo 15, 16, and 17 astronauts to travel up to 7.6 km from the LM, discovering the ancient 4.1-billion-year-old "Genesis Rock". The color TV camera, operated remotely from Houston by Ed Fendell, filmed the ascent stage liftoff from the Moon.',
    signalConnection: 'Its Delco inertial guidance computer holds the vector coordinates pointing towards Mars and deep space. Installing a fresh battery makes the LRV drivable!',
    rewards: [
      { id: 'gyro', count: 1, name: 'Delco Inertial Gyro' }
    ]
  },
  {
    id: 'surveyor',
    name: 'Surveyor 3 Soft-Lander',
    nssdca: '1967-035A',
    coords: '3.016° S, 23.418° W · Oceanus Procellarum (Apollo 12 site)',
    nasaPhoto: 'https://nssdc.gsfc.nasa.gov/image/spacecraft/surveyor3_land.jpg',
    nasaPhotoCredit: 'Credit: NASA / Surveyor 3 lander at Oceanus Procellarum',
    source: 'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1967-035A',
    verified: true,
    differentSite: true,
    siteNote: '⚠ DIFFERENT MISSION SITE: Surveyor 3 is at Oceanus Procellarum (3.016°S, 23.418°W), visited by Apollo 12 — not at Tranquillity Base. Represented here as a cross-site Long-Listen archive entry.',
    verifiedNote: 'NSSDCA confirmed · Apollo 12 Oceanus Procellarum site · 3.016°S 23.418°W',
    x: 2700,
    y: 1750,
    radius: 70,
    synced: false,
    scavenged: false,
    icon: '🛰️',
    desc: 'The robotic precursor lander that touched down in 1967, visited by Apollo 12 astronauts Pete Conrad and Alan Bean in 1969.',
    howItWorked: 'Surveyor 3 was an unmanned triangular tubular probe that proved the lunar surface was firm enough to support a manned lander. In November 1969, Apollo 12 executed a pinpoint landing only 163 meters away. The astronauts walked over and cut off Surveyor\'s television camera and soil scoop to return to Earth.',
    whatItDiscovered: 'Provided the only empirical analysis in human history of how human-made metals, glass lenses, and cables withstand years of raw space radiation, micrometeorites, and 250°C temperature swings.',
    signalConnection: 'Surveyor\'s retrieved optics provided the original optical calibration profiles used by the Long-Listen program.',
    rewards: [
      { id: 'mylar', count: 1, name: 'Mylar Thermal Blanket' }
    ]
  },
  {
    id: 'pse',
    name: 'Passive Seismic Experiment (PSE)',
    nssdca: '1969-099B',
    coords: '0.671° N, 23.442° E · Seismic Station, Tranquillity Base',
    nasaPhoto: 'https://www.hq.nasa.gov/alsj/a11/AS11-40-5944HR.jpg',
    nasaPhotoCredit: 'Credit: NASA / Apollo 11 PSE deployment',
    source: 'https://nssdc.gsfc.nasa.gov/nmc/experiment/display.action?id=1969-099B',
    verified: true,
    verifiedNote: 'NSSDCA confirmed · Apollo 11 ALSEP PSE · Operated until NASA shut receiver stations Sep 30 1977',
    x: 1450,
    y: 1550,
    radius: 60,
    synced: false,
    scavenged: false,
    icon: '🔔',
    desc: 'A gold-foil drum seismometer so sensitive it could detect an astronaut\'s boots walking on the surface.',
    howItWorked: 'The PSE measured lunar vibrations using three long-period and one short-period seismometer enclosed in an insulated thermal beryllium shroud. It was calibrated by deliberately crashing Saturn V S-IVB booster rocket stages and spent LM ascent stages into the Moon at 5,600 mph!',
    whatItDiscovered: 'When the S-IVB booster crashed, the Moon "rang like a bell" for over three hours! Because the lunar crust is completely dry and heavily fractured by billions of years of impacts, seismic energy reverberates without water absorption. Proved the Moon has a 50 km thick crust and deep moonquakes caused by Earth\'s tidal gravity.',
    signalConnection: 'The rhythmic pulse of the mysterious signal matches the resonant seismic ringdown frequency recorded by the PSE!',
    rewards: []
  }
];

// Scavengeable Field Caches
const CACHES = [
  { id: 'cache1', name: 'Apollo Equipment Bay Crate', x: 2150, y: 1180, radius: 40, scavenged: false, item: 'battery', count: 1, icon: '📦' },
  { id: 'cache2', name: 'Thermal Insulation Supply Pack', x: 1400, y: 800, radius: 40, scavenged: false, item: 'mylar', count: 1, icon: '📦' },
  { id: 'cache3', name: 'Optical Specimen Container', x: 950, y: 700, radius: 40, scavenged: false, item: 'prism', count: 1, icon: '📦' },
  { id: 'cache4', name: 'Propellant Service Kit', x: 2000, y: 1600, radius: 40, scavenged: false, item: 'valve', count: 1, icon: '📦' }
];

// Crafting Blueprints
const BLUEPRINTS = [
  {
    id: 'thruster',
    title: 'EVA Thruster Boost Pack',
    desc: 'Pressurized gas thruster nozzles allowing quick dashes and high-speed exploration across the regolith.',
    icon: '🚀',
    reqs: [ { id: 'mylar', count: 1, name: 'Mylar Blanket' }, { id: 'valve', count: 1, name: 'Aerozine Valve' } ],
    crafted: false,
    effect: () => { GAME.boostUnlocked = true; say('EXPLORER', 'Thruster pack installed! Holding SHIFT allows rapid sprint bounding over the surface.'); }
  },
  {
    id: 'sband',
    title: 'Deep-Frequency S-Band Decoder',
    desc: 'High-gain frequency tuner expanding the Long-Listen signal scanner range and showing precise coordinates.',
    icon: '📡',
    reqs: [ { id: 'rtg_wire', count: 1, name: 'SNAP-27 Wire' }, { id: 'gyro', count: 1, name: 'Delco Gyro' } ],
    crafted: false,
    effect: () => { GAME.sbandUnlocked = true; say('EXPLORER', 'S-Band decoder online! Radar range doubled and signal direction vectors locked.'); }
  },
  {
    id: 'relay',
    title: 'Long-Listen Optical Relay Array',
    desc: 'The grand objective: a high-energy optical transmitter to install on Apollo 11 to beam the recovered archive to Earth and deep space!',
    icon: '✨',
    reqs: [
      { id: 'prism', count: 1, name: 'Quartz Prism' },
      { id: 'valve', count: 1, name: 'Aerozine Valve' },
      { id: 'rtg_wire', count: 1, name: 'SNAP-27 Wire' },
      { id: 'tape', count: 1, name: 'Apollo 11 Tape' }
    ],
    crafted: false,
    effect: () => {
      GAME.relayCrafted = true;
      say('CONTROL', 'You did it! The Long-Listen Optical Relay is assembled! Take it to the Apollo 11 Descent Stage and initiate transmission!');
    }
  }
];

/* ---------- Game Loop & Logic ---------- */
let lastTime = performance.now();
let radarSweepAngle = 0;
let wavePhase = 0;

function update(dt) {
  if (!GAME.active) return;

  // Oxygen & Power depletion / recharge
  const distToBase = dist(PLAYER.x, PLAYER.y, 1800, 1250);
  if (distToBase < 120) {
    if (GAME.o2 < 100) {
      GAME.o2 = Math.min(100, GAME.o2 + dt * 25);
      $('#hud-loc').textContent = 'BASE CAMP (RECHARGING O₂)';
    }
  } else {
    $('#hud-loc').textContent = 'MARE TRANQUILLITATIS';
    const drainRate = (GAME.inRover ? 0.3 : (K['ShiftLeft'] || K['ShiftRight'] ? 1.1 : 0.55));
    GAME.o2 = Math.max(0, GAME.o2 - dt * drainRate);
  }
  $('#meter-o2').style.width = Math.max(0, GAME.o2) + '%';
  $('#hud-o2-text').textContent = Math.round(GAME.o2) + '%';

  // Movement input
  let dx = 0, dy = 0;
  if (K['KeyW'] || K['ArrowUp']) dy -= 1;
  if (K['KeyS'] || K['ArrowDown']) dy += 1;
  if (K['KeyA'] || K['ArrowLeft']) dx -= 1;
  if (K['KeyD'] || K['ArrowRight']) dx += 1;

  if (GAME.inRover) {
    // Rover driving physics
    let turn = 0, accel = 0;
    if (K['KeyA'] || K['ArrowLeft']) turn -= 1;
    if (K['KeyD'] || K['ArrowRight']) turn += 1;
    if (K['KeyW'] || K['ArrowUp']) accel += 1;
    if (K['KeyS'] || K['ArrowDown']) accel -= 0.6;

    ROVER.angle += turn * 2.2 * dt * (ROVER.speed / ROVER.maxSpeed || 0.4);
    if (accel > 0) ROVER.speed = Math.min(ROVER.maxSpeed, ROVER.speed + 320 * dt);
    else if (accel < 0) ROVER.speed = Math.max(-ROVER.maxSpeed * 0.4, ROVER.speed - 240 * dt);
    else ROVER.speed *= Math.pow(0.88, dt * 60);

    ROVER.vx = Math.cos(ROVER.angle) * ROVER.speed;
    ROVER.vy = Math.sin(ROVER.angle) * ROVER.speed;
    ROVER.x = clamp(ROVER.x + ROVER.vx * dt, 100, WORLD_W - 100);
    ROVER.y = clamp(ROVER.y + ROVER.vy * dt, 100, WORLD_H - 100);

    PLAYER.x = ROVER.x;
    PLAYER.y = ROVER.y;
    PLAYER.angle = ROVER.angle;

    updateRoverSound(Math.abs(ROVER.speed) / ROVER.maxSpeed);

    if (Math.abs(ROVER.speed) > 15) {
      addTrack(ROVER.x, ROVER.y, ROVER.angle, true);
    }
  } else {
    // Astronaut on foot physics
    let speed = PLAYER.speed;
    if (GAME.boostUnlocked && (K['ShiftLeft'] || K['ShiftRight'])) speed *= 1.65;

    if (dx !== 0 || dy !== 0) {
      const len = Math.hypot(dx, dy);
      dx /= len; dy /= len;
      PLAYER.vx = lerp(PLAYER.vx, dx * speed, dt * 10);
      PLAYER.vy = lerp(PLAYER.vy, dy * speed, dt * 10);
      PLAYER.angle = Math.atan2(dy, dx);
      PLAYER.isMoving = true;
      PLAYER.hopPhase += dt * (speed > 200 ? 12 : 8);

      PLAYER.footstepTimer += dt;
      if (PLAYER.footstepTimer > 0.42) {
        PLAYER.footstepTimer = 0;
        playFootstep();
        addTrack(PLAYER.x, PLAYER.y, PLAYER.angle, false);
      }
    } else {
      PLAYER.vx = lerp(PLAYER.vx, 0, dt * 12);
      PLAYER.vy = lerp(PLAYER.vy, 0, dt * 12);
      PLAYER.isMoving = false;
      PLAYER.hopPhase = 0;
    }

    PLAYER.x = clamp(PLAYER.x + PLAYER.vx * dt, 80, WORLD_W - 80);
    PLAYER.y = clamp(PLAYER.y + PLAYER.vy * dt, 80, WORLD_H - 80);
    updateRoverSound(0);
  }

  // Camera tracking
  GAME.targetCamX = (GAME.inRover ? ROVER.x : PLAYER.x);
  GAME.targetCamY = (GAME.inRover ? ROVER.y : PLAYER.y);
  GAME.camX = lerp(GAME.camX, GAME.targetCamX, dt * 6);
  GAME.camY = lerp(GAME.camY, GAME.targetCamY, dt * 6);
  GAME.zoom = lerp(GAME.zoom, GAME.targetZoom, dt * 4);

  // O2 low warning flash
  const o2bar = document.getElementById('meter-o2');
  if (GAME.o2 < 25) {
    o2bar.style.backgroundColor = (Math.floor(performance.now() / 350) % 2 === 0) ? '#ff4444' : '#e8a33d';
  } else {
    o2bar.style.backgroundColor = '';
  }

  // Update objective tracker
  updateObjectiveText();

  // Tick toasts
  for (let i = GAME.toasts.length - 1; i >= 0; i--) {
    GAME.toasts[i].t -= dt;
    if (GAME.toasts[i].t <= 0) GAME.toasts.splice(i, 1);
  }

  // Update Coordinates in HUD
  const lat = (0.674 + (1250 - PLAYER.y) * 0.00015).toFixed(3);
  const lon = (23.473 + (PLAYER.x - 1800) * 0.00015).toFixed(3);
  $('#hud-coords').textContent = `${lat}° N, ${lon}° E`;

  // Radar & Signal detection
  updateRadar(dt);

  // Interaction prompt detection
  checkInteractions();
}

/* ---------- Radar & Signal Detector (Opus core) ---------- */
let radarPingTimer = 0;
function updateRadar(dt) {
  radarSweepAngle += dt * 3.5;
  wavePhase += dt * 8;

  // Find nearest unsynced hardware or active target
  let nearestHw = null;
  let minDist = Infinity;
  HARDWARE.forEach(h => {
    if (h.id === 'base') return;
    const d = dist(PLAYER.x, PLAYER.y, h.x, h.y);
    if (!h.synced && d < minDist) {
      minDist = d;
      nearestHw = h;
    }
  });

  // If all synced and relay ready, point to Apollo 11
  if (!nearestHw && GAME.relayCrafted && !GAME.relayInstalled) {
    const ap11 = HARDWARE.find(h => h.id === 'apollo11');
    nearestHw = ap11;
    minDist = dist(PLAYER.x, PLAYER.y, ap11.x, ap11.y);
  }

  GAME.activeTarget = nearestHw;

  const rc = $('#radar-canvas').getContext('2d');
  rc.clearRect(0, 0, 84, 84);

  // Radar grid rings
  rc.strokeStyle = '#252630';
  rc.lineWidth = 1;
  rc.beginPath(); rc.arc(42, 42, 18, 0, 7); rc.stroke();
  rc.beginPath(); rc.arc(42, 42, 36, 0, 7); rc.stroke();
  rc.strokeStyle = '#181920';
  rc.beginPath(); rc.moveTo(42, 0); rc.lineTo(42, 84); rc.stroke();
  rc.beginPath(); rc.moveTo(0, 42); rc.lineTo(84, 42); rc.stroke();

  // Radar sweep line
  rc.save();
  rc.translate(42, 42);
  rc.rotate(radarSweepAngle);
  const sweepGrad = rc.createRadialGradient(0, 0, 0, 0, 0, 40);
  sweepGrad.addColorStop(0, 'rgba(42, 157, 143, 0.8)');
  sweepGrad.addColorStop(1, 'rgba(42, 157, 143, 0.05)');
  rc.fillStyle = sweepGrad;
  rc.beginPath();
  rc.moveTo(0, 0);
  rc.arc(0, 0, 39, -0.4, 0);
  rc.closePath();
  rc.fill();
  rc.restore();

  // Target blip on radar
  if (nearestHw) {
    const angleToTarget = Math.atan2(nearestHw.y - PLAYER.y, nearestHw.x - PLAYER.x);
    const radarRange = GAME.sbandUnlocked ? 1600 : 900;
    const rDist = clamp(minDist / radarRange, 0, 1) * 36;
    const blipX = 42 + Math.cos(angleToTarget) * rDist;
    const blipY = 42 + Math.sin(angleToTarget) * rDist;

    rc.fillStyle = '#f4a340';
    rc.beginPath();
    rc.arc(blipX, blipY, 3.5, 0, 7);
    rc.fill();
    rc.strokeStyle = '#fff';
    rc.lineWidth = 1;
    rc.stroke();

    const bearingDeg = Math.round(((angleToTarget * 180 / Math.PI) + 360) % 360);
    $('#radar-target').textContent = nearestHw.name.split(' ')[0].toUpperCase();
    $('#radar-bearing').textContent = `${bearingDeg}°`;
    $('#radar-dist').textContent = `${Math.round(minDist / 2)} m`;

    // Periodic ping audio
    radarPingTimer += dt;
    const pingInterval = clamp(minDist / 600, 0.35, 1.8);
    if (radarPingTimer > pingInterval) {
      radarPingTimer = 0;
      playPing(520 + (1 - clamp(minDist / 800, 0, 1)) * 380, clamp(minDist / 800, 0, 1));
    }
  } else {
    $('#radar-target').textContent = 'ALL SYNCED';
    $('#radar-bearing').textContent = '0°';
    $('#radar-dist').textContent = '0 m';
  }

  // Live Oscilloscope Waveform Canvas
  const wc = $('#wave-canvas').getContext('2d');
  wc.fillStyle = '#050608';
  wc.fillRect(0, 0, 112, 24);
  wc.strokeStyle = '#2ecc71';
  wc.lineWidth = 1.5;
  wc.beginPath();
  const amp = nearestHw ? clamp(1 - minDist / 1000, 0.25, 1) * 9 : 3;
  for (let x = 0; x < 112; x += 3) {
    const y = 12 + Math.sin(x * 0.15 - wavePhase) * amp * Math.cos(x * 0.05);
    x ? wc.lineTo(x, y) : wc.moveTo(x, y);
  }
  wc.stroke();

  // Sync Percentage
  const syncedCount = HARDWARE.filter(h => h.id !== 'base' && h.synced).length;
  GAME.sync = Math.round((syncedCount / 6) * 100);
  $('#hud-sync').textContent = `${GAME.sync}% SYNC`;
}

/* ---------- Interaction Checks ---------- */
let activeInteractable = null;
function checkInteractions() {
  if (GAME.currentModal) {
    $('#prompt-box').style.display = 'none';
    return;
  }

  // Check hardware proximity
  let found = null;
  for (const h of HARDWARE) {
    const d = dist(PLAYER.x, PLAYER.y, h.x, h.y);
    if (d < h.radius + 55) {
      found = { type: 'hardware', obj: h };
      break;
    }
  }

  // Check rover proximity
  if (!found && !GAME.inRover) {
    const d = dist(PLAYER.x, PLAYER.y, ROVER.x, ROVER.y);
    if (d < 90) {
      found = { type: 'rover', obj: ROVER };
    }
  }

  // Check caches proximity
  if (!found) {
    for (const c of CACHES) {
      if (!c.scavenged && dist(PLAYER.x, PLAYER.y, c.x, c.y) < 75) {
        found = { type: 'cache', obj: c };
        break;
      }
    }
  }

  activeInteractable = found;

  if (found) {
    $('#prompt-box').style.display = 'flex';
    if (found.type === 'hardware') {
      if (found.obj.id === 'base') {
        $('#prompt-text').textContent = 'OPEN BASE WORKBENCH';
      } else if (found.obj.id === 'apollo11' && GAME.relayCrafted && !GAME.relayInstalled) {
        $('#prompt-text').textContent = 'INSTALL LONG-LISTEN OPTICAL RELAY';
      } else {
        $('#prompt-text').textContent = `INSPECT ${found.obj.name.toUpperCase()}`;
      }
    } else if (found.type === 'rover') {
      $('#prompt-text').textContent = ROVER.repaired ? 'BOARD LUNAR ROVER [SPACE]' : 'REPAIR LUNAR ROVER (BATTERY)';
    } else if (found.type === 'cache') {
      $('#prompt-text').textContent = `SCAVENGE ${found.obj.name.toUpperCase()}`;
    }
  } else {
    $('#prompt-box').style.display = 'none';
  }
}

function handleInteract() {
  if (!activeInteractable) return;
  playClick();

  if (activeInteractable.type === 'hardware') {
    const h = activeInteractable.obj;
    if (h.id === 'base') {
      toggleWorkshop();
    } else if (h.id === 'apollo11' && GAME.relayCrafted && !GAME.relayInstalled) {
      installRelayArray();
    } else {
      openFactCard(h);
    }
  } else if (activeInteractable.type === 'rover') {
    if (ROVER.repaired) {
      toggleRover();
    } else {
      if (INV.battery.count > 0) {
        INV.battery.count--;
        ROVER.repaired = true;
        updateInventoryUI();
        $('#rover-btn-text').textContent = 'ROVER [READY]';
        playChime();
        say('CONTROL', 'Telemetry confirms rover auxiliary battery online! Traction motors responsive. You can now drive the Lunar Rover!');
      } else {
        say('EXPLORER', 'The rover batteries are completely dead. I need to find a spare Silver-Zinc battery cell in one of the equipment crates.');
      }
    }
  } else if (activeInteractable.type === 'cache') {
    const c = activeInteractable.obj;
    c.scavenged = true;
    INV[c.item].count += c.count;
    updateInventoryUI();
    playChime();
    say('EXPLORER', `Recovered: ${INV[c.item].name} x${c.count}!`);
    showToast('RECOVERED: ' + INV[c.item].name);
  }
}

function toggleRover() {
  if (!ROVER.repaired) {
    if (dist(PLAYER.x, PLAYER.y, ROVER.x, ROVER.y) < 70) {
      handleInteract();
    }
    return;
  }
  if (GAME.inRover) {
    // Exit rover
    GAME.inRover = false;
    ROVER.driverInside = false;
    PLAYER.x = ROVER.x + Math.sin(ROVER.angle) * 35;
    PLAYER.y = ROVER.y - Math.cos(ROVER.angle) * 35;
    PLAYER.vx = 0; PLAYER.vy = 0;
    $('#rover-btn-text').textContent = 'ROVER [READY]';
    playClick();
  } else if (dist(PLAYER.x, PLAYER.y, ROVER.x, ROVER.y) < 100) {
    // Board rover
    GAME.inRover = true;
    ROVER.driverInside = true;
    $('#rover-btn-text').textContent = 'EXIT ROVER [SPACE]';
    playClick();
  }
}
$('#btn-rover').addEventListener('click', toggleRover);

/* ---------- Fact Card Modal ---------- */
let currentFactHw = null;
function openFactCard(hw) {
  currentFactHw = hw;
  GAME.currentModal = 'fact';
  GAME.discoveredHw.add(hw.id);
  showToast('DISCOVERED: ' + hw.name);

  $('#factcard').style.display = 'block';
  $('#fact-title').textContent = hw.name.toUpperCase();

  // Build verified badge
  const verBadge = hw.verified ? ' <span style="color:#2ecc71;font-size:11px">✓ NSSDCA VERIFIED</span>' : '';
  $('#fact-sub').innerHTML = `NASA NSSDCA ID: ${hw.nssdca}${verBadge}`;
  $('#fact-coords').textContent = hw.coords;

  // Different-site notice
  let dsNote = document.getElementById('fact-ds-note');
  if (!dsNote) {
    dsNote = document.createElement('div');
    dsNote.id = 'fact-ds-note';
    dsNote.style.cssText = 'font-family:Space Mono,monospace;font-size:11px;color:#f4a340;margin:4px 0 2px;line-height:1.4;padding:4px 8px;background:rgba(244,163,64,0.08);border-left:3px solid #f4a340;';
    document.getElementById('fact-coords').insertAdjacentElement('afterend', dsNote);
  }
  dsNote.textContent = hw.differentSite ? hw.siteNote : '';
  dsNote.style.display = hw.differentSite ? 'block' : 'none';

  // Tabs
  switchFactTab('eng');

  // Rewards description & Action Button
  if (hw.rewards && hw.rewards.length > 0 && !hw.scavenged) {
    const rNames = hw.rewards.map(r => r.name).join(' & ');
    $('#fact-reward-name').textContent = rNames;
    $('#fact-action-btn').textContent = 'CALIBRATE & RECOVER HARDWARE';
    $('#fact-action-btn').style.display = 'inline-block';
  } else if (!hw.synced) {
    $('#fact-reward-name').textContent = 'Optical & Thermal Resonance Frequency';
    $('#fact-action-btn').textContent = 'CALIBRATE & SYNC FREQUENCY';
    $('#fact-action-btn').style.display = 'inline-block';
  } else {
    $('#fact-reward-name').textContent = 'Hardware Synchronized into Long-Listen Network';
    $('#fact-action-btn').style.display = 'none';
  }

  // Draw schematic and try to show NASA photo
  const fcanvas = $('#fact-canvas');
  const fc = fcanvas.getContext('2d');
  drawHardwareSchematic(fc, hw.id);

  // Show NASA photo alongside schematic if available
  if (hw.nasaPhoto) {
    let photoDiv = document.getElementById('fact-nasa-photo');
    if (!photoDiv) {
      photoDiv = document.createElement('div');
      photoDiv.id = 'fact-nasa-photo';
      photoDiv.style.cssText = 'margin-top:6px;';
      fcanvas.insertAdjacentElement('afterend', photoDiv);
    }
    photoDiv.innerHTML = `<img src="${hw.nasaPhoto}" 
      onerror="this.parentElement.style.display='none'"
      style="width:238px;height:120px;object-fit:cover;border:1px solid #333;display:block;"
      alt="${hw.name}">
      <div style="font-family:Space Mono,monospace;font-size:9px;color:#666;margin-top:2px;">${hw.nasaPhotoCredit || 'Credit: NASA'}</div>
      <a href="${hw.source || '#'}" target="_blank" style="font-family:Space Mono,monospace;font-size:9px;color:#f4a340;text-decoration:none;">NSSDCA SOURCE ↗</a>`;
    photoDiv.style.display = 'block';
  } else {
    const photoDiv = document.getElementById('fact-nasa-photo');
    if (photoDiv) photoDiv.style.display = 'none';
  }

  // Update objective on visit
  updateObjectiveAfterVisit(hw);
}

function switchFactTab(tab) {
  $$('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  const c = $('#fact-content');
  if (!currentFactHw) return;

  if (tab === 'eng') {
    c.innerHTML = `<p>${currentFactHw.howItWorked}</p>`;
  } else if (tab === 'sci') {
    c.innerHTML = `<p>${currentFactHw.whatItDiscovered}</p>`;
  } else if (tab === 'sig') {
    c.innerHTML = `<div class="quote">${currentFactHw.signalConnection}</div>`;
  }
}
$$('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => switchFactTab(btn.dataset.tab));
});

$('#fact-action-btn').addEventListener('click', () => {
  if (!currentFactHw) return;
  playClick();

  // If LRRR, interactive laser pulse chirp!
  if (currentFactHw.id === 'lrrr') {
    playLaserChirp();
  } else if (currentFactHw.id === 'pse') {
    playSeismicRumble();
  } else {
    playChime();
  }

  // Give rewards
  if (currentFactHw.rewards && !currentFactHw.scavenged) {
    currentFactHw.rewards.forEach(r => {
      INV[r.id].count += r.count;
    });
    currentFactHw.scavenged = true;
    updateInventoryUI();
  }

  currentFactHw.synced = true;
  updateArchiveBadge();

  $('#fact-action-btn').style.display = 'none';
  $('#fact-reward-name').textContent = 'Hardware Synchronized into Long-Listen Network!';

  say('CONTROL', `Telemetry handshake verified for ${currentFactHw.name}! Data stream integrated into the Long-Listen archive.`);
});

$('#fact-close').addEventListener('click', () => {
  $('#factcard').style.display = 'none';
  GAME.currentModal = null;
  playClick();
});

/* ---------- Workshop / Crafting Modal ---------- */
function toggleWorkshop() {
  if (GAME.currentModal === 'workshop') {
    closeAllModals();
    return;
  }
  closeAllModals();
  GAME.currentModal = 'workshop';
  $('#workshop-modal').style.display = 'block';
  renderCraftingGrid();
  playClick();
}
$('#btn-workshop').addEventListener('click', toggleWorkshop);
document.getElementById('btn-inv')?.addEventListener('click', toggleInventory);
document.getElementById('inv-close')?.addEventListener('click', () => { closeAllModals(); playClick(); });
$('#workshop-close').addEventListener('click', () => { closeAllModals(); playClick(); });

function renderCraftingGrid() {
  const g = $('#crafting-grid');
  g.innerHTML = '';

  BLUEPRINTS.forEach(bp => {
    const card = document.createElement('div');
    card.className = 'blueprint-card' + (bp.crafted ? ' crafted' : '');

    let canCraft = true;
    const reqsHtml = bp.reqs.map(r => {
      const have = INV[r.id].count >= r.count;
      if (!have) canCraft = false;
      return `<div class="bp-req-item ${have ? 'met' : 'unmet'}">
        <span>${have ? '✔' : '✖'}</span> ${r.name} (${INV[r.id].count}/${r.count})
      </div>`;
    }).join('');

    card.innerHTML = `
      <div>
        <div class="kick">${bp.icon} BLUEPRINT</div>
        <div class="bp-title">${bp.title}</div>
        <div class="bp-desc">${bp.desc}</div>
      </div>
      <div>
        <div class="bp-reqs">${reqsHtml}</div>
        <button class="btn ${bp.crafted ? 'alt' : ''}" style="width:100%" ${bp.crafted ? 'disabled' : (canCraft ? '' : 'disabled')}>
          ${bp.crafted ? 'CRAFTED & ACTIVE' : (canCraft ? 'FABRICATE UPGRADE' : 'MISSING PARTS')}
        </button>
      </div>
    `;

    const btn = card.querySelector('button');
    if (!bp.crafted && canCraft) {
      btn.onclick = () => {
        bp.reqs.forEach(r => { INV[r.id].count -= r.count; });
        bp.crafted = true;
        updateInventoryUI();
        renderCraftingGrid();
        playChime();
        bp.effect();
      };
    }
    g.appendChild(card);
  });
}

/* ---------- NASA Field Archive / Codex Modal ---------- */
function toggleCodex() {
  if (GAME.currentModal === 'codex') {
    closeAllModals();
    return;
  }
  closeAllModals();
  GAME.currentModal = 'codex';
  $('#codex-modal').style.display = 'block';
  renderCodex();
  playClick();
}
$('#btn-codex').addEventListener('click', toggleCodex);
$('#codex-close').addEventListener('click', () => { closeAllModals(); playClick(); });

function renderCodex(selectedId) {
  const nav = $('#codex-nav');
  nav.innerHTML = '';
  const detail = $('#codex-detail');

  const list = HARDWARE.filter(h => h.id !== 'base');
  const targetId = selectedId || list[0].id;

  list.forEach(h => {
    const item = document.createElement('div');
    item.className = 'codex-item' + (h.id === targetId ? ' active' : '');
    item.innerHTML = `
      <div class="codex-item-title">${h.synced ? '✔ ' : '○ '}${h.name}</div>
      <div class="codex-item-sub">NSSDCA: ${h.nssdca} · ${h.synced ? 'SYNCED' : 'UNSYNCED'}</div>
    `;
    item.onclick = () => { renderCodex(h.id); playClick(); };
    nav.appendChild(item);
  });

  const cur = list.find(h => h.id === targetId);
  if (cur) {
    const verBadge = cur.verified
      ? '<span style="display:inline-block;padding:1px 6px;background:#2ecc71;color:#000;font-size:10px;font-family:Space Mono,monospace;border-radius:3px;margin-left:6px">✓ NSSDCA VERIFIED</span>'
      : '<span style="display:inline-block;padding:1px 6px;background:#e8a33d;color:#000;font-size:10px;font-family:Space Mono,monospace;border-radius:3px;margin-left:6px">! UNVERIFIED</span>';
    const dsSite = cur.differentSite
      ? `<div style="padding:6px 10px;background:rgba(244,163,64,0.1);border-left:3px solid #f4a340;margin:8px 0;font-family:Space Mono,monospace;font-size:11px;color:#f4a340;line-height:1.4">${cur.siteNote}</div>`
      : '';
    const photoHtml = cur.nasaPhoto
      ? `<div style="margin:10px 0"><img src="${cur.nasaPhoto}" 
           onerror="this.parentElement.style.display='none'"
           style="width:100%;max-width:340px;height:200px;object-fit:cover;border:1px solid #333">
           <div style="font-family:Space Mono,monospace;font-size:9px;color:#666;margin-top:2px">${cur.nasaPhotoCredit || 'Credit: NASA'}</div>
           ${cur.source ? '<a href="' + cur.source + '" target="_blank" style="font-family:Space Mono,monospace;font-size:10px;color:#f4a340;text-decoration:none">NSSDCA SOURCE ↗</a>' : ''}
         </div>`
      : '';
    const verNote = cur.verifiedNote
      ? `<div style="font-family:Space Mono,monospace;font-size:10px;color:#2ecc71;margin-top:4px;opacity:0.8">${cur.verifiedNote}</div>`
      : '';
    detail.innerHTML = `
      <div class="kick">NASA ARCHIVE ENTRY · ${cur.nssdca}</div>
      <h2 class="bebas" style="font-size:36px;margin:4px 0">${cur.name}${verBadge}</h2>
      <div style="font-family:'Space Mono',monospace;font-size:12px;color:var(--mustard);margin-bottom:4px">${cur.coords}</div>
      ${verNote}
      ${dsSite}
      ${photoHtml}
      <p style="font-size:16px;line-height:1.5">${cur.desc}</p>
      <h3 class="bebas" style="font-size:24px;margin-top:14px">ENGINEERING & HOW IT WORKED</h3>
      <p style="font-size:15px;line-height:1.5">${cur.howItWorked}</p>
      <h3 class="bebas" style="font-size:24px;margin-top:14px">SCIENTIFIC IMPACT</h3>
      <p style="font-size:15px;line-height:1.5">${cur.whatItDiscovered}</p>
    `;
  }
}

function updateArchiveBadge() {
  const syncedCount = HARDWARE.filter(h => h.id !== 'base' && h.synced).length;
  $('#archive-count').textContent = `${syncedCount}/6`;
}

/* ---------- Houston Comms / Radio ---------- */
async function radioHouston() {
  playStatic();
  const synced = HARDWARE.filter(h => h.id !== 'base' && h.synced).length;
  if (GAME.relayInstalled) {
    await say('CONTROL', 'Houston here! The beam is solid. All fifty years of lunar archives have reached Earth. Interplanetary coordinates confirmed—stand by for Act 2!');
  } else if (GAME.relayCrafted) {
    await say('CONTROL', 'Houston reading your craft status! You have assembled the Long-Listen Optical Relay Array! Head to the Apollo 11 Descent Stage and install it on the MESA bracket.');
  } else if (synced >= 4) {
    await say('CONTROL', 'Houston here. We are receiving pristine harmonic pulses through the retroreflectors. Check your base camp workbench—you should have enough materials to assemble the Optical Relay!');
  } else {
    await say('CONTROL', 'Houston reading your telemetry. Follow the Long-Listen detector pings. Inspect the Apollo descent stage, the SNAP-27 RTG, and the LRRR retroreflector to harvest components.');
  }
}
$('#btn-radio').addEventListener('click', radioHouston);

/* ---------- Act 1 Climax: Installing the Long-Listen Optical Relay ---------- */
async function installRelayArray() {
  GAME.relayInstalled = true;
  playLaserChirp();
  playChime();

  // Trigger beam visual cutscene
  await say('EXPLORER', 'Long-Listen Optical Relay locked onto Eagle\'s MESA bracket. Aligning laser optical sights with the Suprasil quartz retroreflectors...');
  await say('EXPLORER', 'Powering optical emitter to full output. Firing in 3... 2... 1... TRANSMIT!');

  playLaserChirp();
  await sleep(1200);

  // Show Act 1 Completion Modal
  $('#act1-modal').style.display = 'block';
  GAME.currentModal = 'act1';

  // Stats
  const statBox = $('#act1-stats');
  statBox.innerHTML = `
    <div class="stat-pill"><div class="stat-num">6 / 6</div><div class="stat-lbl">APOLLO ARTIFACTS SYNCED</div></div>
    <div class="stat-pill"><div class="stat-num">100%</div><div class="stat-lbl">LONG-LISTEN ARCHIVE RESTORED</div></div>
    <div class="stat-pill"><div class="stat-num">532 nm</div><div class="stat-lbl">OPTICAL RELAY FREQUENCY</div></div>
    <div class="stat-pill"><div class="stat-num">ACT 2</div><div class="stat-lbl">NEXT DESTINATION: MARS</div></div>
  `;
}

$('#act1-continue-btn').addEventListener('click', () => {
  $('#act1-modal').style.display = 'none';
  GAME.currentModal = null;
  playClick();
});
$('#act1-restart-btn').addEventListener('click', () => {
  location.reload();
});

function closeAllModals() {
  $('#factcard').style.display = 'none';
  $('#workshop-modal').style.display = 'none';
  $('#codex-modal').style.display = 'none';
  $('#act1-modal').style.display = 'none';
  const invM = document.getElementById('inv-modal');
  if (invM) invM.style.display = 'none';
  GAME.currentModal = null;
  GAME.invOpen = false;
}

function updateInventoryUI() {
  // Update tray (compact)
  const grid = $('#inv-items');
  grid.innerHTML = '';
  let totalItems = 0;
  Object.keys(INV).forEach(k => {
    const it = INV[k];
    if (it.count > 0) {
      totalItems++;
      const badge = document.createElement('div');
      badge.className = 'inv-badge highlight';
      badge.title = it.desc;
      badge.innerHTML = `<span>${it.icon}</span> <span>${it.name}</span> <b>x${it.count}</b>`;
      grid.appendChild(badge);
    }
  });
  if (totalItems === 0) {
    grid.innerHTML = '<span style="font-family:\'Space Mono\',monospace;font-size:11px;color:#777">No hardware collected yet. Explore!</span>';
  }

  // Update full inventory modal if open
  renderInventoryModal();
}

// Categories for inventory modal
const INV_CATEGORIES = {
  'Power Systems': ['battery', 'rtg_wire'],
  'Optical / Scientific': ['prism'],
  'Propulsion': ['valve'],
  'Data Storage': ['tape'],
  'Navigation': ['gyro'],
  'Structural': ['mylar']
};

function renderInventoryModal() {
  const modal = document.getElementById('inv-modal');
  if (!modal) return;
  const body = document.getElementById('inv-modal-body');
  if (!body) return;

  body.innerHTML = '';

  // Which items are needed for each blueprint
  const neededBy = {};
  BLUEPRINTS.forEach(bp => {
    bp.reqs.forEach(r => {
      if (!neededBy[r.id]) neededBy[r.id] = [];
      if (!bp.crafted) neededBy[r.id].push(bp.title);
    });
  });

  Object.entries(INV_CATEGORIES).forEach(([catName, keys]) => {
    const catDiv = document.createElement('div');
    catDiv.style.cssText = 'margin-bottom:14px';

    const catHeader = document.createElement('div');
    catHeader.style.cssText = 'font-family:Bebas Neue,sans-serif;font-size:18px;color:#f4a340;letter-spacing:2px;border-bottom:1px solid rgba(244,163,64,0.3);padding-bottom:3px;margin-bottom:8px';
    catHeader.textContent = catName;
    catDiv.appendChild(catHeader);

    const itemGrid = document.createElement('div');
    itemGrid.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:8px';

    keys.forEach(k => {
      const it = INV[k];
      const have = it.count > 0;
      const needed = neededBy[k] || [];
      const card = document.createElement('div');
      card.style.cssText = `padding:8px 10px;background:rgba(255,255,255,${have ? '0.07' : '0.02'});border:1px solid rgba(255,255,255,${have ? '0.2' : '0.05'});border-radius:4px;position:relative`;

      const neededHtml = needed.length > 0
        ? `<div style="font-size:9px;color:#f4a340;font-family:Space Mono,monospace;margin-top:3px">FOR: ${needed.join(', ')}</div>`
        : '';

      card.innerHTML = `
        <div style="display:flex;align-items:center;gap:6px">
          <span style="font-size:18px">${it.icon}</span>
          <div>
            <div style="font-family:Space Mono,monospace;font-size:11px;color:${have ? '#f4f0ea' : '#666'};font-weight:${have ? 'bold' : 'normal'}">${it.name}</div>
            <div style="font-family:Space Mono,monospace;font-size:10px;color:${have ? '#2ecc71' : '#555'}">QTY: ${it.count}</div>
          </div>
        </div>
        <div style="font-family:Space Mono,monospace;font-size:9px;color:#888;margin-top:4px;line-height:1.3">${it.desc}</div>
        ${neededHtml}
      `;
      card.title = it.desc;
      itemGrid.appendChild(card);
    });

    catDiv.appendChild(itemGrid);
    body.appendChild(catDiv);
  });
}

function toggleInventory() {
  GAME.invOpen = !GAME.invOpen;
  const modal = document.getElementById('inv-modal');
  if (!modal) return;
  if (GAME.invOpen) {
    if (GAME.currentModal && GAME.currentModal !== 'inv') closeAllModals();
    GAME.currentModal = 'inv';
    modal.style.display = 'block';
    renderInventoryModal();
  } else {
    modal.style.display = 'none';
    GAME.currentModal = null;
    GAME.invOpen = false;
  }
}

/* ---------- Graphics Rendering ---------- */
function draw() {
  gc.clearRect(0, 0, W, H);

  // Camera viewport transform with zoom
  gc.save();
  const z = GAME.zoom;
  gc.translate(W / 2, H / 2);
  gc.scale(z, z);
  gc.translate(-GAME.camX, -GAME.camY);

  // 1. Lunar Regolith Background & Maria
  drawLunarSurface(gc);

  // 2. Footprints & Rover tracks
  drawTracks(gc);

  // 3. Craters & Boulders
  drawCratersAndBoulders(gc);

  // 4. Scavengeable Caches
  drawCaches(gc);

  // 5. Historical NASA Hardware
  drawAllHardware(gc);

  // 6. Rover (if player is not driving it)
  if (!GAME.inRover) {
    drawRover(gc, ROVER.x, ROVER.y, ROVER.angle);
  }

  // 7. Player (or Player driving Rover)
  if (GAME.inRover) {
    drawRover(gc, ROVER.x, ROVER.y, ROVER.angle, true);
  } else {
    drawAstronaut(gc, PLAYER.x, PLAYER.y, PLAYER.angle, PLAYER.hopPhase);
  }

  // 8. Dynamic Flashlight & Space Darkness Mask
  drawLightingMask(gc);

  // 9. Transmission Laser Beam (if installed)
  if (GAME.relayInstalled) {
    drawTransmissionBeam(gc);
  }

  gc.restore();

  // Earth hanging in the sky window overlay
  drawEarthCorner(gc);

  // HUD overlays (screen-space, no transform)
  drawObjectiveTracker(gc);
  drawToasts(gc);
  drawDirectionalArrow(gc);
}

function drawLunarSurface(c) {
  // Base highland regolith (brighter)
  c.fillStyle = '#c4beb1';
  c.fillRect(0, 0, WORLD_W, WORLD_H);

  // Albedo variation - secondary highland patch
  c.fillStyle = '#ccc8bb';
  c.beginPath();
  c.ellipse(600, 600, 700, 500, 0.3, 0, 7);
  c.fill();

  c.fillStyle = '#b0a99c';
  c.beginPath();
  c.ellipse(3000, 1800, 500, 400, -0.1, 0, 7);
  c.fill();

  // Mare Tranquillitatis dark basalt - primary
  c.fillStyle = '#9a9387';
  c.beginPath();
  c.ellipse(1800, 1000, 1100, 650, 0.1, 0, 7);
  c.fill();

  // Mare secondary darker pool
  c.fillStyle = '#8a837a';
  c.beginPath();
  c.ellipse(2400, 1300, 820, 520, -0.2, 0, 7);
  c.fill();

  // Regolith grain texture - fine procedural dots
  c.fillStyle = 'rgba(70,66,60,0.09)';
  for (let i = 0; i < 1800; i++) {
    const gx = (i * 1733 + 500) % WORLD_W;
    const gy = (i * 1049 + 300) % WORLD_H;
    c.beginPath(); c.arc(gx, gy, 1.5, 0, 7); c.fill();
  }

  // Bright grain highlights (solar reflection)
  c.fillStyle = 'rgba(230,224,210,0.11)';
  for (let i = 0; i < 900; i++) {
    const gx = (i * 2017 + 100) % WORLD_W;
    const gy = (i * 887 + 200) % WORLD_H;
    c.beginPath(); c.arc(gx, gy, 1, 0, 7); c.fill();
  }

  // Micro-crater field (3-8px)
  c.strokeStyle = 'rgba(60,56,50,0.35)';
  c.lineWidth = 1;
  for (let i = 0; i < 120; i++) {
    const mx = (i * 1193 + 400) % WORLD_W;
    const my = (i * 677 + 150) % WORLD_H;
    const mr = 3 + (i * 7) % 6;
    c.beginPath(); c.arc(mx, my, mr, 0, 7); c.stroke();
    // micro-crater inner dark
    c.fillStyle = 'rgba(40,38,34,0.25)';
    c.beginPath(); c.arc(mx + mr*0.1, my + mr*0.1, mr*0.65, 0, 7); c.fill();
    // micro-crater bright rim (sun from upper-left)
    c.strokeStyle = 'rgba(220,214,200,0.4)';
    c.beginPath(); c.arc(mx, my, mr, Math.PI*0.75, Math.PI*1.75); c.stroke();
    c.strokeStyle = 'rgba(60,56,50,0.35)';
  }

  // Directional dust streaks using seeded positions matching BOULDERS layout
  c.strokeStyle = 'rgba(90,86,80,0.10)';
  c.lineWidth = 2.5;
  for (let _i = 0; _i < 40; _i++) {
    const _bx = 100 + ((_i * 449 + 310) % (WORLD_W - 200));
    const _by = 100 + ((_i * 617 + 170) % (WORLD_H - 200));
    const _br = 8 + ((_i * 23) % 20);
    c.beginPath();
    c.moveTo(_bx, _by);
    c.lineTo(_bx + _br * 2.8, _by + _br * 2.8);
    c.stroke();
  }
}

function drawTracks(c) {
  TRACKS.forEach(tr => {
    c.save();
    c.translate(tr.x, tr.y);
    c.rotate(tr.angle);
    if (tr.isRover) {
      c.fillStyle = 'rgba(60, 55, 48, 0.45)';
      c.fillRect(-10, -18, 6, 4);
      c.fillRect(-10, 14, 6, 4);
    } else {
      c.fillStyle = 'rgba(70, 65, 58, 0.5)';
      c.beginPath();
      c.ellipse(0, 0, 3, 5, 0, 0, 7);
      c.fill();
    }
    c.restore();
  });
}

function drawCratersAndBoulders(c) {
  // Craters
  CRATERS.forEach(cr => {
    // Outer shadow
    c.fillStyle = '#7a7469';
    c.beginPath(); c.arc(cr.x, cr.y, cr.r, 0, 7); c.fill();

    // Inner rim illuminated by sunlight (from upper-left)
    c.strokeStyle = '#dfd9cc';
    c.lineWidth = Math.max(2, cr.r * 0.08);
    c.beginPath();
    c.arc(cr.x, cr.y, cr.r * 0.94, Math.PI * 0.8, Math.PI * 1.8);
    c.stroke();

    // Dark interior shadow
    c.fillStyle = '#3a3731';
    c.beginPath();
    c.arc(cr.x + cr.r * 0.15, cr.y + cr.r * 0.15, cr.r * 0.72, 0, 7);
    c.fill();
  });

  // Boulders
  BOULDERS.forEach(b => {
    // Cast shadow
    c.fillStyle = 'rgba(25, 24, 22, 0.45)';
    c.beginPath();
    c.ellipse(b.x + b.r * 0.6, b.y + b.r * 0.6, b.r * 1.1, b.r * 0.6, 0.5, 0, 7);
    c.fill();

    // Rock body
    c.fillStyle = '#9c9587';
    c.beginPath(); c.arc(b.x, b.y, b.r, 0, 7); c.fill();

    // Rock highlight
    c.fillStyle = '#d5cfc2';
    c.beginPath(); c.arc(b.x - b.r * 0.3, b.y - b.r * 0.3, b.r * 0.5, 0, 7); c.fill();
  });
}

function drawCaches(c) {
  CACHES.forEach(ch => {
    if (ch.scavenged) return;
    c.save();
    c.translate(ch.x, ch.y);
    c.fillStyle = 'rgba(0,0,0,0.3)';
    c.fillRect(-12, 6, 24, 8);
    c.fillStyle = '#e8a33d';
    c.strokeStyle = '#141414';
    c.lineWidth = 2;
    c.fillRect(-10, -10, 20, 20);
    c.strokeRect(-10, -10, 20, 20);
    c.fillStyle = '#fff';
    c.fillRect(-2, -8, 4, 16);
    c.fillRect(-8, -2, 16, 4);
    c.restore();
  });
}

function drawAllHardware(c) {
  HARDWARE.forEach(h => {
    c.save();
    c.translate(h.x, h.y);

    if (h.id === 'base') {
      // Base camp habitat
      c.fillStyle = 'rgba(0,0,0,0.35)';
      c.fillRect(-70, -40, 140, 80);
      c.fillStyle = '#e5dfcf';
      c.strokeStyle = '#111';
      c.lineWidth = 3;
      c.beginPath(); c.roundRect(-60, -35, 120, 70, 12); c.fill(); c.stroke();
      // Solar panel wings
      c.fillStyle = '#1c3d5a';
      c.fillRect(-110, -25, 45, 50);
      c.fillRect(65, -25, 45, 50);
      c.strokeStyle = '#5bc0be'; c.lineWidth = 1;
      c.strokeRect(-110, -25, 45, 50);
      c.strokeRect(65, -25, 45, 50);
      // Dish antenna
      c.strokeStyle = '#e8a33d'; c.lineWidth = 2;
      c.beginPath(); c.arc(0, -45, 16, Math.PI, 2 * Math.PI); c.stroke();
      c.beginPath(); c.moveTo(0, -35); c.lineTo(0, -45); c.stroke();
    } else if (h.id === 'apollo11') {
      // Apollo 11 LM Descent Stage
      // 4 Landing gear legs with pads
      c.strokeStyle = '#555'; c.lineWidth = 5;
      const legR = 64;
      for (let a = 0; a < 4; a++) {
        const ang = a * Math.PI / 2 + Math.PI / 4;
        const lx = Math.cos(ang) * legR, ly = Math.sin(ang) * legR;
        c.beginPath(); c.moveTo(0, 0); c.lineTo(lx, ly); c.stroke();
        // Footpad
        c.fillStyle = '#999';
        c.beginPath(); c.ellipse(lx, ly, 10, 7, ang, 0, 7); c.fill();
        c.stroke();
      }
      // Octagonal descent stage body (Gold Mylar foil)
      c.fillStyle = '#d4af37';
      c.strokeStyle = '#1a1a1a';
      c.lineWidth = 3;
      c.beginPath();
      for (let i = 0; i < 8; i++) {
        const ang = i * Math.PI / 4;
        const px = Math.cos(ang) * 38, py = Math.sin(ang) * 38;
        i === 0 ? c.moveTo(px, py) : c.lineTo(px, py);
      }
      c.closePath(); c.fill(); c.stroke();

      // Descent Engine Bell in center
      c.fillStyle = '#1a1a1a';
      c.beginPath(); c.arc(0, 0, 16, 0, 7); c.fill();
      c.strokeStyle = '#555'; c.lineWidth = 2; c.stroke();

      // Plaque & American Flag nearby
      c.fillStyle = '#fff';
      c.fillRect(36, 15, 6, 14);
      c.fillStyle = '#d9432b';
      c.fillRect(42, 15, 18, 12);
      c.fillStyle = '#1c3d5a';
      c.fillRect(42, 15, 7, 7);

      // If Long-Listen relay installed
      if (GAME.relayInstalled) {
        c.fillStyle = '#2ecc71';
        c.beginPath(); c.arc(0, 0, 10, 0, 7); c.fill();
      }
    } else if (h.id === 'rtg') {
      // ALSEP Station + SNAP-27 RTG
      // Station box
      c.fillStyle = '#e8e4da'; c.strokeStyle = '#141414'; c.lineWidth = 2;
      c.fillRect(-22, -18, 44, 36); c.strokeRect(-22, -18, 44, 36);
      // Helical antenna
      c.strokeStyle = '#d9432b'; c.lineWidth = 2;
      c.beginPath(); c.moveTo(0, -18); c.lineTo(0, -42); c.stroke();
      // Cable to RTG
      c.strokeStyle = '#e8a33d'; c.lineWidth = 3;
      c.beginPath(); c.moveTo(22, 0); c.quadraticCurveTo(34, 12, 42, 0); c.stroke();
      // SNAP-27 finned cylinder
      c.fillStyle = '#4a4a52';
      c.fillRect(42, -14, 18, 28);
      // Heat fins
      c.strokeStyle = '#222'; c.lineWidth = 1.5;
      for (let f = -12; f <= 12; f += 6) {
        c.beginPath(); c.moveTo(38, f); c.lineTo(64, f); c.stroke();
      }
    } else if (h.id === 'lrrr') {
      // Retroreflector pallet (100 corner-cube prisms)
      c.fillStyle = '#fff'; c.strokeStyle = '#111'; c.lineWidth = 2;
      c.fillRect(-26, -20, 52, 40); c.strokeRect(-26, -20, 52, 40);
      // Prisms array
      c.fillStyle = '#38bdf8';
      for (let rx = -20; rx <= 16; rx += 9) {
        for (let ry = -14; ry <= 12; ry += 9) {
          c.beginPath(); c.arc(rx + 4, ry + 4, 3, 0, 7); c.fill();
        }
      }
    } else if (h.id === 'surveyor') {
      // Surveyor 3 triangular tripod
      c.strokeStyle = '#fff'; c.lineWidth = 3;
      c.beginPath();
      c.moveTo(0, -28); c.lineTo(-24, 18); c.lineTo(24, 18); c.closePath(); c.stroke();
      // Mast & Solar panel
      c.fillStyle = '#1c3d5a'; c.fillRect(-10, -44, 20, 16);
      c.strokeStyle = '#333'; c.lineWidth = 1; c.strokeRect(-10, -44, 20, 16);
      c.fillStyle = '#777'; c.beginPath(); c.arc(0, 0, 9, 0, 7); c.fill();
    } else if (h.id === 'pse') {
      // Passive Seismic Experiment drum
      c.fillStyle = '#d4af37'; c.strokeStyle = '#111'; c.lineWidth = 2;
      c.beginPath(); c.arc(0, 0, 22, 0, 7); c.fill(); c.stroke();
      c.fillStyle = '#fff'; c.beginPath(); c.arc(0, 0, 8, 0, 7); c.fill();
    }

    // Sync status ring indicator
    if (h.id !== 'base') {
      c.strokeStyle = h.synced ? 'rgba(46, 204, 113, 0.7)' : 'rgba(232, 163, 61, 0.6)';
      c.lineWidth = 2;
      c.setLineDash([4, 4]);
      c.beginPath(); c.arc(0, 0, h.radius + 6, 0, 7); c.stroke();
      c.setLineDash([]);

      // Beacon pulse rings on unvisited hardware
      if (!h.synced && !GAME.discoveredHw.has(h.id)) {
        const pt = performance.now() * 0.001;
        const ringPhases = [0, 0.4, 0.8];
        ringPhases.forEach(phase => {
          const p = ((pt + phase) % 1.6) / 1.6;
          if (p > 1) return;
          const r = h.radius + 10 + p * 55;
          const alpha = (1 - p) * 0.6;
          c.strokeStyle = `rgba(232, 163, 61, ${alpha})`;
          c.lineWidth = 2;
          c.setLineDash([]);
          c.beginPath(); c.arc(0, 0, r, 0, 7); c.stroke();
        });
      } else if (!h.synced) {
        // Softer ring for discovered but not synced
        const pt = performance.now() * 0.001;
        const p = (pt % 1.2) / 1.2;
        c.strokeStyle = `rgba(232, 163, 61, ${(1-p)*0.3})`;
        c.lineWidth = 1.5;
        c.beginPath(); c.arc(0, 0, h.radius + 10 + p*30, 0, 7); c.stroke();
      }
    }

    c.restore();
  });
}

function drawAstronaut(c, x, y, angle, hopPhase) {
  c.save();
  c.translate(x, y);

  // 1/6th gravity hop lift & shadow
  const hopY = Math.abs(Math.sin(hopPhase)) * 9;
  // Ground shadow ellipse
  c.fillStyle = 'rgba(10, 10, 10, 0.5)';
  c.beginPath();
  c.ellipse(0, 8, 14 - hopY * 0.4, 6 - hopY * 0.15, 0, 0, 7);
  c.fill();

  c.translate(0, -hopY);
  c.rotate(angle);

  // === LIMBS (drawn behind torso) ===
  c.strokeStyle = '#d8d4ca';
  c.lineWidth = 5;
  c.lineCap = 'round';
  // Arms
  c.beginPath(); c.moveTo(-3, -5); c.lineTo(-18, 2); c.stroke();
  c.beginPath(); c.moveTo(-3, 5); c.lineTo(-17, 11); c.stroke();
  // Legs
  c.beginPath(); c.moveTo(0, 10); c.lineTo(-8, 22); c.stroke();
  c.beginPath(); c.moveTo(0, 10); c.lineTo(8, 22); c.stroke();

  // PLSS Backpack
  c.fillStyle = '#c8c4bb';
  c.strokeStyle = '#1a1a1a';
  c.lineWidth = 2;
  c.fillRect(-18, -12, 11, 24);
  c.strokeRect(-18, -12, 11, 24);
  // PLSS vents detail
  c.fillStyle = '#aaa69e';
  c.fillRect(-16, -9, 7, 5);
  c.fillRect(-16, -1, 7, 5);
  c.fillRect(-16, 7, 7, 5);

  // Suit Torso – bright white with thick dark outline for contrast
  c.strokeStyle = '#111111';
  c.lineWidth = 3;
  c.fillStyle = '#f4f0ea';
  c.beginPath();
  c.ellipse(0, 0, 14, 15, 0, 0, 7);
  c.fill(); c.stroke();

  // Bright outline so astronaut reads clearly on dark AND light surfaces
  c.strokeStyle = 'rgba(255,255,255,0.75)';
  c.lineWidth = 1.5;
  c.beginPath();
  c.ellipse(0, 0, 15.5, 16.5, 0, 0, 7);
  c.stroke();

  // Helmet
  c.fillStyle = '#eceada';
  c.strokeStyle = '#111111';
  c.lineWidth = 3;
  c.beginPath(); c.arc(6, 0, 11, 0, 7); c.fill(); c.stroke();
  // Helmet highlight
  c.strokeStyle = 'rgba(255,255,255,0.6)';
  c.lineWidth = 1.5;
  c.beginPath(); c.arc(6, 0, 12, 0, 7); c.stroke();

  // Amber Gold Visor
  c.fillStyle = '#f0a030';
  c.strokeStyle = '#c47c10';
  c.lineWidth = 1.5;
  c.beginPath();
  c.arc(8, 0, 8, -Math.PI / 2.2, Math.PI / 2.2);
  c.fill(); c.stroke();
  // Visor earth reflection
  c.fillStyle = 'rgba(100,180,255,0.35)';
  c.beginPath(); c.arc(6, -2, 4, -Math.PI / 3, Math.PI / 4); c.fill();

  // American flag patch
  c.fillStyle = '#d9432b';
  c.fillRect(-3, -16, 5, 4);
  c.fillStyle = '#ffffff';
  c.fillRect(-3, -15, 5, 1.5);
  c.fillStyle = '#1c3d5a';
  c.fillRect(-3, -16, 2, 2);

  c.restore();
}

function drawRover(c, x, y, angle, hasDriver) {
  c.save();
  c.translate(x, y);
  c.rotate(angle);

  // Shadow
  c.fillStyle = 'rgba(20, 20, 20, 0.4)';
  c.fillRect(-32, -22, 64, 44);

  // 4 Wheels (piano-wire mesh with titanium chevrons)
  c.fillStyle = '#484950';
  c.strokeStyle = '#111';
  c.lineWidth = 2;
  // Front-Left, Front-Right, Rear-Left, Rear-Right
  c.fillRect(16, -26, 18, 9); c.strokeRect(16, -26, 18, 9);
  c.fillRect(16, 17, 18, 9); c.strokeRect(16, 17, 18, 9);
  c.fillRect(-30, -26, 18, 9); c.strokeRect(-30, -26, 18, 9);
  c.fillRect(-30, 17, 18, 9); c.strokeRect(-30, 17, 18, 9);

  // Chassis Frame
  c.fillStyle = '#9e998e';
  c.fillRect(-26, -17, 52, 34);
  c.strokeRect(-26, -17, 52, 34);

  // Twin Seats
  c.fillStyle = '#4a4843';
  c.fillRect(-10, -14, 16, 12);
  c.fillRect(-10, 2, 16, 12);

  // Driver figure if inside
  if (hasDriver) {
    c.fillStyle = '#f8f6f0';
    c.beginPath(); c.arc(-2, -8, 8, 0, 7); c.fill();
    c.fillStyle = '#f4a340';
    c.beginPath(); c.arc(0, -8, 5, -1, 1); c.fill();
  }

  // High-Gain Parabolic Dish Antenna
  c.strokeStyle = '#fff'; c.lineWidth = 2;
  c.beginPath(); c.arc(14, -8, 10, -Math.PI / 2, Math.PI / 2); c.stroke();

  // TV Camera
  c.fillStyle = '#d9432b';
  c.fillRect(20, 6, 8, 8);

  // Headlights
  if (ROVER.repaired) {
    c.fillStyle = '#fff';
    c.fillRect(25, -13, 3, 5);
    c.fillRect(25, 8, 3, 5);
  }

  c.restore();
}

function drawLightingMask(c) {
  // We draw a dark overlay over the viewport, then punch out the light cones
  c.save();

  // Ambient space darkness
  c.fillStyle = 'rgba(11, 12, 16, 0.32)';
  c.fillRect(GAME.camX - W * 2, GAME.camY - H * 2, W * 4, H * 4);

  // Flashlight / Headlight punch-out using destination-out
  c.globalCompositeOperation = 'destination-out';

  if (GAME.inRover) {
    // Dual headlights
    const hx = ROVER.x + Math.cos(ROVER.angle) * 30;
    const hy = ROVER.y + Math.sin(ROVER.angle) * 30;
    const g = c.createRadialGradient(hx, hy, 10, hx + Math.cos(ROVER.angle) * 280, hy + Math.sin(ROVER.angle) * 280, 260);
    g.addColorStop(0, 'rgba(0,0,0,1)');
    g.addColorStop(0.7, 'rgba(0,0,0,0.6)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = g;
    c.beginPath();
    c.moveTo(hx, hy);
    c.arc(hx, hy, 380, ROVER.angle - 0.55, ROVER.angle + 0.55);
    c.closePath();
    c.fill();
  } else {
    // Astronaut Helmet Flashlight cone
    const fx = PLAYER.x + Math.cos(PLAYER.angle) * 10;
    const fy = PLAYER.y + Math.sin(PLAYER.angle) * 10;
    const g = c.createRadialGradient(fx, fy, 8, fx + Math.cos(PLAYER.angle) * 200, fy + Math.sin(PLAYER.angle) * 200, 200);
    g.addColorStop(0, 'rgba(0,0,0,1)');
    g.addColorStop(0.65, 'rgba(0,0,0,0.5)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = g;
    c.beginPath();
    c.moveTo(fx, fy);
    c.arc(fx, fy, 280, PLAYER.angle - 0.65, PLAYER.angle + 0.65);
    c.closePath();
    c.fill();

    // Small gentle ambient softening around astronaut (not punched out)
    const g2 = c.createRadialGradient(PLAYER.x, PLAYER.y, 18, PLAYER.x, PLAYER.y, 65);
    g2.addColorStop(0, 'rgba(0,0,0,0.5)');
    g2.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = g2;
    c.beginPath(); c.arc(PLAYER.x, PLAYER.y, 65, 0, 7); c.fill();
  }

  c.restore();
}

function drawTransmissionBeam(c) {
  // Laser beam connecting Apollo 11 to LRRR retroreflector and shooting into space!
  c.save();
  const ap11 = HARDWARE.find(h => h.id === 'apollo11');
  const lrrr = HARDWARE.find(h => h.id === 'lrrr');

  c.strokeStyle = '#2ecc71';
  c.lineWidth = 4;
  c.beginPath();
  c.moveTo(ap11.x, ap11.y);
  c.lineTo(lrrr.x, lrrr.y);
  c.stroke();

  // Beam ricochets off retroreflector into deep space (towards upper-right)
  const g = c.createLinearGradient(lrrr.x, lrrr.y, lrrr.x + 1200, lrrr.y - 1400);
  g.addColorStop(0, '#2ecc71');
  g.addColorStop(0.7, '#38ef7d');
  g.addColorStop(1, 'rgba(56, 239, 125, 0)');
  c.strokeStyle = g;
  c.lineWidth = 6;
  c.beginPath();
  c.moveTo(lrrr.x, lrrr.y);
  c.lineTo(lrrr.x + 1200, lrrr.y - 1400);
  c.stroke();

  // Pulsing glow at LRRR
  c.fillStyle = 'rgba(56, 239, 125, 0.4)';
  c.beginPath();
  c.arc(lrrr.x, lrrr.y, 24 + Math.sin(performance.now() * 0.01) * 8, 0, 7);
  c.fill();

  c.restore();
}

function drawEarthCorner(c) {
  // Draw the Earth hanging over the Moon in upper-left corner
  c.save();
  const ex = 100, ey = 100;
  // Earth Glow
  const g = c.createRadialGradient(ex, ey, 24, ex, ey, 48);
  g.addColorStop(0, 'rgba(42, 157, 143, 0.4)');
  g.addColorStop(1, 'rgba(42, 157, 143, 0)');
  c.fillStyle = g;
  c.beginPath(); c.arc(ex, ey, 48, 0, 7); c.fill();

  // Blue marble
  c.fillStyle = '#1c4966';
  c.beginPath(); c.arc(ex, ey, 28, 0, 7); c.fill();

  // Continents (Africa / Europe outlines)
  c.fillStyle = '#6b8e23';
  c.beginPath();
  c.ellipse(ex - 4, ey - 2, 9, 14, 0.2, 0, 7);
  c.fill();

  // Clouds
  c.fillStyle = 'rgba(255, 255, 255, 0.65)';
  c.beginPath();
  c.arc(ex + 6, ey - 8, 8, 0, 7);
  c.arc(ex - 8, ey + 10, 6, 0, 7);
  c.fill();

  // Sunset Terminator line
  c.fillStyle = 'rgba(10, 11, 15, 0.75)';
  c.beginPath();
  c.arc(ex, ey, 28.5, Math.PI * 0.4, Math.PI * 1.6);
  c.closePath();
  c.fill();

  // Amber Sunset Rim
  c.strokeStyle = '#f4a340';
  c.lineWidth = 2;
  c.beginPath();
  c.arc(ex, ey, 28, Math.PI * 0.35, Math.PI * 1.65);
  c.stroke();

  c.restore();
}

/* Schematic drawings on Fact Card */
function drawHardwareSchematic(c, id) {
  c.clearRect(0, 0, 240, 220);
  c.save();
  c.translate(120, 110);
  c.strokeStyle = '#f4a340';
  c.lineWidth = 2;

  if (id === 'apollo11') {
    c.strokeRect(-50, -35, 100, 70);
    c.fillStyle = '#d4af37'; c.fillRect(-48, -33, 96, 66);
    // Legs
    c.beginPath();
    c.moveTo(-50, -35); c.lineTo(-80, -65);
    c.moveTo(50, -35); c.lineTo(80, -65);
    c.moveTo(-50, 35); c.lineTo(-80, 65);
    c.moveTo(50, 35); c.lineTo(80, 65);
    c.stroke();
    // Engine Bell
    c.fillStyle = '#111';
    c.beginPath(); c.arc(0, 0, 20, 0, 7); c.fill(); c.stroke();
  } else if (id === 'rtg') {
    // SNAP-27 finned generator
    c.strokeRect(-25, -50, 50, 100);
    c.fillStyle = '#4a4a52'; c.fillRect(-23, -48, 46, 96);
    for (let y = -40; y <= 40; y += 16) {
      c.beginPath(); c.moveTo(-45, y); c.lineTo(45, y); c.stroke();
    }
  } else if (id === 'lrrr') {
    c.strokeRect(-60, -45, 120, 90);
    c.fillStyle = '#fff'; c.fillRect(-58, -43, 116, 86);
    c.fillStyle = '#38bdf8';
    for (let x = -45; x <= 45; x += 18) {
      for (let y = -30; y <= 30; y += 18) {
        c.beginPath(); c.arc(x, y, 6, 0, 7); c.fill();
      }
    }
  } else if (id === 'lrv') {
    c.strokeRect(-50, -30, 100, 60);
    c.strokeRect(-65, -45, 25, 15);
    c.strokeRect(40, -45, 25, 15);
    c.strokeRect(-65, 30, 25, 15);
    c.strokeRect(40, 30, 25, 15);
  } else {
    c.beginPath(); c.arc(0, 0, 45, 0, 7); c.stroke();
    c.beginPath(); c.moveTo(0, -60); c.lineTo(0, 60); c.stroke();
    c.beginPath(); c.moveTo(-60, 0); c.lineTo(60, 0); c.stroke();
  }
  c.restore();
}

/* ---------- Scroll Wheel Zoom ---------- */
document.getElementById('gc').addEventListener('wheel', e => {
  e.preventDefault();
  if (e.deltaY < 0) {
    GAME.targetZoom = Math.min(1.4, GAME.targetZoom + 0.08);
  } else {
    GAME.targetZoom = Math.max(0.7, GAME.targetZoom - 0.08);
  }
}, { passive: false });

/* ---------- New HUD Helper Functions ---------- */
function showToast(msg) {
  GAME.toasts.push({ msg, t: 2.8 });
}

function updateObjectiveText() {
  const el = document.getElementById('obj-text');
  if (el) el.textContent = GAME.objective;
}

function updateObjectiveAfterVisit(hw) {
  const syncedCount = HARDWARE.filter(h => h.id !== 'base' && h.synced).length;
  if (GAME.relayInstalled) {
    GAME.objective = 'Act 1 Complete! Long-Listen Optical Relay transmitting';
  } else if (GAME.relayCrafted) {
    GAME.objective = 'Install the Long-Listen Optical Relay on Apollo 11 Descent Stage';
  } else if (syncedCount >= 4) {
    GAME.objective = 'Return to Base Camp Workshop → Craft the Optical Relay Array';
  } else if (syncedCount >= 2) {
    GAME.objective = `Sync ${6 - syncedCount} more hardware nodes → Check Workshop progress`;
  } else {
    GAME.objective = 'Inspect Apollo 11 hardware → Sync Long-Listen Detector signals';
  }
}

function drawObjectiveTracker(c) {
  if (!GAME.active) return;
  const x = W / 2 - 200, y = 10, w = 400, h = 36;
  c.save();
  c.fillStyle = 'rgba(10,10,14,0.72)';
  c.beginPath(); if (c.roundRect) c.roundRect(x, y, w, h, 6); else c.rect(x, y, w, h); c.fill();
  c.strokeStyle = 'rgba(244,163,64,0.4)'; c.lineWidth = 1;
  c.beginPath(); if (c.roundRect) c.roundRect(x, y, w, h, 6); else c.rect(x, y, w, h); c.stroke();

  c.fillStyle = '#f4a340';
  c.font = 'bold 10px "Space Mono", monospace';
  c.textAlign = 'left';
  c.fillText('OBJECTIVE:', x + 10, y + 15);

  c.fillStyle = '#f4f0ea';
  c.font = '10px "Space Mono", monospace';
  // Truncate if too long
  const obj = GAME.objective || '';
  const maxW = w - 90;
  let txt = obj;
  while (c.measureText(txt).width > maxW && txt.length > 10) txt = txt.slice(0, -1);
  if (txt !== obj) txt += '…';
  c.fillText(txt, x + 85, y + 15);

  // Zoom hint
  c.fillStyle = 'rgba(255,255,255,0.3)';
  c.font = '9px "Space Mono", monospace';
  c.textAlign = 'right';
  c.fillText(`ZOOM: ${GAME.zoom.toFixed(1)}x  [-/+]  [I] INV`, x + w - 6, y + 28);
  c.restore();
}

function drawToasts(c) {
  if (!GAME.toasts.length) return;
  c.save();
  GAME.toasts.forEach((toast, i) => {
    const alpha = Math.min(1, toast.t / 0.5) * Math.min(1, (toast.t) * 0.8);
    const ty = H / 2 - 40 - i * 38;
    const tw = c.measureText(toast.msg).width + 40;
    const tx = W / 2 - tw / 2;
    c.fillStyle = `rgba(10,10,14,${0.82 * alpha})`;
    c.beginPath(); if (c.roundRect) c.roundRect(tx, ty, tw, 30, 6); else c.rect(tx, ty, tw, 30); c.fill();
    c.strokeStyle = `rgba(46,204,113,${0.7 * alpha})`;
    c.lineWidth = 1.5; c.beginPath(); if (c.roundRect) c.roundRect(tx, ty, tw, 30, 6); else c.rect(tx, ty, tw, 30); c.stroke();
    c.fillStyle = `rgba(46,204,113,${alpha})`;
    c.font = 'bold 13px "Space Mono", monospace';
    c.textAlign = 'center';
    c.fillText(toast.msg, W / 2, ty + 20);
  });
  c.restore();
}

function drawDirectionalArrow(c) {
  if (!GAME.active || GAME.currentModal) return;
  // Find nearest unsynced hardware
  let nearest = null, minD = Infinity;
  HARDWARE.forEach(h => {
    if (h.id === 'base' || h.synced) return;
    const d = dist(PLAYER.x, PLAYER.y, h.x, h.y);
    if (d < minD) { minD = d; nearest = h; }
  });
  if (!nearest || minD < 200) return; // close enough — no arrow needed

  const ang = Math.atan2(nearest.y - PLAYER.y, nearest.x - PLAYER.x);
  const sx = W / 2 + Math.cos(ang) * 90;
  const sy = H / 2 + Math.sin(ang) * 65;

  c.save();
  c.translate(sx, sy);
  c.rotate(ang);
  const alpha = 0.55 + Math.sin(performance.now() * 0.003) * 0.3;
  c.strokeStyle = `rgba(232,163,61,${alpha})`;
  c.fillStyle = `rgba(232,163,61,${alpha})`;
  c.lineWidth = 2.5;
  // Arrow
  c.beginPath();
  c.moveTo(-12, 0); c.lineTo(12, 0);
  c.moveTo(7, -6); c.lineTo(12, 0); c.lineTo(7, 6);
  c.stroke();
  // Distance label
  const dm = Math.round(minD);
  c.font = '9px "Space Mono",monospace';
  c.textAlign = 'center';
  c.fillText(dm + 'm', 0, -10);
  c.restore();
}

/* ---------- Main Game Loop ---------- */
function gameLoop(now) {
  const dt = Math.min(0.08, (now - lastTime) / 1000);
  lastTime = now;

  if (GAME.active) {
    update(dt);
    draw();
  }

  requestAnimationFrame(gameLoop);
}
requestAnimationFrame(gameLoop);

/* ---------- Transition to Lunar Exploration ---------- */
async function transitionToGame() {
  $('#fade').style.opacity = 1;
  await sleep(600);

  $('#s-title').classList.remove('on');
  $('#s-open').classList.remove('on');
  $('#s-game').classList.add('on');
  GAME.active = true;
  lastTime = performance.now();

  updateInventoryUI();
  updateArchiveBadge();

  $('#fade').style.opacity = 0;
  await sleep(600);

  // Arrival Dialogue
  await say('CONTROL', 'Houston to Explorer. Telemetry confirms touchdown in Mare Tranquillitatis. Look around you. You are standing in the quietest museum in human history.');
  await say('EXPLORER', 'The silence out here... it\'s absolute. Where do I begin, Houston?');
  await say('CONTROL', 'Activate your suit\'s Long-Listen signal detector. The Apollo 11 descent stage should be nearby. Check its flight recorder and the ALSEP scientific instruments.');
}
