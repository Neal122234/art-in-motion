// Records the site frame by frame on a virtual clock. Usage: node capture.js <out-name> [maxSeconds] [--probe]
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), { spawn } = require('child_process');
const FFMPEG = process.env.FFMPEG || 'ffmpeg';
const SITE = path.resolve(__dirname, '../..');
const OUT = __dirname;
const name = process.argv[2] || 'tour';
const maxSec = +(process.argv[3] || 1e9);
const probe = process.argv.includes('--probe');
const FPS = 30, DT = 1000 / FPS;
const GATE_SEC = 3.5;      // the lamp at the entrance before the click
const REST = 6.5;          // seconds each hung painting rests before moving on (the site's own is 11)
const HOLD = 11;
const END_SEC = 7;         // the last room's end card

(async () => {
  const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required', '--hide-scrollbars', '--force-color-profile=srgb'] });
  const ctx = await b.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  await ctx.route('**/js/core.js*', async r => {
    let s = fs.readFileSync(path.join(SITE, 'js/core.js'), 'utf8');
    s = s.replace('EH.debug={state:st,', 'EH.debug={isLoading:function(){return loading;},durations:function(){return ROOMS.map(function(r,i){return duration(i);});},ids:function(){return ROOMS.map(function(r){return r.id;});},state:st,');
    r.fulfill({ body: s, contentType: 'application/javascript' });
  });
  const page = await ctx.newPage();
  page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') console.log('[page]', m.type(), m.text().slice(0, 200)); });
  page.on('pageerror', e => console.log('[pageerror]', e.message));
  await page.addInitScript({ content: `window.__CFG={audioSec:${Math.min(maxSec, 900) + 60}};\n` + fs.readFileSync(path.join(OUT, 'inject.js'), 'utf8') });
  await page.goto('http://localhost:8080/');
  await page.evaluate(() => document.fonts.ready);
  // warm the HTTP cache with every room asset so loading never stalls a transition
  const files = [];
  const walk = rel => { for (const f of fs.readdirSync(path.join(SITE, rel), { withFileTypes: true })) f.isDirectory() ? walk(rel + '/' + f.name) : files.push(rel + '/' + f.name); };
  walk('rooms');
  for (const d of ['music', 'sprites']) for (const f of fs.readdirSync(path.join(SITE, 'audio', d))) files.push(`audio/${d}/${f}`);
  await page.evaluate(async fs_ => { await Promise.all(fs_.map(f => fetch(f).then(r => r.arrayBuffer()).catch(() => 0))); }, files);
  const durs = await page.evaluate(() => EH.debug.durations()), ids = await page.evaluate(() => EH.debug.ids());
  console.log('rooms', ids.map((id, i) => id + ':' + durs[i]).join(' '));
  const est = GATE_SEC + durs.reduce((a, x) => a + x, 0) + (ids.length - 1) * REST + END_SEC;
  console.log('estimated length', est.toFixed(1), 's =', Math.round(est * FPS), 'frames');
  if (probe) { await b.close(); return; }

  const cdp = await ctx.newCDPSession(page);
  const ff = spawn(FFMPEG, ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '16', '-pix_fmt', 'yuv420p', '-r', String(FPS), path.join(OUT, name + '.video.mp4')], { stdio: ['pipe', 'inherit', 'inherit'] });
  const write = buf => new Promise(res => { if (!ff.stdin.write(buf)) ff.stdin.once('drain', res); else res(); });
  const step = () => page.evaluate(async dt => { await __cap.step(dt); const s = EH.debug.state; return { idx: s.idx, phase: s.phase, t: s.t, now: __cap.now() }; }, DT);
  const shot = async () => { const r = await cdp.send('Page.captureScreenshot', { format: 'jpeg', quality: 93, optimizeForSpeed: true }); await write(Buffer.from(r.data, 'base64')); };

  let frames = 0, recStart = null, t0 = Date.now(), endAt = null;
  const last = ids.length - 1, log = [];
  // frame 0 is the gate
  let s = await step(); recStart = s.now; await shot(); frames++;
  while (true) {
    if (frames === Math.round(GATE_SEC * FPS)) await page.evaluate(() => document.getElementById('gate').click());
    s = await step(); await shot(); frames++;
    if (!log.length || log[log.length - 1].idx !== s.idx || log[log.length - 1].phase !== s.phase) { log.push({ idx: s.idx, phase: s.phase, frame: frames - 1 }); console.log(`frame ${frames - 1}  ${ids[s.idx]} ${s.phase}  (${((Date.now() - t0) / frames).toFixed(0)} ms/frame)`); }
    if (s.phase === 'rest' && s.idx < last && s.t >= REST) await page.evaluate(h => { EH.debug.state.t = h; }, HOLD);
    if (s.phase === 'rest' && s.idx === last && endAt === null) endAt = frames + Math.round((HOLD - 1 + END_SEC) * FPS);
    if ((endAt !== null && frames >= endAt) || frames >= maxSec * FPS) break;
    if (frames % 300 === 0) console.log(`  ${frames} frames, ${(frames / FPS).toFixed(1)} s of video, ${((Date.now() - t0) / 1000 / 60).toFixed(1)} min elapsed`);
  }
  ff.stdin.end();
  await new Promise(r => ff.on('close', r));
  // audio: the offline context started at the gate click
  const a = await page.evaluate(() => __cap.finishAudio());
  if (a) {
    const CH = 4 << 20, parts = [];
    for (let off = 0; off < a.n; off += CH) parts.push(Buffer.from(await page.evaluate(([o, l]) => __cap.chunk(o, l), [off, CH]), 'base64'));
    fs.writeFileSync(path.join(OUT, name + '.pcm'), Buffer.concat(parts));
    fs.writeFileSync(path.join(OUT, name + '.json'), JSON.stringify({ sr: a.sr, audioStartSec: (a.acStart - recStart) / 1000, frames, fps: FPS, log, ids }, null, 1));
  }
  console.log('done', frames, 'frames in', ((Date.now() - t0) / 60000).toFixed(1), 'min');
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
