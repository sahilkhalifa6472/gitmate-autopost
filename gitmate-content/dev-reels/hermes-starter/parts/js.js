<script>
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
// all times are voice seconds (SPD 1.0)
const SPD = 1.0, RAWTOTAL = 34.95, TOTAL = +(RAWTOTAL / SPD).toFixed(2); window.__TOTAL = TOTAL;
const S = [0, 5.0, 8.9, 13.45, 14.95, 19.9, 22.2, 24.55, 27.25, 30.25, 32.2];
const NS = S.length;

// S3 dominoes: the guide's 7 steps
const STEPS = [['terminal'], ['install'], ['doctor'], ['model'], ['say hi'], ['first code'], ['memory']];
STEPS.forEach(([w], k) => { const d = document.createElement('div'); d.className = 'dom'; d.id = 'dm' + k; d.style.left = (k * 134) + 'px';
  d.innerHTML = [0, 6, 12].map(z => `<div class="db" style="transform:translateZ(${z}px)"></div>`).join('') + `<div class="df"><small>STEP</small><b>${k}</b><i></i><em>${w}</em></div>`; $('#doms').appendChild(d); });

const scenes = $$('.sc');
const poses = scenes.map(s => s.dataset.pose.split(',').map(Number));
scenes.forEach((s, i) => { const [x, y, z, ry, rx, rz] = poses[i]; s.style.transform = `translate3d(${x}px,${y}px,${z}px) rotateY(${ry}deg) rotateX(${rx}deg) rotateZ(${rz}deg)`; });
const tl = gsap.timeline({ paused: true });

// shell: typing / reveals / pops / 3D cards
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

// S1 coin is minted out of the terminal and spins to face us
tl.set('#coin', { opacity: 0, y: -260, z: -300, rotationY: -540, rotationX: 10, scale: .4, transformPerspective: 1400 }, 0);
tl.to('#coin', { opacity: 1, duration: .1 }, 3.3);
tl.to('#coin', { y: 0, z: 0, scale: 1, rotationY: -20, duration: 1.1, ease: 'expo.out' }, 3.3);
tl.to('#coin', { rotationY: 14, duration: 2.2, ease: 'sine.inOut' }, 4.4);

// S2 book: cover swings open on the real repo page
tl.set('#book', { rotationX: 12, rotationY: 16, scale: .9, transformPerspective: 1800 }, 0);
tl.set('#book', { opacity: 0, y: 300, z: -600 }, 0); tl.to('#book', { opacity: 1, y: 0, z: 0, duration: .9, ease: 'expo.out' }, 5.05);
tl.to('#book', { rotationY: 4, duration: 3.6, ease: 'sine.inOut' }, 5.9);
tl.to('#cov', { rotationY: -55, x: -1000, z: 260, opacity: 0, duration: .6, ease: 'power3.in' }, 6.95);

// S3 dominoes stand up, then fall back one by one (step by step)
tl.set('#doms', { rotationX: 18, transformPerspective: 1700 }, 0);
for (let k = 0; k < 7; k++) { tl.set('#dm' + k, { opacity: 0, y: 120, rotationX: 0 }, 0);
  tl.to('#dm' + k, { opacity: 1, y: 0, duration: .45, ease: 'back.out(1.8)' }, 10.6 + k * .08);
  tl.to('#dm' + k, { rotationX: -72, duration: .32, ease: 'power2.in' }, 12.2 + k * .11);
  tl.set('#dm' + k, { attr: { class: 'dom on' } }, 12.25 + k * .11); }

// S4 enter key arrives and is pressed
tl.set('#ekey', { rotationX: 34, rotationY: -12, transformPerspective: 1500, opacity: 0, z: -400 }, 0);
tl.to('#ekey', { opacity: 1, z: 0, duration: .6, ease: 'expo.out' }, 13.4);
tl.to('#etop', { z: -28, duration: .1, ease: 'power2.in' }, 13.9); tl.to('#etop', { z: 40, duration: .25, ease: 'back.out(3)' }, 14.02);
tl.set('#etop', { z: 40 }, 0);

// S5 cartridges rise and light up on each name
tl.set('#carts', { rotationX: 12, rotationY: -10, transformPerspective: 1800 }, 0); tl.to('#carts', { rotationY: 8, duration: 4.6, ease: 'sine.inOut' }, 15.0);
[['#ct0', 15.2], ['#ct1', 15.3], ['#ct2', 15.4]].forEach(([c, t]) => { tl.set(c, { opacity: 0, y: 200, z: -300 }, 0); tl.to(c, { opacity: 1, y: 0, z: 0, duration: .7, ease: 'expo.out' }, t); });
[['#ct0', 16.5], ['#ct1', 17.3], ['#ct2', 18.7]].forEach(([c, t]) => { tl.to(c, { y: -50, z: 80, rotationX: -8, duration: .35, ease: 'back.out(2)' }, t); tl.set(c, { attr: { class: 'cart on' } }, t + .05); });

// S6 heartbeat line
tl.fromTo('#ecgp', { attr: { 'stroke-dashoffset': 1 } }, { attr: { 'stroke-dashoffset': 0 }, duration: .9, ease: 'power1.inOut', immediateRender: false }, 21.3);

// S7 cards drop into the memory box
tl.set('#rbox', { rotationX: 20, rotationY: -12, transformPerspective: 1800, scale: .95 }, 0); tl.to('#rbox', { rotationY: -2, duration: 2.6, ease: 'sine.inOut' }, 22.2);
tl.set(['#ic1', '#ic2'], { opacity: 0, y: -700 }, 0);
tl.to('#ic1', { opacity: 1, duration: .05 }, 22.75); tl.to('#ic1', { y: 0, duration: .5, ease: 'back.out(1.2)' }, 22.75);
tl.to('#ic2', { opacity: 1, duration: .05 }, 23.35); tl.to('#ic2', { y: 0, duration: .5, ease: 'back.out(1.2)' }, 23.35);

// S8 steps tick, arrow draws, keycap forms and gets pressed
['#tk1', '#tk2', '#tk3', '#tk4'].forEach((k, i) => tl.set(k, { textContent: '☑ ' + ['write index.html', 'menu + prices', 'WhatsApp button', 'make it mobile'][i] }, 25.0 + i * .14));
tl.fromTo('#arwp', { attr: { 'stroke-dashoffset': 1 } }, { attr: { 'stroke-dashoffset': 0 }, duration: .35, ease: 'power2.out', immediateRender: false }, 25.55);
tl.set('#kc', { opacity: 0, scale: .3, rotationX: 30, rotationY: -30, transformPerspective: 1400 }, 0);
tl.to('#kc', { opacity: 1, scale: 1, rotationX: 22, rotationY: -16, duration: .6, ease: 'back.out(1.6)' }, 25.8);
tl.set('#kct', { z: 36 }, 0);
tl.to('#kct', { z: 6, duration: .1, ease: 'power2.in' }, 26.45); tl.to('#kct', { z: 36, duration: .25, ease: 'back.out(3)' }, 26.57);

// S9 FEATURE card typed then slides into the mailbox slot
tl.set('#fcard', { opacity: 0, rotationX: 0, transformPerspective: 1400 }, 0);
tl.to('#fcard', { opacity: 1, duration: .3 }, 28.5);
tl.to('#fcard', { y: 380, rotationX: -62, scaleX: .78, duration: .45, ease: 'power3.in' }, 29.75);
tl.to('#fcard', { opacity: 0, duration: .08 }, 30.17);
tl.set('#flag', { rotation: 0 }, 0); tl.to('#flag', { rotation: -90, duration: .35, ease: 'back.out(2)' }, 30.05);

// S10 comment typing
const cm = { n: 0 };
tl.fromTo(cm, { n: 0 }, { n: 7, duration: .45, ease: 'none', immediateRender: false, onUpdate: () => $('#ctx').textContent = 'GITMATE'.slice(0, Math.round(cm.n)) }, 30.65);

// S11 end
tl.set('#bigmk', { opacity: 0, scale: .2 }, 0);
tl.to('#bigmk', { opacity: 1, scale: 1, duration: .9, ease: 'back.out(1.8)' }, 32.25);
tl.fromTo('#er1', { attr: { 'stroke-dashoffset': 1420 } }, { attr: { 'stroke-dashoffset': 0 }, duration: 1.0, ease: 'power2.inOut', immediateRender: false }, 32.4);
tl.fromTo('#er2', { attr: { 'stroke-dashoffset': 1546 } }, { attr: { 'stroke-dashoffset': 0 }, duration: 1.2, ease: 'power2.inOut', immediateRender: false }, 32.55);
tl.to('#tapd', { opacity: 1, left: 560, top: 1440, duration: .5, ease: 'power2.out' }, 33.65);
tl.to('#tapd', { scale: .7, duration: .1 }, 34.15); tl.to('#tapd', { scale: 1, duration: .15 }, 34.25);
tl.to('#fol', { scale: .93, duration: .1 }, 34.15); tl.to('#fol', { scale: 1, duration: .2 }, 34.25);
tl.set('#fol2', { opacity: 1 }, 34.25); tl.set('#fol', { opacity: 0 }, 34.25);
tl.fromTo('#rip', { opacity: .7, width: 10, height: 10, margin: -5 }, { opacity: 0, width: 640, height: 640, margin: -320, duration: .8, ease: 'power2.out', immediateRender: false }, 34.2);
tl.to('#tapd', { opacity: 0, duration: .3 }, 34.6);
tl.to({}, { duration: .01 }, RAWTOTAL);

// camera: pure function of time
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
const CMD4 = 'curl -fsSL hermes-agent.nousresearch.com/install.sh | bash';
const AI6 = "Hey! I'm Hermes. What are we building?";
function tick(t) {
  const c = camAt(t), p = camAt(Math.max(0, t - SPD / 30));
  world.style.transform = camT(c);
  const hx = Math.abs(c.x - p.x) * .9 + Math.abs(c.ry - p.ry) * 32, vy = Math.abs(c.y - p.y) * .9 + Math.abs(c.rx - p.rx) * 32, zz = Math.abs(c.z - p.z + (p.d - c.d)) * .25;
  const bx = Math.min(70, hx * .22 + zz * .05), by = Math.min(70, vy * .22 + zz * .05);
  if (bx + by > .4) { mbg.setAttribute('stdDeviation', `${bx.toFixed(1)} ${by.toFixed(1)}`); cam.style.filter = 'url(#mb)'; } else cam.style.filter = 'none';
  scenes.forEach((s, k) => { s.style.visibility = (k === c.i || (k === c.i - 1 && t < S[c.i] - TPRE + TD)) ? 'visible' : 'hidden'; });
  $('#tag').innerHTML = `<b>${String(c.i + 1).padStart(2, '0')}</b> / ${NS}`;
  // S1 terminal: blinking cursor, then "hermes" typed
  { const blink = Math.floor(t * 2.4) % 2 === 0; const cmd = typeAt(t, 2.9, .35, 'hermes');
    const out = t > 3.35 ? '\n<span class="q">→ starting your agent…</span>' : '';
    $('#ps1').innerHTML = '<span style="color:#8b8d91">PS&gt; </span>' + cmd + (t < 3.35 && blink ? '<span class="cur1"></span>' : t < 3.35 ? '<span class="cur1" style="opacity:0"></span>' : '') + out; }
  // S4 command types fast
  $('#cmd4').innerHTML = '<span class="pr">$ </span>' + typeAt(t, 13.2, .55, CMD4);
  // S5 slot status
  { const n = t < 16.5 ? 0 : t < 17.3 ? 1 : t < 18.7 ? 2 : 3; $('#led5').className = 'led' + (n ? ' on' : ''); $('#slt5').textContent = n ? ['', 'nous portal', 'openrouter', 'ollama · offline'][n] : 'hermes model'; }
  // S6 typing dots, then reply typed
  $('#ai6').innerHTML = t < 20.85 ? '<span class="dots"><i></i><i></i><i></i></span>' : typeAt(t, 20.85, .7, AI6);
  { const e = Math.max(0, Math.min(1, (t - 21.3) / .9)); const d = $('#ecgd'); d.setAttribute('opacity', e > 0 ? 1 : 0); d.setAttribute('cx', (e * 960).toFixed(1));
    const x = e * 960; let y = 90; if (x > 330 && x < 460) { const pts = [[330, 90], [350, 40], [380, 160], [410, 10], [440, 130], [460, 90]]; for (let k = 0; k < 5; k++) if (x >= pts[k][0] && x <= pts[k + 1][0]) { const u = (x - pts[k][0]) / (pts[k + 1][0] - pts[k][0]); y = pts[k][1] + (pts[k + 1][1] - pts[k][1]) * u; } } else if (x > 620 && x < 660) y = x < 640 ? 90 - (x - 620) : 70 + (x - 640); d.setAttribute('cy', y.toFixed(1)); }
  // S9 FEATURE typed
  $('#ftx').textContent = typeAt(t, 28.85, .55, 'FEATURE');
}
window.__seek = vt => { const t = vt * SPD; tl.time(t, false); tick(t); const ims = [...document.images].map(i => i.complete ? null : i.decode().catch(() => {})).filter(Boolean); return Promise.all(ims); };
__seek(0);
if (!navigator.webdriver) { const t0 = performance.now(); const loop = () => { window.__seek(((performance.now() - t0) / 1000) % TOTAL); requestAnimationFrame(loop); }; requestAnimationFrame(loop); }
</script>
</body></html>
