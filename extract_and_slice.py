"""Build the animated character layers from the clean (transparent-background)
THOY illustration, slicing it into body + two legs for the walk cycle.

Source: public/assets/character-clean.png  (character on a transparent canvas)
Requires: pillow, scipy, numpy.   Run from the repo root:  python3 extract_and_slice.py
"""
from PIL import Image
import numpy as np
from scipy import ndimage

TARGET_W = 1000   # working width for the web layers

src = Image.open('public/assets/character-clean.png').convert('RGBA')
a = np.array(src)
al = a[:, :, 3]

# crop to the figure, then downscale to a web-friendly size
ys, xs = np.where(al > 20)
crop = src.crop((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))
th = round(crop.height * TARGET_W / crop.width)
img = crop.resize((TARGET_W, th), Image.LANCZOS)
img.save('assets/character.png')

arr = np.array(img)
op = arr[:, :, 3] > 40
ch, cw = op.shape
rr = np.arange(ch)[:, None] * np.ones((1, cw))
cc = np.ones((ch, 1)) * np.arange(cw)

# slice lines (derived from the profile of this clean art)
LEG_TOP = 565      # just below the shorts hem
BODY_KEEP = 588    # body overlaps the leg tops to hide the seam
CROTCH = 770       # split between the two legs
LEG_LEFT = 615     # right of the mower / handle
FOOT_TOP = 806     # below here the leading foot's toe juts left of LEG_LEFT
FOOT_LEFT = 545    # capture the whole leading shoe so it doesn't tear

# the front (leading) foot points left, so below FOOT_TOP it reaches left of LEG_LEFT
front = op & (rr >= LEG_TOP) & (cc < CROTCH) \
    & ((cc >= LEG_LEFT) | ((rr >= FOOT_TOP) & (cc >= FOOT_LEFT)))
back = op & (rr >= LEG_TOP) & (cc >= CROTCH)

def clean(m):
    l, k = ndimage.label(m)
    if k == 0:
        return m
    sz = ndimage.sum(np.ones_like(l), l, index=range(1, k + 1))
    out = np.zeros_like(m)
    for i, s in enumerate(sz):
        if s >= 80:
            out |= (l == (i + 1))
    return out

front, back = clean(front), clean(back)
body = op.copy()
body[(rr >= BODY_KEEP) & (cc >= LEG_LEFT)] = False
body[(rr >= FOOT_TOP) & (cc >= FOOT_LEFT) & (cc < LEG_LEFT)] = False  # release the leading toe

def save(mask, name):
    out = np.zeros_like(arr)
    out[mask] = arr[mask]
    Image.fromarray(out, 'RGBA').save(name)

save(body, 'assets/char-body.png')
save(front, 'assets/char-leg-front.png')
save(back, 'assets/char-leg-back.png')

fx = cc[front & (rr < LEG_TOP + 26)].mean()
bx = cc[back & (rr < LEG_TOP + 26)].mean()
print(f"canvas {cw}x{ch}   aspect {cw}/{ch}")
print(f"front-origin: {100*fx/cw:.1f}% {100*LEG_TOP/ch:.1f}%")
print(f"back-origin:  {100*bx/cw:.1f}% {100*LEG_TOP/ch:.1f}%")

# recomposed sanity preview
base = Image.new('RGBA', (cw, ch), (70, 158, 82, 255))
for n_ in ['assets/char-leg-back.png', 'assets/char-leg-front.png', 'assets/char-body.png']:
    base.alpha_composite(Image.open(n_))
base.convert('RGB').save('dbg-recomposed.png')
