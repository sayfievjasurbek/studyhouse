#!/usr/bin/env python3
"""Stamp every local stylesheet and script with a version taken from its contents.

Browsers keep a stylesheet or script they already have and do not ask again for
a while, so after an edit visitors can keep seeing the old version. Adding
?v=<hash> to the address makes the browser treat a changed file as a new one:

    <link rel="stylesheet" href="../styles.css?v=3f9a1c2e">

The hash is computed from the file, so it only changes when the file does.
Run it after editing any CSS or JS file, from the project root:

    python3 tools/stamp.py

It is safe to run repeatedly, and it leaves external URLs (Google Fonts) alone.
"""

import hashlib
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# href="..." on a stylesheet, src="..." on a script; any existing ?v=... is replaced
REF = re.compile(r'(<link[^>]*?href|<script[^>]*?src)="([^"?#]+\.(?:css|js))(?:\?v=[0-9a-f]+)?"')


def pages():
    for dirpath, dirnames, filenames in os.walk(ROOT):
        dirnames[:] = [d for d in dirnames if d not in (".git", "tools", "images", "data")]
        for name in filenames:
            if name.endswith(".html") and not name.startswith("_"):
                yield os.path.join(dirpath, name)


def digest(path):
    with open(path, "rb") as f:
        return hashlib.sha1(f.read()).hexdigest()[:8]


def stamp(page):
    base = os.path.dirname(page)
    text = open(page, encoding="utf-8").read()
    changed = 0

    def repl(m):
        nonlocal changed
        ref = m.group(2)
        if ref.startswith(("http:", "https:", "//")):
            return m.group(0)
        target = os.path.normpath(os.path.join(base, ref))
        if not os.path.isfile(target):
            print("  missing: %s (in %s)" % (ref, os.path.relpath(page, ROOT)))
            return m.group(0)
        new = '%s="%s?v=%s"' % (m.group(1), ref, digest(target))
        if new != m.group(0):
            changed += 1
        return new

    out = REF.sub(repl, text)
    if out != text:
        open(page, "w", encoding="utf-8").write(out)
    return changed


if __name__ == "__main__":
    total = 0
    files = list(pages())
    for page in files:
        total += stamp(page)
    print("%d pages checked, %d references updated" % (len(files), total))
