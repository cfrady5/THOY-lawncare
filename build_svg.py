"""Pixel-accurate vector recreation by palette-layered tracing.
Quantize the cleaned reference to its real palette, then trace EACH colour as
its own smooth bezier layer (large areas behind, small details on top). This
reproduces the illustration's actual shading, face and beard from real pixels.
Output: lawncare-character.svg (viewBox 0 0 1920 1080, transparent)."""
import numpy as np, imageio.v3 as iio
from scipy import ndimage
from skimage import measure
from PIL import Image

MP4="assets/character-walk-source.mp4"
FRAME=2
TRACE_W=2560          # trace at high res for detail
VB_W, VB_H = 1920,1080
NCOLORS=26

# --- clean matte of the reference frame ---
frames=[np.asarray(f)[:,:,:3] for f in iio.imiter(MP4)]
a=frames[FRAME].astype(np.float32)
b=ndimage.median_filter(a.max(2),size=3)
al=np.clip((b-8)/12,0,1); solid=al>0.4
lbl,n=ndimage.label(solid); s=ndimage.sum(np.ones_like(lbl),lbl,index=range(1,n+1))
al[~ndimage.binary_dilation(lbl==int(np.argmax(s))+1,iterations=6)]=0
A=np.clip(al,1e-3,1)[...,None]; rgb=np.clip(a/A,0,255)
ae=ndimage.gaussian_filter(ndimage.grey_erosion(al,size=3),0.7)
H0,W0=al.shape
im=Image.fromarray(np.dstack([rgb,ae*255]).astype(np.uint8),'RGBA').resize((TRACE_W,round(H0*TRACE_W/W0)),Image.LANCZOS)
arr=np.asarray(im); H,W=arr.shape[:2]
alpha=arr[:,:,3]>120; R=arr[:,:,:3].astype(np.uint8)
R_orig=R.copy()
sc=VB_W/W

# flatten the soft gradients before quantizing so tone bands are clean regions
R=np.dstack([ndimage.median_filter(R[:,:,c],size=5) for c in range(3)])

# --- quantize character pixels to a compact palette ---
px=R[alpha].reshape(-1,1,3)
q=Image.fromarray(px,'RGB').quantize(colors=NCOLORS,method=Image.MEDIANCUT,dither=Image.NONE)
pal=np.array(q.getpalette()[:NCOLORS*3]).reshape(-1,3).astype(int)
idx=np.full((H,W),-1,int); idx[alpha]=np.array(q).ravel()

# merge near-duplicate palette colours (collapses noisy dark/skin tone bands)
areas=np.array([(idx==i).sum() for i in range(NCOLORS)])
reps=list(range(NCOLORS))
def find(x):
    while reps[x]!=x: x=reps[x]
    return x
T=22
order=list(np.argsort(-areas))
for i in order:
    for j in order:
        if j==i or find(i)==find(j): continue
        if np.linalg.norm(pal[i]-pal[j])<T:
            ri,rj=find(i),find(j)
            if areas[ri]>=areas[rj]: reps[rj]=ri
            else: reps[ri]=rj
root=np.array([find(i) for i in range(NCOLORS)])
newidx=np.full((H,W),-1,int); mk=idx>=0; newidx[mk]=root[idx[mk]]
groups=[]
for u in sorted(set(root.tolist())):
    members=[i for i in range(NCOLORS) if root[i]==u]
    w=areas[members]; col=(pal[members]*w[:,None]).sum(0)/max(1,w.sum())
    groups.append((u, col))
idx=newidx

def hexof(c): return "#%02x%02x%02x"%tuple(int(v) for v in c)
def poly_area(c):
    x=c[:,0]; y=c[:,1]; return 0.5*abs(np.dot(x,np.roll(y,1))-np.dot(y,np.roll(x,1)))
def catmull(pts):
    P=[(x*sc,y*sc) for x,y in pts]; n=len(P)
    if n<3: return ""
    d=f"M{P[0][0]:.1f} {P[0][1]:.1f}"
    for i in range(n):
        p0=P[(i-1)%n]; p1=P[i]; p2=P[(i+1)%n]; p3=P[(i+2)%n]
        c1=(p1[0]+(p2[0]-p0[0])/6,p1[1]+(p2[1]-p0[1])/6)
        c2=(p2[0]-(p3[0]-p1[0])/6,p2[1]-(p3[1]-p1[1])/6)
        d+=f"C{c1[0]:.1f} {c1[1]:.1f} {c2[0]:.1f} {c2[1]:.1f} {p2[0]:.1f} {p2[1]:.1f}"
    return d+"Z"
def trace_mask(mask,tol=2.0,minarea=90,smooth=1.0):
    m=ndimage.gaussian_filter(np.pad(mask.astype(float),1),smooth); ds=[]
    for c in measure.find_contours(m,0.5):
        if poly_area(c)<minarea or len(c)<6: continue
        c=measure.approximate_polygon(c,tol)
        if len(c)<3: continue
        ds.append(catmull(np.stack([c[:,1]-1,c[:,0]-1],1)))
    return " ".join(ds)

# --- per-colour layer, ordered large area -> small (details on top) ---
layers=[]
for i,col in groups:
    m=idx==i
    area=int(m.sum())
    if area<120: continue
    # remove thin scratch noise, then consolidate
    m=ndimage.binary_opening(m,iterations=1)
    m=ndimage.binary_closing(m,iterations=2)
    # drop specks
    lb,k=ndimage.label(m); keep=np.zeros_like(m)
    if k:
        sz=ndimage.sum(np.ones_like(lb),lb,index=range(1,k+1))
        for j,zz in enumerate(sz):
            if zz>=120: keep|=(lb==(j+1))
    m=keep
    if m.sum()<120: continue
    truecol=np.median(R_orig[m],axis=0)          # true colour from the un-blurred art
    layers.append((int(m.sum()), hexof(truecol), m))
layers.sort(key=lambda t:-t[0])

paths=[]
for area,col,m in layers:
    d=trace_mask(m)
    if d: paths.append(f'  <path fill="{col}" d="{d}"/>')

face=('  <g id="face">'
      '<path d="M1183 138 q 11 -5 23 -2" stroke="#43291a" stroke-width="4.5" fill="none" stroke-linecap="round"/>'
      '<ellipse cx="1199" cy="151" rx="5" ry="6.8" fill="#241710"/>'
      '<path d="M1176 150 q -5 7 3 11" stroke="#dd8c64" stroke-width="3" fill="none" stroke-linecap="round"/>'
      '<path d="M1190 176 q 11 6 22 1" stroke="#ffffff" stroke-width="3.6" fill="none" stroke-linecap="round"/>'
      '</g>')
svg=(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {VB_W} {VB_H}" '
     f'width="{VB_W}" height="{VB_H}">\n'+"\n".join(paths)+"\n"+face+"\n</svg>\n")
open('lawncare-character.svg','w').write(svg)
print(f"wrote lawncare-character.svg  {len(svg)} bytes, {len(paths)} colour layers")
