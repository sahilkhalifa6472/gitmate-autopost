const { chromium } = require('playwright');
const V = __dirname + '/vend/';
(async () => {
  const [file, outdir] = process.argv.slice(2);
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 1 });
  p.on('pageerror', e => console.log('ERR', e.message));
  await p.route('**fonts.googleapis.com/**', r => r.fulfill({ path: V + 'fonts.css', contentType: 'text/css' }));
  await p.goto('file://' + __dirname + '/' + file);
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(600);
  const issues = await p.evaluate(() => { const out = [];
    document.querySelectorAll('section.f').forEach(f => { const fr = f.getBoundingClientRect();
      const els = [...f.querySelectorAll('.top>.glass,.foot,.sc>.L,.sc>.glass,.sc>.L>.glass,.grid>.tile')].filter(e => !e.classList.contains('grid'));
      const R = els.map(e => [e, e.getBoundingClientRect()]);
      R.forEach(([e, a], i) => {
        if (a.right - fr.left > 1040 || a.left - fr.left < 40 || a.bottom - fr.top > 1350 - 40) out.push(f.id + ' EDGE ' + e.className + ' ' + Math.round(a.right - fr.left) + ' ' + Math.round(a.bottom - fr.top));
        e.querySelectorAll('.ln').forEach(l => { const w = [...l.children].reduce((m, c) => Math.max(m, c.getBoundingClientRect().right - fr.left), 0); if (w > 1016) out.push(f.id + ' WIDE ' + l.textContent); });
        const ch = [...e.querySelectorAll('*')].reduce((m, c) => Math.max(m, c.getBoundingClientRect().bottom), 0); if (e.classList.contains('glass') && ch > a.bottom + 1) out.push(f.id + ' SPILL ' + e.className + ' ' + Math.round(ch - a.bottom));
        for (let j = i + 1; j < R.length; j++) { const [e2, c] = R[j]; if (e2.contains(e) || e.contains(e2)) continue;
          if (a.left < c.right - 1 && c.left < a.right - 1 && a.top < c.bottom - 1 && c.top < a.bottom - 1) out.push(f.id + ' OVER ' + e.className.slice(0, 25) + ' x ' + e2.className.slice(0, 25)); } });
      f.querySelectorAll('.glass *').forEach(c => { if (c.scrollWidth > c.clientWidth + 2 && c.clientWidth > 0 && getComputedStyle(c).display !== 'inline') {} });
    }); return out; });
  console.log(issues.join('\n'));
  const fs = await p.$$('section.f'); let i = 1;
  for (const f of fs) await f.screenshot({ path: `${outdir}/${String(i++).padStart(2, '0')}.png` });
  await b.close(); console.log('ok');
})();
