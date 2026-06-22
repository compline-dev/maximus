#!/usr/bin/env python3
"""
Batch-optimize background videos for the Home page.

Requirements:
  - ffmpeg on PATH (https://ffmpeg.org/download.html)
  - pip not required (stdlib only)

Usage (from maximus/):
  python scripts/optimize_videos.py

Outputs:
  public/video-optimized/<slug>.mp4  (H.264, max 1080p, no audio)
  public/video-optimized/<slug>.webm (VP9, max 1080p, no audio)
"""

from __future__ import annotations

import re
import shutil
import subprocess
import sys
import unicodedata
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parent
INPUT_DIR = PROJECT_ROOT / "public" / "video"
OUTPUT_DIR = PROJECT_ROOT / "public" / "video-optimized"

# Safe kebab-case slugs for every source file (Cyrillic / spaces renamed).
SLUG_BY_FILENAME: dict[str, str] = {
    "hero-building.mp4": "hero-building",
    "approach-sunset.mp4": "approach-sunset",
    "смена дня и ночи жк.mp4": "day-night-facade",
    "hf_20260528_112004_06bb68cb-ed26-4215-8332-1c96c3d92c99.mp4": "banner-tour",
    "hf_20260528_110650_c6021416-2d00-43db-b6f9-9ae0b2120bfd.mp4": "facade-day-alt",
    "maximus-interior.mp4": "maximus-interior",
    "приблежение к жк на фоне заката.mp4": "approach-dusk-wide",
    "ты_сделал_видео_как_здание_раз (online-video-cutter.com).mp4": "building-reveal",
}

SCALE_FILTER = "scale=-2:1080"


def slugify(name: str) -> str:
    stem = Path(name).stem.lower()
    normalized = unicodedata.normalize("NFKD", stem)
    ascii_text = normalized.encode("ascii", "ignore").decode("ascii")
    slug = re.sub(r"[^a-z0-9]+", "-", ascii_text).strip("-")
    return slug or "video"


def resolve_slug(filename: str) -> str:
    if filename in SLUG_BY_FILENAME:
        return SLUG_BY_FILENAME[filename]
    return slugify(filename)


def run_ffmpeg(args: list[str]) -> None:
    cmd = ["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", *args]
    subprocess.run(cmd, check=True)


def encode_mp4(src: Path, dst: Path) -> None:
    run_ffmpeg(
        [
            "-i",
            str(src),
            "-an",
            "-vf",
            SCALE_FILTER,
            "-c:v",
            "libx264",
            "-crf",
            "28",
            "-preset",
            "slow",
            "-movflags",
            "+faststart",
            str(dst),
        ]
    )


def encode_webm(src: Path, dst: Path) -> None:
    run_ffmpeg(
        [
            "-i",
            str(src),
            "-an",
            "-vf",
            SCALE_FILTER,
            "-c:v",
            "libvpx-vp9",
            "-crf",
            "32",
            "-b:v",
            "0",
            str(dst),
        ]
    )


def human_mb(path: Path) -> str:
    return f"{path.stat().st_size / (1024 * 1024):.2f} MB"


def main() -> int:
    if shutil.which("ffmpeg") is None:
        print("ffmpeg not found. Install from https://ffmpeg.org/download.html", file=sys.stderr)
        return 1

    if not INPUT_DIR.is_dir():
        print(f"Input folder not found: {INPUT_DIR}", file=sys.stderr)
        return 1

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    sources = sorted(INPUT_DIR.glob("*.mp4"))
    if not sources:
        print(f"No .mp4 files in {INPUT_DIR}", file=sys.stderr)
        return 1

    print(f"Optimizing {len(sources)} videos")
    print(f"  from: {INPUT_DIR}")
    print(f"  to:   {OUTPUT_DIR}\n")

    manifest: list[tuple[str, str, str, str]] = []

    for i, src in enumerate(sources, start=1):
        slug = resolve_slug(src.name)
        mp4_out = OUTPUT_DIR / f"{slug}.mp4"
        webm_out = OUTPUT_DIR / f"{slug}.webm"

        print(f"[{i}/{len(sources)}] {src.name}")
        print(f"  slug: {slug}")

        encode_mp4(src, mp4_out)
        print(f"  mp4:  {human_mb(mp4_out)}")

        encode_webm(src, webm_out)
        print(f"  webm: {human_mb(webm_out)}")

        manifest.append((src.name, slug, f"/video-optimized/{slug}.mp4", f"/video-optimized/{slug}.webm"))

    print("\n--- React paths (used on Home) ---")
    lookup = {slug: (mp4, webm) for _, slug, mp4, webm in manifest}
    for key, slug in [
        ("HERO_VIDEO", "hero-building"),
        ("DUAL_VIDEO_LEFT", "day-night-facade"),
        ("DUAL_VIDEO_RIGHT", "approach-sunset"),
        ("BANNER_VIDEO", "banner-tour"),
    ]:
        if slug in lookup:
            mp4, webm = lookup[slug]
            print(f"  {key}: mp4={mp4} webm={webm}")

    print("\nDone.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
