#!/usr/bin/env python3
"""Generate Android launcher icons, adaptive icons and splash for One Post AI.

Pure standard-library PNG writer (zlib + struct) — no PIL required.
Brand: One Post AI — dark gray (#12121a) background, champagne gold (#c9a96e) mark.
Writes into android/ app res layout so `npx cap add android && cap sync` picks them up,
plus a portable copy under assets/native/.
"""
import os, struct, zlib, math

DARK = (18, 18, 26)        # #12121a
GOLD = (201, 169, 110)     # #c9a96e
CREAM = (232, 224, 212)    # #e8e0d4

def png_bytes(size, bg, draw=None):
    """Return a PNG (bytes) of `size`x`size` with `bg` and optional draw fn."""
    w = h = size
    # rows: each row prefixed with filter byte 0
    raw = bytearray()
    for y in range(h):
        raw.append(0)
        for x in range(w):
            c = bg
            if draw:
                c = draw(x, y, w, h)
            raw.extend(c)
    compressed = zlib.compress(bytes(raw), 9)

    def chunk(typ, data):
        out = struct.pack(">I", len(data)) + typ + data
        out += struct.pack(">I", zlib.crc32(typ + data) & 0xffffffff)
        return out

    ihdr = struct.pack(">IIBBBBB", w, h, 8, 2, 0, 0, 0)  # 8-bit RGB (truecolor, opaque)
    return (b"\x89PNG\r\n\x1a\n"
            + chunk(b"IHDR", ihdr)
            + chunk(b"IDAT", compressed)
            + chunk(b"IEND", b""))

def rounded_square_draw(inset_ratio=0.18, radius_ratio=0.22):
    """Return a draw fn that paints a gold rounded square monogram on dark bg."""
    def draw(x, y, w, h):
        half = w / 2.0
        inset = inset_ratio * w
        r = radius_ratio * w
        x0, y0 = inset, inset
        x1, y1 = w - inset, h - inset
        # inside rounded rect => gold, else dark
        cx = min(max(x + 0.5, x0 + r), x1 - r)
        cy = min(max(y + 0.5, y0 + r), y1 - r)
        dx = (x + 0.5) - cx
        dy = (y + 0.5) - cy
        inside = (x0 <= x + 0.5 <= x1 and y0 <= y + 0.5 <= y1
                  and (dx * dx + dy * dy <= r * r
                       or (x0 + r <= x + 0.5 <= x1 - r) or (y0 + r <= y + 0.5 <= y1 - r)))
        return GOLD if inside else DARK
    return draw

def draw_one(draw):  # placeholder for later text rendering
    return draw

def write_png(path, size, draw):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "wb") as f:
        f.write(png_bytes(size, DARK, draw))
    print("wrote", path, size, "px")

BASE = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "android")
RES = os.path.join(BASE, "app", "src", "main", "res")

densities = {
    "mipmap-mdpi": 48,
    "mipmap-hdpi": 72,
    "mipmap-xhdpi": 96,
    "mipmap-xxhdpi": 144,
    "mipmap-xxxhdpi": 192,
}

mono = rounded_square_draw()
for folder, size in densities.items():
    write_png(os.path.join(RES, folder, "ic_launcher.png"), size, mono)
    write_png(os.path.join(RES, folder, "ic_launcher_round.png"), size, mono)

# Adaptive icon foreground (108dp canvas, safe zone ~66dp centered) + background
write_png(os.path.join(RES, "drawable", "ic_launcher_background.png"), 108, None)
write_png(os.path.join(RES, "drawable", "ic_launcher_foreground.png"), 108, rounded_square_draw(inset_ratio=0.24, radius_ratio=0.20))

# Adaptive icon XML for API 26+
anydpi = os.path.join(RES, "mipmap-anydpi-v26")
os.makedirs(anydpi, exist_ok=True)
for name in ("ic_launcher", "ic_launcher_round"):
    with open(os.path.join(anydpi, name + ".xml"), "w") as f:
        f.write('<?xml version="1.0" encoding="utf-8"?>\n'
                '<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">\n'
                '    <background android:drawable="@drawable/ic_launcher_background" />\n'
                '    <foreground android:drawable="@drawable/ic_launcher_foreground" />\n'
                '    <monochrome android:drawable="@drawable/ic_launcher_foreground" />\n'
                '</adaptive-icon>\n')
print("wrote adaptive-icon XMLs")

# Splash screen
write_png(os.path.join(RES, "drawable", "splash.png"), 1024, None)

# colors.xml for splash background
values = os.path.join(RES, "values")
os.makedirs(values, exist_ok=True)
with open(os.path.join(values, "colors.xml"), "w") as f:
    f.write('<?xml version="1.0" encoding="utf-8"?>\n'
            '<resources>\n'
            '    <color name="splash_background">#FF12121A</color>\n'
            '    <color name="ic_launcher_background">#FF12121A</color>\n'
            '</resources>\n')
print("wrote colors.xml")

print("Done. Assets written under", RES)
