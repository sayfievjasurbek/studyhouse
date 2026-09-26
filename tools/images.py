#!/usr/bin/env python3
"""Make responsive versions of the site's photos and wire them into the pages.

For every photo listed below it writes smaller WebP copies next to the original
(photo-480.webp, photo-640.webp, photo-800.webp, photo-1200.webp — only widths smaller than the
original), then rewrites each <img> that uses it with a srcset and a sizes
attribute. A phone then downloads a 480px file instead of a 1600px one.

    pip install pillow
    python3 tools/images.py

Safe to run repeatedly: existing variants are rebuilt only if the source is
newer, and an <img> that already has a srcset is updated, not duplicated.

`sizes` tells the browser how wide the image will be shown BEFORE it downloads
anything, so it can pick a file. Keep each value in step with the CSS for that
class — if a layout changes, change its line in SIZES.

Images built by JavaScript (the Services cards and popups) follow the same file
naming; their srcset lives in services.js.
"""

import glob
import io
import os
import re

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WIDTHS = [480, 640, 800, 1200]
VARIANT_QUALITY = 72        # the resized copies; the originals are left as they are

# How wide each kind of image is displayed, by the class on the <img>.
SIZES = {
    "hero__image": "(max-width: 1024px) 92vw, 560px",
    "dest-card__image": "(max-width: 640px) 78vw, (max-width: 1024px) 40vw, 300px",   # shown cropped to a landscape strip, so a smaller file is enough
    "why__image": "300px",
    "country-hero__image": "100vw",
    "country-overview__image": "(max-width: 1024px) 92vw, 600px",
}

def is_variant(p):
    return re.search(r"-(480|640|800|1200)\.webp$", p) is not None


# Photos to make variants of (paths relative to the project root)
PHOTOS = (
    ["images/dest-europe.webp", "images/dest-usa.webp", "images/dest-australia.webp",
     "images/dest-china.webp", "images/why-building.webp", "images/hero-mascot.webp"]
    + sorted(glob.glob(os.path.join(ROOT, "destinations/europe/*/hero.webp")))
    + sorted(glob.glob(os.path.join(ROOT, "destinations/europe/images/*.webp")))
    + sorted(glob.glob(os.path.join(ROOT, "images/programmes/*-card.webp")))
    + sorted(glob.glob(os.path.join(ROOT, "images/programmes/*-hero.webp")))
)
PHOTOS = [p for p in PHOTOS if not is_variant(p)]


def absolute(p):
    return p if os.path.isabs(p) else os.path.join(ROOT, p)


def variant_path(path, width):
    stem, ext = os.path.splitext(path)
    return "%s-%d%s" % (stem, width, ext)


def convert_hero_jpg():
    """The homepage hero was added as a 344 KB JPG; serve it as WebP."""
    src, dst = absolute("images/hero-mascot.jpg"), absolute("images/hero-mascot.webp")
    if os.path.exists(src) and (not os.path.exists(dst) or os.path.getmtime(src) > os.path.getmtime(dst)):
        Image.open(src).convert("RGB").save(dst, "WEBP", quality=82, method=6)
        print("converted %s -> %s (%d KB)" % ("images/hero-mascot.jpg", "images/hero-mascot.webp", os.path.getsize(dst) // 1024))


def make_variants(path):
    path = absolute(path)
    if not os.path.exists(path):
        return {}
    im = Image.open(path)
    made = {}
    for w in WIDTHS:
        # a variant within 10% of the original's width saves almost nothing
        if w >= im.width * 0.9:
            continue
        out = variant_path(path, w)
        if not os.path.exists(out) or os.path.getmtime(path) > os.path.getmtime(out):
            h = round(im.height * w / im.width)
            im.convert("RGBA" if im.mode in ("RGBA", "LA") else "RGB").resize((w, h), Image.LANCZOS).save(
                out, "WEBP", quality=VARIANT_QUALITY, method=6)
        made[w] = out
    made[im.width] = path
    return made


IMG = re.compile(r"<img\b[^>]*>")


def rewrite_page(page):
    base = os.path.dirname(page)
    text = io.open(page, encoding="utf-8").read()
    changed = 0

    def repl(m):
        nonlocal changed
        tag = m.group(0)
        src = re.search(r'\bsrc="([^"]+)"', tag)
        if not src or src.group(1).startswith(("http:", "https:", "data:")):
            return tag
        ref = src.group(1)
        if ref.endswith("hero-mascot.jpg"):                      # the JPG becomes WebP
            ref = ref[:-4] + ".webp"
            tag = tag.replace(src.group(1), ref)
        cls = re.search(r'\bclass="([^"]*)"', tag)
        classes = cls.group(1).split() if cls else []
        sizes = next((SIZES[c] for c in classes if c in SIZES), None)
        if not sizes:
            return tag
        target = os.path.normpath(os.path.join(base, ref))
        variants = make_variants(target)
        if len(variants) < 2:
            return tag
        rel = os.path.dirname(ref)
        def url(p):
            return (rel + "/" if rel else "") + os.path.basename(p)
        srcset = ", ".join("%s %dw" % (url(p), w) for w, p in sorted(variants.items()))
        tag = re.sub(r'\s(srcset|sizes)="[^"]*"', "", tag)
        tag = tag.replace(' class="', ' srcset="%s" sizes="%s" class="' % (srcset, sizes), 1)
        # dimensions of the original keep the layout from jumping
        w0, h0 = Image.open(target).size
        tag = re.sub(r'\s(width|height)="[^"]*"', "", tag)
        tag = tag.replace(' class="', ' width="%d" height="%d" class="' % (w0, h0), 1)
        changed += 1
        return tag

    out = IMG.sub(repl, text)
    if out != text:
        io.open(page, "w", encoding="utf-8").write(out)
    return changed


if __name__ == "__main__":
    convert_hero_jpg()
    for p in PHOTOS:
        make_variants(p)
    total = 0
    for page in sorted(glob.glob(os.path.join(ROOT, "**", "index.html"), recursive=True)):
        if os.sep + "tools" + os.sep in page or "node_modules" in page:
            continue
        total += rewrite_page(page)
    print("photos processed: %d, <img> tags updated: %d" % (len(PHOTOS), total))
