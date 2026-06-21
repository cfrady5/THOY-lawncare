"""Animated walk SVG: reuse the static traced base (upper body + mower, no
boiling) and cycle the REAL per-frame leg motion underneath the static shorts.
Pure SVG + CSS visibility steps -> animates in every browser, transparent."""
import re, numpy as np
import imageio.v3 as iio
from scipy import ndimage
from skimage import measure
from PIL import Image

MP4 = "assets/character-walk-source.mp4"
NFRAMES = 12
DUR = 1.1            # seconds per loop
LOWER_Y = 585        # everything below this is the animated lower body (legs/feet)

# ---- helpers (shared with build_svg) ----
def matte(a, LO=8, HI=20):
    b = ndimage.median_filter(a.max(2).astype(np.float32), size=3)
    al = np.clip((b-LO)/(HI-LO),0,1); solid=al>0.4
    lbl,n=ndimage.label(solid)
    if n:
        s=ndimage.sum(np.ones_like(lbl),lbl,index=range(1,n+1)); big=int(np.argmax(s))+1
        al[~ndimage.binary_dilation(lbl==big,iterations=6)]=0
    A=np.clip(al,1e-3,1)[...,None]; rgb=np.clip(a/A,0,255)
    ae=ndimage.gaussian_filter(ndimage.grey_erosion(al,size=3),0.7)
    return rgb, ae

def poly_area(c):
    x=c[:,0]; y=c[:,1]; return 0.5*abs(np.dot(x,np.roll(y,1))-np.dot(y,np.roll(x,1)))
def catmull(pts):
    P=[(float(x),float(y)) for x,y in pts]; n=len(P)
    if n<3: return ""
    d=f"M{P[0][0]:.1f} {P[0][1]:.1f}"
    for i in range(n):
        p0=P[(i-1)%n]; p1=P[i]; p2=P[(i+1)%n]; p3=P[(i+2)%n]
        c1=(p1[0]+(p2[0]-p0[0])/6,p1[1]+(p2[1]-p0[1])/6)
        c2=(p2[0]-(p3[0]-p1[0])/6,p2[1]-(p3[1]-p1[1])/6)
        d+=f"C{c1[0]:.1f} {c1[1]:.1f} {c2[0]:.1f} {c2[1]:.1f} {p2[0]:.1f} {p2[1]:.1f}"
    return d+"Z"
def clean(m,minpx=120):
    lbl,n=ndimage.label(m); out=np.zeros_like(m)
    for c in range(1,n+1):
        s=(lbl==c)
        if s.sum()>=minpx: out|=s
    return out
def trace_d(mask,tol=2.2,minarea=180,smooth=0.6):
    mask=clean(mask)
    if smooth: mask=ndimage.binary_closing(mask,iterations=1)
    m=ndimage.gaussian_filter(np.pad(mask.astype(float),1),smooth); ds=[]
    for c in measure.find_contours(m,0.5):
        if poly_area(c)<minarea or len(c)<8: continue
        c=measure.approximate_polygon(c,tol)
        if len(c)<4: continue
        ds.append(catmull(np.stack([c[:,1]-1,c[:,0]-1],1)))
    return " ".join(ds)

# ---- classify lower body of a frame into legs / socks / shoes ----
cents=np.array([(246,179,145),(227,226,225),(40,39,38),(199,31,27),(163,93,54),(91,37,12)])
def lower_layers(rgb, al):
    H,W=al.shape; A=al>110
    yy,xx=np.mgrid[0:H,0:W]
    d=((rgb[:,:,None,:]-cents[None,None,:,:])**2).sum(3); cls=np.argmin(d,2)
    skin=(cls==0)&A; light=(cls==1)&A
    region = (yy>=LOWER_Y)&(xx>=950)
    legs = skin & region
    foot = light & region
    luma = rgb.mean(2)
    socks= foot & (luma>=232)
    shoes= foot & (luma<232)
    legcol="#f4b194"
    out=[]
    out.append((trace_d(legs), legcol, ""))
    lsh = legs & (luma < (np.median(luma[legs]) if legs.any() else 0)*0.9)
    out.append((trace_d(lsh,tol=2.5,minarea=300), "#d98c63", 'opacity="0.5"'))
    out.append((trace_d(shoes), "#dfe2e1", ""))
    out.append((trace_d(socks), "#f3f4f3", ""))
    return out

# ---- build per-frame leg groups ----
frames=[np.asarray(f)[:,:,:3].astype(np.float32) for f in iio.imiter(MP4)]
idxs=[round(i*(len(frames)-1)/NFRAMES) for i in range(NFRAMES)]
frame_groups=[]
for k,fi in enumerate(idxs):
    rgb,al=matte(frames[fi])
    im=Image.fromarray(np.dstack([rgb,al*255]).astype(np.uint8),'RGBA').resize((1920,1080),Image.LANCZOS)
    arr=np.asarray(im).astype(np.int16)
    layers=lower_layers(arr[:,:,:3], arr[:,:,3])
    paths="".join(f'<path d="{d}" fill="{f}" {e}/>' for d,f,e in layers if d)
    frame_groups.append(f'<g class="f">{paths}</g>')
    print("frame",k,"of",NFRAMES,"(src",fi,")")

# ---- splice into the static base ----
base=open('lawncare-character.svg').read()
# remove the static lower-body groups
for gid in ['legs','shoes','socks']:
    base=re.sub(rf'  <g id="{gid}">.*?</g>\n', '', base, flags=re.S)
step=100.0/NFRAMES
css=(f'<style>'
     f'#walk .f{{visibility:hidden;animation:walkcyc {DUR}s steps(1) infinite}}'
     f'@keyframes walkcyc{{0%{{visibility:visible}}{step:.4f}%{{visibility:hidden}}100%{{visibility:hidden}}}}'
     + "".join(f'#walk .f:nth-child({i+1}){{animation-delay:{-i*DUR/NFRAMES:.4f}s}}' for i in range(NFRAMES))
     + '@media(prefers-reduced-motion:reduce){#walk .f{animation:none}#walk .f:first-child{visibility:visible}}'
     '</style>')
walk=f'  <g id="walk">{ "".join(frame_groups) }</g>\n'
# insert defs(css) after the opening <svg ...> and walk group before <g id="shorts">
base=base.replace('>\n', '>\n  <defs>'+css+'</defs>\n', 1)
base=base.replace('  <g id="shorts">', walk+'  <g id="shorts">', 1)
open('lawncare-walk.svg','w').write(base)
print("wrote lawncare-walk.svg (%d bytes)"%len(base))
