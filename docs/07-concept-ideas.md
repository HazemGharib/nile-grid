# 07 — Concept ideas

Five visual directions were generated so a theme could be chosen before Phase 1. **Nile Neon was selected on 2026-11-27.** The other four sheets are kept for reference.

Each concept is one roster sprite sheet: a hero, two companions, and one enemy, in idle / run / attack poses. Sheets were generated, then run through `scripts/process_sprites.py` (see [03-art-pipeline.md](03-art-pipeline.md)).

These are **style and roster proposals**, not production atlases. Typical AI issues apply to every sheet: foot pivots and silhouettes are not stable enough for a real animation loop, and some cells show the wrong character. Manual cleanup in a pixel editor is required before anything is imported into Phaser.

## File map

For each slug `NN-name`:

| File | What it is |
|------|------------|
| `concepts/raw/NN-name.png` | Unprocessed generation (lossless copy of the original) |
| `concepts/processed/NN-name-grid.png` | 1:1 quantized pixel grid |
| `concepts/NN-name.png` | Nearest-neighbour 8× upscale, for review |

Processed sheets use a **48 px row height** (character bodies land around 32–48 px), a **24-colour** palette, and a locked flat grey background.

## 1. Ashen Crown

- **Slug:** `01-ashen-crown`
- **Genre fit:** side-view action RPG or short co-op dungeon crawl
- **Roster:** knight (hero), indigo mage with an owl, hooded ranger, goblin raider (enemy)
- **Why it fits later multiplayer:** a classic party fantasy is easy to read as co-op (one player per role) or as a small versus brawl in an arena room
- **Processed sheet:** `concepts/01-ashen-crown.png`
- **Caveats:** Row 4, column 3 is a running ranger, not the goblin — that cell is wrong. Run frames of the knight are usable as a sketch; the mage’s owl and the ranger’s cloak shift between poses. Not animation-ready.

## 2. Scrap Protocol

- **Slug:** `02-scrap-protocol`
- **Genre fit:** real-time arena shooter / robot brawl, top-down or side arena
- **Roster:** agile scout bot (hero), heavy treaded tank, hovering medic drone, virus-corrupted mech (enemy)
- **Why it fits later multiplayer:** asymmetric roles (scout, tank, support) map cleanly onto small real-time rooms, and an arena mode is a natural first Colyseus match type
- **Processed sheet:** `concepts/02-scrap-protocol.png`
- **Caveats:** Row 2, column 3 replaces the tank with a scout-like body on treads. Row 4, column 2 is a purple-tinted scout, not the corrupted mech. The tank reads as a bulky stack and would need a cleaner silhouette. Muzzle flashes should become separate VFX, not baked into inconsistent frames.

## 3. Horizon of Ra

- **Slug:** `03-horizon-of-ra`
- **Genre fit:** side-view action-adventure or short campaign through tombs and desert roads
- **Roster:** linen-and-bronze khopesh warrior (hero), ankh-staff priestess, jackal-headed scout, living mummy soldier (enemy)
- **Why it fits later multiplayer:** a distinctive Egyptian-mythology party supports co-op stages (warrior / support / scout) and is visually unique in a sea of generic fantasy
- **Processed sheet:** `concepts/03-horizon-of-ra.png`
- **Caveats:** The most consistent sheet of the five, but still not production animation. The jackal scout switches from dark armour (idle) to a lighter kilt (run). The priestess’s hair is bound in idle frames and loose in the run/attack frames. Faces lost some sharpness in quantization.

## 4. Alley All-Stars

- **Slug:** `04-alley-all-stars`
- **Genre fit:** cute animal beat-’em-up or party arena brawler
- **Roster:** tabby cat boxer (hero), pug wrestler, fox ninja, raccoon with a lid-shield (enemy)
- **Why it fits later multiplayer:** a four-fighter roster is already a local or online versus / co-op brawler, with short mobile sessions and very readable silhouettes
- **Processed sheet:** `concepts/04-alley-all-stars.png`
- **Caveats:** Strongest on-model consistency of the set. Soft “painted” source art became chunky after processing, which is intended, but fur edges and the raccoon jacket still need manual cleanup. A purple contact shadow sits under some frames and should be removed or unified. Sword length and pug proportions drift slightly between poses.

## 5. Nile Neon

- **Slug:** `05-nile-neon`
- **Genre fit:** cyberpunk Cairo beat-’em-up or street-courier action
- **Roster:** street courier with a magenta LED jacket (hero), mechanic with a shoulder drone, graffiti hacker in a teal hoodie and keffiyeh-scarf, corporate security unit (enemy)
- **Why it fits later multiplayer:** a local, contemporary identity; team roles (runner, fixer, hacker) vs. a security faction work as co-op chases or small versus matches
- **Processed sheet:** `concepts/05-nile-neon.png`
- **Caveats:** The weakest contrast of the five — dark outfits lose detail on a mid-grey ground, especially the mechanic and the security unit. Row 4, column 2 is the mechanic’s body with a helmet, not the security unit. The hacker drops the hood in the attack frame, so the costume is not stable. The magenta jacket stripe and any gold scorpion decal are easy to lose and should be redrawn by hand if this direction is chosen.

## Chosen direction (2026-11-27)

Hazem picked **Nile Neon** (Egyptian cyberpunk), and Egyptian settings in general. The direction is expanded: each level is a real Egyptian governorate map. Ismailia is the first map being designed ([09-ismailia-map.md](09-ismailia-map.md)), not a required first level. The **storyline** is *Nile Grid* ([10-storyline.md](10-storyline.md)): the roster is a crew of couriers, hackers, and mechanics against Horus Corp security. **Approved names:** Nour Hassan (male courier; نور is unisex and the name stays), Adel Mansour (male mechanic), Laila Farouk (female hacker, the only girl) ([12-characters.md](12-characters.md)). Production art must draw Nour as a young man; the concept sheet is a style and costume reference only. The contrast caveats on this sheet still apply.

The same day, the **view** was locked to **2D top-down (3/4)**, not isometric. Production character, enemy, and environment art should be drawn for that camera, even though some earlier concept notes (including side-view beat-'em-up or street-courier pitches) described a different angle. The Nile Neon sheet is a style and roster proposal, not a production atlas and not a camera test.

Map scale, chunked loading, the minimap, and client-side cameras are documented in [09-ismailia-map.md](09-ismailia-map.md) and [05-ux-and-loading.md](05-ux-and-loading.md). They do not change which concept was chosen.

## Next

The storyline is written. Phase 1 art should start from the three approved crew members, beginning with the courier (Nour) for the 2D top-down (3/4) view: one idle, a short run cycle, and one attack each, cleaned by hand, enough for Ismailia missions 1–3. Do not import these sheets straight into the game.
