const { chromium } = require('playwright');
const V = __dirname + '/../vend/';
// args: raw voice-take seconds; page seek wants real seconds (raw / 1.1)
(async () => {
  const ts = process.argv.slice(2).map(Number);
  const br = await chromium.launch(); const p = await br.newPage({ viewport: { width: 1080, height: 1920 } });
  p.on('pageerror', e => console.log('ERR', e.message));
  await p.route('**/gsap.min.js', r => r.fulfill({ path: V + 'gsap.min.js', contentType: 'text/javascript' }));
  await p.route('**fonts.googleapis.com/**', r => r.fulfill({ path: V + 'fonts.css', contentType: 'text/css' }));
  await p.goto('file://' + __dirname + '/reel.html');
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(600);
  for (const t of ts) { await p.evaluate(t => __seek(t / 1.12), t); for (const [k, y] of [['a', 0], ['b', 640], ['c', 1280]]) await p.screenshot({ path: `${__dirname}/shots/s${t.toFixed(2)}${k}.jpg`, type: 'jpeg', quality: 80, clip: { x: 0, y, width: 1080, height: 640 } }); }
  await br.close();
})();
