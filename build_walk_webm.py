"""Turn the black-background walking clip into a transparent VP9-alpha WebM for
the hero, plus a matching fallback poster PNG.

The source is a 4K Runway clip on a pure-black background. The figure's darkest
parts (shorts, mower, handle) are dark grey, not pure black, so a brightness
ramp cleanly separates the figure from the backdrop while also dropping any
faint shadow glow and letting the handle gaps fall out as background. We keep
only the largest blob (the connected figure), which removes any stray specks /
watermark. Frames are downscaled from 4K to a hero-friendly width.

Requires: imageio, imageio-ffmpeg, pillow, numpy, scipy.
Run from the repo root:  python3 build_walk_webm.py
"""
import subprocess, os, tempfile
import imageio.v3 as iio
import numpy as np
from scipy import ndimage
from PIL import Image
import imageio_ffmpeg

SRC = "assets/character-walk-source.mp4"   # 4K black-background walk clip
WEBM = "assets/character-walk.webm"
POSTER = "assets/character-walk-poster.png"
WORK_W = 2200          # working width (downscaled from 4K)
LO, HI = 8, 20         # brightness ramp: <=LO transparent, >=HI opaque
FPS = 24


def matte(rgb):
    a = rgb.astype(np.int16)
    b = ndimage.median_filter(a.max(2).astype(np.float32), size=3)
    alpha = np.clip((b - LO) / (HI - LO), 0, 1)
    solid = alpha > 0.4
    lbl, n = ndimage.label(solid)
    if n >= 1:
        sizes = ndimage.sum(np.ones_like(lbl), lbl, index=range(1, n + 1))
        biggest = int(np.argmax(sizes)) + 1                          # the figure
        charmask = ndimage.binary_dilation(lbl == biggest, iterations=6)
        alpha[~charmask] = 0                                         # drop stray specks
    alpha = ndimage.gaussian_filter(alpha, 1.0)
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
    pad = 12
    H2, W2 = frames[0].shape[:2]
    x0, y0 = max(0, x0 - pad), max(0, y0 - pad)
    x1, y1 = min(W2 - 1, x1 + pad), min(H2 - 1, y1 + pad)
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
        "-b:v", "0", "-crf", "30", "-deadline", "good", "-cpu-used", "2", "-an", WEBM,
    ], check=True)
    print(f"wrote {WEBM} ({cw}x{ch}, {len(frames)} frames @ {FPS}fps) and {POSTER}")


if __name__ == "__main__":
    main()
