const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const SPD = 1.08, RAWTOTAL = 38.0, TOTAL = RAWTOTAL / SPD; window.__TOTAL = TOTAL;
const S = [0, 5.75, 11.85, 16.2, 21.85, 26.25, 30.55, 33.25, 35.1];
const NS = S.length;
const sm = (a, b, x) => { const k = Math.min(1, Math.max(0, (x - a) / (b - a))); return k * k * (3 - 2 * k); };
const cl = (a, b, x) => Math.min(1, Math.max(0, (x - a) / (b - a)));
const bump = (t, c, w) => Math.max(0, 1 - Math.abs(t - c) / w);

// S1 file tiles
const FL = ['track_01.mp3', 'demo_v2.flac', 'mixtape.m4a', 'live_set.opus'];
$('#files1').innerHTML = FL.map((f, i) => `<div class="ftile" id="ft${i}" style="top:${660 + i * 190}px"><div class="nt">♪</div>${f}</div>`).join('');
// S3 cover-flow panels
const CF = [['Library.png', 'songs'], ['Albums.png', 'albums'], ['Artists.png', 'artists'], ['Lyric_sync.png', 'synced lyrics']];
$('#cfw').innerHTML = CF.map(([f], i) => `<div class="cf" id="cf${i}"><img src="media/${f}"></div>`).join('');
const CFT = [11.9, 12.48, 13.28, 13.8];
// S3 spectrum city: 10 bands x 9 segments
const BANDS = ['32', '64', '125', '250', '500', '1k', '2k', '4k', '8k', '16k'];
$('#eqp').innerHTML = BANDS.map((b, i) => `<div class="eqc" style="left:${46 + i * 82}px">${Array.from({ length: 9 }, (_, j) => `<i id="e${i}_${j}" style="bottom:${j * 32}px"></i>`).join('')}<b>${b}</b></div>`).join('');
const BOOST = [8, 7, 6, 4, 3, 3, 4, 5, 6, 7];
// S4 fingerprint
$('#fp').innerHTML = Array.from({ length: 72 }, (_, i) => { const h = 20 + 100 * Math.abs(Math.sin(i * 1.7) * Math.cos(i * .37)); return `<i style="left:${30 + i * 11.8}px;height:${h}px" id="fu${i}"></i><i class="lo" style="left:${30 + i * 11.8}px;height:${h * .7}px" id="fd${i}"></i>`; }).join('') + '<div class="ph" id="ph"></div>';
// S7 letter tiles
const LET = 'FEATURE', PTS = [4, 1, 1, 1, 1, 1, 1];
$('#tiles').innerHTML = [...LET].map((c, i) => `<div class="lt" id="lt${i}" style="left:${70 + i * 138}px">${c}<small>${PTS[i]}</small></div>`).join('');

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
tl.fromTo(cm, { n: 0 }, { n: 7, duration: .45, ease: 'none', immediateRender: false, onUpdate: () => $('#ctx').textContent = 'GITMATE'.slice(0, Math.round(cm.n)) }, 33.75);
// end
const E = 35.2;
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
  // S1 files float in, push at the wall, bounce; lock clicks shut; stamp
  { FL.forEach((_, i) => { const t0 = .5 + i * .25, k = sm(t0, t0 + .6, t), push = sm(3.3 + i * .08, 3.7 + i * .08, t) - sm(3.75 + i * .08, 4.2 + i * .08, t), e = $('#ft' + i);
      e.style.opacity = sm(t0 - .05, t0 + .1, t);
      e.style.transform = `perspective(1400px) translate3d(${(1 - k) * -260 + push * 40}px,${Math.sin(t * 1.4 + i) * 6}px,${(1 - k) * -400 + 40}px) rotateY(${18 - push * 14}deg) rotateZ(${push * (i % 2 ? 3 : -3)}deg)`; });
    $('#shk').setAttribute('transform', `translate(0 ${-22 * (1 - sm(3.5, 3.75, t))})`);
    const st = sm(4.0, 4.2, t); $('#stamp1').style.opacity = st; $('#stamp1').style.transform = `rotate(-7deg) scale(${2 - st + bump(t, 4.22, .1) * .08})`; }
  // S2 vinyl slides out spinning, list types
  { const k = sm(9.0, 9.9, t), v = $('#vin'); v.style.opacity = sm(8.95, 9.1, t);
    v.style.transform = `perspective(1400px) translate3d(${(1 - k) * 520}px,0,${(1 - k) * -300}px) rotateX(18deg) rotate(${t * 140}deg)`;
    $('#list2').textContent = [typeAt(t, 10.3, .35, '♪ your files'), typeAt(t, 10.75, .35, '✗ no account'), typeAt(t, 11.15, .4, '✗ no subscription')].join('\n'); }
  // S3 cover-flow
  { let f = 0; CFT.forEach((t0, i) => { f += sm(t0, t0 + .45, t) * (i ? 1 : 0); });
    const app = sm(11.75, 12.4, t);
    CF.forEach((_, i) => { const d = i - f, e = $('#cf' + i), ad = Math.min(1.6, Math.abs(d));
      e.style.opacity = app * Math.max(0, 1 - Math.max(0, ad - 1.2) * 2.5);
      e.style.transform = `translate3d(${d * 340}px,${(1 - app) * 300}px,${-ad * 300 + (1 - app) * -600}px) rotateY(${-Math.sign(d) * Math.min(1, ad) * 55}deg)`;
      e.style.zIndex = 10 - Math.round(ad * 3); });
    const ci = Math.min(3, Math.round(f)); $('#cfl').textContent = t > 12.0 ? '← ' + CF[ci][1] + ' →' : '';
    const pk = sm(14.3, 15.0, t); $('#eqp').style.opacity = sm(14.25, 14.4, t);
    $('#eqp').style.transform = `rotateX(${30 + (1 - pk) * 50}deg) rotateY(${-8 + 4 * sm(14.3, 16.2, t)}deg) translateZ(${(1 - pk) * -400}px)`;
    BANDS.forEach((_, i) => { const tgt = BOOST[i] * sm(15.0 + i * .05, 15.6 + i * .05, t) + (t > 15.7 ? Math.sin(t * 9 + i * 1.3) * 1.2 : 0);
      for (let j = 0; j < 9; j++) $(`#e${i}_${j}`).className = j < Math.round(tgt) ? '' : 'off'; }); }
  // S4 fingerprint scan + split-flap + cover drop
  { const ph = cl(17.9, 19.6, t), x = 30 + ph * 840; $('#ph').style.left = x + 'px'; $('#ph').style.opacity = sm(17.85, 17.95, t) * (1 - sm(19.6, 19.75, t));
    $('#fp').style.opacity = sm(17.3, 17.6, t); $('#fp').style.transform = `perspective(1400px) rotateX(${(1 - sm(17.3, 17.9, t)) * 60}deg)`;
    for (let i = 0; i < 72; i++) { const lx = 30 + i * 11.8, on = lx < x && t > 17.9; const c = on ? '#ffffff' : '#5b5d62'; $('#fu' + i).style.background = c; $('#fd' + i).style.background = c;
      const s = 1 + (on ? .15 * Math.sin(t * 20 + i) : 0); $('#fu' + i).style.transform = `scaleY(${s})`; }
    $('#fpl').textContent = t < 19.7 ? typeAt(t, 17.9, .8, 'listening… fingerprint → AcoustID') : 'match found ✓ · MusicBrainz';
    [[19.76, 0], [20.24, 1]].forEach(([t0, i]) => { const k = sm(t0, t0 + .35, t), fl = $('#fl' + i);
      fl.children[0].style.transform = `rotateX(${k * 180}deg)`; fl.children[1].style.transform = `rotateX(${(k - 1) * 180}deg)`; });
    const ck = sm(20.8, 21.25, t), cv = $('#cov4'); cv.style.opacity = sm(20.75, 20.85, t);
    cv.style.transform = `rotateX(${(1 - ck) * -90}deg) scale(${1 + bump(t, 21.3, .1) * .05})`; }
  // S5 cartridges eject from slot
  { [23.44, 24.2, 24.8].forEach((t0, i) => { const k = sm(t0 - .15, t0 + .35, t), e = $('#ct' + i);
      e.style.opacity = sm(t0 - .2, t0 - .05, t);
      e.style.transform = `perspective(1400px) translateY(${(1 - k) * -120}px) rotateX(${(1 - k) * -80 + 8}deg) rotateY(${(i - 1) * -10}deg) scale(${1 + bump(t, t0 + .38, .1) * .05})`; });
    $('#slot').style.transform = `scaleX(${.96 + .04 * sm(22.7, 23.1, t)})`; $('#slot').style.opacity = sm(22.6, 22.9, t); }
  // S6 installer bar
  { $('#pb6').style.width = (100 * sm(28.9, 29.9, t)) + '%'; }
  // S7 letter tiles drop in sequence
  { [...LET].forEach((_, i) => { const t0 = 30.95 + i * .08, k = sm(t0, t0 + .35, t), e = $('#lt' + i);
      e.style.opacity = sm(t0 - .02, t0 + .08, t);
      e.style.transform = `translate3d(0,${(1 - k) * -260 + bump(t, t0 + .37, .1) * 10}px,${(1 - k) * 300}px) rotateX(${(1 - k) * 70 + 14}deg) rotateZ(${(i % 2 ? 2 : -2) * (1 - k * .5)}deg)`; });
    $('#dm7l').textContent = typeAt(t, 31.9, .5, 'send it to @git.mate'); }
}
window.__seek = vt => { const t = vt * SPD; tl.time(t, false); tick(t); const ims = [...document.images].map(i => i.complete ? null : i.decode().catch(() => {})).filter(Boolean); return Promise.all(ims); };
__seek(0);
if (!navigator.webdriver) { const t0 = performance.now(); const loop = () => { window.__seek(((performance.now() - t0) / 1000) % TOTAL); requestAnimationFrame(loop); }; requestAnimationFrame(loop); }
