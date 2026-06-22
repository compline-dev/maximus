#!/usr/bin/env python3
"""
Convert photos in a public folder to WebP (same folder).

Requirements:
  pip install Pillow

Usage (from site_scrool/):
  python scripts/convert_people_park_to_webp.py
  python scripts/convert_people_park_to_webp.py public/high_quality_photos
  python scripts/convert_people_park_to_webp.py public/inside_premium_view --quality 90 --delete-source
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

from PIL import Image

DEFAULT_QUALITY = 82
DEFAULT_MAX_WIDTH = 2400
INPUT_EXTS = {".png", ".jpg", ".jpeg", ".bmp", ".tif", ".tiff"}

SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parent
DEFAULT_DIR = PROJECT_ROOT / "public" / "people_walking_park"


def convert_image(src: Path, dst: Path, *, quality: int, max_width: int | None) -> tuple[int, int]:
    with Image.open(src) as img:
        if img.mode not in ("RGB", "RGBA"):
            img = img.convert("RGBA" if "A" in img.getbands() else "RGB")

        if max_width and img.width > max_width:
            ratio = max_width / img.width
            size = (max_width, round(img.height * ratio))
            img = img.resize(size, Image.Resampling.LANCZOS)

        img.save(dst, format="WEBP", quality=quality, method=6)

    return src.stat().st_size, dst.stat().st_size


def resolve_target_dir(arg: str | None) -> Path:
    if not arg:
        return DEFAULT_DIR
    path = Path(arg)
    if not path.is_absolute():
        path = PROJECT_ROOT / path
    return path.resolve()


def main() -> int:
    parser = argparse.ArgumentParser(description="Convert images in a folder to WebP.")
    parser.add_argument(
        "folder",
        nargs="?",
        default=None,
        help="Folder relative to site_scrool/ (default: public/people_walking_park)",
    )
    parser.add_argument(
        "--quality",
        type=int,
        default=DEFAULT_QUALITY,
        help=f"WebP quality 1-100 (default: {DEFAULT_QUALITY})",
    )
    parser.add_argument(
        "--max-width",
        type=int,
        default=DEFAULT_MAX_WIDTH,
        help=f"Max width in px, 0 = no resize (default: {DEFAULT_MAX_WIDTH})",
    )
    parser.add_argument(
        "--delete-source",
        action="store_true",
        help="Remove original image files after successful conversion",
    )
    args = parser.parse_args()
    target_dir = resolve_target_dir(args.folder)
    max_width = None if args.max_width == 0 else args.max_width

    if not target_dir.is_dir():
        print(f"Folder not found: {target_dir}", file=sys.stderr)
        return 1

    sources = sorted(
        p for p in target_dir.iterdir() if p.is_file() and p.suffix.lower() in INPUT_EXTS
    )
    if not sources:
        print(f"No images found in {target_dir}", file=sys.stderr)
        return 1

    resize_note = "no resize" if max_width is None else f"max {max_width}px"
    print(f"Converting {len(sources)} image(s) to WebP (quality={args.quality}, {resize_note})")
    print(f"  folder: {target_dir}")

    saved_total = 0
    deleted = 0
    for i, src in enumerate(sources, start=1):
        dst = target_dir / f"{src.stem}.webp"
        before, after = convert_image(src, dst, quality=args.quality, max_width=max_width)
        saved = before - after
        saved_total += saved
        pct = (saved / before * 100) if before else 0
        print(
            f"  [{i}/{len(sources)}] {src.name} -> {dst.name}  "
            f"({before // 1024} KB -> {after // 1024} KB, -{pct:.0f}%)"
        )
        if args.delete_source:
            src.unlink()
            deleted += 1
            print(f"           deleted {src.name}")

    print(f"Done. Saved ~{saved_total // 1024} KB total.", end="")
    if args.delete_source:
        print(f" Removed {deleted} source file(s).")
    else:
        print()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
