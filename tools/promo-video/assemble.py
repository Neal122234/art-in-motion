import json, os, subprocess, re, sys
F = os.environ.get('FFMPEG', 'ffmpeg')
T = json.load(open('tour.json')); V = json.load(open('visit.json'))
tour_len = T['frames'] / 30; visit_len = V['frames'] / 30
TITLE, MID, END = 5.0, 4.0, 7.0

def audio_chain(label, meta, length, out):
    off = meta['audioStartSec']
    if off >= 0:
        pre = f"adelay={int(off*1000)}|{int(off*1000)},"
    else:
        pre = f"atrim=start={-off},asetpts=PTS-STARTPTS,"
    return (f"[{label}]{pre}apad,atrim=0:{length},asetpts=PTS-STARTPTS,"
            f"afade=t=in:d=0.4,afade=t=out:st={length-1.5}:d=1.5[{out}]")

def build(extra_af, out, measure=False):
    inp = ['-loop', '1', '-t', str(TITLE), '-framerate', '30', '-i', 'card_title.png',
           '-i', 'tour.video.mp4',
           '-f', 's16le', '-ar', '48000', '-ac', '2', '-i', 'tour.pcm',
           '-loop', '1', '-t', str(MID), '-framerate', '30', '-i', 'card_mid.png',
           '-i', 'visit.video.mp4',
           '-f', 's16le', '-ar', '48000', '-ac', '2', '-i', 'visit.pcm',
           '-loop', '1', '-t', str(END), '-framerate', '30', '-i', 'card_end.png']
    fc = ';'.join([
        f"[0]format=yuv420p,fade=t=in:d=1,fade=t=out:st={TITLE-1}:d=1,setsar=1[v0]",
        f"[1]format=yuv420p,setsar=1,fade=t=out:st={tour_len-1.2}:d=1.2[v1]",
        f"[3]format=yuv420p,fade=t=in:d=0.8,fade=t=out:st={MID-0.8}:d=0.8,setsar=1[v2]",
        f"[4]format=yuv420p,setsar=1,fade=t=in:d=0.6,fade=t=out:st={visit_len-1}:d=1[v3]",
        f"[6]format=yuv420p,fade=t=in:d=1,fade=t=out:st={END-1.2}:d=1.2,setsar=1[v4]",
        f"anullsrc=r=48000:cl=stereo,atrim=0:{TITLE}[a0]",
        audio_chain('2', T, tour_len, 'a1'),
        f"anullsrc=r=48000:cl=stereo,atrim=0:{MID}[a2]",
        audio_chain('5', V, visit_len, 'a3'),
        f"anullsrc=r=48000:cl=stereo,atrim=0:{END}[a4]",
        f"[v0][a0][v1][a1][v2][a2][v3][a3][v4][a4]concat=n=5:v=1:a=1[v][a0x]",
        f"[a0x]{extra_af}[a]",
    ])
    if measure:
        cmd = [F, '-y', *inp, '-filter_complex', fc, '-map', '[v]', '-map', '[a]', '-f', 'null', '-']
    else:
        cmd = [F, '-y', '-loglevel', 'error', '-stats', *inp, '-filter_complex', fc, '-map', '[v]', '-map', '[a]',
               '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-profile:v', 'high', '-pix_fmt', 'yuv420p', '-r', '30',
               '-g', '60', '-movflags', '+faststart', '-c:a', 'aac', '-b:a', '320k', '-ar', '48000', out]
    return subprocess.run(cmd, capture_output=measure, text=True)

# pass 1: measure loudness; pass 2: normalise to -16 LUFS / -1.5 dBTP (bilibili-friendly)
r = build('loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json', None, measure=True)
m = json.loads(re.findall(r'\{[^{}]*"input_i"[^{}]*\}', r.stderr)[-1])
print('measured', m)
af = (f"loudnorm=I=-16:TP=-1.5:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:"
      f"measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true,aresample=48000")
build(af, sys.argv[1] if len(sys.argv) > 1 else 'art-in-motion.mp4')
