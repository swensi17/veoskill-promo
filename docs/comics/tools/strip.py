# strip.py in.webp out.webp : finds the 3 panels of a Flow comic sheet (light gutters / outer margin) and
# rebuilds it as 3 panels side by side with thin 4px white separators, no outer margin. Prints the boxes.
import sys
from PIL import Image

src, out = sys.argv[1], sys.argv[2]
im = Image.open(src).convert("RGB")
W, H = im.size
g = im.convert("L")
px = g.load()

def col_light(x, y0, y1):
    n = 0
    for y in range(y0, y1, 3):
        if px[x, y] > 225:
            n += 1
    return n / max(1, len(range(y0, y1, 3)))

def row_light(y, x0, x1):
    n = 0
    for x in range(x0, x1, 3):
        if px[x, y] > 225:
            n += 1
    return n / max(1, len(range(x0, x1, 3)))

# vertical gutters: columns that are almost all light
lightcols = [x for x in range(W) if col_light(x, int(H * 0.1), int(H * 0.9)) > 0.93]
# group into runs
runs = []
for x in lightcols:
    if runs and x - runs[-1][1] <= 2:
        runs[-1][1] = x
    else:
        runs.append([x, x])
# interior gutters: runs not touching edges, near 1/3 and 2/3
inner = [r for r in runs if r[0] > W * 0.15 and r[1] < W * 0.85]

def pick(target):
    c = [r for r in inner if abs((r[0] + r[1]) / 2 - target) < W * 0.12]
    return min(c, key=lambda r: abs((r[0] + r[1]) / 2 - target)) if c else None

g1, g2 = pick(W / 3), pick(2 * W / 3)
if not g1 or not g2:
    print("NO_GUTTERS", runs[:12])
    sys.exit(2)
# outer margins
left = next((r[1] + 1 for r in runs if r[0] <= 2), 0)
right = next((r[0] for r in runs if r[1] >= W - 3), W)
rows = [y for y in range(H) if row_light(y, int(W * 0.05), int(W * 0.95)) > 0.93]
top = 0
while top < H * 0.45 and top in rows:
    top += 1
bot = H
while bot > H * 0.55 and (bot - 1) in rows:
    bot -= 1
# trim thin dark panel borders a bit
pad = 7
boxes = [(left + pad, g1[0] - pad), (g1[1] + 1 + pad, g2[0] - pad), (g2[1] + 1 + pad, right - pad)]
top += pad
bot -= pad
h = (bot - top) // 2 * 2
panels = [im.crop((a, top, b, top + h)) for a, b in boxes]
sep = 4
total = sum(p.size[0] for p in panels) + 2 * sep
total -= total % 2
canvas = Image.new("RGB", (total, h), "white")
x = 0
for i, p in enumerate(panels):
    canvas.paste(p, (x, 0))
    x += p.size[0] + sep
canvas.save(out, "WEBP", quality=90)
print("OK", W, H, boxes, top, h, canvas.size)
