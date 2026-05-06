#!/usr/bin/env python3
"""
Regenerate PWA / Apple touch / favicon PNGs from the symbol-only source.
Tight trim, centered composition, calm wellness background.
"""
from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "public" / "brand" / "sesh-icon.png"
OUT_DIR = ROOT / "public" / "pwa"
BRAND = ROOT / "public" / "brand"

# Match SVG viewBox padding: rounded rect starts at (6,6) in 128×128 artwork.
SVG_INSET_RATIO = 6 / 128

# Symbol fills this fraction of the output square (after SVG crop). Larger = bolder on home screen.
FILL_ANY = 0.86
# Maskable: keep important content inside iOS/Android safe zone (~66% circle).
FILL_MASKABLE = 0.60

# Soft square background (matches SVG iconBg / app shell greens)
BG_TOP = (230, 246, 238)
BG_BOTTOM = (215, 240, 227)


def _lerp(a: int, b: int, t: float) -> int:
    return int(a + (b - a) * t)


def make_square_canvas(size: int) -> Image.Image:
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    for y in range(size):
        t = y / max(size - 1, 1)
        r = _lerp(BG_TOP[0], BG_BOTTOM[0], t)
        g = _lerp(BG_TOP[1], BG_BOTTOM[1], t)
        b = _lerp(BG_TOP[2], BG_BOTTOM[2], t)
        draw.line([(0, y), (size, y)], fill=(r, g, b, 255))
    return img


def trim_symbol(src: Image.Image) -> Image.Image:
    """Crop to non-transparent bounds (helps if source uses transparency)."""
    if src.mode != "RGBA":
        src = src.convert("RGBA")
    alpha = src.split()[-1]
    bbox = alpha.getbbox()
    if not bbox:
        return src
    return src.crop(bbox)


def crop_svg_padding(src: Image.Image) -> Image.Image:
    """Remove outer padding consistent with `sesh-icon.svg` (6px margin in 128 space)."""
    w, h = src.size
    inset = max(1, int(round(min(w, h) * SVG_INSET_RATIO)))
    return src.crop((inset, inset, w - inset, h - inset))


def compose(size: int, fill_ratio: float) -> Image.Image:
    src = Image.open(SRC).convert("RGBA")
    sym = crop_svg_padding(src)
    sym = trim_symbol(sym)
    cw, ch = sym.size
    target = int(size * fill_ratio)
    scale = target / max(cw, ch)
    nw = max(1, int(round(cw * scale)))
    nh = max(1, int(round(ch * scale)))
    sym = sym.resize((nw, nh), Image.Resampling.LANCZOS)

    canvas = make_square_canvas(size)
    x = (size - nw) // 2
    y = (size - nh) // 2
    canvas.alpha_composite(sym, (x, y))
    return canvas


def save_png(img: Image.Image, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    base = Image.new("RGBA", img.size, (*BG_TOP, 255))
    flat = Image.alpha_composite(base, img.convert("RGBA")).convert("RGB")
    flat.save(path, format="PNG", optimize=True)


def main() -> None:
    if not SRC.is_file():
        raise SystemExit(f"Missing source icon: {SRC}")

    pairs = [
        (192, FILL_ANY, OUT_DIR / "icon-192.png"),
        (512, FILL_ANY, OUT_DIR / "icon-512.png"),
        (192, FILL_MASKABLE, OUT_DIR / "icon-maskable-192.png"),
        (512, FILL_MASKABLE, OUT_DIR / "icon-maskable-512.png"),
        (180, FILL_ANY, BRAND / "sesh-icon-180.png"),
        (64, FILL_ANY, ROOT / "public" / "favicon.png"),
        (32, FILL_ANY, ROOT / "public" / "favicon-32.png"),
    ]

    for size, fill, out in pairs:
        img = compose(size, fill)
        save_png(img, out)
        print(f"Wrote {out.relative_to(ROOT)} ({size}px, fill={fill})")


if __name__ == "__main__":
    main()
