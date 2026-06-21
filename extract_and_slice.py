"""Lift the THOY mower character off its scene background and slice it into
body + two legs so the legs can be animated as a walk cycle.

Requires: pillow, scipy, numpy.  Run from the repo root:  python3 extract_and_slice.py
"""
from PIL import Image
import numpy as np
from scipy import ndimage

src = Image.open('public/assets/hero-mower.png').convert('RGBA')
a = np.array(src).astype(int)
R, G, B = a[:, :, 0], a[:, :, 1], a[:, :, 2]
mx = a[:, :, :3].max(2); mn = a[:, :, :3].min(2)
H, W = R.shape
rows = np.arange(H)[:, None] * np.ones((1, W))
cols = np.ones((H, 1)) * np.arange(W)

white = (mn > 226)
green = (G > R + 10) & (G > B + 8)
neutral = (mx - mn < 30) & (mx >= 105) & (mx <= 222)

# sky = white connected to the image border (keeps interior whites: socks, hubs)
lblw, nw = ndimage.label(white)
bdr = set(np.unique(lblw[0])) | set(np.unique(lblw[-1])) | set(np.unique(lblw[:, 0])) | set(np.unique(lblw[:, -1]))
bdr.discard(0)
sky = np.isin(lblw, list(bdr))

# Pass 1: rough figure to anchor the feet-bottom row
rough = ~(green | sky)
rl, rn = ndimage.label(rough)
rs = ndimage.sum(np.ones_like(rl), rl, index=range(1, rn + 1))
rough = (rl == (np.argmax(rs) + 1))
fb = int(np.where(rough.any(1))[0].max())   # bottom of the figure/mower

# Pass 2: remove scenery grays, but protect the (gray) sneakers near the feet
sneaker = (rows >= fb - 50) & (cols >= 255)
bg = green | sky | (neutral & ~sneaker)
fg = ~bg
lbl, n = ndimage.label(fg)
sizes = ndimage.sum(np.ones_like(lbl), lbl, index=range(1, n + 1))
char = (lbl == (np.argmax(sizes) + 1))

# punch the enclosed handle A-frame gaps (big, upper interior white pockets)
for i in range(1, nw + 1):
    if i in bdr:
        continue
    comp = (lblw == i)
    if comp.sum() >= 600 and rows[comp].mean() < fb - 90:
        char &= ~comp

# recover interior holes that belong to the figure: wheels/sneaker detail (low) or tiny
filled = ndimage.binary_fill_holes(char)
holes = filled & ~char
hl, hn = ndimage.label(holes)
hs = ndimage.sum(np.ones_like(hl), hl, index=range(1, hn + 1))
for i in range(1, hn + 1):
    comp = (hl == i)
    if hs[i - 1] < 300 or rows[comp].mean() > fb - 44:
        char |= comp

char = ndimage.binary_closing(char, structure=np.ones((3, 3)))
cl, cn = ndimage.label(char)
cs = ndimage.sum(np.ones_like(cl), cl, index=range(1, cn + 1))
char = (cl == (np.argmax(cs) + 1))

# remove the illustration's soft ground-shadow band just above the shoes
band = char & (mx - mn < 48) & (mx >= 180) & (mx <= 240) & (np.abs(R - B) < 24) \
    & (rows >= fb - 76) & (rows <= fb - 50) & (cols >= 232) & ~sneaker
char &= ~band

# keep the main blob plus any sneaker blobs the band-cut may have detached
cl, cn = ndimage.label(char)
cs = ndimage.sum(np.ones_like(cl), cl, index=range(1, cn + 1))
keep = (cl == (np.argmax(cs) + 1))
for i in range(1, cn + 1):
    comp = (cl == i)
    if cs[i - 1] >= 120 and rows[comp].mean() > fb - 46:
        keep |= comp
char = keep

# crop to the figure
ys, xs = np.where(char)
x0, y0, x1, y1 = xs.min(), ys.min(), xs.max() + 1, ys.max() + 1
arr = a.astype(np.uint8).copy()
arr[:, :, 3] = np.where(char, 255, 0).astype(np.uint8)
arr = arr[y0:y1, x0:x1]

# keep only the figure (largest blob) plus any large detached piece (e.g. a shoe);
# this clears all the small stray specks left by the scene background
op = arr[:, :, 3] > 30
l2, k2 = ndimage.label(op)
s2 = ndimage.sum(np.ones_like(l2), l2, index=range(1, k2 + 1))
main = int(np.argmax(s2) + 1)
for i in range(1, k2 + 1):
    if i != main and s2[i - 1] < 350:
        arr[l2 == i, 3] = 0

Image.fromarray(arr, 'RGBA').save('assets/character.png')
ch, cw = arr.shape[0], arr.shape[1]

# ---- slice into body + two legs (crop coordinates) ----
op = arr[:, :, 3] > 30
rr = np.arange(ch)[:, None] * np.ones((1, cw))
cc = np.ones((ch, 1)) * np.arange(cw)
LEG_TOP = 232      # just below the shorts hem
BODY_KEEP = 250    # body shorts overlap the leg tops to hide the seam
CROTCH = 320       # split between the two legs
LEG_LEFT = 250     # right of the mower

leg_area = op & (rr >= LEG_TOP) & (cc >= LEG_LEFT)
front = leg_area & (cc < CROTCH)
back = leg_area & (cc >= CROTCH)

def clean(m):
    l, k = ndimage.label(m)
    if k == 0:
        return m
    sz = ndimage.sum(np.ones_like(l), l, index=range(1, k + 1))
    out = np.zeros_like(m)
    for i, s in enumerate(sz):
        if s >= 60:
            out |= (l == (i + 1))
    return out

front, back = clean(front), clean(back)
body = op.copy()
body[(rr >= BODY_KEEP) & (cc >= LEG_LEFT)] = False

def save(mask, name):
    out = np.zeros_like(arr)
    out[mask] = arr[mask]
    Image.fromarray(out, 'RGBA').save(name)

save(body, 'assets/char-body.png')
save(front, 'assets/char-leg-front.png')
save(back, 'assets/char-leg-back.png')

fx = cc[front & (rr < LEG_TOP + 12)].mean()
bx = cc[back & (rr < LEG_TOP + 12)].mean()
print(f"canvas {cw}x{ch}  feet-bottom(full)={fb}")
print(f"front-origin: {100*fx/cw:.1f}% {100*LEG_TOP/ch:.1f}%")
print(f"back-origin:  {100*bx/cw:.1f}% {100*LEG_TOP/ch:.1f}%")

# recomposed sanity preview
base = Image.new('RGBA', (cw, ch), (70, 158, 82, 255))
for n_ in ['assets/char-leg-back.png', 'assets/char-leg-front.png', 'assets/char-body.png']:
    base.alpha_composite(Image.open(n_))
base.convert('RGB').save('dbg-recomposed.png')
