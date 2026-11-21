const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 1 });
  const out = process.argv[2] || 'out';
  require('fs').mkdirSync(out, { recursive: true });
  for (let i = 0; i < 10; i++) {
    await p.goto('file://' + path.resolve('carousel.html') + '?s=' + i);
    await p.evaluate(() => document.fonts.ready);
    await p.waitForTimeout(250);
    await p.screenshot({ path: `${out}/${String(i + 1).padStart(2, '0')}.png` });
  }
  await b.close();
})();
