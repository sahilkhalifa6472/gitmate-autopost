const { chromium } = require('playwright');
const V = __dirname + '/vend/';
(async () => {
  const [file, outdir, a, b] = process.argv.slice(2);
  const br = await chromium.launch(); const p = await br.newPage({ viewport: { width: 1080, height: 1920 } });
  p.on('pageerror', e => console.log('ERR', e.message));
  await p.route('**/gsap.min.js', r => r.fulfill({ path: V + 'gsap.min.js', contentType: 'text/javascript' }));
  await p.route('**fonts.googleapis.com/**', r => r.fulfill({ path: V + 'fonts.css', contentType: 'text/css' }));
  await p.goto('file://' + __dirname + '/' + file);
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(600);
  // start a bit early so time-jump callbacks settle, then render forward
  for (let i = +a; i < +b; i++) { await p.evaluate(t => __seek(t), i / 30); await p.screenshot({ path: `${outdir}/f${String(i).padStart(5, '0')}.jpg`, type: 'jpeg', quality: 95 }); }
  await br.close(); console.log('done', a, b);
})();
