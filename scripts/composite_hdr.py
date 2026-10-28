"""Lay a transparent Remotion overlay (ProRes 4444 with alpha) over untouched iPhone HDR (HLG) footage.

The video is never colour-converted: it stays 10-bit HEVC, BT.2020 / HLG, as shot. Only the overlay
is mapped into that space (SDR white -> ~75% HLG signal, the reference-white level). Audio is the
clip's own voice (cleaned + loudness-normalised) with a quiet music bed underneath.

Usage:
  python3 scripts/composite_hdr.py SOURCE OVERLAY.mov BED.wav OUT.mp4 [SEGMENTS]
SEGMENTS: optional "start-end,start-end" in seconds, joined with an 8-frame crossfade
          (must match the cut used in the Remotion overlay composition).
"""
import subprocess
import sys

FPS = 30
XFADE = 8 / FPS

src, overlay, bed, out = sys.argv[1:5]
segments = [tuple(map(float, s.split('-'))) for s in sys.argv[5].split(',')] if len(sys.argv) > 5 else None

parts = []
if segments:
    # Each later segment starts XFADE early so it can fade in over the previous one (as in Remotion).
    v_labels, a_labels = [], []
    for i, (s, e) in enumerate(segments):
        if i > 0:
            e += XFADE
        parts.append(f'[0:v]trim={s}:{e},setpts=PTS-STARTPTS[v{i}]')
        parts.append(f'[0:a]atrim={s}:{e},asetpts=PTS-STARTPTS[a{i}]')
        v_labels.append(f'v{i}')
        a_labels.append(f'a{i}')
    v, a = v_labels[0], a_labels[0]
    offset = segments[0][1] - segments[0][0] - XFADE
    for i in range(1, len(segments)):
        parts.append(f'[{v}][{v_labels[i]}]xfade=transition=fade:duration={XFADE:.4f}:offset={offset:.4f}[vx{i}]')
        parts.append(f'[{a}][{a_labels[i]}]acrossfade=d={XFADE:.4f}[ax{i}]')
        v, a = f'vx{i}', f'ax{i}'
        offset += segments[i][1] - segments[i][0]
else:
    v, a = '0:v', '0:a'

parts += [
    # Overlay: straight RGB -> scale to HLG reference white -> BT.2020 YUV with alpha.
    '[1:v]format=rgba64le,colorchannelmixer=rr=0.75:gg=0.75:bb=0.75,'
    'scale=out_color_matrix=bt2020:out_range=tv,format=yuva420p10le[ov]',
    f'[{v}][ov]overlay=format=yuv420p10:shortest=1[vout]',
    f'[{a}]highpass=f=80,afftdn=nf=-25,loudnorm=I=-15:TP=-1.5:LRA=11,aresample=48000[voice]',
    '[2:a]aresample=48000,volume=0.12[bed]',
    '[voice][bed]amix=inputs=2:duration=first:normalize=0[aout]',
]

cmd = [
    'ffmpeg', '-v', 'error', '-y', '-i', src, '-i', overlay, '-i', bed,
    '-filter_complex', ';'.join(parts), '-map', '[vout]', '-map', '[aout]',
    '-c:v', 'libx265', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p10le', '-profile:v', 'main10',
    '-x265-params', 'colorprim=bt2020:transfer=arib-std-b67:colormatrix=bt2020nc:range=limited:log-level=error',
    '-color_primaries', 'bt2020', '-color_trc', 'arib-std-b67', '-colorspace', 'bt2020nc', '-color_range', 'tv',
    '-tag:v', 'hvc1', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-movflags', '+faststart', out,
]
subprocess.run(cmd, check=True)
print('wrote', out)
