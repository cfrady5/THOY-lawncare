"""Trace the cleaned reference character into an organized, smooth-path SVG.
Per-region masks (colour class + spatial rules) -> simplified contours ->
Catmull-Rom smoothed bezier paths, grouped by body part. Not one giant path."""
import numpy as np
from scipy import ndimage
from skimage import measure
from PIL import Image

im = np.asarray(Image.open('/tmp/char_rgba.png').convert('RGBA')).astype(np.int16)
H, W = im.shape[:2]
rgb = im[:, :, :3]
alpha = im[:, :, 3] > 110
yy, xx = np.mgrid[0:H, 0:W]

# colour classes (incl. distinct hair tones so dark hair != shorts-dark)
cents = {
    'skin': (246,179,145), 'light': (227,226,225), 'dark': (40,39,38),
    'red': (199,31,27), 'hairmid': (163,93,54), 'hairdk': (91,37,12),
}
names = list(cents); C = np.array([cents[k] for k in names])
dist = ((rgb[:,:,None,:]-C[None,None,:,:])**2).sum(3)
cls = np.argmin(dist, 2)
ci = {k:i for i,k in enumerate(names)}
def cmask(*ks):
    m = np.zeros((H,W), bool)
    for k in ks: m |= (cls==ci[k])
    return m & alpha

skin  = cmask('skin'); light = cmask('light'); dark = cmask('dark')
red   = cmask('red');  hair_all = cmask('hairmid','hairdk')

# spatial split into named regions
regions = {}
regions['mower_red']    = red
regions['mower_handle'] = dark & (xx < 1130) & (yy < 815)
regions['mower_body']   = dark & (xx < 1130) & (yy >= 815)
regions['shorts']       = dark & (xx >= 1130) & (yy < 800)
regions['shirt']        = light & (yy < 720) & (xx >= 1000)
regions['hub']          = light & (xx < 950) & (yy > 800)         # wheel hubs
foot                    = light & (yy >= 815) & (xx >= 950)
regions['legs']         = skin & (yy >= 590)
regions['arms']         = skin & (yy >= 250) & (yy < 590)
regions['headskin']     = skin & (yy < 255)
regions['hair']         = hair_all & (yy < 160)
regions['beard']        = hair_all & (yy >= 152)

# socks (brighter) vs shoes (greyer) inside the foot mask
luma = rgb.mean(2)
regions['socks'] = foot & (luma >= 232)
regions['shoes'] = foot & (luma < 232)

def clean(m, minpx=120):
    lbl,n = ndimage.label(m); out=np.zeros_like(m)
    for c in range(1,n+1):
        s=(lbl==c)
        if s.sum()>=minpx: out|=s
    return out

def poly_area(c):
    x=c[:,0]; y=c[:,1]; return 0.5*abs(np.dot(x,np.roll(y,1))-np.dot(y,np.roll(x,1)))

def catmull(pts, closed=True):
    P=[(float(x),float(y)) for x,y in pts]; n=len(P)
    if n<3: return ""
    d=f"M{P[0][0]:.1f} {P[0][1]:.1f}"
    rng = range(n) if closed else range(n-1)
    for i in rng:
        p0=P[(i-1)%n]; p1=P[i]; p2=P[(i+1)%n]; p3=P[(i+2)%n]
        c1=(p1[0]+(p2[0]-p0[0])/6,p1[1]+(p2[1]-p0[1])/6)
        c2=(p2[0]-(p3[0]-p1[0])/6,p2[1]-(p3[1]-p1[1])/6)
        d+=f"C{c1[0]:.1f} {c1[1]:.1f} {c2[0]:.1f} {c2[1]:.1f} {p2[0]:.1f} {p2[1]:.1f}"
    return d+("Z" if closed else "")

def trace_d(mask, tol=2.2, minarea=180, smooth=0.6):
    mask = clean(mask)
    if smooth: mask = ndimage.binary_closing(mask, iterations=1)
    m = np.pad(mask.astype(float),1)
    m = ndimage.gaussian_filter(m, smooth)
    ds=[]
    for c in measure.find_contours(m,0.5):
        if poly_area(c)<minarea or len(c)<8: continue
        c = measure.approximate_polygon(c, tol)
        if len(c)<4: continue
        pts = np.stack([c[:,1]-1, c[:,0]-1],1)   # (x,y), undo pad
        ds.append(catmull(pts, True))
    return " ".join(ds)

def rep_color(mask):
    px = rgb[mask]
    if len(px)==0: return (128,128,128)
    return tuple(int(v) for v in np.median(px,0))

def hexof(c): return "#%02x%02x%02x"%tuple(max(0,min(255,int(v))) for v in c)

def shade(c,f): return tuple(int(v*f) for v in c)

# build the SVG
parts=[]
def emit(group_id, *layers):
    s=f'  <g id="{group_id}">\n'
    for d,fill,extra in layers:
        if not d: continue
        s+=f'    <path d="{d}" fill="{fill}" {extra}/>\n'
    s+='  </g>\n'
    parts.append(s)

def region_layers(name, base_extra=""):
    m=clean(regions[name]); col=rep_color(m)
    base=(trace_d(regions[name]), hexof(col), base_extra)
    # shadow = darker pixels within the region
    rl=luma.copy()
    med=np.median(rl[m]) if m.any() else 0
    sh = m & (rl < med*0.9)
    shd=(trace_d(sh, tol=2.5, minarea=300), hexof(shade(col,0.82)), 'opacity="0.55"')
    return base, shd, col

# colours / order (back -> front)
mb,_,_   = region_layers('mower_body')
mh,_,_   = region_layers('mower_handle')
mr,mrs,_ = region_layers('mower_red')
hub_d    = trace_d(regions['hub'])
emit('mower',
     (trace_d(regions['mower_body']), hexof(rep_color(clean(regions['mower_body']))), ''),
     (trace_d(regions['mower_red']),  hexof(rep_color(clean(regions['mower_red']))), ''),
     (trace_d(regions['mower_red'], minarea=300, tol=2.5), '#000000', 'opacity="0"'))
emit('mower-handle', (trace_d(regions['mower_handle']), hexof(rep_color(clean(regions['mower_handle']))), ''))
emit('mower-wheels', (hub_d, '#cfd2d0', ''))

# legs (split into back/front by x): back leg is further (right/larger x), front nearer
legm=clean(regions['legs']); lbl,n=ndimage.label(legm)
legcomps=sorted([(np.where(lbl==c)[1].mean(),(lbl==c)) for c in range(1,n+1) if (lbl==c).sum()>500])
legcol=hexof(rep_color(legm))
leg_layers=[]
for cx,mm in legcomps:
    leg_layers.append((trace_d(mm), legcol, ''))
# leg shadow
lsh = legm & (luma < np.median(luma[legm])*0.9)
leg_layers.append((trace_d(lsh,tol=2.5,minarea=300), hexof(shade(rep_color(legm),0.8)),'opacity="0.5"'))
emit('legs', *leg_layers)

# shoes + socks
footm=clean(foot); shoem=clean(regions['shoes']); sockm=clean(regions['socks'])
emit('shoes',
     (trace_d(regions['shoes']), '#dfe2e1', ''),
     (trace_d(regions['shoes'], tol=2.5, minarea=300), '#ffffff', 'opacity="0"'))
emit('socks', (trace_d(regions['socks']), '#f3f4f3', ''))

b,s,_=region_layers('shorts')
emit('shorts', b, s)
b,s,_=region_layers('shirt')
emit('torso-shirt', b, s)
b,s,_=region_layers('arms')
emit('arms', b, s)
b,s,_=region_layers('headskin')
emit('head', b)
b,s,_=region_layers('beard')
emit('beard', b)
b,s,_=region_layers('hair')
emit('hair', b, s)

# simple face features placed within head bbox
hm=clean(regions['headskin']); ys,xs=np.where(hm)
if len(xs):
    # fixed coords mapped from the reference (he faces left; features small)
    brow='<path d="M1184 137 q 11 -5 22 -2" stroke="#4a2f1d" stroke-width="4.5" fill="none" stroke-linecap="round"/>'
    eye ='<ellipse cx="1198" cy="150" rx="5.2" ry="7" fill="#22150d"/>'
    nose='<path d="M1176 150 q -5 7 3 11" stroke="#e0936c" stroke-width="3.5" fill="none" stroke-linecap="round"/>'
    smile='<path d="M1189 177 q 11 7 22 1" stroke="#ffffff" stroke-width="4" fill="none" stroke-linecap="round"/>'
    parts.append(f'  <g id="face">\n    {brow}\n    {eye}\n    {nose}\n    {smile}\n  </g>\n')

svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" '
       f'width="{W}" height="{H}" fill-rule="evenodd">\n' + "".join(parts) + '</svg>\n')
open('lawncare-character.svg','w').write(svg)
print("wrote lawncare-character.svg  (%d bytes)" % len(svg))
print("groups:", [p.split('id="')[1].split('"')[0] for p in parts])
