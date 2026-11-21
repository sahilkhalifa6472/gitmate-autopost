const { chromium } = require('playwright');
const V = __dirname + '/vend/';
(async () => {
  const [file, outdir, ...ts] = process.argv.slice(2);
  const br = await chromium.launch(); const p = await br.newPage({ viewport: { width: 1080, height: 1920 } });
  p.on('pageerror', e => console.log('ERR', e.message)); p.on('console', m => console.log('LOG', m.text()));
  await p.route('**/gsap.min.js', r => r.fulfill({ path: V + 'gsap.min.js', contentType: 'text/javascript' }));
  await p.route('**fonts.googleapis.com/**', r => r.fulfill({ path: V + 'fonts.css', contentType: 'text/css' }));
  await p.goto('file://' + __dirname + '/' + file);
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(500);
  for (const t of ts) { await p.evaluate(async t => { await __seek(t - 1/30); await __seek(t); }, +t); await p.screenshot({ path: `${outdir}/t${(+t).toFixed(2)}.jpg`, type: 'jpeg', quality: 80 }); }
  await br.close();
})();
