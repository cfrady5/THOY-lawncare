"""Turn the white-background walking clip into a transparent VP9-alpha WebM for
the hero, plus a matching fallback poster PNG.

The source export (Canva → MP4) flattened the transparent background onto solid
white, and the figure spans the full tonal range (white socks, black shorts,
grey shirt), so a plain colour key can't separate it. Instead, for each frame we
remove only the *background* white:

  * border-connected white  → the surrounding backdrop, and
  * white enclosed deep inside the figure (the gaps between the mower handle
    rails sit ~18px from any backdrop) → also backdrop,

while keeping white that hugs the silhouette (the socks, only a few px from the
surrounding backdrop). A thin feathered shell anti-aliases the outline.

Requires: imageio, imageio-ffmpeg, pillow, numpy, scipy.
Run from the repo root:  python3 build_walk_webm.py
"""
import subprocess, glob, os, tempfile
import imageio.v3 as iio
import numpy as np
from scipy import ndimage
from PIL import Image
import imageio_ffmpeg

SRC = "assets/character-walk-source.mp4"   # the white-background walk export
WEBM = "assets/character-walk.webm"
POSTER = "assets/character-walk-poster.png"
WORK_W = 2000          # processing width
WHITE = 238            # min-channel at/above this is "white"
DEEP = 18              # enclosed white this far from the backdrop = handle gaps
SHELL = 4              # feather band width (px) along the silhouette
GAUSS = 1.0            # silhouette anti-alias
FPS = 30


def matte(rgb):
    a = rgb.astype(np.int16)
    mn = a.min(2)
    white = mn >= WHITE
    lbl, n = ndimage.label(white)
    border = set(np.unique(np.concatenate([lbl[0], lbl[-1], lbl[:, 0], lbl[:, -1]])))
    border.discard(0)
    outer = np.isin(lbl, list(border))
    dist = ndimage.distance_transform_edt(~outer)
    bg = outer.copy()
    for c in range(1, n + 1):
        if c in border:
            continue
        m = lbl == c
        if dist[m].min() >= DEEP:           # deep enclosed white = background holes
            bg |= m
    fg = ~bg
    alpha = fg.astype(np.float32)
    shell = fg & ndimage.binary_dilation(bg, iterations=SHELL)
    alpha[shell] = np.clip((255 - mn[shell]) / 23.0, 0, 1)
    alpha = ndimage.gaussian_filter(alpha, GAUSS)
    return (np.clip(alpha, 0, 1) * 255).astype(np.uint8)


def main():
    frames = []
    x0 = y0 = 10 ** 9
    x1 = y1 = -1
    for fr in iio.imiter(SRC):
        a0 = np.asarray(fr)[:, :, :3]
        h0, w0 = a0.shape[:2]
        a = np.asarray(Image.fromarray(a0).resize((WORK_W, round(h0 * WORK_W / w0)), Image.LANCZOS))
        al = matte(a)
        frames.append(np.dstack([a, al]))
        ys, xs = np.where(al > 16)
        if len(xs):
            x0, x1 = min(x0, xs.min()), max(x1, xs.max())
            y0, y1 = min(y0, ys.min()), max(y1, ys.max())
    pad = 18
    x0, y0 = max(0, x0 - pad), max(0, y0 - pad)
    x1, y1 = min(WORK_W - 1, x1 + pad), min(frames[0].shape[0] - 1, y1 + pad)
    cw, ch = (x1 - x0 + 1), (y1 - y0 + 1)
    cw -= cw % 2
    ch -= ch % 2                                  # even dims for VP9

    seq = tempfile.mkdtemp()
    for i, f in enumerate(frames):
        Image.fromarray(f[y0:y0 + ch, x0:x0 + cw], "RGBA").save(os.path.join(seq, f"f_{i:04d}.png"))
    Image.fromarray(frames[len(frames) // 2][y0:y0 + ch, x0:x0 + cw], "RGBA").save(POSTER)

    ff = imageio_ffmpeg.get_ffmpeg_exe()
    subprocess.run([
        ff, "-y", "-hide_banner", "-loglevel", "error",
        "-framerate", str(FPS), "-i", os.path.join(seq, "f_%04d.png"),
        "-c:v", "libvpx-vp9", "-pix_fmt", "yuva420p", "-auto-alt-ref", "0",
        "-b:v", "0", "-crf", "32", "-deadline", "good", "-cpu-used", "2", "-an", WEBM,
    ], check=True)
    print(f"wrote {WEBM} ({cw}x{ch}, {len(frames)} frames) and {POSTER}")


if __name__ == "__main__":
    main()
