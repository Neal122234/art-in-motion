// A scripted visit on the virtual clock: stop in a room, read the wall text, use the exhibits. Usage: node interact.js <out-name>
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), { spawn } = require('child_process');
const FFMPEG = process.env.FFMPEG || 'ffmpeg';
const SITE = path.resolve(__dirname, '../..'), OUT = __dirname;
const name = process.argv[2] || 'visit';
const FPS = 30, DT = 1000 / FPS;
const ROOM = 4;   // baroque

(async () => {
  const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required', '--hide-scrollbars', '--force-color-profile=srgb'] });
  const ctx = await b.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  await ctx.route('**/js/core.js*', async r => {
    let s = fs.readFileSync(path.join(SITE, 'js/core.js'), 'utf8');
    s = s.replace('EH.debug={state:st,', 'EH.debug={isLoading:function(){return loading;},state:st,');
    r.fulfill({ body: s, contentType: 'application/javascript' });
  });
  const page = await ctx.newPage();
  page.on('pageerror', e => console.log('[pageerror]', e.message));
  await page.addInitScript({ content: `window.__CFG={audioSec:180};\n` + fs.readFileSync(path.join(OUT, 'inject.js'), 'utf8') });
  await page.goto('http://localhost:8080/');
  await page.evaluate(() => document.fonts.ready);
  const files = [];
  const walk = rel => { for (const f of fs.readdirSync(path.join(SITE, rel), { withFileTypes: true })) f.isDirectory() ? walk(rel + '/' + f.name) : files.push(rel + '/' + f.name); };
  walk('rooms/baroque'); walk('rooms/renaissance'); walk('rooms/rococo'); walk('audio/sprites'); walk('audio/music');
  await page.evaluate(async fs_ => { await Promise.all(fs_.map(f => fetch(f).then(r => r.arrayBuffer()).catch(() => 0))); }, files);
  // a drawn cursor, since screenshots carry none
  await page.evaluate(() => {
    const c = document.createElement('div'); c.id = '__cur';
    c.innerHTML = '<svg width="28" height="28" viewBox="0 0 28 28"><path d="M3 2 L3 22 L8.5 17 L12.5 26 L16 24.5 L12 15.5 L19.5 15.5 Z" fill="#fff" stroke="#111" stroke-width="1.6" stroke-linejoin="round"/></svg>';
    c.style.cssText = 'position:fixed;left:0;top:0;z-index:99999;pointer-events:none;filter:drop-shadow(0 2px 4px rgba(0,0,0,.45));transform:translate(960px,700px)';
    document.body.appendChild(c);
  });

  const cdp = await ctx.newCDPSession(page);
  const ff = spawn(FFMPEG, ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '16', '-pix_fmt', 'yuv420p', '-r', String(FPS), path.join(OUT, name + '.video.mp4')], { stdio: ['pipe', 'inherit', 'inherit'] });
  const write = buf => new Promise(res => { if (!ff.stdin.write(buf)) ff.stdin.once('drain', res); else res(); });
  let rec = false, frames = 0, recStart = 0;
  const frame = async () => {
    const now = await page.evaluate(async dt => { await __cap.step(dt); return __cap.now(); }, DT);
    if (rec) { const r = await cdp.send('Page.captureScreenshot', { format: 'jpeg', quality: 93, optimizeForSpeed: true }); await write(Buffer.from(r.data, 'base64')); frames++; }
    return now;
  };
  const wait = async sec => { for (let k = 0; k < Math.round(sec * FPS); k++) await frame(); };
  let cx = 960, cy = 700;
  const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const cursor = async (x, y) => { cx = x; cy = y; await page.mouse.move(x, y); await page.evaluate(([x, y]) => { document.getElementById('__cur').style.transform = `translate(${x - 3}px,${y - 2}px)`; }, [x, y]); };
  const moveTo = async (x, y, sec, path_) => { const x0 = cx, y0 = cy, n = Math.max(1, Math.round(sec * FPS));
    for (let k = 1; k <= n; k++) { const e = ease(k / n); const p = path_ ? path_(k / n) : [x0 + (x - x0) * e, y0 + (y - y0) * e]; await cursor(p[0], p[1]); await frame(); } };
  const rect = sel => page.evaluate(sel => { const e = typeof sel === 'string' ? document.querySelector(sel) : null; if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height, cx: r.x + r.width / 2, cy: r.y + r.height / 2 }; }, sel);
  const byText = t => page.evaluate(t => { const e = [...document.querySelectorAll('#read .act, #read .work, .ctl button, .textbtn')].find(e => e.textContent.includes(t)); if (!e) return null; e.scrollIntoView({ block: 'nearest' }); const r = e.getBoundingClientRect(); return { cx: r.x + Math.min(r.width / 2, 60), cy: r.y + r.height / 2, x: r.x, y: r.y, w: r.width, h: r.height }; }, t);
  const click = async () => { await page.mouse.down(); await frame(); await page.mouse.up(); await frame(); };

  // enter, go straight to the baroque room (not recorded)
  await frame(); await page.evaluate(() => document.getElementById('gate').click()); await frame();
  await page.evaluate(i => EH.debug.jump(i), ROOM);
  for (let k = 0; k < 90; k++) await frame();
  rec = true; recStart = await page.evaluate(() => __cap.now());

  await wait(2.5);
  let r = await byText('停下来读'); await moveTo(r.cx, r.cy, 1.2); await wait(.3); await click(); await wait(2.6);
  // compare with the renaissance
  r = await byText('与文艺复兴对比'); await moveTo(r.cx, r.cy, 1.3); await wait(.3); await click(); await wait(1.6);
  let s = await rect('#split');
  if (s && s.w) { await moveTo(s.cx, s.cy, 1); await page.mouse.down();
    const f = await rect('#cw');
    await moveTo(f.x + f.w * .22, s.cy, 1.6); await moveTo(f.x + f.w * .8, s.cy, 2.2); await moveTo(f.x + f.w * .5, s.cy, 1.2);
    await page.mouse.up(); await wait(.8); }
  r = await byText('与文艺复兴对比'); await moveTo(r.cx, r.cy, 1); await click(); await wait(.8);
  // the magnifier over the painting
  r = await byText('放大镜'); await moveTo(r.cx, r.cy, 1); await click(); await wait(.4);
  let f = await rect('#cw');
  const faces = [[.40, .42], [.33, .45], [.22, .5], [.55, .42], [.62, .36]];
  for (const [u, v] of faces) await moveTo(f.x + f.w * u, f.y + f.h * v, 1.1);
  await wait(.6);
  r = await byText('放大镜'); await moveTo(r.cx, r.cy, 1); await click(); await wait(.5);
  // scroll the wall text down to the other works
  await moveTo(1500, 620, .8);
  const H = await page.evaluate(() => { const e = document.getElementById('read'); const w = [...e.querySelectorAll('.works')][0]; return w ? Math.max(0, w.offsetTop - 140) : e.scrollHeight - e.clientHeight; });
  const n = Math.round(4 * FPS);
  for (let k = 1; k <= n; k++) { await page.evaluate(y => { document.getElementById('read').scrollTop = y; }, H * ease(k / n)); await frame(); }
  await wait(1);
  // open the Night Watch in the viewer and zoom in
  r = await byText('夜巡'); if (r) { await moveTo(r.cx, r.cy - 30, 1.1); await wait(.2);
    // the first click only starts loading the full-size image; the viewer opens on the next one
    await page.mouse.click(cx, cy); await new Promise(z => setTimeout(z, 1500)); await click(); await wait(2); }
  await moveTo(1000, 520, .8);
  for (let k = 0; k < 16; k++) { await page.mouse.wheel(0, -120); await frame(); await frame(); await frame(); }
  await wait(1.2);
  await moveTo(820, 560, 1.6); await wait(1.5);
  r = await byText('关闭'); if (r) { await moveTo(r.cx, r.cy, 1.1); await click(); }
  await wait(1.2);
  // on to the next room with the arrow key
  await moveTo(1700, 900, .6);
  await page.keyboard.press('ArrowRight'); await wait(4);

  ff.stdin.end(); await new Promise(r => ff.on('close', r));
  const a = await page.evaluate(() => __cap.finishAudio());
  const CH = 4 << 20, parts = [];
  for (let off = 0; off < a.n; off += CH) parts.push(Buffer.from(await page.evaluate(([o, l]) => __cap.chunk(o, l), [off, CH]), 'base64'));
  fs.writeFileSync(path.join(OUT, name + '.pcm'), Buffer.concat(parts));
  fs.writeFileSync(path.join(OUT, name + '.json'), JSON.stringify({ sr: a.sr, audioStartSec: (a.acStart - recStart) / 1000, frames, fps: FPS }, null, 1));
  console.log('done', frames, 'frames');
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
