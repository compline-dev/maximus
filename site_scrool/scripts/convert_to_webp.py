#!/usr/bin/env python3
"""
Convert construction sequence PNG frames to WebP.

Usage (from maximus/):
  pip install Pillow
  python scripts/convert_to_webp.py
"""

from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image

QUALITY = 80
SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parent
INPUT_DIR = PROJECT_ROOT / "public" / "construction-frames_new"
OUTPUT_DIR = PROJECT_ROOT / "public" / "construction-webp"


def convert_frame(src: Path, dst: Path) -> None:
    with Image.open(src) as img:
        img.save(dst, format="WEBP", quality=QUALITY, method=6)


def main() -> int:
    if not INPUT_DIR.is_dir():
        print(f"Input folder not found: {INPUT_DIR}", file=sys.stderr)
        return 1

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    png_files = sorted(INPUT_DIR.glob("*.png"))
    if not png_files:
        print(f"No PNG files in {INPUT_DIR}", file=sys.stderr)
        return 1

    total = len(png_files)
    print(f"Converting {total} PNG frames to WebP (quality={QUALITY})")
    print(f"  from: {INPUT_DIR}")
    print(f"  to:   {OUTPUT_DIR}")

    for i, src in enumerate(png_files, start=1):
        dst = OUTPUT_DIR / f"{src.stem}.webp"
        convert_frame(src, dst)
        if i % 25 == 0 or i == total:
            print(f"  [{i}/{total}] {src.name} -> {dst.name}")

    print("Done.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
