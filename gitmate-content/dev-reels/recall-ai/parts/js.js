
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const SPD = 1.0, RAWTOTAL = 34.15, TOTAL = RAWTOTAL; window.__TOTAL = TOTAL;
const S = [0, 4.75, 10.7, 13.6, 16.6, 22.1, 25.55, 28.55, 31.0];
const NS = S.length;
const sm = (a, b, x) => { const k = Math.min(1, Math.max(0, (x - a) / (b - a))); return k * k * (3 - 2 * k); };
const cl = (a, b, x) => Math.min(1, Math.max(0, (x - a) / (b - a)));
const bump = (t, c, w) => Math.max(0, 1 - Math.abs(t - c) / w);
const pad3 = n => String(n).padStart(3, '0');
// S1 snapshots (coverflow back in time)
const SN = ['Mon 9:12 am', 'Mon 2:47 pm', 'Tue 11:03 am', 'Wed 4:30 pm', 'Thu 8:15 pm'];
$('#strip').innerHTML = SN.map((ts, i) => `<div class="snap" id="sn${i}"><div class="sb"><i></i><i></i><i></i></div>
  <i class="ln5" style="top:${62}px;width:${180 + (i * 37) % 120}px"></i><i class="ln5" style="top:${88}px;width:${240 - (i * 23) % 90}px"></i>
  <div class="blk" style="top:${120}px"></div><i class="ln5" style="top:${216}px;width:${200 + (i * 51) % 110}px"></i><i class="ln5" style="top:${242}px;width:${150 + (i * 29) % 100}px"></i>
  <div class="ts">${ts}</div></div>`).join('');
// S2 memory tiles
const SNAPT = [8.0, 8.7, 9.4, 10.1];
const frameAt = t => Math.min(160, Math.max(60, 60 + Math.floor((t - 5.2) * 15)));
$('#mem').innerHTML = SNAPT.map((st, k) => `<div class="mt" id="mt${k}"><img src="media/seq/d${pad3(frameAt(st))}.jpg"></div>`).join('');
$('#shut').innerHTML = Array.from({ length: 6 }, (_, i) => `<i id="bl${i}"></i>`).join('');
// S4 bouncing packets
$('#bncs').innerHTML = Array.from({ length: 6 }, (_, i) => `<div class="bnc" id="bn${i}"></div>`).join('');
// S6 contribution grid
const CG = Array.from({ length: 156 }, (_, i) => { const r = Math.sin(i * 12.9898) * 43758.5453; return r - Math.floor(r); });
$('#cgg').innerHTML = CG.map((_, i) => `<i id="cg${i}"></i>`).join('');
// S7 tiles
$('#tiles').innerHTML = 'FEATURE'.split('').map((c, i) => `<b id="tl${i}">${c}</b>`).join('');

const scenes = $$('.sc');
const poses = scenes.map(s => s.dataset.pose.split(',').map(Number));
scenes.forEach((s, i) => { const [x, y, z, ry, rx, rz] = poses[i]; s.style.transform = `translate3d(${x}px,${y}px,${z}px) rotateY(${ry}deg) rotateX(${rx}deg) rotateZ(${rz}deg)`; });
const tl = gsap.timeline({ paused: true });
$$('.ty').forEach(el => { const t = +el.dataset.t, cd = +(el.dataset.cd || .045); const txt = el.textContent; el.textContent = '';
  const chs = [...txt].map(c => { const s = document.createElement('span'); s.className = 'ch'; s.textContent = c; el.appendChild(s); return s; });
  tl.set(chs, { opacity: 0 }, 0);
  chs.forEach((c, i) => tl.fromTo(c, { opacity: 0, y: 26, filter: 'blur(14px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: .42, ease: 'power3.out', immediateRender: false }, Math.max(0.001, t + i * cd))); });
$$('.rv').forEach(el => { const t = +el.dataset.t; if (isNaN(t)) return;
  tl.set(el, { opacity: 0 }, 0); tl.fromTo(el, { opacity: 0, y: 46, filter: 'blur(16px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: .55, ease: 'power3.out', immediateRender: false }, Math.max(0.001, t)); });
$$('.pp').forEach(el => { const t = +el.dataset.t;
  tl.set(el, { opacity: 0 }, 0); tl.fromTo(el, { opacity: 0, scale: .55, filter: 'blur(10px)' }, { opacity: 1, scale: 1, filter: 'blur(0px)', duration: .5, ease: 'back.out(2.2)', immediateRender: false }, t); });
$$('.c3d').forEach(el => { const t = +el.dataset.t, rx = +(el.dataset.rx || 0), ry = +(el.dataset.ry || 0);
  tl.set(el, { opacity: 0, transformPerspective: 1500 }, 0);
  tl.fromTo(el, { opacity: 0, rotationX: rx + 50, rotationY: ry * 2.5, y: 260, z: -500, scale: .9 }, { opacity: 1, rotationX: rx, rotationY: ry, y: 0, z: 0, scale: 1, duration: 1.05, ease: 'expo.out', immediateRender: false }, Math.max(0.001, t));
  tl.to(el, { rotationX: rx * .4, rotationY: -ry * .5, duration: 3.2, ease: 'sine.inOut' }, Math.max(0.001, t) + 1.05); });
// S8 comment typing
const cm = { n: 0 };
tl.fromTo(cm, { n: 0 }, { n: 7, duration: .45, ease: 'none', immediateRender: false, onUpdate: () => $('#ctx').textContent = 'GITMATE'.slice(0, Math.round(cm.n)) }, 29.15);
// S9 end
const E = 31.0;
tl.set('#bigmk', { opacity: 0, scale: .2 }, 0);
tl.to('#bigmk', { opacity: 1, scale: 1, duration: .9, ease: 'back.out(1.8)' }, E);
tl.fromTo('#er1', { attr: { 'stroke-dashoffset': 1420 } }, { attr: { 'stroke-dashoffset': 0 }, duration: 1.0, ease: 'power2.inOut', immediateRender: false }, E + .15);
tl.fromTo('#er2', { attr: { 'stroke-dashoffset': 1546 } }, { attr: { 'stroke-dashoffset': 0 }, duration: 1.2, ease: 'power2.inOut', immediateRender: false }, E + .3);
tl.to('#tapd', { opacity: 1, left: 560, top: 1440, duration: .5, ease: 'power2.out' }, E + 1.4);
tl.to('#tapd', { scale: .7, duration: .1 }, E + 1.9); tl.to('#tapd', { scale: 1, duration: .15 }, E + 2.0);
tl.to('#fol', { scale: .93, duration: .1 }, E + 1.9); tl.to('#fol', { scale: 1, duration: .2 }, E + 2.0);
tl.set('#fol2', { opacity: 1 }, E + 2.0); tl.set('#fol', { opacity: 0 }, E + 2.0);
tl.fromTo('#rip', { opacity: .7, width: 10, height: 10, margin: -5 }, { opacity: 0, width: 640, height: 640, margin: -320, duration: .8, ease: 'power2.out', immediateRender: false }, E + 1.95);
tl.to('#tapd', { opacity: 0, duration: .3 }, E + 2.35);
tl.to({}, { duration: .01 }, RAWTOTAL);
const ease = x => x < .5 ? 16 * x ** 5 : 1 - Math.pow(-2 * x + 2, 5) / 2;
const TD = .8, TPRE = .45;
function camAt(t) {
  let i = 0; for (let k = 0; k < S.length; k++) if (t >= S[k] - TPRE) i = k;
  const ta = S[i] - TPRE; let p = poses[i].slice(), d = 0, rr = 0;
  if (i > 0 && t < ta + TD) { const u = (t - ta) / TD, e = ease(u), a = poses[i - 1]; p = a.map((v, j) => v + (poses[i][j] - v) * e); d = Math.sin(u * Math.PI) * 700; rr = Math.sin(u * Math.PI) * (i % 2 ? 4 : -4); }
  const st = Math.max(0, t - (S[i] - TPRE + TD)); const dz = Math.min(st, 6) * 8;
  return { x: p[0], y: p[1], z: p[2] - dz, ry: p[3] + Math.sin(t * .6) * .6, rx: p[4] + Math.sin(t * .45) * .5, rz: p[5] + rr, d, i };
}
function camT(c) { return `translateZ(${-c.d + 60}px) rotateZ(${-c.rz}deg) rotateX(${-c.rx}deg) rotateY(${-c.ry}deg) translate3d(${-c.x}px,${-c.y}px,${-c.z}px)`; }
const world = $('#world'), mbg = $('#mbg'), cam = $('#cam');
const typeAt = (t, t0, dur, s) => s.slice(0, Math.max(0, Math.min(s.length, Math.round((t - t0) / dur * s.length))));
const HEX = '0123456789abcdef';
const scramble = (n, seed) => { let s = ''; for (let i = 0; i < n; i++) { const r = Math.sin((i + 1) * 91.7 + seed * 13.1) * 9999; s += i % 5 === 4 ? ' ' : HEX[Math.floor((r - Math.floor(r)) * 16)]; } return s; };
function tick(t) {
  const c = camAt(t), p = camAt(Math.max(0, t - SPD / 30));
  world.style.transform = camT(c);
  const hx = Math.abs(c.x - p.x) * .9 + Math.abs(c.ry - p.ry) * 32, vy = Math.abs(c.y - p.y) * .9 + Math.abs(c.rx - p.rx) * 32, zz = Math.abs(c.z - p.z + (p.d - c.d)) * .25;
  const bx = Math.min(70, hx * .22 + zz * .05), by = Math.min(70, vy * .22 + zz * .05);
  if (bx + by > .4) { mbg.setAttribute('stdDeviation', `${bx.toFixed(1)} ${by.toFixed(1)}`); cam.style.filter = 'url(#mb)'; } else cam.style.filter = 'none';
  scenes.forEach((s, k) => { s.style.visibility = (k === c.i || (k === c.i - 1 && t < S[c.i] - TPRE + TD)) ? 'visible' : 'hidden'; });
  $('#tag').innerHTML = `<b>${String(c.i + 1).padStart(2, '0')}</b> / ${NS}`;
  // S1 coverflow scrolls back in time, then memories blur away
  { const sc = 4 - 3 * sm(0.3, 3.2, t), lose = sm(3.95, 4.5, t);
    SN.forEach((_, i) => { const o = i - sc, e = $('#sn' + i), ao = Math.abs(o), k = sm(0.05 + i * .08, .5 + i * .08, t);
      e.style.left = (350 + o * 330) + 'px'; e.style.zIndex = 10 - Math.round(ao);
      e.style.transform = `translateZ(${-ao * 260 + (1 - k) * -900}px) rotateY(${Math.max(-50, Math.min(50, -o * 42))}deg) scale(${1 - lose * .1})`;
      e.style.opacity = k * (ao > 2.3 ? Math.max(0, 1 - (ao - 2.3) * 2) : 1) * (1 - lose * .75); e.style.filter = lose > .01 ? `blur(${lose * 10}px)` : 'none'; });
    $('#sq').textContent = typeAt(t, 2.6, 1.0, 'that page from monday…'); }
  // S2 demo plays on the laptop, shutter fires, snapshots drop into memory
  { const src = `media/seq/d${pad3(frameAt(t))}.jpg`; const im = $('#limg'); if (!im.src.endsWith(src)) im.src = src;
    let fl = 0, cls = 0; SNAPT.forEach(st => { fl = Math.max(fl, bump(t, st + .05, .18)); cls = Math.max(cls, bump(t, st, .15)); });
    $('#flash').style.opacity = fl * .85;
    for (let i = 0; i < 6; i++) $('#bl' + i).style.transform = `rotate(${i * 60 + 30 * cls}deg) translate(${-10 + 14 * (1 - cls)}px,0)`;
    $('#shut').style.opacity = sm(7.4, 7.7, t);
    SNAPT.forEach((st, k) => { const q = sm(st + .05, st + .5, t), e = $('#mt' + k); e.style.opacity = q; e.style.transform = `translateY(${(1 - q) * -500}px) translateZ(${(1 - q) * 300}px) rotateX(${(1 - q) * 60}deg) rotateZ(${(k % 2 ? 3 : -3) * q}deg)`; });
    $('#lap').style.setProperty('--x', 0); }
  // S3 question types, answer streams
  { $('#qt').textContent = typeAt(t, 11.0, 1.3, 'What was I working on yesterday?'); $('#q').style.opacity = sm(10.95, 11.05, t);
    $('#at').textContent = typeAt(t, 12.7, .75, 'You debugged FAISS + reviewed the Qdrant PR.'); $('#ans').style.opacity = sm(12.55, 12.7, t);
    $('#ans').style.transform = `translateY(${(1 - sm(12.55, 12.8, t)) * 30}px)`;
    $('#src5').style.opacity = sm(13.3, 13.5, t); }
  // S4 packets try to leave and bounce off the dome
  { for (let i = 0; i < 6; i++) { const t0 = 14.3 + i * .28, q = cl(t0, t0 + .9, t), e = $('#bn' + i);
      const up = q < .5 ? q / .5 : 1 - (q - .5) / .5; const x = 390 + (i - 2.5) * 70 + q * (i % 2 ? 40 : -40);
      e.style.left = x + 'px'; e.style.top = (1180 - up * 330) + 'px'; e.style.opacity = q > 0 && q < 1 ? 1 : 0; e.style.transform = `translateZ(60px) rotate(${q * 200}deg)`; }
    const cx = sm(15.85, 16.05, t); $('#cx').style.transform = `scale(${cx + bump(t, 16.1, .12) * .2})`; $('#cloud').style.opacity = sm(13.9, 14.2, t);
    $('#dml').textContent = typeAt(t, 15.9, .4, '0 bytes uploaded'); }
  // S5 pipeline: redact, encrypt, local AI
  { const raw = 'email: sam@mail.com\npassword: hunter2';
    const red = t >= 17.9; $('#tx1').innerHTML = red ? 'email: <span class="red">sam@mail.com</span>\npassword: <span class="red">hunter2</span>' : raw;
    $('#fst').textContent = red ? 'filtered ✓' : 'scanning…';
    const enc = sm(19.0, 19.6, t); $('#tx2').textContent = t < 18.95 ? '' : enc < 1 ? scramble(Math.round(20 * enc + 4), Math.floor(t * 20)) + '\n' + scramble(Math.round(14 * enc), Math.floor(t * 20) + 7) : '9f2a c71e 04bd 5e88\nb13c 7a90 e2d4';
    $('#olla').style.transform = `scale(${sm(20.1, 20.4, t) + bump(t, 20.45, .12) * .08})`; $('#olla').style.opacity = sm(20.1, 20.3, t);
    $('#tx3').textContent = typeAt(t, 21.0, .5, 'answers never leave your machine');
    $('#cv1').style.opacity = sm(18.2, 18.4, t); $('#cv2').style.opacity = sm(19.6, 19.8, t); }
  // S6 contribution grid fills
  { CG.forEach((r, i) => { const t0 = 23.6 + (i % 26) * .05 + r * .2, q = t >= t0; const lvl = r > .75 ? '#0b0b0c' : r > .5 ? '#55575b' : r > .3 ? '#a9aaad' : '#ececea'; $('#cg' + i).style.background = q ? lvl : '#ececea'; }); }
  // S7 envelope opens, letter rises, tiles flip
  { const fo = sm(26.9, 27.3, t); $('#efl').style.transform = `rotateX(${-fo * 175}deg)`; $('#efl').style.zIndex = fo > .5 ? 1 : 4;
    const lr = sm(27.2, 27.7, t); $('#lt').style.transform = `translateY(${-lr * 270}px)`; $('#lt').style.zIndex = 2;
    'FEATURE'.split('').forEach((_, i) => { const t0 = 27.55 + i * .07, q = sm(t0, t0 + .25, t); $('#tl' + i).style.transform = `perspective(500px) rotateX(${(1 - q) * -100}deg)`; $('#tl' + i).style.opacity = q; }); }
}
window.__seek = vt => { const t = vt * SPD; tl.time(t, false); tick(t); const ims = [...document.images].map(i => i.complete ? null : i.decode().catch(() => {})).filter(Boolean); return Promise.all(ims); };
__seek(0);
if (!navigator.webdriver) { const t0 = performance.now(); const loop = () => { window.__seek(((performance.now() - t0) / 1000) % TOTAL); requestAnimationFrame(loop); }; requestAnimationFrame(loop); }
