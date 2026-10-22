"""Build the static Indonesia map (public/media/map/indonesia.svg) for the homepage showroom section.

Source: Natural Earth 1:10m country polygons via world-atlas@2.0.2 (public domain).
Usage: python3 scripts/build-map.py countries-10m.json public/media/map/indonesia.svg

Projection (must match components/home/ShowroomMap.tsx):
  x = (lon - 94) * 100 ;  y = (merc(7) - merc(lat)) * 100 * 180 / pi
"""
import json, math, sys

src, out = sys.argv[1], sys.argv[2]
LON0, LAT_TOP, U = 94.0, 7.0, 100.0
CROP = (94.6, 6.4, 126.8, -11.2)  # west, north, east, south: Sumatra to Sulawesi and Flores
TOL = 2.5  # map units; the map renders ~700 px across ~3,200 units, so this is well under a pixel
merc = lambda lat: math.log(math.tan(math.pi / 4 + math.radians(lat) / 2))
def proj(lon, lat): return ((lon - LON0) * U, (merc(LAT_TOP) - merc(lat)) * U * 180 / math.pi)

t = json.load(open(src))
sx, sy = t['transform']['scale']; tx, ty = t['transform']['translate']
arcs = []
for a in t['arcs']:
    x = y = 0; pts = []
    for dx, dy in a:
        x += dx; y += dy; pts.append((x * sx + tx, y * sy + ty))
    arcs.append(pts)
def arc(i): return arcs[i] if i >= 0 else arcs[~i][::-1]
def ring(idx):
    pts = []
    for i in idx:
        a = arc(i); pts.extend(a if not pts else a[1:])
    return pts

def dp(pts, eps):
    if len(pts) < 3: return pts
    keep = [False] * len(pts); keep[0] = keep[-1] = True; stack = [(0, len(pts) - 1)]
    while stack:
        s, e = stack.pop(); (x1, y1), (x2, y2) = pts[s], pts[e]; dx, dy = x2 - x1, y2 - y1; L = math.hypot(dx, dy) or 1e-9
        best, bi = -1, -1
        for i in range(s + 1, e):
            px, py = pts[i]; d = abs(dy * px - dx * py + x2 * y1 - y2 * x1) / L
            if d > best: best, bi = d, i
        if best > eps: keep[bi] = True; stack += [(s, bi), (bi, e)]
    return [p for p, k in zip(pts, keep) if k]

def area(p): return abs(sum(p[i][0] * p[i - 1][1] - p[i - 1][0] * p[i][1] for i in range(len(p)))) / 2

x0, y0 = proj(CROP[0], CROP[1]); x1, y1 = proj(CROP[2], CROP[3])
parts = []
g = next(g for g in t['objects']['countries']['geometries'] if g['properties']['name'] == 'Indonesia')
for poly in g['arcs']:
    for r in poly:
        pts = [proj(lon, lat) for lon, lat in ring(r)]
        xs = [p[0] for p in pts]; ys = [p[1] for p in pts]
        if max(xs) < x0 or min(xs) > x1 or max(ys) < y0 or min(ys) > y1: continue
        if area(pts) < 40: continue  # islets too small to read at this scale
        m = max(range(len(pts)), key=lambda i: (pts[i][0] - pts[0][0]) ** 2 + (pts[i][1] - pts[0][1]) ** 2)
        s = dp(pts[: m + 1], TOL)[:-1] + dp(pts[m:], TOL)
        if len(s) < 3: continue
        parts.append('M' + 'L'.join(f'{x - x0:.0f},{y - y0:.0f}' for x, y in s) + 'Z')

W, H = x1 - x0, y1 - y0
svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W:.0f} {H:.0f}" width="{W:.0f}" height="{H:.0f}">'
       f'<!-- Indonesia, Natural Earth 1:10m (public domain). Crop {CROP}, projection lon0={LON0} latTop={LAT_TOP} u={U} -->'
       f'<path fill="#e6e1d8" d="{"".join(parts)}"/></svg>')
open(out, 'w').write(svg)
import os
print(f'viewBox {W:.1f} x {H:.1f} (offset {x0:.1f},{y0:.1f}), {len(parts)} shapes, {os.path.getsize(out)/1024:.1f} KB')
