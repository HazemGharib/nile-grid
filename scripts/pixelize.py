#!/usr/bin/env python3
"""Snap an AI 'pixel-ish' image onto a true pixel grid: box-downscale, quantize (no dither), nearest upscale."""
import sys
from PIL import Image
src, dst = sys.argv[1], sys.argv[2]
block = int(sys.argv[3]) if len(sys.argv) > 3 else 3
colors = int(sys.argv[4]) if len(sys.argv) > 4 else 64
im = Image.open(src).convert("RGB")
w, h = im.size[0] // block, im.size[1] // block
small = im.resize((w, h), Image.BOX)
if colors > 0:  # FASTOCTREE keeps rare saturated neon colours better than MEDIANCUT
    small = small.quantize(colors=colors, method=Image.Quantize.FASTOCTREE, dither=Image.Dither.NONE).convert("RGB")
small.save(dst.replace(".png", "-1x.png"))
small.resize((w * block * 2, h * block * 2), Image.NEAREST).save(dst)
print(dst, small.size)
