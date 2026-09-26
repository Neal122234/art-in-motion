const { chromium } = require('playwright');
const fs = require('fs');
const css = `
html,body{margin:0;width:1920px;height:1080px;background:#0b0908;color:#efe6d6;overflow:hidden}
.c{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center}
.zh{font:300 104px/1.1 'Noto Serif SC',serif;letter-spacing:.34em;margin-right:-.34em}
.lat{font:italic 400 40px/1.2 'Bodoni Moda',serif;color:#d3c8b6;margin-top:30px}
.rule{width:64px;height:1px;background:#b08d57;margin:46px 0 40px}
.one{font:400 34px/1.8 'Noto Serif SC',serif;color:#d3c8b6;letter-spacing:.12em}
.sub{font:400 25px/1.8 'Noto Serif SC',serif;color:#b3a893;letter-spacing:.12em;margin-top:14px}
.url{font:400 44px/1.2 'Noto Serif SC',serif;letter-spacing:.06em;color:#efe6d6;margin-top:6px}
.small{font:400 24px/1.9 'Noto Serif SC',serif;color:#b3a893;letter-spacing:.14em}
.flame{width:14px;height:22px;margin:0 auto 40px;border-radius:50% 50% 50% 50%/60% 60% 40% 40%;background:radial-gradient(circle at 50% 70%,#fff2c8,#ffb347 45%,#c2410c 80%,transparent 81%);box-shadow:0 0 60px 26px rgba(255,150,60,.2)}
`;
const cards = {
  title: `<div class="c"><div class="zh">艺术的演进</div><div class="lat">Art in Motion</div><div class="rule"></div>
    <div class="one">一座会自己播放的艺术史展厅</div><div class="sub">从洞穴岩画到当代艺术 · 十七个时代 · 每一次转场由画作本身完成</div></div>`,
  mid: `<div class="c"><div class="one">它也可以随时停下来</div><div class="sub">读墙上的文字 · 用放大镜看笔触 · 把一幅画放大到每一张脸</div></div>`,
  end: `<div class="c"><div class="flame"></div><div class="small">在浏览器里打开，点亮火光，进入展厅</div><div class="rule"></div>
    <div class="url">art-in-motion.pages.dev</div><div class="sub" style="margin-top:40px">建议使用电脑浏览器 · 打开声音</div></div>`,
};
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  await p.goto('http://localhost:8080/404.html');
  for (const [k, body] of Object.entries(cards)) {
    await p.setContent(`<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><link rel="stylesheet" href="http://localhost:8080/fonts/fonts.css"><style>${css}</style></head><body>${body}</body></html>`);
    await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(800);
    await p.screenshot({ path: `card_${k}.png` });
  }
  {
    await p.goto('http://localhost:8080/404.html');
    await p.setContent(`<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><link rel="stylesheet" href="http://localhost:8080/fonts/fonts.css"><style>${css}
      body{background:radial-gradient(ellipse 60% 70% at 70% 45%,#2a221b,#0b0908 75%)}
      .beam{position:absolute;inset:0;background:linear-gradient(125deg,transparent 52%,rgba(255,240,210,.10) 60%,transparent 70%)}
      .pf{position:absolute;right:120px;top:120px;width:840px;height:840px;padding:22px;background:linear-gradient(160deg,#6d5230,#3a2a14 55%,#5c4424);box-shadow:inset 0 0 0 1px #1c1409,inset 0 0 0 5px #7a5e35,inset 0 0 0 6px #241a0c,0 40px 90px -20px rgba(0,0,0,.9)}
      .pf img{width:100%;height:100%;object-fit:cover;display:block}
      .t{position:absolute;left:120px;top:0;bottom:0;width:820px;display:flex;flex-direction:column;justify-content:center}
      .t .zh{font-size:124px;letter-spacing:.16em;margin:0}.t .lat{font-size:50px;margin-top:26px}
      .t .rule{margin:52px 0 44px}
      .t .one{font-size:46px;letter-spacing:.08em;color:#efe6d6}.t .sub{font-size:32px;margin-top:16px}
    </style></head><body><div class="pf"><img src="http://localhost:8080/rooms/baroque/main.webp"></div><div class="beam"></div><div class="t"><div class="zh">艺术的演进</div><div class="lat">Art in Motion</div><div class="rule"></div>
      <div class="one">一座会自己播放的艺术史展厅</div><div class="sub">17 个时代 · 画作本身完成转场</div></div></body></html>`);
    await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1200);
    await p.screenshot({ path: 'cover.jpg', quality: 92, type: 'jpeg' });
  }
  await b.close();
})();
