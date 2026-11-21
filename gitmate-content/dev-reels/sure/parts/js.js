(function () {
  const SPD = 1.06;
  const S = [0, 4.75, 9.95, 14.25, 17.6, 22.3, 26.6, 30.05, 32.2, 34.4];
  const TOTAL = 37.4; window.__TOTAL = TOTAL / SPD;
  const LABEL = ['hook', 'meet', 'dashboard', 'budgets', 'import + ai', 'backstory', 'setup', 'stars', 'link', 'follow'];
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const tl = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' } });
  $('#prog').innerHTML = S.map(() => '<i><b></b></i>').join('');
  const scenes = $$('.sc');
  const R = 2400, STEP = 28;
  scenes.forEach((sc, i) => { sc.style.transform = `rotateY(${i * STEP}deg) translateZ(${R}px)`; });
  const cam = { a: 0, d: 0, rx: 0, rz: 0 };
  const MOVE = { 1: 'crane', 2: 'roll', 4: 'crane', 5: 'roll', 7: 'crane', 8: 'roll', 9: 'crane' };
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
  const money = (v, dec) => '$' + v.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec });

  // S1 statement rows
  const ROWS = [['BUDGET APP · PREMIUM', '−$14.99'], ['SPENDING TRACKER · PLUS', '−$12.99'], ['NET WORTH APP · PRO', '−$9.99'], ['BILLS APP · MONTHLY', '−$14.99']];
  const RT = [2.2, 2.55, 2.9, 3.25];
  $('#srows').innerHTML = ROWS.map(([n, a], i) => `<div class="srow" id="sr${i}" style="top:${58 + i * 72}px"><span>${n}</span><span class="rc">AUTO</span><span class="am">${a}</span></div>`).join('');
  // S2 coin
  { let h = ''; for (let i = -6; i <= 6; i++) h += `<div class="ly" style="transform:translateZ(${i * 2}px)"></div>`;
    h += `<div class="face" style="transform:translateZ(13px)">${document.getElementById('LOGO').innerHTML}</div><div class="face bk" style="transform:rotateY(180deg) translateZ(13px)"><span class="zz">$0</span></div>`;
    $('#coin').innerHTML = h; }
  // S4 bars
  const BARS = [['Groceries', 62], ['Rent', 100], ['Dining', 38], ['Travel', 20]];
  const BW = 150, BD = 80, BH = 240;
  $('#bars').innerHTML = BARS.map(([n, p], i) => { const h = BH * p / 100, x = 40 + i * 230, dk = i % 2 ? '' : 'dk';
    return `<div class="bar ${dk}" id="br${i}" style="left:${x}px;width:${BW}px;height:${h}px;transform-origin:50% 100%">
      <div class="fc fr" style="width:${BW}px;height:${h}px;transform:translateZ(${BD / 2}px)"></div>
      <div class="fc sd" style="left:${(BW - BD) / 2}px;width:${BD}px;height:${h}px;transform:rotateY(90deg) translateZ(${BW / 2}px)"></div>
      <div class="fc sd" style="left:${(BW - BD) / 2}px;width:${BD}px;height:${h}px;transform:rotateY(-90deg) translateZ(${BW / 2}px)"></div>
      <div class="fc tp" style="top:${(h - BD) / 2}px;width:${BW}px;height:${BD}px;transform:rotateX(90deg) translateZ(${h / 2}px)"></div></div>
      <div class="blb" style="left:${x - 25}px">${n}</div><div class="bpc" id="bp${i}" style="left:${x - 25}px;top:${470 - h - 70}px">0%</div>`; }).join('')
    + `<svg class="inv" viewBox="0 0 952 470"><path id="invl" d="M20 150 L120 138 L200 146 L290 118 L380 124 L470 96 L560 104 L650 76 L740 82 L830 50 L930 34" fill="none" stroke="#f5f6f7" stroke-width="6" stroke-linejoin="round" stroke-linecap="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/><circle id="invd" cx="930" cy="34" r="12" fill="#f5f6f7" opacity="0"/><text id="invt" x="925" y="0" text-anchor="end" font-family="JetBrains Mono" font-weight="800" font-size="26" fill="#f5f6f7" opacity="0">↑ 9.5% this quarter</text></svg>`;
  // S5 transactions
  const TX = [['10/02', 'Grocery', '−$62.40', ''], ['10/03', 'Coffee', '−$4.50', ''], ['10/05', 'Salary', '+$3,200', 'lite'], ['10/07', 'Rent', '−$1,450', '']];
  $('#txs').innerHTML = TX.map(([d, m, a, k], i) => `<div class="c3 ${k} tx" id="tx${i}" style="top:${i * 80}px"><span class="dt">${d}</span><span>${m}</span><span class="am">${a}</span></div>`).join('');
  // S6 bolts
  $('#bolts').innerHTML = Array.from({ length: 12 }, (_, i) => { const a = i / 12 * Math.PI * 2; return `<div class="bolt" id="bo${i}" style="left:${290 + 238 * Math.cos(a) - 15}px;top:${290 + 238 * Math.sin(a) - 15}px"></div>`; }).join('');
  // S7 yaml + server cuboid
  const YML = [['services:', ''], ['  web:', ''], ['    image: ', 'ghcr.io/we-promise/sure:stable'], ['    ports: ', '["3000:3000"]'], ['  db:', ''], ['    image: ', 'postgres:16'], ['  redis:', ''], ['    image: ', 'redis:latest']];
  $('#yml').innerHTML = YML.map(([k, v], i) => `<div class="yl" id="yl${i}"><span class="n">${i + 1}</span><span class="${v ? 'k' : ''}">${k}</span>${v}</div>`).join('');
  { const w = 360, h = 200, d = 220;
    $('#srv').innerHTML = `<div class="cub" id="cub" style="left:30px;top:40px;width:${w}px;height:${h}px">
      <div class="fc fr" style="width:${w}px;height:${h}px;transform:translateZ(${d / 2}px)">${[0, 1, 2, 3].map(j => `<div class="slot7" style="top:${24 + j * 42}px"><i id="led${j}"></i><i></i><i></i></div>`).join('')}</div>
      <div class="fc sd" style="left:${(w - d) / 2}px;width:${d}px;height:${h}px;transform:rotateY(90deg) translateZ(${w / 2}px)"></div>
      <div class="fc sd" style="left:${(w - d) / 2}px;width:${d}px;height:${h}px;transform:rotateY(-90deg) translateZ(${w / 2}px)"></div>
      <div class="fc tp" style="top:${(h - d) / 2}px;width:${w}px;height:${d}px;transform:rotateX(90deg) translateZ(${h / 2}px)"></div></div>`; }

  // S9 comment flow
  tl.call(() => { $('#t9').textContent = 'Add a comment…'; $('#t9').style.color = 'rgba(255,255,255,.4)'; }, null, 32.94);
  tl.call(() => { $('#t9').style.color = '#fff'; }, null, 32.95);
  typer($('#t9'), 'GITMATE', 32.95, .3);
  tl.fromTo('#snd9', { scale: 1 }, { scale: .8, duration: .1, yoyo: true, repeat: 1 }, 33.3);
  tl.fromTo('#pst9', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: .35 }, 33.35);
  // S10 end
  const E = 34.45;
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
  const PP = [[404.6, 141.2, 329, 210, 10.3], [61.9, 141.2, 330.8, 226, 11.0], [61.9, 379.2, 330.8, 238, 11.68], [404.6, 363.3, 329, 188, 12.4]];
  const tick = (t) => {
    const a = cam.a + Math.sin(t * .5) * .35, rx = cam.rx + Math.sin(t * .37 + 1) * .7, rz = cam.rz + Math.sin(t * .29) * .25;
    scenes.forEach((sc, i) => { sc.style.display = t >= S[i] - .7 && t <= (S[i + 1] || 99) + .5 ? '' : 'none'; });
    world.style.transform = `translateZ(${-cam.d}px) rotateX(${rx}deg) rotateZ(${rz}deg) translateZ(${-R}px) rotateY(${-a}deg)`;
    // S1 tombstone rise + crack, statement rows
    { const k = sm(0.05, 0.75, t), sh = bump(t, 1.0, .12);
      $('#tomb').style.transform = `perspective(1600px) translateY(${(1 - k) * 120}px) rotateX(${(1 - k) * -85 + 6}deg) rotateY(${-8 + 4 * sm(0, 4.6, t)}deg) translateX(${Math.sin(t * 60) * sh * 6}px)`;
      $('#tomb').style.opacity = sm(0, .2, t);
      $('#crk').setAttribute('stroke-dashoffset', 1 - sm(0.85, 1.35, t));
      ROWS.forEach((_, i) => { const k2 = sm(RT[i], RT[i] + .3, t), e = $('#sr' + i); e.style.opacity = k2; e.style.transform = `translate3d(${(1 - k2) * 160}px,0,${(1 - k2) * 200}px) rotateX(${(1 - k2) * -60}deg)`; });
      const tk = sm(3.3, 3.9, t); $('#stot').innerHTML = `<small>EVERY MONTH</small>−${money(52.96 * tk, 2)}`;
      $('#stot').style.transform = `scale(${1 + bump(t, 3.95, .15) * .08})`; $('#stot').style.opacity = sm(3.2, 3.35, t); }
    // S2 coin drop + spin, price strike
    { const k = sm(4.7, 5.9, t), land = bump(t, 5.92, .12);
      $('#coin').style.transform = `translateY(${(1 - k) * -700 + land * 8}px) rotateX(${-10 + Math.sin(t * 1.4) * 4}deg) rotateY(${(1 - k) * 900 + Math.sin(t * 1.1) * 18 + (t > 8.6 ? 180 * sm(8.6, 9.2, t) : 0)}deg)`;
      $('#coin').style.opacity = sm(4.6, 4.75, t); $('#cshd').style.opacity = sm(5.4, 5.9, t); $('#cshd').style.transform = `scale(${.6 + .4 * k})`;
      const ok = sm(6.5, 6.8, t); $('#old').style.opacity = ok; $('#old').style.transform = `perspective(1200px) translateZ(${(1 - ok) * -300}px) rotateY(12deg)`;
      $('#strk').setAttribute('stroke-dashoffset', 1 - sm(7.05, 7.45, t));
      const zk = sm(7.4, 7.75, t); $('#zero').style.opacity = zk; $('#zero').style.transform = `perspective(1200px) rotateY(${-14 + (1 - zk) * -70}deg) scale(${.7 + .3 * zk + bump(t, 7.8, .12) * .06})`;
      $('#chips2').textContent = twl(t, 8.0, 8.9, 'open-source · self-hosted · AGPL-3.0'); }
    // S3 exploded dashboard
    { const k = sm(9.55, 10.35, t), sl = $('#slab');
      sl.style.opacity = sm(9.5, 9.65, t);
      sl.style.transform = `perspective(2400px) translate3d(0,${(1 - k) * 260}px,${(1 - k) * -800}px) rotateX(${14 + (1 - k) * 45}deg) rotateY(${-10 + 6 * sm(10, 14, t)}deg)`;
      $('#dim3').style.opacity = .55 * sm(10.2, 10.6, t);
      PP.forEach(([x, y, w, h, t0], i) => { const pk = sm(t0, t0 + .45, t), e = $('#pp' + i);
        e.style.left = x + 'px'; e.style.top = y + 'px'; e.style.width = w + 'px'; e.style.height = h + 'px'; e.style.opacity = sm(t0 - .05, t0 + .05, t);
        e.style.transform = `translateZ(${pk * 150 + bump(t, t0 + .48, .12) * 12}px) scale(${1 + pk * .04})`; });
      const nk = sm(10.3, 11.5, t); $('#nwn').textContent = money(855419.82 * nk, 2); $('#nwn').style.opacity = sm(10.2, 10.35, t);
      $('#nwn').style.transform = `perspective(1400px) rotateX(${(1 - sm(10.2, 10.8, t)) * 70}deg)`;
      $('#nwl').textContent = twl(t, 11.7, 12.5, 'net worth · real demo data from the repo'); }
    // S4 account cards, bars, investment line
    { [0, 1, 2].forEach(i => { const t0 = 14.45 + i * .17, k = sm(t0, t0 + .45, t), e = $('#ac' + i);
        e.style.left = (i * 331) + 'px'; e.style.opacity = sm(t0 - .02, t0 + .1, t);
        e.style.transform = `translate3d(0,${(1 - k) * -200}px,${(1 - k) * -700}px) rotateX(${14 + (1 - k) * 70}deg) rotateY(${(i - 1) * -12}deg) translateY(${bump(t, 15.1 + i * .08, .12) * -12}px)`; });
      $('#sync4').textContent = twl(t, 15.0, 15.55, '✓ 3 accounts synced');
      BARS.forEach(([n, p], i) => { const t0 = 15.75 + i * .12, k = sm(t0, t0 + .55, t);
        $('#br' + i).style.transform = `rotateX(-14deg) rotateY(-24deg) scaleY(${Math.max(.001, k)})`; $('#br' + i).style.opacity = sm(t0 - .05, t0 + .05, t);
        $('#bp' + i).textContent = Math.round(p * k) + '%'; $('#bp' + i).style.opacity = sm(t0, t0 + .2, t); });
      $('#invl').setAttribute('stroke-dashoffset', 1 - sm(16.6, 17.3, t));
      $('#invd').setAttribute('opacity', sm(17.25, 17.35, t)); $('#invt').setAttribute('opacity', sm(17.3, 17.45, t)); $('#invt').setAttribute('y', 18); }
    // S5 csv -> transactions, AI panel
    { $('#bm').setAttribute('stroke-dashoffset', 1 - sm(18.55, 18.9, t));
      TX.forEach((_, i) => { const t0 = 18.85 + i * .2, k = sm(t0, t0 + .3, t), e = $('#tx' + i); e.style.opacity = k; e.style.transform = `translate3d(${(1 - k) * -140}px,0,${(1 - k) * -200}px) rotateY(${-10 + (1 - k) * -40}deg)`; });
      const ak = sm(19.95, 20.75, t), aw = $('#aiw'); aw.style.opacity = sm(19.9, 20.05, t);
      aw.style.transform = `perspective(2200px) translate3d(0,${(1 - ak) * 300}px,${(1 - ak) * -800}px) rotateX(${10 + (1 - ak) * 55}deg) rotateY(${8 - 4 * sm(20, 22.3, t)}deg)`;
      $('#scan5').style.top = (-140 + 860 * cl(20.7, 21.9, t)) + 'px'; $('#scan5').style.opacity = sm(20.6, 20.75, t) * (1 - sm(21.8, 21.95, t)); }
    // S6 vault: counter, wheel, bolts, door
    { const v = sm(23.3, 24.6, t); $('#cnt6').textContent = v >= 1 ? '~$1,000,000' : money(Math.round(1000000 * v / 1000) * 1000, 0);
      $('#cnt6').style.transform = `scale(${1 + bump(t, 24.65, .15) * .06})`; $('#cnt6').style.opacity = sm(23.2, 23.35, t);
      $('#alm').textContent = twl(t, 24.0, 24.7, 'nearly $1M · then the startup stopped');
      const vk = sm(22.1, 22.9, t); $('#vaultw').style.opacity = sm(22.05, 22.2, t);
      $('#vaultw').style.transform = `perspective(2000px) translate3d(0,${(1 - vk) * 200}px,${(1 - vk) * -700}px) rotateX(${8 + (1 - vk) * 40}deg) rotateY(${-14}deg)`;
      $('#wheel').style.transform = `rotate(${200 * sm(24.7, 25.35, t)}deg)`;
      for (let i = 0; i < 12; i++) $('#bo' + i).style.transform = `scale(${1 - .6 * sm(25.0 + i * .02, 25.3 + i * .02, t)})`;
      document.querySelector('#vaultw .behind').style.opacity = sm(25.3, 25.4, t); $('#door').style.transform = `translateZ(30px) rotateY(${-108 * sm(25.35, 26.0, t)}deg)`;
      $('#story').textContent = twl(t, 24.9, 25.5, 'Maybe Finance → community fork: Sure'); }
    // S7 yaml lines, terminal, server + lock
    { YML.forEach((_, i) => { const t0 = 26.85 + i * .11, k = sm(t0, t0 + .2, t), e = $('#yl' + i); e.style.opacity = k; e.style.transform = `translateX(${(1 - k) * 40}px)`; });
      $('#trm7').textContent = twl(t, 28.0, 28.6, 'docker compose up -d');
      const sk = sm(28.4, 29.0, t); $('#srv').style.opacity = sm(28.35, 28.5, t);
      $('#cub').style.transform = `translate3d(0,${(1 - sk) * 200}px,${(1 - sk) * -500}px) rotateX(-22deg) rotateY(${-28 + (1 - sk) * 60 + Math.sin(t) * 3}deg)`;
      for (let j = 0; j < 4; j++) $('#led' + j).style.background = t > 28.9 && Math.sin(t * 9 + j * 2) > 0 ? '#f5f6f7' : '#55595f';
      const pk = sm(29.0, 29.35, t), lock = sm(29.4, 29.55, t); $('#pad').style.opacity = pk;
      $('#pad').style.transform = `translate3d(0,${(1 - pk) * -260}px,60px) scale(${1 + bump(t, 29.56, .1) * .1})`;
      $('#shk').setAttribute('transform', `translate(0 ${-18 * (1 - lock)})`);
      $('#lbl7').textContent = twl(t, 29.4, 29.95, 'your server · your data'); }
    // S8 github + star
    { const gk = sm(29.85, 30.6, t), g = $('#ghs'); g.style.opacity = sm(29.8, 29.95, t);
      g.style.transform = `perspective(2200px) translate3d(0,${(1 - gk) * 260}px,${(1 - gk) * -800}px) rotateX(${10 + (1 - gk) * 50}deg) rotateY(${8}deg)`;
      $('#ring8').style.opacity = sm(30.5, 30.65, t); $('#ring8').style.transform = `scale(${1 + bump(t, 30.7, .15) * .3})`;
      $('#star').setAttribute('stroke-dashoffset', 1 - sm(30.45, 31.0, t)); $('#star').setAttribute('fill-opacity', sm(30.9, 31.2, t));
      $('#star').parentNode.style.transform = `rotate(${(1 - sm(30.45, 31.1, t)) * -90}deg) scale(${1 + bump(t, 31.25, .15) * .12})`;
      const sc = sm(30.5, 31.3, t); $('#stn').textContent = sc >= 1 ? '16.3K' : (16.3 * sc).toFixed(1) + 'K';
      $('#stl').textContent = twl(t, 31.25, 31.75, '1.4K forks · 494 contributors'); }
    let si = 0; for (let i = 0; i < S.length; i++) if (t >= S[i] - .3) si = i;
    tag.innerHTML = `<b>${String(si + 1).padStart(2, '0')}</b> / ${LABEL[si]}`;
    segs.forEach((b, i) => { const e = i < S.length - 1 ? S[i + 1] : TOTAL - 1.5; b.style.width = Math.min(100, Math.max(0, (t - S[i]) / (e - S[i]) * 100)) + '%'; });
  };
  window.__tl = tl;
  window.__seek = (rt) => { const t = rt * SPD; tl.time(t, false); tick(t); return Promise.all($$('img').map(im => im.decode().catch(() => null))).then(() => null); };
  window.__seek(0);
  if (!navigator.webdriver) { const t0 = performance.now(); const loop = () => { window.__seek(((performance.now() - t0) / 1000) % (TOTAL / SPD)); requestAnimationFrame(loop); }; requestAnimationFrame(loop); }
})();
