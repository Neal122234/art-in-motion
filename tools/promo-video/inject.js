// Injected before any page script: runs the page on a virtual clock we step frame by frame.
(() => {
  const CFG = window.__CFG || { audioSec: 600 };
  let vnow = 0;                                        // virtual ms since load
  const dateBase = Date.now();
  performance.now = () => vnow;
  Date.now = () => dateBase + vnow;

  // requestAnimationFrame only fires when we step
  let q = [], rid = 0;
  window.requestAnimationFrame = cb => { const i = ++rid; q.push({ i, cb }); return i; };
  window.cancelAnimationFrame = i => { q = q.filter(e => e.i !== i); };
  function runRaf(ts) { const L = q; q = []; for (const e of L) { try { e.cb(ts); } catch (err) { console.error(err); } } }

  // the site's one AudioContext becomes an offline context rendered in step with the clock
  const SR = 48000;
  const realResume = OfflineAudioContext.prototype.resume;
  let AC = null, acStart = 0, rendering = null, lastSusp = 0;
  class FakeAC extends OfflineAudioContext {
    constructor() { super({ numberOfChannels: 2, length: Math.ceil(CFG.audioSec * SR), sampleRate: SR }); AC = this; acStart = vnow; }
    get state() { return 'running'; }
    resume() { return Promise.resolve(); }
    close() { return Promise.resolve(); }
  }
  window.AudioContext = window.webkitAudioContext = FakeAC;
  async function renderTo(ms) {
    if (!AC) return;
    let t = (ms - acStart) / 1000;
    t = Math.ceil(t * SR / 128) * 128 / SR;
    if (t <= lastSusp) return;
    lastSusp = t;
    const p = AC.suspend(t);
    if (!rendering) rendering = AC.startRendering(); else realResume.call(AC);
    await p;
  }

  // media elements follow the virtual clock
  const MP = HTMLMediaElement.prototype, realPause = MP.pause;
  MP.play = function () { this.__vplay = true; return Promise.resolve(); };
  MP.pause = function () { this.__vplay = false; return realPause.call(this); };
  Object.defineProperty(MP, 'paused', { get() { return !this.__vplay; }, configurable: true });

  const sleep = ms => new Promise(r => setTimeout(r, ms));
  async function mediaSettled() {
    for (let k = 0; k < 200; k++) {
      const vs = [...document.querySelectorAll('video')];
      if (vs.every(v => !v.seeking && (v.readyState >= 2 || v.readyState === 0))) return true;
      await sleep(10);
    }
    return false;
  }

  window.__cap = {
    now: () => vnow,
    acStart: () => acStart,
    hasAC: () => !!AC,
    async step(dt) {
      // don't let asset loading eat virtual time
      for (let k = 0; k < 600 && EH.debug && EH.debug.isLoading && EH.debug.isLoading(); k++) await sleep(20);
      vnow += dt;
      await renderTo(vnow);
      for (const v of document.querySelectorAll('video')) if (v.__vplay && v.duration) { const n = Math.min(v.currentTime + dt / 1000, v.duration); if (Math.abs(n - v.currentTime) > 1e-4) v.currentTime = n; }
      await mediaSettled();
      for (const v of document.querySelectorAll('video')) v.__seekedThisFrame = false;
      runRaf(vnow);
      // CSS transitions/animations: frozen, advanced by hand
      for (const a of document.getAnimations()) {
        if (!a.__v) { a.__v = true; a.pause(); a.currentTime = 0; continue; }
        if (a.playState === 'finished' || a.playState === 'idle') continue;
        const end = a.effect ? a.effect.getComputedTiming().endTime : Infinity;
        const n = (a.currentTime || 0) + dt;
        if (isFinite(end) && n >= end) a.finish(); else a.currentTime = n;
      }
      // a video seeked during the frame: redraw at the same instant once the new frame is decoded
      if ([...document.querySelectorAll('video')].some(v => v.__seekedThisFrame)) { await mediaSettled(); await sleep(5); runRaf(vnow); }
    },
    async finishAudio() {
      if (!AC) return null;
      realResume.call(AC);
      const buf = await rendering;
      const L = buf.getChannelData(0), R = buf.getChannelData(1), n = buf.length;
      const out = new Int16Array(n * 2);
      for (let i = 0; i < n; i++) { out[2 * i] = Math.max(-1, Math.min(1, L[i])) * 32767; out[2 * i + 1] = Math.max(-1, Math.min(1, R[i])) * 32767; }
      window.__pcm = new Uint8Array(out.buffer);
      return { sr: SR, acStart, n: window.__pcm.length };
    },
    chunk(off, len) { const a = window.__pcm.subarray(off, off + len); let s = ''; for (let i = 0; i < a.length; i += 32768) s += String.fromCharCode.apply(null, a.subarray(i, i + 32768)); return btoa(s); },
  };
  // mark videos that seek so the step can redraw after the new frame arrives
  document.addEventListener('seeking', e => { e.target.__seekedThisFrame = true; }, true);
})();
