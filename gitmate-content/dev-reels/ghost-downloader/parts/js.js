(function () {
  const SPD = 1.0;
  const S = [0, 3.25, 8.15, 12.5, 17.25, 21.6, 26.95, 29.3];
  const TOTAL = 32.05; window.__TOTAL = TOTAL / SPD;
  const LABEL = ['hook', 'meet ghost', 'clip it', 'every link', 'swap link', 'everywhere', 'link', 'follow'];
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const tl = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' } });
  $('#prog').innerHTML = S.map(() => '<i><b></b></i>').join('');
  const scenes = $$('.sc');
  const R = 2400, STEP = 28;
  scenes.forEach((sc, i) => { sc.style.transform = `rotateY(${i * STEP}deg) translateZ(${R}px)`; });
  const cam = { a: 0, d: 0, rx: 0, rz: 0 };
  const MOVE = { 1: 'crane', 2: 'roll', 3: 'crane', 4: 'roll', 5: 'crane', 6: 'roll', 7: 'crane' };
  scenes.forEach((sc, i) => {
    if (i < scenes.length - 1) tl.set(sc, { visibility: 'hidden' }, S[i + 1] + .45);
    if (i) {
      tl.set(sc, { visibility: 'visible' }, Math.max(0, S[i] - .62));
      const t0 = S[i] - .58, dir = i % 2 ? 1 : -1, mv = MOVE[i];
      const prx = mv === 'crane' ? -20 : 9 * dir, prz = mv === 'roll' ? -10 * dir : mv === 'crane' ? 0 : 3 * dir, pd = mv === 'crane' ? 1300 : 950;
      tl.to(cam, { a: i * STEP, duration: 1.0, ease: 'power3.inOut' }, t0);
      tl.to(cam, { keyframes: [{ d: pd, rx: prx, rz: prz, duration: .5, ease: 'power2.out' }, { d: 0, rx: 0, rz: 0, duration: .5, ease: 'power2.in' }] }, t0);
    }
  });
  $$('.h .w').forEach((w) => { const t = +w.dataset.t; if (!t) return;
    tl.fromTo(w, { opacity: 0, y: 70, scale: 1.12, filter: 'blur(18px)' }, { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', duration: .55, ease: 'expo.out' }, t); });
  scenes.forEach((sc, i) => { const k = $('.kick', sc); if (!k || !k.dataset.k) return; const txt = k.dataset.k, o = { n: 0 }; k.textContent = i ? '' : txt; if (!i) return;
    tl.fromTo(o, { n: 0 }, { n: txt.length, duration: Math.min(.7, txt.length * .025), ease: 'none', immediateRender: false, onUpdate: () => { k.textContent = txt.slice(0, Math.round(o.n)); } }, S[i] + .05); });
  $$('.in').forEach((c) => {
    const t = +c.dataset.t, rx = +(c.dataset.rx || 0), ry = +(c.dataset.ry || 0), z = +(c.dataset.z || 0);
    const end = { autoAlpha: 1, z, rotationX: rx, rotationY: ry, y: 0, duration: .9, ease: 'expo.out' };
    if (!t) { gsap.set(c, end); return; }
    tl.fromTo(c, { autoAlpha: 0, z: -900, rotationX: rx + 40, rotationY: ry * 2, y: 120 }, end, t);
  });
  const typer = (el, text, t, d) => { const o = { n: 0 }; tl.fromTo(o, { n: 0 }, { n: text.length, duration: d, ease: 'none', immediateRender: false, onUpdate: () => { el.textContent = text.slice(0, Math.round(o.n)); } }, t); };
  const sm = (a, b, x) => { const k = Math.min(1, Math.max(0, (x - a) / (b - a))); return k * k * (3 - 2 * k); };
  const cl = (a, b, x) => Math.min(1, Math.max(0, (x - a) / (b - a)));
  const twl = (t, a, b, s) => s.slice(0, Math.round(cl(a, b, t) * s.length));
  const bump = (t, c, w) => Math.max(0, 1 - Math.abs(t - c) / w);

  const CL = Array.from({ length: 129 }, (_, i) => 'media/clip2/c' + String(i + 1).padStart(3, '0') + '.jpg');
  const SW = Array.from({ length: 52 }, (_, i) => 'media/swap2/w' + String(i + 1).padStart(3, '0') + '.jpg');
  [...CL, ...SW].forEach(s => { const im = new Image(); im.src = s; });
  // S7 comment flow (ending shell)
  const C = 28.0;
  tl.call(() => { $('#t9').textContent = 'Add a comment…'; $('#t9').style.color = 'rgba(255,255,255,.4)'; }, null, C - .01);
  tl.call(() => { $('#t9').style.color = '#fff'; }, null, C);
  typer($('#t9'), 'GITMATE', C, .3);
  tl.fromTo('#snd9', { scale: 1 }, { scale: .8, duration: .1, yoyo: true, repeat: 1 }, C + .35);
  tl.fromTo('#pst9', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: .35 }, C + .4);
  // S8 end
  const E = 29.4;
  tl.fromTo('#bigmk', { opacity: 0, scale: .2, rotation: -40 }, { opacity: 1, scale: 1, rotation: 0, duration: .9, ease: 'back.out(1.8)' }, E);
  tl.fromTo('#er1', { attr: { 'stroke-dashoffset': 1420 } }, { attr: { 'stroke-dashoffset': 0 }, duration: 1.0, ease: 'power2.inOut', immediateRender: false }, E + .15);
  tl.fromTo('#er2', { attr: { 'stroke-dashoffset': 1546 } }, { attr: { 'stroke-dashoffset': 0 }, duration: 1.2, ease: 'power2.inOut', immediateRender: false }, E + .3);
  typer($('#hnd'), '@git.mate', E + .4, .5);
  tl.fromTo('#fol', { opacity: 0, scale: .6 }, { opacity: 1, scale: 1, duration: .5, ease: 'back.out(2)' }, E + .9);
  tl.fromTo('#tap10', { opacity: 0, x: 160, y: 140 }, { opacity: 1, x: 0, y: 0, duration: .5, ease: 'power2.out' }, E + 1.25);
  tl.to('#tap10', { scale: .75, duration: .1, yoyo: true, repeat: 1 }, E + 1.8);
  tl.to('#fol', { scale: .93, duration: .1 }, E + 1.8);
  tl.set('#fol2', { opacity: 1 }, E + 1.9); tl.set('#fol', { opacity: 0 }, E + 1.9);
  tl.fromTo('#erip', { opacity: .8, width: 10, height: 10, margin: -5 }, { opacity: 0, width: 640, height: 640, margin: -320, duration: .8, ease: 'power2.out', immediateRender: false }, E + 1.85);
  tl.to('#tap10', { opacity: 0, duration: .3 }, E + 2.3);
  tl.to({}, { duration: .01 }, TOTAL);

  const world = $('#world'), tag = $('#tag'), segs = $$('#prog b');
  const tick = (t) => {
    const a = cam.a + Math.sin(t * .5) * .35, rx = cam.rx + Math.sin(t * .37 + 1) * .7, rz = cam.rz + Math.sin(t * .29) * .25;
    scenes.forEach((sc, i) => { sc.style.display = t >= S[i] - .7 && t <= (S[i + 1] || 99) + .5 ? '' : 'none'; });
    world.style.transform = `translateZ(${-cam.d}px) rotateX(${rx}deg) rotateZ(${rz}deg) translateZ(${-R}px) rotateY(${-a}deg)`;
    // S1 five broken app rows fan in, then all fail at once
    { const RT = [0.12, 0.34, 0.56, 0.72, 0.88], gk = sm(2.0, 2.25, t);
      RT.forEach((t0, i) => { const e = $('#r' + i), k = sm(t0 - .1, t0 + .35, t), sh = gk * Math.sin(t * 60 + i * 2) * 6 * (1 - sm(2.4, 2.8, t));
        e.style.opacity = sm(t0 - .1, t0 + .05, t) * (1 - .45 * sm(2.5, 3.0, t));
        e.style.transform = `perspective(1600px) translate3d(${(1 - k) * (i % 2 ? 260 : -260) + sh}px,0,${(1 - k) * -900 + 20}px) rotateY(${(i % 2 ? -1 : 1) * (8 + (1 - k) * 40)}deg) rotateX(${6 + Math.sin(t * .9 + i) * 2}deg)`;
        const x = $('#x' + i), xk = sm(2.0 + i * .07, 2.2 + i * .07, t); x.style.opacity = xk; x.style.transform = `scale(${1 + (1 - xk) * 1.5})`; }); }
    // S2 sub line, five chips fall into one ghost
    { $('#sub2').textContent = twl(t, 5.44, 6.5, 'free · open-source · no ads');
      const ck = sm(7.2, 7.65, t), g = $('#ghost'), gk = sm(7.45, 7.85, t);
      for (let i = 0; i < 5; i++) { const e = $('#ch' + i), k = sm(5.6 + i * .12, 5.95 + i * .12, t), cx = 64 + i * 195 + 86;
        e.style.opacity = sm(5.6 + i * .12, 5.7 + i * .12, t) * (1 - sm(7.5, 7.65, t));
        e.style.transform = `perspective(1400px) translate3d(${(540 - cx) * ck}px,${ck * 150 + (1 - k) * 120}px,${(1 - k) * -600 + 40}px) rotateX(${(1 - k) * 50 + 10}deg) scale(${1 - .7 * ck})`; }
      g.style.opacity = gk; g.style.transform = `perspective(1400px) translateZ(${60 + bump(t, 7.85, .2) * 60}px) rotateY(${(1 - gk) * -180 + Math.sin(t * 1.3) * 8}deg) scale(${.4 + .6 * gk})`;
      $('#fl').textContent = twl(t, 7.62, 7.95, '5 apps  →  1'); }
    // S3 real clip footage, film strip handles follow the drag, the part lifts out
    { $('#clip').src = CL[Math.min(128, Math.max(0, Math.floor(cl(8.15, 12.45, t) * 128.99)))];
      const st = $('#strip'), k = sm(8.6, 9.1, t); st.style.opacity = sm(8.55, 8.7, t);
      st.style.transform = `perspective(1800px) translate3d(0,${(1 - k) * 160}px,${(1 - k) * -600 + 40}px) rotateX(${16 + (1 - k) * 40}deg)`;
      const W = 952, l = .296 * sm(9.5, 10.5, t), r = 1 - .59 * sm(10.4, 11.2, t), lx = 18 + l * (W - 36), rx = 18 + r * (W - 36);
      $('#hdl').style.left = (lx - 9) + 'px'; $('#hdr').style.left = (rx - 9) + 'px';
      const se = $('#sel'); se.style.left = (lx - 6) + 'px'; se.style.width = (rx - lx + 12) + 'px';
      const lf = sm(11.4, 11.85, t), li = $('#lift'); li.style.opacity = lf; li.style.left = lx + 'px'; li.style.width = (rx - lx) + 'px';
      li.style.transform = `translate3d(0,${-lf * 30}px,${lf * 140}px) rotateX(${-12 * lf}deg) scale(${1 + bump(t, 11.85, .15) * .05})`;
      $('#slbl').textContent = twl(t, 11.6, 12.0, 'no full video · no editing'); }
    // S4 keycaps drop on each protocol word, then press into one queue
    { const KT = [12.73, 13.04, 13.92, 14.3, 14.62, 15.2];
      KT.forEach((t0, i) => { const e = $('#k' + i), k = sm(t0 - .2, t0 + .25, t), p = bump(t, 16.1 + i * .1, .1);
        e.style.opacity = sm(t0 - .2, t0 - .08, t);
        e.style.transform = `perspective(1400px) translate3d(0,${(1 - k) * -200 + p * 10}px,${(1 - k) * 900 - p * 30}px) rotateX(${14 + (1 - k) * -40}deg) rotateZ(${(1 - k) * (i % 2 ? 10 : -10)}deg)`; });
      const rk = sm(16.0, 16.4, t), r = $('#rail'); r.style.opacity = rk;
      r.style.transform = `perspective(1400px) translate3d(0,${(1 - rk) * 120}px,${(1 - rk) * -500 + 30}px) rotateX(${12 + (1 - rk) * 40}deg)`;
      $('#railt').textContent = twl(t, 16.2, 16.8, 'all in one queue ✓'); }
    // S5 real edit dialog, link cartridge swaps, progress continues
    { $('#swp').src = SW[Math.min(51, Math.max(0, Math.floor(cl(18.0, 19.8, t) * 51.99)))];
      const pk = sm(17.5, 17.9, t), pb = $('#pbar'); pb.style.opacity = pk;
      pb.style.transform = `perspective(1600px) translate3d(0,${(1 - pk) * 140}px,${(1 - pk) * -600 + 30}px) rotateX(${12 + (1 - pk) * 40}deg)`;
      const fw = 50 + 50 * sm(20.5, 21.1, t), dead = sm(18.0, 18.2, t) * (1 - sm(19.5, 19.7, t));
      $('#pfill').style.width = fw + '%'; $('#pfill').style.opacity = 1 - dead * .6 * (Math.sin(t * 30) > 0 ? 1 : .3);
      $('#pc').textContent = Math.round(fw) + '%';
      const ok = sm(17.8, 18.15, t), oe = sm(19.36, 19.7, t), o = $('#lkold');
      o.style.opacity = sm(17.8, 17.9, t) * (1 - oe);
      o.style.transform = `perspective(1400px) translate3d(0,${(1 - ok) * 100 - oe * 160}px,${(1 - ok) * -500 + 40 + oe * 300}px) rotateX(${10 + (1 - ok) * 40 + oe * 70}deg) rotateZ(${oe * -12}deg)`;
      const nk = sm(19.45, 19.85, t), n = $('#lknew'); n.style.opacity = sm(19.45, 19.55, t);
      n.style.transform = `perspective(1400px) translate3d(${(1 - nk) * 500 - nk * 206}px,0,${40 + bump(t, 19.85, .15) * 40}px) rotateY(${(1 - nk) * -50}deg) rotateX(10deg)`;
      $('#kept').textContent = twl(t, 20.6, 21.1, 'progress never lost ✓'); }
    // S6 star counter downloads toward 14K
    { $('#oslbl').textContent = twl(t, 22.0, 22.8, 'x64 · arm64 · free installers');
      const sk = sm(24.3, 24.75, t), s = $('#stars'); s.style.opacity = sk;
      s.style.transform = `perspective(1800px) translate3d(0,${(1 - sk) * 160}px,${(1 - sk) * -700 + 30}px) rotateX(${10 + (1 - sk) * 45}deg) rotateY(${-5 + 2 * Math.sin(t * .7)}deg) scale(${1 + bump(t, 25.95, .15) * .04})`;
      const v = Math.round(13871 * Math.pow(cl(24.6, 25.9, t), .55)); $('#snum').textContent = v.toLocaleString('en-US');
      $('#sfill').style.width = (v / 14000 * 100) + '%'; }
    let si = 0; for (let i = 0; i < S.length; i++) if (t >= S[i] - .3) si = i;
    tag.innerHTML = `<b>${String(si + 1).padStart(2, '0')}</b> / ${LABEL[si]}`;
    segs.forEach((b, i) => { const e = i < S.length - 1 ? S[i + 1] : TOTAL - 1.5; b.style.width = Math.min(100, Math.max(0, (t - S[i]) / (e - S[i]) * 100)) + '%'; });
  };
  window.__tl = tl;
  window.__seek = (rt) => { const t = rt * SPD; tl.time(t, false); tick(t); return Promise.all($$('img').map(im => im.decode().catch(() => null))).then(() => null); };
  window.__seek(0);
  if (!navigator.webdriver) { const t0 = performance.now(); const loop = () => { window.__seek(((performance.now() - t0) / 1000) % (TOTAL / SPD)); requestAnimationFrame(loop); }; requestAnimationFrame(loop); }
})();
