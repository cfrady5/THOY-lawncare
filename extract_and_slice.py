"""Lift the THOY mower character off its scene background and slice it into
body + two legs so the legs can be animated as a walk cycle."""
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
neutral = (mx - mn < 32) & (mx <= 224) & (mx >= 105)

# sky = white connected to the image border (keeps interior whites like sneakers)
lblw, nw = ndimage.label(white)
bdr = set(np.unique(lblw[0])) | set(np.unique(lblw[-1])) | set(np.unique(lblw[:, 0])) | set(np.unique(lblw[:, -1]))
bdr.discard(0)
sky = np.isin(lblw, list(bdr))

# remove scenery grays in the lower zone, but protect the shoes (low + right of mower)
neutral_low = neutral & (rows > 262) & ~((rows > 306) & (cols > 250))
# a light-gray shadow/bush band crosses behind the ankles (too light for `neutral`)
gray_band = (mx - mn < 36) & (mx >= 110) & (mx <= 247) & (rows >= 268) & (rows <= 306) & (cols >= 236)
# the illustration's soft ground-shadow under the feet — a wide dim band just above
# the shoes. Drop desaturated dim pixels there, but keep skin and the bright socks.
foot_shadow = (rows >= 290) & (rows <= 312) & (cols >= 236) & ((R - B) <= 22) & (mx - mn < 55) & (mn <= 224)

bg = sky | green | neutral_low | gray_band | foot_shadow
fg = ~bg
lbl, n = ndimage.label(fg)
sizes = ndimage.sum(np.ones_like(lbl), lbl, index=range(1, n + 1))
char = (lbl == (np.argmax(sizes) + 1))

# punch out big UPPER interior white pockets (the handle A-frame gaps + trapped bg),
# keep the LOW ones (sneakers)
for i in range(1, nw + 1):
    if i in bdr:
        continue
    comp = (lblw == i); s = comp.sum()
    if s >= 300 and rows[comp].mean() < 315:
        char &= ~comp

char = ndimage.binary_closing(char, structure=np.ones((3, 3)))
cl, cn = ndimage.label(char)
cs = ndimage.sum(np.ones_like(cl), cl, index=range(1, cn + 1))
char = (cl == (np.argmax(cs) + 1))
# re-attach low sneaker pockets
for i in range(1, nw + 1):
    if i in bdr:
        continue
    comp = (lblw == i)
    if comp.sum() >= 120 and rows[comp].mean() >= 315:
        char |= comp
char = ndimage.binary_erosion(char, iterations=1)

# crop to the character
ys, xs = np.where(char)
x0, y0, x1, y1 = xs.min(), ys.min(), xs.max() + 1, ys.max() + 1
arr = a.astype(np.uint8).copy()
arr[:, :, 3] = np.where(char, 255, 0).astype(np.uint8)
arr = arr[y0:y1, x0:x1]
op = arr[:, :, 3] > 30
ch, cw = op.shape
Image.fromarray(arr, 'RGBA').save('assets/character.png')

# ---- slice into body + two legs (coords are within the crop) ----
rr = np.arange(ch)[:, None] * np.ones((1, cw))
cc = np.ones((ch, 1)) * np.arange(cw)
LEG_TOP = 228       # just below the shorts hem
BODY_KEEP = 250     # body shorts overlap the leg tops to hide the seam
CROTCH = 318        # split between the two legs
LEG_LEFT = 236      # right of the mower

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
    out = np.zeros_like(arr); out[mask] = arr[mask]
    Image.fromarray(out, 'RGBA').save(name)

save(body, 'assets/char-body.png')
save(front, 'assets/char-leg-front.png')
save(back, 'assets/char-leg-back.png')

fx = cc[front & (rr < LEG_TOP + 12)].mean()
bx = cc[back & (rr < LEG_TOP + 12)].mean()
print(f"canvas {cw}x{ch}")
print(f"front-origin: {100*fx/cw:.1f}% {100*LEG_TOP/ch:.1f}%")
print(f"back-origin:  {100*bx/cw:.1f}% {100*LEG_TOP/ch:.1f}%")

# recomposed sanity preview
base = Image.new('RGBA', (cw, ch), (60, 150, 72, 255))
for n_ in ['assets/char-leg-back.png', 'assets/char-leg-front.png', 'assets/char-body.png']:
    base.alpha_composite(Image.open(n_))
base.convert('RGB').save('preview-recomposed.png')
