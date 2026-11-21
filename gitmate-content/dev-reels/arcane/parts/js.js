
(function () {
  const SPD = 1.1;
  const S = [0, 7.2, 12.35, 17.9, 20.95, 24.2, 29.6, 33.05, 35.2];
  const TOTAL = 38.3; window.__TOTAL = TOTAL / SPD;
  const LABEL = ['hook', 'meet', 'containers', 'compose', 'scans', 'setup', 'free', 'link', 'follow'];
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const tl = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' } });
  $('#prog').innerHTML = S.map(() => '<i><b></b></i>').join('');
  const scenes = $$('.sc');
  const R = 2400, STEP = 30;
  scenes.forEach((sc, i) => { sc.style.transform = `rotateY(${i * STEP}deg) translateZ(${R}px)`; });
  const cam = { a: 0, d: 0, rx: 0, rz: 0 };
  const MOVE = { 1: 'crane', 2: 'roll', 4: 'crane', 5: 'roll', 7: 'crane' };
  scenes.forEach((sc, i) => {
    if (i < scenes.length - 1) tl.set(sc, { visibility: 'hidden' }, S[i + 1] + .45);
    if (i) {
      tl.set(sc, { visibility: 'visible' }, Math.max(0, S[i] - .62));
      const t0 = S[i] - .58, dir = i % 2 ? 1 : -1, mv = MOVE[i];
      const prx = mv === 'crane' ? 22 : 9 * dir, prz = mv === 'roll' ? 9 * dir : mv === 'crane' ? 0 : 3 * dir, pd = mv === 'crane' ? 1250 : 900;
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

  // S1 command tower: bricks stack bottom-up, each a typed docker command
  const CMDS = ['docker ps', 'docker logs -f api', 'docker restart api', 'docker ps -a', 'docker logs web', 'docker restart web', 'docker ps', 'docker stats', 'docker ps'];
  const CT = [1.25, 3.0, 4.2, 4.95, 5.25, 5.5, 5.75, 5.95, 6.15];
  const CW = [430, 560, 600, 460, 520, 600, 430, 500, 430];
  $('#tower').innerHTML = CMDS.map((c, i) => `<div class="c3 brk ${i === 8 ? 'lite' : ''}" id="bk${i}" style="top:${1430 - i * 86}px;left:${540 - CW[i] / 2 + (i % 2 ? 1 : -1) * (8 + i * 7)}px;width:${CW[i]}px"><span class="pr">$</span><span id="bt${i}"></span></div>`).join('');

  // S3 cubes
  const CUBES = [['nginx', 'running'], ['api', 'running'], ['postgres', 'running'], ['redis', 'stopped']];
  const cube = (id, name, st, sz) => { const h = sz / 2;
    return `<div class="cb" id="${id}"><div class="fc ff" style="transform:translateZ(${h}px)"><div class="led" id="${id}l"></div><span>${name}</span><span class="st" id="${id}s">${st}</span><i class="rib" style="top:22px"></i><i class="rib" style="bottom:22px"></i></div>
      <div class="fc ff" style="transform:rotateY(180deg) translateZ(${h}px)"></div>
      <div class="fc fs" style="transform:rotateY(90deg) translateZ(${h}px)"></div><div class="fc fs" style="transform:rotateY(-90deg) translateZ(${h}px)"></div>
      <div class="fc ft" style="transform:rotateX(90deg) translateZ(${h}px)"></div><div class="fc fs" style="transform:rotateX(-90deg) translateZ(${h}px)"></div></div>`; };
  $('#cubes').innerHTML = CUBES.map(([n, s], i) => cube('cu' + i, n, s, 170)).join('');
  CUBES.forEach((_, i) => { $('#cu' + i).style.left = (238 * i + 34) + 'px'; });
  const LOGS = ['GET /health 200 2ms', 'GET /api/users 200 14ms', 'POST /api/orders 201 31ms', 'GET /api/users/42 200 9ms', 'worker: job#118 done', 'GET /health 200 1ms', 'POST /api/login 200 22ms', 'GET /api/orders 200 17ms', 'cache: hit ratio 0.94', 'GET /health 200 2ms', 'PUT /api/cart 200 12ms', 'GET /api/items 200 8ms'];
  $('#lgs').innerHTML = LOGS.map(l => `<div>${l}</div>`).join('');
  const CPU = Array.from({ length: 40 }, (_, i) => 30 + 22 * Math.sin(i * .7) + 14 * Math.sin(i * 1.9 + 1) + (i > 26 ? 18 : 0));
  // S4 services
  const SV = [['web', 'nginx:1.29'], ['api', './api'], ['db', 'postgres:16']];
  $('#svcs').innerHTML = SV.map(([n, d], i) => `<div class="c3 svc ${i === 0 ? 'lite' : ''}" id="sv${i}"><div class="sn">${n} · ${d}</div><div class="ss" id="ss${i}">pulling…</div></div>`).join('');
  // S5 image rows
  const IM = [['nginx:alpine', 'update ↑', 'w'], ['postgres:16', 'clean ✓', 'o'], ['redis:7', '2 high CVEs', 'w'], ['node:20', 'update ↑', 'o']];
  $('#irows').innerHTML = IM.map(([n, b, k], i) => `<div class="irow" style="top:${40 + i * 116}px"><div class="ic"></div><div class="in2">${n}</div><div class="bdg ${k}" id="bg${i}">${b}</div></div>`).join('');
  // S6 big cube
  $('#bigc').innerHTML = cube('bc', 'arcane', 'one container', 220);

  // S8 comment flow
  tl.call(() => { $('#t9').textContent = 'Add a comment…'; $('#t9').style.color = 'rgba(255,255,255,.4)'; }, null, 33.69);
  tl.call(() => { $('#t9').style.color = '#fff'; }, null, 33.7);
  typer($('#t9'), 'GITMATE', 33.7, .3);
  tl.fromTo('#snd9', { scale: 1 }, { scale: .8, duration: .1, yoyo: true, repeat: 1 }, 34.05);
  tl.fromTo('#pst9', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: .35 }, 34.1);
  // S9 end
  const E = 35.25;
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
  const pcs = $$('#logo .pc');
  const tick = (t) => {
    const a = cam.a + Math.sin(t * .5) * .35, rx = cam.rx + Math.sin(t * .37 + 1) * .7, rz = cam.rz + Math.sin(t * .29) * .25;
    scenes.forEach((sc, i) => { sc.style.display = t >= S[i] - .7 && t <= (S[i + 1] || 99) + .5 ? '' : 'none'; });
    world.style.transform = `translateZ(${-cam.d}px) rotateX(${rx}deg) rotateZ(${rz}deg) translateZ(${-R}px) rotateY(${-a}deg)`;
    // S1 tower
    { let n = 0; CMDS.forEach((c, i) => { const t0 = CT[i], k = sm(t0, t0 + .3, t), e = $('#bk' + i), land = bump(t, t0 + .31, .1); if (t >= t0) n++;
        e.style.opacity = k; const lean = (i % 2 ? 1 : -1) * 1.5 + i * .35;
        e.style.transform = `perspective(1600px) translate3d(0,${(1 - k) * -260}px,${(1 - k) * 600}px) rotateX(${12 + (1 - k) * -40}deg) rotateZ(${lean * k}deg) scale(${1 + land * .04})`;
        $('#bt' + i).textContent = i < 3 ? twl(t, t0 + .05, t0 + .05 + c.length * .03, c) : (t >= t0 ? c : ''); });
      const ck = sm(5.55, 6.6, t); $('#cx').textContent = '×' + Math.round(50 * ck); $('#cnt').style.opacity = sm(5.4, 5.6, t);
      $('#cnt').style.transform = `perspective(1400px) rotateX(14deg) scale(${.7 + .3 * sm(5.4, 5.7, t) + bump(t, 6.65, .15) * .08})`;
      // tower wobble as it grows
      $('#tower').style.transform = `rotateZ(${Math.sin(t * 3.2) * sm(5, 6.5, t) * 1.2}deg)`; $('#tower').style.transformOrigin = '540px 1500px'; }
    // S2 logo trace + dashboard slab
    { pcs.forEach((p, i) => { const t0 = 8.05 + i * .045, k = sm(t0, t0 + .7, t); p.setAttribute('stroke-dashoffset', 1 - k); p.setAttribute('fill-opacity', sm(t0 + .5, t0 + 1.0, t)); });
      const k = sm(9.0, 9.9, t), dw = $('#dashw'); dw.style.opacity = sm(8.95, 9.1, t);
      dw.style.transform = `perspective(2200px) translate3d(0,${(1 - k) * 300}px,${(1 - k) * -900}px) rotateX(${8 + (1 - k) * 50}deg) rotateY(${-10 + 5 * sm(9, 12.5, t)}deg)`;
      $('#sheen').style.left = (-200 + 1400 * cl(10.0, 11.0, t)) + 'px';
      $('#sub2').textContent = twl(t, 11.0, 11.7, 'self-hosted · BSD-3 · open-source'); }
    // S3 cubes + buttons + logs
    { const press = [[12.95, 0, 3], [13.35, 1, 0], [14.0, 2, 1]];
      CUBES.forEach((_, i) => { const e = $('#cu' + i), k = sm(12.2 + i * .08, 12.7 + i * .08, t);
        let lift = 0, spin = 0, dim = 0; let st = CUBES[i][1];
        if (i === 3) { lift = 40 * sm(12.95, 13.2, t); if (t >= 13.05) st = 'running'; }
        if (i === 0) { dim = sm(13.35, 13.6, t); lift = -30 * dim; if (t >= 13.45) st = 'stopped'; }
        if (i === 1) { spin = 360 * sm(14.0, 14.7, t); if (t >= 14.0 && t < 14.7) st = 'restarting'; }
        e.style.transform = `translate3d(0,${(1 - k) * -300 - lift}px,${(1 - k) * -800}px) rotateX(-18deg) rotateY(${32 + spin}deg)`; e.style.opacity = k * (1 - .55 * dim);
        $('#cu' + i + 's').textContent = st; $('#cu' + i + 'l').style.background = st === 'stopped' ? '#3a3c40' : st === 'restarting' ? '#9da1a8' : '#f2f3f5';
        $('#cu' + i + 'l').style.boxShadow = st === 'running' ? '0 0 16px 4px rgba(255,255,255,.6)' : '0 0 0 2px rgba(255,255,255,.2)'; });
      press.forEach(([pt, b]) => { $('#b' + b).style.transform = `translateY(${bump(t, pt + .05, .1) * 5}px)`; $('#b' + b).style.background = t >= pt && t < pt + .5 ? 'linear-gradient(180deg,#f7f8f9,#cfd2d6)' : ''; $('#b' + b).style.color = t >= pt && t < pt + .5 ? '#08090a' : ''; });
      const tp = $('#tap3'); let tx = 0, ty = 0; const bx = [300, 540, 780];
      const pi = t < 13.2 ? 0 : t < 13.75 ? 1 : 2; const prev = Math.max(0, pi - 1); const mt = [12.6, 13.15, 13.7][pi];
      const mk = sm(mt, mt + .25, t); tx = bx[prev] + (bx[pi] - bx[prev]) * (pi ? mk : 1); ty = 1130;
      tp.style.left = (tx - 48) + 'px'; tp.style.top = ty + 'px'; tp.style.opacity = sm(12.55, 12.75, t) * (1 - sm(14.4, 14.6, t));
      tp.style.transform = `translateZ(140px) scale(${1 - .25 * (bump(t, 13.0, .1) + bump(t, 13.4, .1) + bump(t, 14.05, .1))})`;
      $('#lgs').style.transform = `translateY(${-Math.max(0, (t - 15.6)) * 70}px)`; $('#lgs').style.opacity = sm(15.6, 15.8, t);
      const n = Math.round(40 * cl(15.8, 17.3, t)); let d = ''; for (let i = 0; i < n; i++) d += (i ? 'L' : 'M') + (16 + i * 7.6) + ' ' + (200 - CPU[i] * 1.6);
      $('#spk').setAttribute('d', d || 'M0 0'); $('#cpv').textContent = (n ? Math.round(CPU[n - 1] / 1.4) : 0) + '%'; }
    // S4 compose edit + deploy
    { const ed = sm(18.75, 18.95, t) * (1 - sm(19.9, 20.1, t)); $('#ed4').style.opacity = ed;
      const nv = 'nginx:1.29'; $('#img4').textContent = t < 18.95 ? 'nginx:1.27' : t < 19.15 ? 'nginx:1.' : twl(t, 19.15, 19.45, nv).length > 8 ? twl(t, 19.15, 19.45, nv) : 'nginx:1.';
      const pr = bump(t, 19.95, .1); $('#dep').style.transform = `translateY(${pr * 5}px) scale(${1 - pr * .05})`; $('#dept').textContent = t >= 20.6 ? 'Live ✓' : t >= 19.95 ? 'Deploying' : 'Deploy';
      $('#dpb').style.width = (100 * sm(19.95, 20.6, t)) + '%';
      SV.forEach((_, i) => { const t0 = 20.0 + i * .14, k = sm(t0, t0 + .35, t), e = $('#sv' + i);
        e.style.opacity = k; e.style.transform = `rotateX(${(1 - k) * -80 + 10}deg) translateZ(${(1 - k) * -300}px)`; $('#ss' + i).textContent = t >= t0 + .45 ? 'running ✓' : 'pulling…'; }); }
    // S5 laser scan + badges + risk card
    { const lk = cl(21.3, 22.5, t), ly = 20 + 470 * lk; $('#laser').style.top = ly + 'px'; $('#lglow').style.top = (ly - 120) + 'px';
      const lo = sm(21.2, 21.35, t) * (1 - sm(22.5, 22.7, t)); $('#laser').style.opacity = lo; $('#lglow').style.opacity = lo;
      IM.forEach((_, i) => { const bt = 21.3 + (1.2 * (40 + i * 116 + 50) / 490), k = sm(bt, bt + .2, t), e = $('#bg' + i);
        e.style.opacity = k; e.style.transform = `translateZ(40px) scale(${.6 + .4 * k + bump(t, bt + .22, .1) * .1})`; });
      const rk = sm(22.9, 23.6, t), rw = $('#riskw'); rw.style.opacity = sm(22.85, 23.0, t);
      rw.style.transform = `perspective(2000px) translate3d(0,${(1 - rk) * 200}px,${(1 - rk) * -700}px) rotateX(${10 + (1 - rk) * 60}deg) rotateY(${6}deg)`; }
    // S6 cube drop, terminal, url, mini dash unfold
    { const k = sm(24.9, 25.45, t), land = bump(t, 25.47, .12);
      $('#bc').style.transform = `translate3d(0,${(1 - k) * -700 + land * 10}px,0) rotateX(-18deg) rotateY(${32 + (1 - k) * 160 + t * 6}deg) scale(${1 - land * .04},${1 + land * -.06})`; $('#bc').style.opacity = sm(24.85, 24.95, t);
      $('#plate').style.opacity = .5 + .5 * bump(t, 25.5, .3); $('#plate').style.transform = `scale(${1 + bump(t, 25.5, .3) * .2})`;
      $('#trm').textContent = twl(t, 26.25, 27.0, 'docker compose up -d');
      $('#urt').textContent = twl(t, 27.45, 28.0, 'localhost:3552');
      const mk = sm(28.1, 28.8, t); $('#mini').style.opacity = sm(28.05, 28.15, t); $('#mini').style.transform = `perspective(1800px) rotateX(${(1 - mk) * -95}deg)`;
      $('#okp').textContent = twl(t, 29.15, 29.5, 'done ✓ · running on :3552'); }
    // S7 receipt prints + star count
    { const pk = sm(30.0, 31.1, t); $('#rcp').style.transform = `translateY(${(pk - 1) * 420}px)`;
      const sc = sm(30.7, 31.8, t); $('#stc').textContent = sc >= 1 ? '8.9K' : (8.9 * sc).toFixed(1) + 'K'; }
    let si = 0; for (let i = 0; i < S.length; i++) if (t >= S[i] - .3) si = i;
    tag.innerHTML = `<b>${String(si + 1).padStart(2, '0')}</b> / ${LABEL[si]}`;
    segs.forEach((b, i) => { const e = i < S.length - 1 ? S[i + 1] : TOTAL - 1.5; b.style.width = Math.min(100, Math.max(0, (t - S[i]) / (e - S[i]) * 100)) + '%'; });
  };
  window.__tl = tl;
  window.__seek = (rt) => { const t = rt * SPD; tl.time(t, false); tick(t); return Promise.all($$('img').map(im => im.decode().catch(() => null))).then(() => null); };
  window.__seek(0);
  if (!navigator.webdriver) { const t0 = performance.now(); const loop = () => { window.__seek(((performance.now() - t0) / 1000) % (TOTAL / SPD)); requestAnimationFrame(loop); }; requestAnimationFrame(loop); }
})();
