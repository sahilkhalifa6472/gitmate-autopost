const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const SPD = 1.06, RAWTOTAL = 35.1, TOTAL = RAWTOTAL / SPD; window.__TOTAL = TOTAL;
const S = [0, 6.95, 10.55, 15.45, 20.75, 24.85, 27.2, 30.1, 32.25];
const NS = S.length;
const sm = (a, b, x) => { const k = Math.min(1, Math.max(0, (x - a) / (b - a))); return k * k * (3 - 2 * k); };
const cl = (a, b, x) => Math.min(1, Math.max(0, (x - a) / (b - a)));
const bump = (t, c, w) => Math.max(0, 1 - Math.abs(t - c) / w);

// S6 APK box
{ const w = 300, d = 300, cube = `<div class="fc fr" style="left:30px;top:30px;width:${w}px;height:${w}px;transform:translateZ(${d / 2}px)">APK</div>
  <div class="fc sd" style="left:30px;top:30px;width:${d}px;height:${w}px;transform:rotateY(90deg) translateZ(${w / 2}px)"></div>
  <div class="fc sd" style="left:30px;top:30px;width:${d}px;height:${w}px;transform:rotateY(-90deg) translateZ(${w / 2}px)"></div>
  <div class="fc fr" style="left:30px;top:30px;width:${w}px;height:${w}px;transform:rotateY(180deg) translateZ(${d / 2}px);font-size:40px">.apk</div>
  <div class="fc tp" style="left:30px;top:30px;width:${w}px;height:${d}px;transform:rotateX(90deg) translateZ(${w / 2}px)"></div>
  <div class="fc tp" style="left:30px;top:30px;width:${w}px;height:${d}px;transform:rotateX(-90deg) translateZ(${w / 2}px)"></div>`; $('#apk').innerHTML = cube; }

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
tl.fromTo(cm, { n: 0 }, { n: 7, duration: .45, ease: 'none', immediateRender: false, onUpdate: () => $('#ctx').textContent = 'GITMATE'.slice(0, Math.round(cm.n)) }, 30.7);
// end
const E = 32.3;
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
  // S1 ad countdown, paywall slides up, lock clicks, stamp
  { const pk = sm(0, .6, t), ph = $('#ph1'); ph.style.opacity = sm(0, .12, t);
    ph.style.transform = `perspective(1600px) translate3d(0,${(1 - pk) * 200}px,${(1 - pk) * -600 + 40}px) rotateX(${6 + (1 - pk) * 30}deg) rotateY(${-14 + 5 * sm(0, 6.5, t)}deg)`;
    const n = Math.max(1, 5 - Math.floor(cl(2.16, 4.16, t) * 5)); $('#adn').textContent = n; $('#adsk').textContent = 'Skip in ' + n;
    $('#adov').style.opacity = 1 - sm(4.45, 4.7, t);
    $('#pw').style.transform = `translateY(${(1 - sm(4.55, 5.0, t)) * 110}%)`;
    $('#shk1').setAttribute('transform', `translate(0 ${-14 * (1 - sm(5.3, 5.45, t))})`);
    const st = sm(5.6, 5.78, t); $('#st1').style.opacity = st; $('#st1').style.transform = `translateZ(160px) rotate(-8deg) scale(${2 - st + bump(t, 5.8, .1) * .08})`; }
  // S2 phone spins in showing its side, credit types
  { const k = sm(6.9, 7.8, t), ph = $('#ph2'); ph.style.opacity = sm(6.85, 7.0, t);
    ph.style.transform = `perspective(1600px) translate3d(0,${(1 - k) * 160}px,${(1 - k) * -500 + 40}px) rotateY(${-70 * (1 - k) + 12 * Math.sin(t * .7)}deg) rotateX(6deg)`;
    $('#cred2').textContent = typeAt(t, 9.3, .8, 'free · open source (GPL-3.0) · by @konkomaji'); }
  // S3 leader line grows to each field as it is named
  { const FT = [11.56, 12.16, 12.72, 13.48]; let lh = 0;
    FT.forEach((t0, i) => { const k = sm(t0 - .12, t0 + .3, t), e = $('#fd' + i), d = $('#dt' + i);
      e.style.opacity = sm(t0 - .12, t0, t);
      e.style.transform = `perspective(1400px) translate3d(${(1 - k) * 160}px,0,${(1 - k) * -400 + 30}px) rotateY(${(1 - k) * -40 - 6}deg) scale(${1 + bump(t, t0 + .32, .1) * .03})`;
      d.style.transform = `translateZ(40px) scale(${sm(t0 - .05, t0 + .1, t)})`;
      lh = Math.max(lh, (96 + i * 160) * sm(t0 - .25, t0, t)); });
    $('#ld').style.height = lh + 'px'; $('#ld').style.transform = 'translateZ(30px)'; }
  // S4 phone, seal slams, hash types
  { const k = sm(15.3, 16.0, t), ph = $('#ph4'); ph.style.opacity = sm(15.25, 15.4, t);
    ph.style.transform = `perspective(1600px) translate3d(0,${(1 - k) * 200}px,${(1 - k) * -500 + 30}px) rotateY(${16 - 4 * cl(15.3, 20.3, t)}deg) rotateX(6deg)`;
    const sk = sm(16.0, 16.3, t), se = $('#seal'); se.style.opacity = sm(15.95, 16.05, t);
    se.style.transform = `perspective(1400px) translateZ(${60 + (1 - sk) * 500}px) rotateX(${(1 - sk) * 40 + 8}deg) rotateZ(${(1 - sk) * -90 + t * 4}deg) scale(${1 + bump(t, 16.32, .12) * .06})`;
    $('#hash').textContent = [typeAt(t, 16.6, .45, 'hash: image pixels'), typeAt(t, 17.1, .4, '+ GPS + time'), typeAt(t, 17.55, .5, 'key: Android Keystore')].join('\n'); }
  // S5 bars drop out, still stamping, plaques + checks
  { [0, 1, 2, 3].forEach(i => { $('#sig').children[3 - i].style.opacity = 1 - .85 * sm(21.2 + i * .12, 21.3 + i * .12, t); });
    const sg = sm(20.7, 21.2, t); $('#sig').style.opacity = sm(20.65, 20.8, t); $('#sig').style.transform = `perspective(1400px) translateZ(${(1 - sg) * -500 + 40}px) rotateX(${(1 - sg) * 50 + 10}deg)`;
    $('#sigl').textContent = typeAt(t, 21.75, .6, 'no signal · still stamping ✓');
    [[22.3, 22.56], [22.85, 23.2], [23.6, 24.08]].forEach(([t0, tc], i) => { const k = sm(t0 - .1, t0 + .35, t), e = $('#pq' + i);
      e.style.opacity = sm(t0 - .1, t0, t);
      e.style.transform = `perspective(1400px) translate3d(0,${(1 - k) * -180}px,${(1 - k) * 400 + 20}px) rotateX(${(1 - k) * 70 + 12}deg) rotateZ(${(i - 1) * 1.5}deg)`;
      $('#sk' + i).style.transform = `scale(${sm(tc, tc + .15, t) + bump(t, tc + .17, .08) * .2})`; }); }
  // S6 3D APK box tumbles in
  { const k = sm(24.8, 25.6, t), b = $('#apk'); b.style.opacity = sm(24.75, 24.9, t);
    b.style.transform = `perspective(1600px) translate3d(0,${(1 - k) * -300}px,${(1 - k) * -800}px) rotateX(${-18 - (1 - k) * 60}deg) rotateY(${-30 + (1 - k) * 200 + Math.sin(t * .8) * 12}deg)`;
    $('#fn6').textContent = typeAt(t, 25.5, .6, 'Android 8.0+ · no Google Play needed'); }
  // S7 type FEATURE, send, plane flies, reply
  { $('#bmt').textContent = typeAt(t, 28.9, .35, 'FEATURE'); $('#bm').style.opacity = sm(28.8, 28.9, t);
    const pk = cl(29.3, 29.75, t), pl = $('#plane'); pl.style.opacity = t > 29.3 && t < 29.8 ? 1 : 0;
    pl.style.transform = `translateZ(140px) translate(${pk * 260}px,${-pk * 480}px) rotate(-30deg) scale(${1 - pk * .5})`;
    $('#bt').style.opacity = sm(29.55, 29.7, t); $('#bt').style.transform = `translateY(${(1 - sm(29.55, 29.75, t)) * 30}px)`; }
}
window.__seek = vt => { const t = vt * SPD; tl.time(t, false); tick(t); const ims = [...document.images].map(i => i.complete ? null : i.decode().catch(() => {})).filter(Boolean); return Promise.all(ims); };
__seek(0);
if (!navigator.webdriver) { const t0 = performance.now(); const loop = () => { window.__seek(((performance.now() - t0) / 1000) % TOTAL); requestAnimationFrame(loop); }; requestAnimationFrame(loop); }
