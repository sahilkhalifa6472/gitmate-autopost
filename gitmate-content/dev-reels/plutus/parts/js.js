const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const SPD = 1.0, RAWTOTAL = 31.75, TOTAL = RAWTOTAL / SPD; window.__TOTAL = TOTAL;
const S = [0, 5.1, 9.45, 14.45, 19.45, 23.75, 26.6, 29.0];
const NS = S.length;
const sm = (a, b, x) => { const k = Math.min(1, Math.max(0, (x - a) / (b - a))); return k * k * (3 - 2 * k); };
const cl = (a, b, x) => Math.min(1, Math.max(0, (x - a) / (b - a)));
const bump = (t, c, w) => Math.max(0, 1 - Math.abs(t - c) / w);

// S2 coin discs
{ let h=''; for (let i = 0; i < 14; i++) h += `<div class="ds" style="transform:translateZ(${-i * 2.2}px)"></div>`; h += '<div class="fc" style="transform:translateZ(2px)"><img src="media/logo.png"></div><div class="fc" style="transform:translateZ(-31px) rotateY(180deg)"><img src="media/logo.png"></div>'; $('#coin').innerHTML = h; }
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
tl.fromTo(cm, { n: 0 }, { n: 7, duration: .45, ease: 'none', immediateRender: false, onUpdate: () => $('#ctx').textContent = 'GITMATE'.slice(0, Math.round(cm.n)) }, 27.3);
// end
const E = 29.05;
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
  // S1 tiles land on each app word, sheet cells glitch, stamp
  { [[0.28, 0], [1.8, 1]].forEach(([t0, i]) => { const k = sm(t0 - .15, t0 + .4, t), e = $('#t' + i);
      e.style.opacity = sm(t0 - .15, t0, t);
      e.style.transform = `perspective(1500px) translate3d(${(1 - k) * (i ? 300 : -300)}px,0,${(1 - k) * -700 + 30}px) rotateY(${(i ? -1 : 1) * (12 + (1 - k) * 40)}deg) rotateX(8deg) rotateZ(${(i ? 2 : -2) + Math.sin(t * 1.1 + i) * .6}deg)`; });
    const k = sm(2.8, 3.3, t), sh = $('#sheet'); sh.style.opacity = sm(2.8, 2.95, t);
    sh.style.transform = `perspective(1600px) translate3d(0,${(1 - k) * 240}px,${(1 - k) * -700 + 20}px) rotateX(${12 + (1 - k) * 40}deg) rotateZ(${-1.5 + Math.sin(t * 9) * .5 * sm(3.6, 3.8, t) * (1 - sm(4.6, 4.9, t))}deg)`;
    [8, 13, 14, 18, 23].forEach((c, j) => { const e = $('#sc' + c); const on = t > 3.68 + j * .08 && Math.sin(t * 22 + j) > -.2; e.style.background = on ? '#0b0b0c' : ''; e.style.color = on ? '#fff' : ''; });
    const st = sm(4.2, 4.38, t), m = $('#messy'); m.style.opacity = st; m.style.transform = `rotate(-6deg) scale(${2 - st + bump(t, 4.4, .1) * .08})`; }
  // S2 coin built from stacked discs spins in, caption types
  { const k = sm(6.0, 6.9, t), c = $('#coin'); c.style.opacity = sm(5.95, 6.1, t);
    c.style.transform = `perspective(1400px) translate3d(0,${(1 - k) * 260}px,${(1 - k) * -600 + 60}px) rotateX(${14 + (1 - k) * 30}deg) rotateY(${(1 - k) * 540 + Math.sin(t * 1.2) * 22}deg) scale(${1 + bump(t, 9.12, .15) * .05})`;
    $('#cl2').textContent = typeAt(t, 8.28, .7, '1 tracker · for all of it'); }
  // S3 ledger rows write in, live dot pulses
  { [10.16, 10.8, 11.44, 12.04, 12.92].forEach((t0, i) => { const k = sm(t0 - .12, t0 + .3, t), e = $('#lr' + i);
      e.style.opacity = sm(t0 - .12, t0, t); e.style.transform = `translate3d(${(1 - k) * 120}px,0,${(1 - k) * 200}px) rotateX(${(1 - k) * -60}deg)`; });
    $('#lvdot').style.opacity = .35 + .65 * (Math.sin(t * 8) * .5 + .5); }
  // S4 cloud + device, packets rise, wall slams, packets bounce home
  { const ck = sm(15.0, 15.4, t), dk = sm(15.3, 15.7, t);
    $('#cloud').style.opacity = ck * (1 - .5 * sm(18.4, 18.8, t)); $('#cloud').style.transform = `translateZ(${(1 - ck) * -400 + 40}px) translateY(${Math.sin(t * 1.3) * 8}px)`;
    $('#dev').style.opacity = dk; $('#dev').style.transform = `perspective(1400px) translate3d(0,${(1 - dk) * 160}px,${(1 - dk) * -500 + 40}px) rotateX(${14 + (1 - dk) * 40}deg) rotateY(-4deg)`;
    const wk = sm(18.3, 18.45, t), w = $('#wall'); w.style.opacity = wk; w.style.transform = `translateZ(80px) translateY(${(1 - wk) * -120}px) scaleX(${1 + bump(t, 18.47, .08) * .04})`;
    [0, 1, 2].forEach(i => { const t0 = 17.7 + i * .12, up = sm(t0, t0 + .5, t), back = sm(18.45, 18.85, t), e = $('#pk' + i);
      e.style.opacity = sm(t0, t0 + .05, t) * (1 - sm(18.85, 18.95, t));
      e.style.transform = `translateZ(90px) translateY(${(-80 * up) * (1 - back) + back * 40}px)`; });
    $('#pv').textContent = typeAt(t, 18.6, .45, '✓ your data stays on this device'); }
  // S5 commit counter + grid fill, browser bar types the site
  { const k = sm(20.3, 20.7, t), c = $('#cmts'); c.style.opacity = sm(20.25, 20.4, t);
    c.style.transform = `perspective(1500px) translate3d(0,${(1 - k) * 160}px,${(1 - k) * -600 + 30}px) rotateX(${12 + (1 - k) * 40}deg) rotateY(${5 - 2 * Math.sin(t * .7)}deg)`;
    const n = Math.round(995 * Math.pow(cl(20.8, 21.9, t), .6)); $('#cn').textContent = n.toLocaleString('en-US');
    const on = Math.round(160 * n / 995); [...$('#cgrid').children].forEach((e, i) => { e.className = ((i * 37) % 160) < on ? 'on' : ''; });
    const bk = sm(22.3, 22.65, t), b = $('#brw'); b.style.opacity = sm(22.25, 22.4, t);
    b.style.transform = `perspective(1500px) translate3d(0,${(1 - bk) * 140}px,${(1 - bk) * -500 + 50}px) rotateX(${10 + (1 - bk) * 40}deg)`;
    $('#url').textContent = typeAt(t, 22.55, .45, 'plutus.inoculens.com') + (Math.sin(t * 14) > 0 && t < 23.05 ? '|' : ' ');
    $('#go').style.transform = `scale(${1 - bump(t, 23.12, .08) * .15})`; }
  // S7 type FEATURE, send, plane flies, reply
  { $('#bmt').textContent = typeAt(t, 25.85, .35, 'FEATURE'); $('#bm').style.opacity = sm(25.75, 25.85, t);
    const pk = cl(26.2, 26.65, t), pl = $('#plane'); pl.style.opacity = t > 26.2 && t < 26.7 ? 1 : 0;
    pl.style.transform = `translateZ(140px) translate(${pk * 260}px,${-pk * 480}px) rotate(-30deg) scale(${1 - pk * .5})`;
    $('#bt').style.opacity = sm(26.45, 26.6, t); $('#bt').style.transform = `translateY(${(1 - sm(26.45, 26.65, t)) * 30}px)`; }
}
window.__seek = vt => { const t = vt * SPD; tl.time(t, false); tick(t); const ims = [...document.images].map(i => i.complete ? null : i.decode().catch(() => {})).filter(Boolean); return Promise.all(ims); };
__seek(0);
if (!navigator.webdriver) { const t0 = performance.now(); const loop = () => { window.__seek(((performance.now() - t0) / 1000) % TOTAL); requestAnimationFrame(loop); }; requestAnimationFrame(loop); }
