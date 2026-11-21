const { chromium } = require('playwright');
const V = __dirname + '/../vend/';
// Each frame is captured as 3 horizontal strips (a/b/c, 640px tall): full-viewport captures clip
// heavily 3D-transformed layers in this Chromium build. ffmpeg vstacks the strips back together.
(async () => {
  const [file, outdir, a, b] = process.argv.slice(2);
  const br = await chromium.launch(); const p = await br.newPage({ viewport: { width: 1080, height: 1920 } });
  p.on('pageerror', e => console.log('ERR', e.message));
  await p.route('**/gsap.min.js', r => r.fulfill({ path: V + 'gsap.min.js', contentType: 'text/javascript' }));
  await p.route('**fonts.googleapis.com/**', r => r.fulfill({ path: V + 'fonts.css', contentType: 'text/css' }));
  await p.goto('file://' + __dirname + '/' + file);
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(600);
  for (let i = +a; i < +b; i++) { await p.evaluate(t => __seek(t), i / 30);
    for (const [k, y] of [['a', 0], ['b', 640], ['c', 1280]]) await p.screenshot({ path: `${outdir}/${k}${String(i).padStart(5, '0')}.jpg`, type: 'jpeg', quality: 95, clip: { x: 0, y, width: 1080, height: 640 } }); }
  await br.close(); console.log('done', a, b);
})();
