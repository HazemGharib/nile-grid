# 03 — Art pipeline

The look we want is **real pixel art**: hard edges, a short palette, characters that sit on a grid. Raw AI images almost never come out that way. They look “pixel-ish” (soft edges, uneven pixel sizes, too many colours). Every sheet therefore goes through a fixed post-process, and both the raw and processed files are kept.

## Target look

- Production art is drawn for a **2D top-down (3/4)** camera, not isometric and not a side-scroller camera. That view was decided on 2026-11-27 (see [09-ismailia-map.md](09-ismailia-map.md)).
- **In-game character sprites (decided 2026-11-27):** **24×32 px** (24 wide, 32 tall) on **16 px** map tiles, so a character occupies about **1.5 × 2 tiles**. Frames sit on a regular 24×32 grid, pivot at the feet.
- **Dialogue-box portraits (decided 2026-11-27):** **64×64 px**, with facial expressions. See [13-dialogue.md](13-dialogue.md).
- **Why this size, not 16, 32, or 48+:** 16×16 is too small on a phone to tell the crew apart (Nour’s LED jacket, Adel’s drone Bolbol, Laila’s hoodie). A 32×32 square wastes width in a 2D top-down (3/4) view, where characters are taller than they are wide. 48 px and up multiplies animation work and shows less of the map on screen.
- Map **tiles** remain **16 px**. Concept sheets were processed at a **48 px row height** (bodies around 32–48 px); that is historical concept work, not the production frame size. New production art should be authored at 24×32 (characters) and 64×64 (portraits).
- About **16–24 colours** for a given sheet (plus a locked background colour). The concept run used **24**.
- No anti-aliasing, no blur, no photographic texture.
- A flat, plain background on concept sheets so characters are easy to judge.
- Runtime scale: integer nearest-neighbour only (2×, 3×, 4×, …).

Animation frames of the same character must eventually share a consistent silhouette, pivot (feet), and palette. **AI will not deliver that reliably.** Treat generated run/attack frames as sketches. Shipping animation needs manual cleanup in a pixel editor (Aseprite or equivalent).

## Pipeline steps

1. **Generate** one sprite-sheet concept image (hero + companions/rivals + one enemy, idle / run / attack poses) from a written brief.
2. **Save the raw file** under `concepts/raw/NN-slug.png`. Do not overwrite it.
3. **Post-process** with `scripts/process_sprites.py`:
   - Build a background mask from the original corner colour, then crop empty margin.
   - **Downscale** onto a true pixel grid with **box averaging**. The AI source is anti-aliased “pixel-ish” art, not already grid-aligned, so a nearest-neighbour subsample would skip pixels. Box averaging produces one pixel per source block. Default row height for the concept run is 48 px.
   - Force background pixels to a single clean grey so the palette cannot pick up a colour cast.
   - **Quantize** to ~16–24 colours (Pillow `MAXCOVERAGE`, **no dithering**).
   - Re-apply the locked background, then nearest-neighbour **upscale** (default 8×) for display.
4. **Save the processed file** under `concepts/NN-slug.png`, and a 1:1 pixel-grid version under `concepts/processed/NN-slug-grid.png`.
5. **Visual check** of the processed sheet: edge crispness, palette, whether poses are readable, and whether frames of one character actually match.

## Script

```bash
python3 /workspace/pixel-game/scripts/process_sprites.py
python3 /workspace/pixel-game/scripts/process_sprites.py --cell 48 --colors 24 --upscale 8
```

The script is deterministic. Re-run it after changing cell size, colour count, or crop. Do not hand-edit the processed PNG and then lose the settings; change the script or record overrides in this file.

## What these concept sheets are (and are not)

They are **style and roster proposals**. They are not production sprite atlases.

Typical issues to expect, and to mention when reviewing a sheet:

- Character scale drifting between rows or poses.
- Idle / run / attack frames that do not share a skeleton or foot position.
- Extra colours that survived quantization in anti-aliased hair or glows.
- Merged or poorly separated grid cells.
- AI adding labels, shadows, or floor grids we did not ask for.

None of that blocks choosing a theme. It does block dropping a sheet straight into Phaser.

## File map

```
concepts/raw/NN-slug.png              original generation
concepts/processed/NN-slug-grid.png   1:1 quantized pixel grid
concepts/NN-slug.png                  upscaled processed sheet (for display)
```
