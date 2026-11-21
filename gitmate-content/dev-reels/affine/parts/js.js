(function () {
  const SPD = 1.0;
  const S = [0, 4.45, 10.05, 15.25, 20.05, 25.95, 29.75, 32.25];
  const TOTAL = 34.95; window.__TOTAL = TOTAL / SPD;
  const LABEL = ['hook', 'meet affine', 'flip', 'blocks', 'local-first', 'get it', 'link', 'follow'];
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

  const TY = Array.from({ length: 22 }, (_, i) => 'media/ty' + String(i).padStart(3, '0') + '.jpg');
  TY.forEach(s => { const im = new Image(); im.src = s; });
  // S7 comment flow (ending shell)
  const C = 30.75;
  tl.call(() => { $('#t9').textContent = 'Add a comment…'; $('#t9').style.color = 'rgba(255,255,255,.4)'; }, null, C - .01);
  tl.call(() => { $('#t9').style.color = '#fff'; }, null, C);
  typer($('#t9'), 'GITMATE', C, .3);
  tl.fromTo('#snd9', { scale: 1 }, { scale: .8, duration: .1, yoyo: true, repeat: 1 }, C + .35);
  tl.fromTo('#pst9', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: .35 }, C + .4);
  // S8 end
  const E = 32.3;
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
    // S1 receipt prints out of the slot, line by line on the voice
    { const sk = sm(0, .5, t); $('#slot').style.opacity = sm(0, .15, t);
      $('#slot').style.transform = `perspective(1600px) translate3d(0,${(1 - sk) * 120}px,${(1 - sk) * -500}px) rotateX(${24 + (1 - sk) * 30}deg)`;
      const LT = [0.64, 1.76, 2.1, 2.64, 2.95];
      const bot = (id) => { const e = $(id); return e.offsetTop + e.offsetHeight + 40; };
      let h = 150 * sm(0, .5, t), prev = 150; LT.forEach((t0, i) => { const k = sm(t0 - .1, t0 + .2, t), b = bot('#rl' + i); h += (b - prev) * k; prev = b;
        const e = $('#rl' + i); e.style.opacity = sm(t0, t0 + .12, t); e.style.transform = `translateX(${(1 - sm(t0, t0 + .25, t)) * -30}px)`; });
      h += (bot('#stamp') + 10 - prev) * sm(2.95, 3.1, t);
      const r = $('#rcpt'); r.style.height = h + 'px';
      r.style.transform = `perspective(1800px) translateZ(40px) rotateX(${16 - 4 * sm(0, 4, t)}deg) rotateY(${-5 + 3 * Math.sin(t * .8)}deg)`;
      const st = $('#stamp'), sk2 = sm(3.0, 3.18, t); st.style.opacity = sk2; st.style.transform = `rotate(-7deg) scale(${1 + (1 - sk2) * 1.6})`; }
    // S2 sub line, slabs arrive then fuse into one
    { $('#sub2').textContent = twl(t, 6.6, 7.5, 'free · open-source · 75K★');
      const SL = [8.24, 8.84, 9.44], X = [64, 390, 716], fz = sm(9.75, 10.2, t);
      SL.forEach((t0, i) => { const e = $('#sl' + i), k = sm(t0 - .15, t0 + .35, t); e.style.opacity = sm(t0 - .15, t0, t);
        const x = X[i] + (390 - X[i]) * fz * .0 + (i - 1) * -26 * fz;
        e.style.left = x + 'px';
        e.style.transform = `perspective(1500px) translate3d(0,${(1 - k) * 220}px,${(1 - k) * -800}px) rotateX(${14 + (1 - k) * 50}deg) rotateY(${(i - 1) * -14 * (1 - fz)}deg)`;
        e.style.borderRadius = fz > 0 ? `${i === 0 ? 30 : 30 * (1 - fz)}px ${i === 2 ? 30 : 30 * (1 - fz)}px ${i === 2 ? 30 : 30 * (1 - fz)}px ${i === 0 ? 30 : 30 * (1 - fz)}px` : '30px'; });
      $('#seam').textContent = twl(t, 9.8, 10.2, 'docs + board + tasks = 1 app'); }
    // S3 typing frames, toggle, 3D flip, slow push into the board
    { const tk = sm(10.0, 10.5, t), f = $('#flip');
      $('#ty').src = TY[Math.min(21, Math.max(0, Math.floor(cl(10.4, 11.3, t) * 21.99)))];
      const fl = sm(12.3, 13.15, t);
      f.style.opacity = sm(9.95, 10.1, t);
      f.style.transform = `perspective(2200px) translate3d(0,${(1 - tk) * 160}px,${(1 - tk) * -600}px) rotateX(${8 + (1 - tk) * 40}deg) rotateY(${fl * 180 - 6 + 3 * Math.sin(t * .7)}deg) scale(${1 - bump(t, 12.72, .45) * .12})`;
      $('#wbimg').style.transform = `scale(${1 + .16 * cl(13.1, 15.4, t)})`;
      const gk = sm(10.6, 11.0, t), g = $('#tgl'); g.style.opacity = sm(10.55, 10.7, t);
      g.style.transform = `perspective(1400px) translate3d(0,${(1 - gk) * 140}px,${(1 - gk) * -500 + 80}px) rotateX(${18 + (1 - gk) * 40}deg) scale(${1 + bump(t, 12.3, .15) * .06})`;
      const kk = sm(12.05, 12.3, t); $('#kn').style.left = (10 + 240 * kk) + 'px';
      $('#o0').style.color = kk < .5 ? '#08090a' : ''; $('#o1').style.color = kk >= .5 ? '#08090a' : ''; }
    // S4 tiles drop onto a tilted tabletop, then slide together
    { const TT = [15.52, 16.56, 17.2, 18.12], j = sm(18.96, 19.4, t), b = $('#board');
      b.style.transform = `perspective(2000px) translateZ(20px) rotateX(${22 - 8 * cl(15.3, 20, t)}deg) rotateZ(${-3 + 2 * cl(15.3, 20, t)}deg)`;
      TT.forEach((t0, i) => { const e = $('#ti' + i), k = sm(t0 - .2, t0 + .3, t), cx = i % 2, cy = i >> 1, gap = 32 - 22 * j;
        e.style.opacity = sm(t0 - .2, t0 - .05, t);
        e.style.left = (cx ? 486 + (32 - gap) * -.5 + gap - 32 + 16 : 16 + (32 - gap) * .5) + 'px';
        e.style.top = (cy ? 470 + gap - 32 + (32 - gap) * -.5 + 16 : 20 + (32 - gap) * .5) + 'px';
        e.style.transform = `translate3d(0,0,${(1 - k) * 1400 + bump(t, t0 + .32, .15) * 30}px) rotateX(${(1 - k) * -30}deg) rotateZ(${(1 - k) * (i % 2 ? 12 : -12)}deg)`; });
      const fk = sm(19.0, 19.5, t); $('#frame4').style.opacity = fk; $('#frame4').style.transform = `perspective(2000px) translateZ(30px) rotateX(${22 - 8 * cl(15.3, 20, t)}deg) rotateZ(${-3 + 2 * cl(15.3, 20, t)}deg) scale(${1.06 - .06 * fk})`;
      $('#f4lbl').textContent = twl(t, 19.4, 19.9, '4 blocks · 1 workspace'); }
    // S5 cloud crossed out, doc sheet drops into the laptop, extruded star counter
    { const lk = sm(20.0, 20.5, t), l = $('#lap'); l.style.opacity = sm(19.95, 20.1, t);
      l.style.transform = `perspective(1800px) translate3d(0,${(1 - lk) * 200}px,${(1 - lk) * -700}px) rotateX(${10 + (1 - lk) * 30}deg) rotateY(${18 - 4 * cl(20, 23.6, t)}deg)`;
      const ck = sm(20.2, 20.6, t), c = $('#cloud'); c.style.opacity = ck * (1 - .55 * sm(20.9, 21.3, t));
      c.style.transform = `perspective(1400px) translateZ(${(1 - ck) * -500 + 60}px) rotateY(-18deg) translateY(${Math.sin(t * 1.4) * 8}px)`;
      $('#cstrike').setAttribute('stroke-dashoffset', 320 * (1 - sm(20.72, 21.1, t)));
      const dk = sm(21.3, 22.2, t), sh = $('#sheet'); sh.style.opacity = sm(21.2, 21.35, t) * (1 - sm(22.15, 22.3, t));
      sh.style.left = (735 + (330 - 735) * dk) + 'px'; sh.style.top = (720 + (820 - 720) * dk - Math.sin(dk * Math.PI) * 160) + 'px';
      sh.style.transform = `translateZ(160px) rotate(${(1 - dk) * 24}deg) scale(${1 - .45 * dk})`;
      $('#dev').textContent = twl(t, 22.3, 22.9, '✓ saved on this device');
      const bk = sm(23.6, 24.0, t), sb = $('#starbox'); sb.style.opacity = sm(23.55, 23.7, t);
      sb.style.transform = `perspective(1600px) translate3d(0,${(1 - bk) * 160}px,${(1 - bk) * -600}px) rotateX(${10 + (1 - bk) * 50}deg) rotateY(${-8 + 3 * Math.sin(t * .6)}deg) scale(${1 + bump(t, 25.1, .15) * .04})`;
      const n = 75.3 * Math.pow(cl(23.84, 25.0, t), .6); $('#bigst').textContent = (t >= 25.0 ? '75.3' : n.toFixed(1)) + 'K';
      $('#stl').textContent = twl(t, 24.9, 25.5, 'stars on GitHub · toeverything/AFFiNE'); }
    // S6 OS windows pop in on the voice, browser URL types
    { [27.24, 27.68, 28.08].forEach((t0, i) => { const e = $('#os' + i), k = sm(t0 - .15, t0 + .3, t);
        e.style.opacity = sm(t0 - .15, t0, t);
        e.style.transform = `perspective(1400px) translate3d(0,${(1 - k) * 180}px,${(1 - k) * -700}px) rotateX(${12 + (1 - k) * 50}deg) rotateY(${(i - 1) * -16}deg) scale(${1 + bump(t, t0 + .3, .12) * .05})`; });
      const bk = sm(28.4, 28.9, t), b = $('#brw'); b.style.opacity = sm(28.35, 28.5, t);
      b.style.transform = `perspective(1800px) translate3d(0,${(1 - bk) * 200}px,${(1 - bk) * -700}px) rotateX(${12 + (1 - bk) * 40}deg) rotateY(${6 - 2 * Math.sin(t * .7)}deg)`;
      $('#url').textContent = twl(t, 28.95, 29.45, 'app.affine.pro') + (Math.sin(t * 14) > 0 ? '|' : ' ');
      $('#nolog').textContent = twl(t, 29.2, 29.6, 'runs in the browser · no sign-up'); }
    let si = 0; for (let i = 0; i < S.length; i++) if (t >= S[i] - .3) si = i;
    tag.innerHTML = `<b>${String(si + 1).padStart(2, '0')}</b> / ${LABEL[si]}`;
    segs.forEach((b, i) => { const e = i < S.length - 1 ? S[i + 1] : TOTAL - 1.5; b.style.width = Math.min(100, Math.max(0, (t - S[i]) / (e - S[i]) * 100)) + '%'; });
  };
  window.__tl = tl;
  window.__seek = (rt) => { const t = rt * SPD; tl.time(t, false); tick(t); return Promise.all($$('img').map(im => im.decode().catch(() => null))).then(() => null); };
  window.__seek(0);
  if (!navigator.webdriver) { const t0 = performance.now(); const loop = () => { window.__seek(((performance.now() - t0) / 1000) % (TOTAL / SPD)); requestAnimationFrame(loop); }; requestAnimationFrame(loop); }
})();
