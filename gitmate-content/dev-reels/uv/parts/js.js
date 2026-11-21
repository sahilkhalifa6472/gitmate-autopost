(function () {
  const SPD = 1.0;
  const S = [0, 5.45, 11.72, 17.4, 23.05, 25.45, 30.62, 32.9];
  const TOTAL = 35.45; window.__TOTAL = TOTAL / SPD;
  const LABEL = ['hook', 'meet uv', 'our test', 'one tool', 'builder', 'setup', 'link', 'follow'];
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

  // S4 cubes
  const cube = (id, w, d, label, fs, big) => `<div class="cb ${big ? 'big' : ''}" id="${id}" style="width:${w}px;height:${w}px">
      <div class="fc fr" style="width:${w}px;height:${w}px;font-size:${fs}px;transform:translateZ(${d / 2}px)">${label}</div>
      <div class="fc sd" style="left:${(w - d) / 2}px;width:${d}px;height:${w}px;transform:rotateY(90deg) translateZ(${w / 2}px)"></div>
      <div class="fc sd" style="left:${(w - d) / 2}px;width:${d}px;height:${w}px;transform:rotateY(-90deg) translateZ(${w / 2}px)"></div>
      <div class="fc tp" style="top:${(w - d) / 2}px;width:${w}px;height:${d}px;transform:rotateX(90deg) translateZ(${w / 2}px)"></div></div>`;
  const TOOLS = [['pip', 18.48], ['virtualenv', 19.16], ['pyenv', 19.88], ['poetry', 20.72]];
  $('#cubes').innerHTML = cube('cbU', 260, 260, 'uv', 110, true) + TOOLS.map(([n], i) => cube('cb' + i, 190, 190, n, n.length > 6 ? 30 : 44, false)).join('');
  // home positions for the four tool cubes (2x2 around the big cube)
  const HOME = [[70, 20], [820, 20], [70, 420], [820, 420]];

  const PIP = '$ pip install flask requests pandas \\\n    rich httpx fastapi numpy matplotlib\nCollecting flask\nCollecting requests\nDownloading pandas (11.4 MB)\n';
  const OUT0 = 'Collecting flask...\nDownloading pandas...\nInstalling 41 packages...';
  const OUT1 = 'Resolved 41 packages\nInstalled 41 packages\n✓ done';

  // S7 comment flow (ending shell)
  const C = 31.25;
  tl.call(() => { $('#t9').textContent = 'Add a comment…'; $('#t9').style.color = 'rgba(255,255,255,.4)'; }, null, C - .01);
  tl.call(() => { $('#t9').style.color = '#fff'; }, null, C);
  typer($('#t9'), 'GITMATE', C, .3);
  tl.fromTo('#snd9', { scale: 1 }, { scale: .8, duration: .1, yoyo: true, repeat: 1 }, C + .35);
  tl.fromTo('#pst9', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: .35 }, C + .4);
  // S8 end
  const E = 32.95;
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
  const RACE = [0.06, 0.99, 1.90, 4.63], R0 = 7.4, RS = 0.75; // race: 1 benchmark second = 0.75 s of video
  const tick = (t) => {
    const a = cam.a + Math.sin(t * .5) * .35, rx = cam.rx + Math.sin(t * .37 + 1) * .7, rz = cam.rz + Math.sin(t * .29) * .25;
    scenes.forEach((sc, i) => { sc.style.display = t >= S[i] - .7 && t <= (S[i + 1] || 99) + .5 ? '' : 'none'; });
    world.style.transform = `translateZ(${-cam.d}px) rotateX(${rx}deg) rotateZ(${rz}deg) translateZ(${-R}px) rotateY(${-a}deg)`;
    // S1 terminal: typed command, slow crawling bar, LCD timer fast-forwarding the real 48.6 s
    { const k = sm(0.0, 0.7, t), tr = $('#trm1');
      tr.style.opacity = sm(0, .15, t);
      tr.style.transform = `perspective(2000px) translate3d(0,${(1 - k) * 200}px,${(1 - k) * -600}px) rotateX(${12 + (1 - k) * 40}deg) rotateY(${-9 + 3 * sm(0, 5.4, t)}deg)`;
      const cmd = twl(t, 0.25, 1.35, PIP.split('\n').slice(0, 2).join('\n'));
      const rest = t > 1.6 ? PIP.split('\n').slice(2, 2 + Math.min(3, Math.floor((t - 1.6) / .5) + 1)).join('\n') : '';
      const pb = 3 + 22 * cl(2.4, 5.4, t) + Math.sin(t * 3) * 1.2;
      const spin = '⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏'[Math.floor(t * 12) % 10];
      $('#tb1').innerHTML = `<span class="p">${cmd}</span>\n<span class="d">${rest}</span>` + (t > 2.4 ? `\n<span class="pbar"><b style="width:${pb}%"></b></span>${spin} ${Math.round(pb)}%` : '');
      const lk = sm(1.0, 1.7, t), lw = $('#lcdw'); lw.style.opacity = sm(.95, 1.1, t);
      lw.style.transform = `perspective(1600px) translate3d(0,${(1 - lk) * 160}px,${(1 - lk) * -500}px) rotateX(${18 + (1 - lk) * 50}deg) rotateY(${10 - 6 * sm(1, 5.4, t)}deg) scale(${1 + bump(t, 4.35, .15) * .04})`;
      $('#lcdn').textContent = (48.6 * Math.pow(cl(1.2, 5.3, t), 1.6)).toFixed(1);
      $('#lcdl').textContent = twl(t, 3.2, 4.0, 'real pip run · fast-forwarded'); }
    // S2 track tilt + race
    { const k = sm(6.6, 7.4, t), tk = $('#track');
      tk.style.opacity = sm(6.55, 6.7, t);
      tk.style.transform = `rotateX(${40 + (1 - k) * 30}deg) translateZ(${(1 - k) * -400}px) rotateZ(${(1 - k) * 6}deg)`;
      RACE.forEach((v, i) => { const el = t - R0, done = el >= v * RS, p = Math.min(1, Math.max(0, el / (v * RS)));
        $('#rf' + i).style.width = (p * 670) + 'px';
        $('#rt' + i).textContent = (Math.min(v, Math.max(0, el / RS))).toFixed(2) + 's';
        $('#rt' + i).style.color = done && el > 0 ? '#f5f6f7' : ''; });
      $('#src2l').textContent = twl(t, 10.9, 11.5, 'official benchmark · docs.astral.sh'); }
    // S3 twin gauges: pip 48.6 s vs uv 2.1 s (time-compressed)
    { const pk = cl(13.2, 15.9, t), uk = cl(16.05, 16.55, t);
      $('#g0').style.height = (pk * 100) + '%'; $('#tm0').textContent = (48.6 * pk).toFixed(1) + 's';
      $('#g1').style.height = (uk * 4.3) + '%'; $('#tm1').textContent = (2.1 * uk).toFixed(1) + 's';
      $('#tm1').style.transform = `scale(${1 + bump(t, 16.6, .15) * .15})`;
      $('#out0').textContent = OUT0.split('\n').slice(0, Math.floor(cl(13.2, 15.9, t) * 3.2)).join('\n');
      $('#out1').textContent = OUT1.split('\n').slice(0, Math.floor(cl(16.1, 16.7, t) * 3.2)).join('\n');
      const ck = sm(16.95, 17.25, t); $('#chip3').style.opacity = ck;
      $('#chip3').style.transform = `perspective(1200px) translateZ(${(1 - ck) * -400 + 60}px) rotateX(${(1 - ck) * 70}deg) scale(${1 + bump(t, 17.3, .12) * .06})`;
      $('#lbl3').textContent = twl(t, 13.0, 13.8, 'our test · same 41 packages · cold cache'); }
    // S4 cubes fly into the uv cube
    { const big = $('#cbU'), bk = sm(17.5, 18.2, t); let n = 0;
      TOOLS.forEach(([nm, t0], i) => { const e = $('#cb' + i), ap = sm(17.6 + i * .1, 18.1 + i * .1, t), m = sm(t0, t0 + .45, t);
        const [hx, hy] = HOME[i], cx = 445, cy = 225;
        const x = hx + (cx - hx) * m, y = hy + (cy - hy) * m, z = (1 - ap) * -900 + m * -60, s = 1 - .8 * m;
        e.style.opacity = sm(17.55 + i * .1, 17.7 + i * .1, t) * (1 - sm(t0 + .35, t0 + .45, t));
        e.style.transform = `translate3d(${x}px,${y}px,${z}px) rotateX(-18deg) rotateY(${(i % 2 ? -28 : 28) + m * 180}deg) scale(${s})`;
        if (t > t0 + .4) n++; });
      const pulse = TOOLS.reduce((s, [, t0]) => s + bump(t, t0 + .45, .12), 0);
      big.style.opacity = sm(17.45, 17.6, t);
      big.style.transform = `translate3d(410px,190px,${(1 - bk) * -900}px) rotateX(-20deg) rotateY(${-24 + Math.sin(t * .9) * 12}deg) scale(${1 + pulse * .1})`;
      $('#cnt4').textContent = t > 18.4 ? `${4 - n} tools → 1` : '';
      $('#py4').innerHTML = `<span style="color:var(--mut)">$ </span>${twl(t, 21.45, 22.1, 'uv python install 3.13')}` + (t > 22.55 ? `\n<span style="color:var(--mut)">✓ Installed Python 3.13</span>` : ''); }
    // S5 scan + maker plate
    { $('#scan5').style.top = (-140 + 760 * cl(23.6, 25.0, t)) + 'px';
      const mk = sm(24.4, 24.85, t); $('#mk5').style.opacity = mk;
      $('#mk5').style.transform = `perspective(1400px) translateZ(${60 + (1 - mk) * -500}px) rotateX(${8 + (1 - mk) * 60}deg) scale(${1 + bump(t, 24.95, .12) * .05})`; }
    // S6 command, keycaps, stars
    { const full = 'curl -LsSf https://astral.sh/uv/install.sh | sh';
      $('#cmd6').textContent = twl(t, 25.9, 26.65, full); $('#cur6').style.opacity = Math.sin(t * 14) > 0 || t < 26.7 ? 1 : 0;
      [26.88, 27.28, 27.84].forEach((t0, i) => { const e = $('#k' + i), ak = sm(25.7 + i * .1, 26.2 + i * .1, t), pr = bump(t, t0 + .06, .1);
        e.classList.toggle('on', t > t0);
        e.style.opacity = ak;
        e.style.transform = `translate3d(0,${(1 - ak) * 200 + pr * 14}px,${(1 - ak) * -500}px) rotateX(${30 - pr * 8}deg)`; });
      const sk = cl(28.75, 29.9, t); $('#stn6').textContent = sk >= 1 ? '92.3K' : (92.3 * sk).toFixed(1) + 'K';
      const bn = $('#bign'); bn.style.opacity = sm(28.6, 28.8, t); bn.style.transform = `perspective(1400px) rotateY(${-16 + (1 - sm(28.6, 29.1, t)) * -60}deg) translateZ(80px) scale(${1 + bump(t, 30.0, .15) * .06})`;
      $('#hl6').style.opacity = sm(29.0, 29.2, t);
      $('#starrow').innerHTML = [0, 1, 2, 3, 4].map(j => { const f = sm(29.2 + j * .1, 29.4 + j * .1, t);
        return `<svg viewBox="0 0 24 24" style="transform:scale(${.4 + .6 * f});opacity:${f}"><path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7L12 17.3 5.8 20.9l1.6-7L2 9.2l7.1-.6z" fill="#f5f6f7"/></svg>`; }).join(''); }
    let si = 0; for (let i = 0; i < S.length; i++) if (t >= S[i] - .3) si = i;
    tag.innerHTML = `<b>${String(si + 1).padStart(2, '0')}</b> / ${LABEL[si]}`;
    segs.forEach((b, i) => { const e = i < S.length - 1 ? S[i + 1] : TOTAL - 1.5; b.style.width = Math.min(100, Math.max(0, (t - S[i]) / (e - S[i]) * 100)) + '%'; });
  };
  window.__tl = tl;
  window.__seek = (rt) => { const t = rt * SPD; tl.time(t, false); tick(t); return Promise.all($$('img').map(im => im.decode().catch(() => null))).then(() => null); };
  window.__seek(0);
  if (!navigator.webdriver) { const t0 = performance.now(); const loop = () => { window.__seek(((performance.now() - t0) / 1000) % (TOTAL / SPD)); requestAnimationFrame(loop); }; requestAnimationFrame(loop); }
})();
