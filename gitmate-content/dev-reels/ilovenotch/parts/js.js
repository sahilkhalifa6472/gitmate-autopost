const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const SPD = 1.12, RAWTOTAL = 40.0, TOTAL = RAWTOTAL / SPD; window.__TOTAL = TOTAL;
const S = [0, 4.85, 11.3, 15.4, 17.25, 22.4, 26.3, 29.8, 34.55, 36.95];
const NS = S.length;
const sm = (a, b, x) => { const k = Math.min(1, Math.max(0, (x - a) / (b - a))); return k * k * (3 - 2 * k); };
const cl = (a, b, x) => Math.min(1, Math.max(0, (x - a) / (b - a)));
const bump = (t, c, w) => Math.max(0, 1 - Math.abs(t - c) / w);
const pad3 = n => String(n).padStart(3, '0');

// S3 waveform + faders
$('#wv').innerHTML = Array.from({ length: 34 }, (_, i) => `<i id="wv${i}"></i>`).join('');
const APPS = [['♫', 'Music'], ['S', 'Spotify'], ['Z', 'Zoom'], ['◎', 'Safari']];
const FV = [[.7, .85], [.6, .25], [.5, .95], [.8, 0]];
$('#fds').innerHTML = APPS.map(([g, n], i) => `<div class="fd" style="left:${45 + i * 210}px"><div class="pc" id="fp${i}">0%</div><div class="tr"></div><div class="fl" id="ff${i}"></div><div class="kn" id="fk${i}"></div><div class="ap">${g}</div></div>`).join('');
// S4 dropped files
const FILES = ['notes.pdf', 'shot.png', 'deck.key'];
$('#fdz').innerHTML = FILES.map((f, i) => `<div class="fdrop" id="fz${i}" style="left:${170 + i * 270}px;top:620px"><div class="fi"></div>${f}</div>`).join('');
// S5 prism faces
const PR = 150;
[0, 1, 2].forEach(i => { $('#pf' + i).style.transform = `rotateX(${-i * 120}deg) translateZ(${PR}px)`; });
// S6 dimm chips
$('#dimm').innerHTML = Array.from({ length: 7 }, (_, i) => `<div class="chp" id="ch${i}" style="left:${28 + i * 122}px"></div>`).join('') + '<div class="pins"></div><div class="notchk"></div>';

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
// comment typing
const cm = { n: 0 };
tl.fromTo(cm, { n: 0 }, { n: 7, duration: .45, ease: 'none', immediateRender: false, onUpdate: () => $('#ctx').textContent = 'GITMATE'.slice(0, Math.round(cm.n)) }, 35.15);
// end
const E = 37.0;
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
function tick(t) {
  const c = camAt(t), p = camAt(Math.max(0, t - SPD / 30));
  world.style.transform = camT(c);
  const hx = Math.abs(c.x - p.x) * .9 + Math.abs(c.ry - p.ry) * 32, vy = Math.abs(c.y - p.y) * .9 + Math.abs(c.rx - p.rx) * 32, zz = Math.abs(c.z - p.z + (p.d - c.d)) * .25;
  const bx = Math.min(70, hx * .22 + zz * .05), by = Math.min(70, vy * .22 + zz * .05);
  if (bx + by > .4) { mbg.setAttribute('stdDeviation', `${bx.toFixed(1)} ${by.toFixed(1)}`); cam.style.filter = 'url(#mb)'; } else cam.style.filter = 'none';
  scenes.forEach((s, k) => { s.style.visibility = (k === c.i || (k === c.i - 1 && t < S[c.i] - TPRE + TD)) ? 'visible' : 'hidden'; });
  $('#tag').innerHTML = `<b>${String(c.i + 1).padStart(2, '0')}</b> / ${NS}`;
  // S1 cursor pokes the notch, nothing happens
  { const mv = sm(1.9, 2.7, t), cu = $('#cur');
    cu.style.left = (700 - 240 * mv + Math.sin(t * 2) * 4) + 'px'; cu.style.top = (360 - 310 * mv) + 'px'; cu.style.opacity = sm(1.7, 1.9, t);
    cu.style.transform = `scale(${1 - .18 * (bump(t, 2.95, .08) + bump(t, 3.45, .08))})`;
    const r = Math.max(cl(2.95, 3.4, t) * (t < 3.45 ? 1 : 0), cl(3.45, 3.9, t)), rp = $('#crip');
    const rs = 10 + 160 * r; rp.style.width = rs + 'px'; rp.style.height = rs + 'px'; rp.style.margin = (-rs / 2) + 'px'; rp.style.opacity = r > 0 && r < 1 ? (1 - r) * .7 : 0;
    $('#n1').style.transform = `translateX(${Math.sin(t * 50) * bump(t, 3.0, .1) * 0}px)`;
    [1, 2].forEach(k => { const z = $('#zz' + k), q = cl(3.7 + k * .2, 4.8 + k * .2, t); z.style.opacity = Math.sin(q * Math.PI); z.style.transform = `translate(${q * 30}px,${-q * 40}px)`; }); }
  // S2 icon flip, notch grows into the real app
  { const fk = sm(4.9, 5.7, t); $('#tile').style.transform = `perspective(1400px) translateY(${(1 - fk) * 200}px) rotateY(${(1 - fk) * 200 - 14 + 10 * sm(6, 11, t)}deg) rotateX(10deg) scale(${1 + bump(t, 5.75, .15) * .06})`; $('#tile').style.opacity = sm(4.85, 5.0, t);
    const g = sm(8.2, 9.0, t), gw = 258 + (952 - 258) * g, gh = 62 + (551 - 62) * g, gr = $('#grow');
    gr.style.width = gw + 'px'; gr.style.height = gh + 'px'; gr.style.left = (540 - gw / 2) + 'px'; gr.style.borderRadius = `0 0 ${26 + 18 * g}px ${26 + 18 * g}px`; gr.style.opacity = sm(7.9, 8.05, t);
    gr.style.transform = `perspective(2000px) rotateX(${12 - 4 * g}deg)`;
    $('#gimg').style.opacity = sm(8.8, 9.1, t); $('#rb2').style.opacity = sm(9.1, 9.3, t);
    const fi = Math.max(0, Math.floor((t - 8.6) / .08)) % 120; const src = `media/gif/g${pad3(fi)}.jpg`; if (!$('#gimg').src.endsWith(src)) $('#gimg').src = src;
    $('#chips2').textContent = typeAt(t, 7.3, .9, 'free · open-source · MIT'); }
  // S3 now playing + mixer
  { const nk = sm(11.55, 12.15, t); $('#np').style.opacity = sm(11.5, 11.6, t); $('#np').style.transformOrigin = '50% 0'; $('#np').style.transform = `perspective(1500px) rotateX(${(1 - nk) * -80 + 6}deg) scaleY(${.3 + .7 * nk})`;
    for (let i = 0; i < 34; i++) { const h = 10 + 56 * Math.abs(Math.sin(t * 7 + i * .7) * Math.sin(t * 3.1 + i * 1.9)) * sm(12.2, 12.5, t); $('#wv' + i).style.height = h + 'px'; }
    APPS.forEach((_, i) => { const [a, b] = FV[i], t0 = 13.6 + i * .3, v = a + (b - a) * sm(t0, t0 + .5, t) + Math.sin(t * 2 + i) * .02 * sm(13, 13.5, t), y = 40 + 400 * (1 - v) - 27;
      $('#fk' + i).style.top = y + 'px'; $('#ff' + i).style.top = (y + 27) + 'px'; $('#ff' + i).style.height = (440 - y - 27) + 'px'; $('#fp' + i).textContent = Math.round(v * 100) + '%'; }); }
  // S4 files fly in from the front, drop into the shelf
  { FILES.forEach((_, i) => { const t0 = 15.75 + i * .15, k = sm(t0, t0 + .45, t), dn = sm(16.45 + i * .06, 16.8 + i * .06, t), e = $('#fz' + i);
      e.style.opacity = sm(t0 - .02, t0 + .08, t) * (1 - sm(16.7 + i * .06, 16.85 + i * .06, t));
      e.style.transform = `translate3d(0,${dn * 380}px,${(1 - k) * 900 + 60}px) rotateZ(${(i - 1) * 8 * (1 - dn)}deg) rotateX(${(1 - k) * 40}deg) scale(${1 - dn * .5})`; }); }
  // S5 prism rotates face by face
  { const step = sm(18.45, 18.95, t) + sm(20.35, 20.85, t), ik = sm(17.2, 17.9, t);
    $('#prism').style.transform = `translateZ(${-PR}px) rotateX(${step * 120 + (1 - ik) * -70}deg) rotateY(${-8 + 6 * sm(17, 22, t)}deg)`;
    $('#prism').style.opacity = sm(17.15, 17.3, t);
    const cur = t < 18.7 ? 0 : t < 20.6 ? 1 : 2; [0, 1, 2].forEach(i => { const e = $('#d5' + i); e.style.background = i === cur ? '#0b0b0c' : '#fff'; e.style.color = i === cur ? '#fff' : '#0b0b0c'; e.style.opacity = sm(17.6 + i * .1, 17.8 + i * .1, t); }); }
  // S6 77 MB counter, chip lights, flat memory line
  { const m = sm(24.4, 25.5, t); $('#memn').innerHTML = `${Math.round(77 * m)}<small>MB</small>`; $('#memn').style.opacity = sm(24.3, 24.45, t); $('#memn').style.transform = `scale(${1 + bump(t, 25.55, .15) * .06})`;
    for (let i = 0; i < 7; i++) $('#ch' + i).className = 'chp' + (i === 0 && t > 25.0 ? ' on' : '');
    $('#fline').setAttribute('stroke-dashoffset', 1 - sm(24.8, 25.7, t)); $('#flv').textContent = t > 25.6 ? '~77 MB · flat' : ''; }
  // S7 drag icon into Applications
  { const d = sm(27.75, 28.5, t), lift = Math.sin(d * Math.PI), di = $('#dicon');
    di.style.left = (110 + 460 * d) + 'px'; di.style.top = (170 - lift * 60) + 'px'; di.style.transform = `scale(${1 + lift * .08 - sm(28.45, 28.6, t) * .35})`; di.style.opacity = 1 - sm(28.5, 28.65, t) * .9;
    $('#dfold').style.transform = `scale(${1 + bump(t, 28.6, .15) * .1})`;
    $('#brew').textContent = typeAt(t, 28.3, .7, 'or: brew install --cask niyamvora/tap/ilovenotch'); }
  // S8 DM thread
  { const b1 = sm(30.5, 30.8, t); $('#bb1').style.opacity = b1; $('#bb1').style.transform = `translateY(${(1 - b1) * 30}px)`;
    const st = sm(31.1, 31.3, t); $('#stp8').style.opacity = st; $('#stp8').style.transform = `rotate(-8deg) scale(${2 - st + bump(t, 31.32, .1) * .08})`;
    const b2 = sm(32.0, 32.3, t); $('#bb2').style.opacity = b2; $('#bb2').style.transform = `translateY(${(1 - b2) * 30}px)`; }
}
window.__seek = vt => { const t = vt * SPD; tl.time(t, false); tick(t); const ims = [...document.images].map(i => i.complete ? null : i.decode().catch(() => {})).filter(Boolean); return Promise.all(ims); };
__seek(0);
if (!navigator.webdriver) { const t0 = performance.now(); const loop = () => { window.__seek(((performance.now() - t0) / 1000) % TOTAL); requestAnimationFrame(loop); }; requestAnimationFrame(loop); }
