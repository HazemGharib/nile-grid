#!/usr/bin/env python3
"""Post-process AI sprite sheets into a true pixel-grid look.

For each raw sheet in concepts/raw/:
  1. Build a background mask from the original corner colour.
  2. Crop empty margin (keep a little padding), same crop on the mask.
  3. Downscale onto a regular pixel grid with box averaging.
     The source is anti-aliased "pixel-ish" art, not already
     grid-aligned, so nearest-neighbour subsample would skip
     pixels; box averaging produces one pixel per source block.
  4. Force background pixels to a single clean grey *before*
     quantization, so the palette is not spent on JPEG grey noise
     and the ground colour cannot pick up a colour cast.
  5. Quantize to a short palette with no dithering.
  6. Re-apply the background so it stays one exact colour.
  7. Save the 1:1 grid PNG and an integer nearest-neighbour upscale
     for display.

Usage:
    python3 scripts/process_sprites.py
    python3 scripts/process_sprites.py --cell 48 --colors 24
"""

from __future__ import annotations

import argparse
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path("/workspace/pixel-game")
RAW_DIR = ROOT / "concepts" / "raw"
GRID_DIR = ROOT / "concepts" / "processed"
DISPLAY_DIR = ROOT / "concepts"

COLS = 4
ROWS = 4
# Distance on the sum of absolute RGB channels. The raw sheets use a
# nearly flat medium grey; keep this tight so dark clothing is not
# eaten into the mask.
BG_THRESHOLD = 16
# A mid-light grey that stays distinct from dark outfits (Nile Neon)
# and from pale linen (Horizon of Ra).
CLEAN_BG = (176, 178, 180)


def bg_color(arr: np.ndarray) -> np.ndarray:
    patches = np.concatenate(
        [
            arr[0:16, 0:16].reshape(-1, 3),
            arr[0:16, -16:].reshape(-1, 3),
            arr[-16:, 0:16].reshape(-1, 3),
            arr[-16:, -16:].reshape(-1, 3),
        ]
    )
    return np.median(patches, axis=0)


def background_mask(arr: np.ndarray, bg: np.ndarray, threshold: int = BG_THRESHOLD) -> np.ndarray:
    diff = np.abs(arr.astype(np.int16) - bg.astype(np.int16)).sum(axis=2)
    return diff <= threshold


def content_bbox(mask: np.ndarray, pad: int) -> tuple[int, int, int, int]:
    ys, xs = np.where(~mask)
    if len(xs) == 0:
        h, w = mask.shape
        return 0, 0, w, h
    left, top, right, bottom = int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1
    h, w = mask.shape
    left = max(0, left - pad)
    top = max(0, top - pad)
    right = min(w, right + pad)
    bottom = min(h, bottom + pad)
    return left, top, right, bottom


def snap_size(width: int, height: int, cell: int) -> tuple[int, int]:
    """Pick a grid size whose rows are `cell` px tall and cols divide evenly."""
    aspect = width / max(height, 1)
    target_h = ROWS * cell
    target_w = int(round(target_h * aspect))
    target_w = max(COLS * (cell // 2), int(round(target_w / COLS) * COLS))
    return target_w, target_h


def downscale_mask(mask_img: Image.Image, size: tuple[int, int]) -> np.ndarray:
    """Box-downscale a 0/255 mask and keep pixels that are mostly background."""
    reduced = mask_img.resize(size, Image.Resampling.BOX)
    arr = np.array(reduced)
    return arr >= 128


def apply_bg(rgb: Image.Image, mask: np.ndarray, color: tuple[int, int, int]) -> Image.Image:
    arr = np.array(rgb)
    arr[mask] = color
    return Image.fromarray(arr, mode="RGB")


def process_one(
    src: Path,
    cell: int,
    colors: int,
    upscale: int,
) -> dict:
    original = Image.open(src).convert("RGB")
    arr = np.array(original)
    bg = bg_color(arr)
    mask = background_mask(arr, bg)

    left, top, right, bottom = content_bbox(mask, pad=32)
    cropped = original.crop((left, top, right, bottom))
    cropped_mask = Image.fromarray((mask[top:bottom, left:right].astype(np.uint8) * 255), mode="L")

    tw, th = snap_size(cropped.width, cropped.height, cell=cell)
    grid = cropped.resize((tw, th), Image.Resampling.BOX)
    mask_small = downscale_mask(cropped_mask, (tw, th))

    # Lock the background before quantization so it cannot pick up a cast
    # from teal lights, gold linen, or JPEG noise.
    grid = apply_bg(grid, mask_small, CLEAN_BG)

    # Reserve one palette slot for the locked background colour.
    quantized = grid.quantize(
        colors=max(2, colors - 1),
        method=Image.Quantize.MAXCOVERAGE,
        dither=Image.Dither.NONE,
    )
    grid_rgb = apply_bg(quantized.convert("RGB"), mask_small, CLEAN_BG)

    palette = grid_rgb.getcolors(maxcolors=256) or []
    n_colors = len(palette)

    GRID_DIR.mkdir(parents=True, exist_ok=True)
    DISPLAY_DIR.mkdir(parents=True, exist_ok=True)
    grid_path = GRID_DIR / f"{src.stem}-grid.png"
    display_path = DISPLAY_DIR / f"{src.stem}.png"

    grid_rgb.save(grid_path)
    display = grid_rgb.resize((tw * upscale, th * upscale), Image.Resampling.NEAREST)
    display.save(display_path)

    return {
        "slug": src.stem,
        "source": f"{original.width}x{original.height}",
        "crop": f"{cropped.width}x{cropped.height}",
        "grid": f"{tw}x{th}",
        "cell": f"{tw // COLS}x{th // ROWS}",
        "colors": n_colors,
        "upscale": upscale,
        "display": f"{display.width}x{display.height}",
        "grid_path": str(grid_path),
        "display_path": str(display_path),
        "bg_fraction": float(mask_small.mean()),
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--cell",
        type=int,
        default=48,
        help="Target row height in pixels. Character bodies land a little under this.",
    )
    parser.add_argument("--colors", type=int, default=24, help="Palette size.")
    parser.add_argument("--upscale", type=int, default=8, help="Nearest-neighbour display scale.")
    args = parser.parse_args()

    sheets = sorted(RAW_DIR.glob("*.png"))
    if not sheets:
        raise SystemExit(f"No raw PNGs in {RAW_DIR}")

    print(
        f"Processing {len(sheets)} sheet(s)  cell={args.cell}  "
        f"colors={args.colors}  upscale={args.upscale}x  bg={CLEAN_BG}"
    )
    for src in sheets:
        info = process_one(src, cell=args.cell, colors=args.colors, upscale=args.upscale)
        print(
            f"  {info['slug']}: {info['source']} -> crop {info['crop']} -> "
            f"grid {info['grid']} (cell {info['cell']}, {info['colors']} colours, "
            f"bg {info['bg_fraction']:.0%}) -> display {info['display']}"
        )
        print(f"    grid:    {info['grid_path']}")
        print(f"    display: {info['display_path']}")


if __name__ == "__main__":
    main()
