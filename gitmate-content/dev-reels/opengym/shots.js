const { chromium } = require('playwright');
const V = __dirname + '/vend/';
(async () => {
  const [file, outdir, ...times] = process.argv.slice(2);
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  p.on('pageerror', e => console.log('ERR', e.message)); p.on('console', m => console.log('LOG', m.text()));
  await p.route('**/gsap.min.js', r => r.fulfill({ path: V + 'gsap.min.js', contentType: 'text/javascript' }));
  await p.route('**fonts.googleapis.com/**', r => r.fulfill({ path: V + 'fonts.css', contentType: 'text/css' }));
  await p.goto('file://' + __dirname + '/' + file);
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(600);
  for (const t of times) { await p.evaluate(t => __seek(t), +t); await p.screenshot({ path: `${outdir}/t${(+t).toFixed(2).padStart(5,'0')}.jpg`, type: 'jpeg', quality: 80 }); }
  // overlap check: in each scene at its settled time, compare .x boxes
  if (process.env.CHECK) {
    const S = [1.9, 6.2, 8.4, 11.8, 15.2, 18.8, 23.1, 25.7, 27.8, 31.7, 36];
    for (const t of S) {
      const r = await p.evaluate(t => { __seek(t);
        const out = []; const vis = [...document.querySelectorAll('.sc')].filter(s => getComputedStyle(s).visibility === 'visible').slice(0,1);
        const els = [...document.querySelectorAll('.top>.glass,.prog')]; vis.forEach(s => els.push(...s.querySelectorAll('.x')));
        const R = els.map(e => [e, e.getBoundingClientRect()]);
        for (let i = 0; i < R.length; i++) { const [e, a] = R[i];
          if (a.right > 1080 - 40 || a.left < 40) out.push('EDGE ' + (e.id || e.className) + ' ' + Math.round(a.left) + '-' + Math.round(a.right));
          e.querySelectorAll('.ln').forEach(l => { const w = [...l.children].reduce((m, c) => Math.max(m, c.getBoundingClientRect().right), 0); if (w > 1016) out.push('WIDE ' + l.textContent.trim() + ' ' + Math.round(w)); });
          for (let j = i + 1; j < R.length; j++) { const b = R[j][1]; if (R[j][0].contains(e) || e.contains(R[j][0])) continue;
            if (a.left < b.right - 1 && b.left < a.right - 1 && a.top < b.bottom - 1 && b.top < a.bottom - 1) out.push('OVER ' + (e.className.slice(0, 30)) + ' x ' + (R[j][0].className.slice(0, 30)) + ' ' + Math.round(a.bottom) + '/' + Math.round(b.top)); } }
        // text overflow inside cards
        vis.forEach(s => s.querySelectorAll('.glass *').forEach(c => { if (c.scrollWidth > c.clientWidth + 2 && getComputedStyle(c).overflow !== 'visible') out.push('CLIP ' + c.className); }));
        return out; }, t);
      console.log(t, r.join(' | '));
    }
  }
  await b.close(); console.log('ok');
})();
