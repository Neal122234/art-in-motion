# 宣传视频录制工具

把网站在浏览器里逐帧录下来，合成 B 站用的展示视频（1920×1080 · 30fps · 画面和声音都来自网站本身）。

网站在无 GPU 的机器上实时只能跑到约 7 fps，所以不做实时录屏。`inject.js` 让页面跑在一个虚拟时钟上：

- `requestAnimationFrame` / `performance.now` / `Date.now` 只在我们步进时前进；
- CSS 过渡与动画（`document.getAnimations()`）暂停后逐帧手动推进；
- 网站唯一的 `AudioContext` 换成 `OfflineAudioContext`，用 `suspend()` 与画面同步渲染，声音和画面逐帧对齐；
- 印象派展厅的重绘视频跟随虚拟时钟 seek。

## 步骤

```sh
# 仓库根目录起一个静态服务（端口 8080）
npx http-server -p 8080 -s -c3600 .
cd tools/promo-video
export NODE_PATH=$(npm root -g)          # 需要全局安装 playwright
export FFMPEG=/path/to/ffmpeg            # 可选，默认用 PATH 里的 ffmpeg
node capture.js tour                     # 全程导览，约 35 分钟（4 核）
node interact.js visit                   # 停下来读、放大镜、放大看《夜巡》
node cards.js                            # 片头、过场、片尾卡片和封面 cover.jpg
python3 assemble.py art-in-motion.mp4    # 拼接 + 响度标准化到 -16 LUFS
```

`capture.js` 里的 `REST` 是每个展厅挂画停留的秒数（网站自身是 11 秒，视频里缩短为 6.5 秒）。
投稿用的标题、简介、章节时间戳和音乐署名在 `bilibili.md`。
