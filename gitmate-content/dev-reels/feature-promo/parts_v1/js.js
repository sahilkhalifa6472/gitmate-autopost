(function () {
  const SPD = 1.0;
  const S = [0, 5.0, 8.2, 12.6, 17.1, 21.05, 24.35, 28.15];
  const TOTAL = 33.3; window.__TOTAL = TOTAL / SPD;
  const LABEL = ['hook', 'silence', 'true story', 'one reel', 'the truth', 'one word', 'the world', 'your turn'];
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const tl = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' } });
  $('#prog').innerHTML = S.map(() => '<i><b></b></i>').join('');
  // S5 ghost + lit copies of the repo card (before .in / .w setup)
  { const card = $('#s2 .repo').outerHTML.replace(/ in"/, '"').replace(/id="z\d"/g, '').replace(/data-\w+="[^"]*"/g, '');
    $('#gh0').innerHTML = card; $('#gh1').innerHTML = card; }
  const scenes = $$('.sc');
  const R = 2400, STEP = 30;
  scenes.forEach((sc, i) => { sc.style.transform = `rotateY(${i * STEP}deg) translateZ(${R}px)`; });
  const cam = { a: 0, d: 0, rx: 0, rz: 0 };
  const MOVE = { 2: 'crane', 3: 'roll', 5: 'crane', 6: 'roll' };
  scenes.forEach((sc, i) => {
    tl.set(sc, { visibility: 'visible' }, Math.max(0, S[i] - .62));
    if (i < scenes.length - 1) tl.set(sc, { visibility: 'hidden' }, S[i + 1] + .45);
    if (i) {
      const t0 = S[i] - .58, dir = i % 2 ? 1 : -1, mv = MOVE[i];
      const prx = mv === 'crane' ? 22 : 9 * dir, prz = mv === 'roll' ? 9 * dir : mv === 'crane' ? 0 : 3 * dir, pd = mv === 'crane' ? 1250 : 900;
      tl.to(cam, { a: i * STEP, duration: 1.0, ease: 'power3.inOut' }, t0);
      tl.to(cam, { keyframes: [{ d: pd, rx: prx, rz: prz, duration: .5, ease: 'power2.out' }, { d: 0, rx: 0, rz: 0, duration: .5, ease: 'power2.in' }] }, t0);
    }
  });
  tl.set(scenes[0], { visibility: 'visible' }, 0);
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
  const rnd = (i) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
  const fmt = (n) => Math.round(n).toLocaleString('en-US');
  const pop = (e, k, y = 40) => { e.style.opacity = k; e.style.transform = `translateY(${(1 - k) * y}px) scale(${.85 + .15 * k})`; };

  // S1 grid cells
  const COLS = 26, ROWS = 7;
  $('#grid').innerHTML = Array.from({ length: COLS * ROWS }, (_, i) => `<i id="g${i}" style="left:${Math.floor(i / ROWS) * 34}px;top:${(i % ROWS) * 34}px"></i>`).join('');
  const GC = $$('#grid i'), LV = GC.map((_, i) => { const r = rnd(i); return r < .14 ? 0 : r < .45 ? .28 : r < .75 ? .55 : 1; });
  // S7 globe points (fibonacci sphere)
  const NP = 380, GP = Array.from({ length: NP }, (_, i) => { const y = 1 - (i + .5) / NP * 2, r = Math.sqrt(1 - y * y), a = i * 2.399963; return [Math.cos(a) * r, y, Math.sin(a) * r]; });
  $('#globe').innerHTML = GP.map((_, i) => `<i id="gp${i}"></i>`).join('');
  const GE = $$('#globe i'), PING = GP.map((_, i) => (i % 27 === 5 ? Math.floor(i / 27) : -1));

  // S8 end
  const E = 28.2;
  tl.fromTo('#bigmk', { opacity: 0, scale: .2, rotation: -40 }, { opacity: 1, scale: 1, rotation: 0, duration: .9, ease: 'back.out(1.8)' }, E);
  tl.fromTo('#er1', { attr: { 'stroke-dashoffset': 1420 } }, { attr: { 'stroke-dashoffset': 0 }, duration: 1.0, ease: 'power2.inOut', immediateRender: false }, E + .15);
  tl.fromTo('#er2', { attr: { 'stroke-dashoffset': 1546 } }, { attr: { 'stroke-dashoffset': 0 }, duration: 1.2, ease: 'power2.inOut', immediateRender: false }, E + .3);
  typer($('#hnd'), '@git.mate', E + .5, .5);
  tl.fromTo('#fol', { opacity: 0, scale: .6 }, { opacity: 1, scale: 1, duration: .5, ease: 'back.out(2)' }, E + 1.9);
  tl.fromTo('#tap10', { opacity: 0, x: 160, y: 140 }, { opacity: 1, x: 0, y: 0, duration: .5, ease: 'power2.out' }, E + 2.5);
  tl.to('#tap10', { scale: .75, duration: .1, yoyo: true, repeat: 1 }, E + 3.1);
  tl.to('#fol', { scale: .93, duration: .1 }, E + 3.1);
  tl.set('#fol2', { opacity: 1 }, E + 3.2); tl.set('#fol', { opacity: 0 }, E + 3.2);
  tl.fromTo('#erip', { opacity: .8, width: 10, height: 10, margin: -5 }, { opacity: 0, width: 760, height: 760, margin: -380, duration: .8, ease: 'power2.out', immediateRender: false }, E + 3.15);
  tl.to('#tap10', { opacity: 0, duration: .3 }, E + 3.6);
  tl.to({}, { duration: .01 }, TOTAL);

  const world = $('#world'), tag = $('#tag'), segs = $$('#prog b');
  const tick = (t) => {
    const a = cam.a + Math.sin(t * .5) * .35, rx = cam.rx + Math.sin(t * .37 + 1) * .7, rz = cam.rz + Math.sin(t * .29) * .25;
    scenes.forEach((sc, i) => { sc.style.display = t >= S[i] - .7 && t <= (S[i + 1] || 99) + .5 ? '' : 'none'; });
    world.style.transform = `translateZ(${-cam.d}px) rotateX(${rx}deg) rotateZ(${rz}deg) translateZ(${-R}px) rotateY(${-a}deg)`;
    // S1 months of commits fill in, nights, weekends
    if (t < 6) { const k = sm(.25, 3.5, t), wk = sm(3.4, 3.8, t);
      GC.forEach((e, i) => { const col = Math.floor(i / ROWS), row = i % ROWS, on = cl(col / COLS, (col + 1.5) / COLS, k * 1.06);
        let lv = LV[i]; if (row >= 5) lv = Math.max(lv, .55) * (1 - wk) + wk * 1;
        e.style.background = `rgba(242,243,245,${.07 + on * lv * .93})`; e.style.transform = `scale(${1 + Math.max(0, 1 - Math.abs(on - .5) * 2) * .25 + (row >= 5 ? wk * (1 - sm(3.8, 4.3, t)) * .3 : 0)})`; });
      $('#cmt').textContent = Math.round(412 * k); $('#mon').textContent = 'month ' + Math.min(7, 1 + Math.floor(k * 6.99));
      pop($('#ch1'), sm(2.35, 2.65, t)); pop($('#ch2'), sm(3.4, 3.7, t)); pop($('#ch3'), sm(3.7, 3.95, t)); $('#push').textContent = twl(t, 3.8, 4.2, 'git push origin main'); $('#pok').style.opacity = sm(4.2, 4.35, t); }
    // S2 counters spin and land on zero, flat traffic line
    if (t > 4 && t < 9.5) { [6.95, 7.15, 7.4].forEach((t0, i) => { const e = $('#z' + i); const spin = t > 5.7 && t < t0;
        e.textContent = spin ? Math.floor(rnd(Math.floor(t * 14) + i * 7) * 10) : 0; e.style.opacity = spin ? .45 : 1;
        e.style.transform = `scale(${1 + Math.max(0, 1 - Math.abs(t - t0 - .08) / .12) * .18})`; });
      $('#flat').setAttribute('stroke-dashoffset', 880 * (1 - sm(6.9, 7.7, t)));
      $('#tv').textContent = t > 7.5 ? '1 total' : '–'; $('#tn').textContent = twl(t, 7.45, 8.0, '1 unique visitor · it was you'); }
    // S3 the DM lands
    if (t > 7.5 && t < 14) pop($('#b3'), sm(9.25, 9.55, t), 60);
    // S4 the real numbers
    if (t > 11.5 && t < 18.5) { const k = cl(14.2, 16.5, t), ek = 1 - Math.pow(1 - k, 3); $('#cnt').textContent = fmt(111733 * ek);
      [[5719, 15.0], [2204, 15.5], [1221, 16.0]].forEach(([v, t0], i) => { const q = sm(t0 - .1, t0 + .3, t), e = $('#t4' + i);
        e.style.opacity = q; e.style.transform = `perspective(1100px) rotateX(${(1 - q) * -95}deg) rotateY(-8deg) translateZ(${Math.max(0, 1 - Math.abs(t - t0 - .3) / .3) * 50}px)`;
        $('#v4' + i).textContent = fmt(v * sm(t0, t0 + .7, t)); });
      $('#src').textContent = twl(t, 16.3, 16.9, 'real Instagram insights · one reel'); }
    // S5 spotlight finds the invisible repo
    if (t > 16 && t < 22.5) { const on = sm(19.0, 19.3, t), k = sm(19.1, 20.0, t), cx = 150 + 326 * k, r = 230 + 620 * sm(19.85, 20.4, t), cy = 260;
      const m = `radial-gradient(circle ${r}px at ${cx}px ${cy}px,#000 55%,transparent 100%)`;
      const g1 = $('#gh1'); g1.style.opacity = on; g1.style.webkitMaskImage = m; g1.style.maskImage = m;
      const X = 64 + cx, w = Math.min(520, r * .9);
      $('#cone').setAttribute('points', `${X - 44},640 ${X + 44},640 ${X + w},1240 ${X - w},1240`); $('#cone').style.opacity = on * (1 - sm(20.1, 20.5, t) * .5);
      $('#lamp').style.left = X + 'px'; $('#lamp').style.opacity = sm(18.7, 19.0, t);
      $('#s5n').textContent = twl(t, 19.7, 20.2, 'it just needs a spotlight.'); }
    // S6 type FEATURE, send, send repo, reply
    if (t > 20 && t < 25.5) { const a1 = twl(t, 21.9, 22.42, 'FEATURE'), a2 = twl(t, 22.75, 23.2, 'github.com/you/your-project');
      $('#ty6').textContent = t < 22.5 ? a1 : t < 23.25 ? a2 : ''; $('#car6').style.opacity = Math.floor(t * 3) % 2 ? 1 : .15;
      $('#snd6').style.transform = `scale(${1 - Math.max(0, 1 - Math.abs(t - 22.5) / .08, 1 - Math.abs(t - 23.25) / .08) * .22})`;
      pop($('#o1'), sm(22.5, 22.72, t), 330); pop($('#o2'), sm(23.25, 23.45, t), 200); pop($('#o3'), sm(23.55, 23.8, t), 30); }
    // S7 repo becomes a reel, the reel lights up the globe
    if (t > 23.5 && t < 29.5) { $('#ar7').setAttribute('stroke-dashoffset', 200 * (1 - sm(24.95, 25.25, t)));
      const q = sm(25.1, 25.55, t), e = $('#rl7'); e.style.opacity = q; e.style.transform = `perspective(1200px) rotateY(${-14 - (1 - q) * 80}deg) rotateX(6deg) scale(${.5 + .5 * q})`;
      $('#rp7').style.width = cl(25.4, 28.6, t) * 174 + 'px';
      const ga = sm(25.7, 26.3, t), rot = t * .55, tilt = .38; $('#gring').style.opacity = ga;
      GP.forEach((p, i) => { const x = p[0] * Math.cos(rot) + p[2] * Math.sin(rot), z0 = -p[0] * Math.sin(rot) + p[2] * Math.cos(rot);
        const y = p[1] * Math.cos(tilt) - z0 * Math.sin(tilt), z = p[1] * Math.sin(tilt) + z0 * Math.cos(tilt);
        const pi = PING[i], lit = pi >= 0 ? sm(26.2 + pi * .13, 26.45 + pi * .13, t) : 0, pulse = lit ? .5 + .5 * Math.sin(t * 7 + pi) : 0;
        const s = (z > 0 ? 6 : 3.5) + lit * (12 + pulse * 6), el = GE[i];
        el.style.left = 300 + x * 286 - s / 2 + 'px'; el.style.top = 300 + y * 286 - s / 2 + 'px'; el.style.width = el.style.height = s + 'px';
        el.style.opacity = ga * (lit > .05 ? (z > 0 ? 1 : .2) : (z > 0 ? .5 + .5 * z : .16));
        el.style.boxShadow = lit && z > 0 ? `0 0 ${14 + pulse * 18}px ${2 + pulse * 5}px rgba(255,255,255,.55)` : 'none'; });
      $('#vw').textContent = twl(t, 27.1, 27.7, 'in front of developers · everywhere'); }
    let si = 0; for (let i = 0; i < S.length; i++) if (t >= S[i] - .3) si = i;
    tag.innerHTML = `<b>${String(si + 1).padStart(2, '0')}</b> / ${LABEL[si]}`;
    segs.forEach((b, i) => { const e = i < S.length - 1 ? S[i + 1] : TOTAL - 1.5; b.style.width = Math.min(100, Math.max(0, (t - S[i]) / (e - S[i]) * 100)) + '%'; });
  };
  window.__tl = tl;
  window.__seek = (rt) => { const t = rt * SPD; tl.time(t, false); tick(t); return Promise.all($$('img').map(im => im.decode().catch(() => null))).then(() => null); };
  window.__seek(0);
  if (!navigator.webdriver) { const t0 = performance.now(); const loop = () => { window.__seek(((performance.now() - t0) / 1000) % (TOTAL / SPD)); requestAnimationFrame(loop); }; requestAnimationFrame(loop); }
})();
