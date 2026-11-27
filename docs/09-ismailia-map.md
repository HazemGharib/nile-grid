# 09 — Ismailia map

The phrase **Level-1 box** below is the name of this chapter’s geographic extent in the research files. It is **not** a play-order label: chapters are non-linear, and Ismailia is not a required first level ([10-storyline.md](10-storyline.md)).

**Status:** research + layout done, two style mockups made. **View, camera, and map scale were decided on 2026-11-27.** The existing `layout.png` and the 20 m / 10 m tile columns below were built under the earlier scale proposal and need a rebuild before production.

## Decisions so far

- **Theme:** Egyptian cyberpunk, based on the *Nile Neon* concept (`concepts/05-nile-neon.png`).
- **Level structure:** each level is a map of one Egyptian governorate. More governorates are added as the game grows.
- **First map being designed:** Ismailia (الإسماعيلية). Not a required first level; chapters are non-linear ([10-storyline.md](10-storyline.md)).
- **View (2026-11-27):** **2D top-down (3/4)**, not isometric. Reasons are in the section below.
- **Camera (2026-11-27):** each player's camera is **client-side and independent**, and follows **only their own character**. The server sends positions; clients render nearby players only (Colyseus area-of-interest filtering). See [04-multiplayer-and-hosting.md](04-multiplayer-and-hosting.md) and [05-ux-and-loading.md](05-ux-and-loading.md).
- **Map scale (2026-11-27):** about **5 minutes** to walk the map west–east at normal speed, which is **~3.5 m per tile** and **~1500 × ~800 tiles**. This **supersedes** the earlier 20 m/tile compressed-map proposal. Details are in [Projection and scale](#projection-and-scale).
- **Map rule (from Hazem):** the map must follow **real geography**. Landmarks keep their real positions relative to each other (e.g. the Suez Canal Authority building sits on Lake Timsah, *not* next to the railway station). Each map starts from a list of landmarks matched to real coordinates, and the tile map is built on top of that. Landmark positions stay on those real coordinates at the new scale; empty blocks are **not** compressed.
- **Building rule:** landmark buildings must look close to their real appearance, using online reference photos (see `maps/ismailia/refs/`). Cyberpunk is layered on top (neon, holograms, signage, lighting) without changing the silhouette.

## Files

| Path | What |
|------|------|
| `maps/ismailia/landmarks.json` | Landmarks: lat/lon, source, metres from origin, tile coords at the **superseded** 20 m and 10 m scales. Rebuild at ~3.5 m/tile before making the Tiled map. |
| `maps/ismailia/features.geojson` | OSM geometry for the core area: lake, coastline, Sweet-Water canal, Suez Canal, railway, main roads, parks, stadiums, buildings in the waterfront zone |
| `maps/ismailia/layout.png` | Schematic of the whole Level-1 box with numbered landmarks and a tile grid, generated at the **superseded 20 m/tile** scale. Needs a rebuild. |
| `maps/ismailia/layout-mockup-zone.png` | Zoom on the waterfront zone used for the mockups |
| `maps/ismailia/refs/` | Reference photos (Wikimedia Commons) + `SOURCES.json` (licence/author) + `README.md` (visual notes) |
| `maps/ismailia/mockups/` | Style mockups: `ismailia-2d-topdown.png`, `ismailia-isometric.png` (pixel-snapped), `*-1x.png` (1:1 grid), `raw-*.jpg` (AI originals) |
| `maps/ismailia/raw/` | Raw Overpass / Wikivoyage dumps used to build the above |
| `scripts/build_ismailia_layout.py` | Rebuilds `landmarks.json`, `features.geojson`, both layout PNGs |
| `scripts/pixelize.py` | Snaps an AI image onto a real pixel grid (box downscale, optional octree quantize, nearest upscale) |

## Sources

- **OpenStreetMap** via Overpass API (mirror `maps.mail.ru`; `overpass-api.de` was overloaded). © OpenStreetMap contributors, **ODbL** — attribution is required if any derived map ships in the game.
- **Wikidata** coordinates (P625) for items that have them.
- **German Wikivoyage, "Ismailia"** — its listings carry surveyed coordinates for de Lesseps House, Mallaha Park, squares, churches, the sailing club, etc. Used where OSM has no named object.
- **Wikimedia Commons** for photos (licences per file in `refs/SOURCES.json`).

## Projection and scale

- **Origin:** Abdel Moneim Riad Square (30.59193, 32.28185), between the old town and the waterfront.
- **Projection:** local equirectangular (`x = Δlon · 111320 · cos(lat0)`, `y = −Δlat · 110574`). Error at city scale is well under 1 %. Axes match Phaser: **x = east, y = south**.
- **Tile size:** 16 px.
- **Level-1 box:** lat 30.578–30.6035, lon 32.262–32.316 → about **5.2 km west–east × 2.8 km north–south**. West edge = railway station / old town; east edge = Suez Canal; north = Ismailia Stadium; south = Lake Timsah.

### Decided scale (2026-11-27)

Crossing the Level-1 map **west to east** should take about **5 minutes** at normal move speed.

- Design speed: **~5 tiles/s** = **80 px/s** with 16 px tiles.
- 5 minutes × 5 tiles/s = **~1500 tiles** wide.
- 5.2 km ÷ 1500 tiles ≈ **3.47 m per tile**, recorded as **~3.5 m per tile**.
- North–south: 2.8 km ÷ ~3.5 m ≈ **~800 tiles**.
- Map size: **~1500 × ~800 tiles**, or **~24 000 × 12 800 px** at 16 px/tile.
- This is **close to real scale**.

This **supersedes** the earlier 20 m/tile proposal (and the idea of compressing empty housing blocks to shorten the walk). Landmarks stay on **real coordinates**, so their order, direction, and distance ratios stay true. How large each landmark sprite is drawn on those coordinates is an art question and is not decided; sprite size must not be used to move a landmark.

Off-box landmarks (El-Ferdan bridge, and others outside the Level-1 box) remain separate zones or later maps.

### Implications

- **Chunked map loading/streaming:** split the Tiled map into chunks and load (and unload) chunks near the player. A 1500 × 800 layer is too large to keep fully in memory on a phone. See [05-ux-and-loading.md](05-ux-and-loading.md).
- **Minimap:** required, so players can orient themselves and find landmarks on a map this large.
- **Client camera:** follows only the local character (see above). Combined with chunk streaming, the phone only draws a window of the city, not the whole map.
- **Rebuild before production:** `landmarks.json`, `layout.png`, and the tile columns in the table below still use the **20 m and 10 m** scales. Recalculate tile coordinates at ~3.5 m/tile (from the metre-from-origin values, which remain valid) before building the Tiled map.

### Earlier proposals (superseded)

Kept for history only. Do not use these sizes for the Tiled map.

| Scale option | m / tile | Level size (tiles) | Level size (px @16) | Notes |
|---|---|---|---|---|
| Compressed | 20 | 259 × 141 | 4144 × 2256 | Former recommendation. Faster to walk; empty blocks were to be squeezed. **Superseded.** |
| Detailed | 10 | 517 × 282 | 8272 × 4512 | Former “bigger, slower” option. **Superseded.** |
| Strict real scale | ~1–2 | thousands | — | Was marked impractical on mobile. The decided ~3.5 m/tile scale is close to real and is handled with chunked loading instead. |
| **Decided** | **~3.5** | **~1500 × ~800** | **~24 000 × 12 800** | ~5 minutes west–east at ~5 tiles/s. |

## Landmarks

Metre offsets from the origin remain the source of truth. **Tile coords in this table are at the superseded 20 m and 10 m scales**, relative to the north-west corner of the Level-1 box. Recompute them at ~3.5 m/tile before placing tiles.

| # | Landmark | Lat, Lon | Source | m from origin (x E, y S) | Tile @20 m (superseded) | Tile @10 m (superseded) | In L1 box | Where it sits |
|---|---|---|---|---|---|---|---|---|
| 1 | Suez Canal Authority - Ships' Guidance (Irshad) Building (مبنى الإرشاد - هيئة قناة السويس) | 30.58852, 32.28231 | [OSM way 97205818 + Wikivoyage(de)](https://www.openstreetmap.org/way/97205818) | 44, 377 | 97, 83 | 195, 166 | yes | hero landmark on Lake Timsah north shore |
| 2 | Lake Timsah (centre) (بحيرة التمساح) | 30.57778, 32.28889 | [Wikidata Q1724581 / OSM relation 5809452](https://www.wikidata.org/wiki/Q1724581) | 675, 1565 | 129, 142 | 258, 284 | no | big water body south/south-east of town |
| 3 | Suez Canal at Nemra 6 ferry (قناة السويس - معدية نمرة 6) | 30.59016, 32.30936 | [Wikivoyage(de) marker 'Autofähre Nimra Sitta'](https://de.wikivoyage.org/wiki/Ismailia) | 2636, 196 | 227, 74 | 454, 148 | yes | eastern edge of the map |
| 4 | El-Forsan island (Mercure hotel) (جزيرة الفرسان) | 30.58582, 32.28802 | [Wikivoyage(de) + Wikidata Q111857805](https://www.wikidata.org/wiki/Q111857805) | 591, 676 | 125, 98 | 249, 195 | yes | peninsula pushing into the lake, south-east of the Irshad building |
| 5 | El-Forsan beach (Tolip hotel) (شاطئ الفرسان) | 30.58435, 32.29410 | [OSM way 745998248 (natural=beach)](https://www.openstreetmap.org/way/745998248) | 1174, 838 | 154, 106 | 308, 212 | yes | lake beach east of Forsan |
| 6 | Mallaha Park (حديقة الملاحة) | 30.59124, 32.28357 | [Wikivoyage(de) marker](https://de.wikivoyage.org/wiki/Ismailia) | 165, 76 | 103, 68 | 207, 136 | yes | garden right behind (north of) the Irshad building |
| 7 | Ismailia (Archaeological) Museum (متحف الإسماعيلية) | 30.59299, 32.28364 | [OSM way 429911116 + Wikivoyage(de)](https://www.openstreetmap.org/way/429911116) | 172, -117 | 104, 58 | 207, 116 | yes | north edge of Mallaha park, Museum St. |
| 8 | Abdel Moneim Riad Square (war memorial) (ميدان عبد المنعم رياض) | 30.59193, 32.28185 | [Wikivoyage(de) marker](https://de.wikivoyage.org/wiki/Ismailia) | 0, 0 | 95, 64 | 190, 128 | yes | map origin; between old town and waterfront |
| 9 | Ferdinand de Lesseps House (بيت ديليسبس) | 30.58948, 32.27234 | [Wikivoyage(de) marker](https://de.wikivoyage.org/wiki/Ismailia) | -911, 271 | 50, 78 | 99, 155 | yes | on Salah Salem St (old Mohamed Ali quay), south of the old town, north of the Sweet-Water canal |
| 10 | SCA 'new' administration building (1920s, Paul Albert) (مبنى إدارة هيئة القناة القديم) | 30.58960, 32.27272 | [Wikivoyage(de) marker](https://de.wikivoyage.org/wiki/Ismailia) | -875, 258 | 51, 77 | 103, 154 | yes | right next to de Lesseps House |
| 11 | Suez Canal Museum (متحف قناة السويس) | 30.59017, 32.27325 | [Wikidata Q137799678 / OSM way 690921437](https://www.wikidata.org/wiki/Q137799678) | -824, 195 | 54, 74 | 108, 147 | yes | just north of de Lesseps House |
| 12 | SCA Historical Exhibition (المعرض التاريخي لقناة السويس) | 30.58622, 32.27257 | [OSM way 690921438](https://www.openstreetmap.org/way/690921438) | -889, 631 | 51, 96 | 101, 191 | yes | south of the Sweet-Water canal, near the lake shore |
| 13 | Sailing Club (lake shore) (نادي الشراع) | 30.58519, 32.27222 | [Wikivoyage(de) marker](https://de.wikivoyage.org/wiki/Ismailia) | -923, 745 | 49, 101 | 98, 202 | yes | western lake shore / beach strip |
| 14 | Sweet-Water (Ismailia) Canal at Bridge 3 (ترعة الإسماعيلية (كوبري 3)) | 30.58910, 32.27440 | [OSM way 'Bridge 3' + Ismailia Canal ways](https://www.openstreetmap.org/way/28621716) | -714, 313 | 59, 80 | 119, 159 | yes | east-west canal separating the old town from the lake-side strip |
| 15 | Abu Bakr el-Siddiq Mosque (مسجد أبو بكر الصديق) | 30.59230, 32.27271 | [OSM way 473969623 + Wikivoyage(de)](https://www.openstreetmap.org/way/473969623) | -876, -41 | 51, 62 | 103, 124 | yes | old European quarter, 2 blocks east of the station |
| 16 | St. Mark Cathedral (كاتدرائية مارمرقس) | 30.59142, 32.27146 | [Wikivoyage(de) / Commons category coords](https://de.wikivoyage.org/wiki/Ismailia) | -996, 56 | 45, 67 | 91, 134 | yes | old European quarter, south-east of the station |
| 17 | Gumhuriya Square (ex Place Champollion) (ميدان الجمهورية) | 30.59162, 32.27330 | [Wikivoyage(de) marker](https://de.wikivoyage.org/wiki/Ismailia) | -819, 34 | 54, 66 | 108, 131 | yes | heart of the old European quarter (Hay el-Afrang) |
| 18 | Mustafa Kamel Square (ex Place Leibnitz) (ميدان مصطفى كامل) | 30.59320, 32.27859 | [Wikivoyage(de) marker](https://de.wikivoyage.org/wiki/Ismailia) | -312, -140 | 79, 57 | 159, 114 | yes | centre of the old Greek quarter |
| 19 | Ismailia Railway Station (محطة قطار الإسماعيلية) | 30.59337, 32.27008 | [Wikidata Q135113619 / OSM way 97203257](https://www.wikidata.org/wiki/Q135113619) | -1128, -159 | 39, 56 | 77, 112 | yes | far west of the core; railway line splits old town (south) from new town (north) |
| 20 | Orabi Square (station forecourt) (ميدان عرابي) | 30.59265, 32.27035 | [Wikivoyage(de) marker](https://de.wikivoyage.org/wiki/Ismailia) | -1102, -80 | 40, 60 | 80, 120 | yes | in front of the station |
| 21 | Al-Ismaily Mosque (المسجد الإسماعيلي) | 30.59672, 32.27120 | [OSM way 97203275](https://www.openstreetmap.org/way/97203275) | -1021, -530 | 44, 37 | 88, 75 | yes | north of the railway |
| 22 | Ismailia Stadium (Ismaily SC) (ستاد الإسماعيلية) | 30.60194, 32.27389 | [Wikidata Q779930 / OSM way 97203203](https://www.wikidata.org/wiki/Q779930) | -763, -1107 | 57, 9 | 114, 17 | yes | north of the railway, ~1 km north of the station |
| 23 | Suez Canal Authority Stadium (ستاد هيئة قناة السويس) | 30.59270, 32.29250 | [Wikidata Q4118765 / OSM way 664459703](https://www.wikidata.org/wiki/Q4118765) | 1021, -85 | 146, 60 | 292, 119 | yes | east of Mallaha park, towards the canal |
| 24 | Battle of Ismailia (1973) Memorial (نصب معركة الإسماعيلية) | 30.58155, 32.31034 | [Wikivoyage(de/en) marker](https://de.wikivoyage.org/wiki/Ismailia) | 2730, 1148 | 232, 121 | 463, 243 | yes | on the canal bank south-east, where lake meets canal |
| 25 | El-Ferdan Railway Swing Bridge (off-map) (كوبري الفردان) | 30.65714, 32.33396 | [Wikivoyage(de) marker / Wikidata Q610013](https://www.wikidata.org/wiki/Q610013) | 4993, -7211 | 345, -297 | 690, -593 | no | ~8 km north-north-east of the core - separate zone / later map |

## Relative layout (sanity checks)

Distances from the SCA Irshad (Guidance) building, straight line:

- **Mallaha Park:** ~320 m **north** (across the Sweet-Water canal).
- **Ismailia Museum:** ~510 m north (north edge of Mallaha Park).
- **El-Forsan island / Mercure:** ~620 m south-east, on the lake.
- **El-Forsan beach:** ~1.2 km east along the lake shore.
- **De Lesseps House / Suez Canal Museum:** ~960 m **west**.
- **SCA Historical Exhibition:** ~970 m west, on the lake side of the Sweet-Water canal.
- **Railway station:** ~1.3 km **north-west**. The station is *not* near the SCA building, as Hazem said.
- **SCA Stadium:** ~1.1 km north-east.
- **Suez Canal (Nemra 6 ferry):** ~2.6 km east.
- **Battle of Ismailia memorial:** ~2.8 km east (canal bank, where lake meets canal).
- **El-Ferdan swing bridge:** ~9 km north-east, outside Level 1.

Other key facts:

- The **railway** runs roughly west–east across the north of the core. **South** of it is the old colonial town (Hay el-Afrang: European quarter around Gumhuriya Sq., Greek quarter around Mustafa Kamel Sq.). **North** of it is the modern town (Ismailia Stadium, Al-Ismaily mosque).
- The **Sweet-Water (Ismailia) Canal** runs west→east along Salah Salem St. (old Mohamed Ali Quay), south of the old town, then bends around the SCA Irshad building and continues east towards the Suez Canal. It has green 19th-century lift bridges.
- **Lake Timsah** forms the whole southern edge; its north-west shore has harbour piers / clubs (Sailing Club); its north-east shore is El-Forsan with hotels and a beach.
- The **Suez Canal** is the eastern edge, running north–south; the lake opens into it.

## Visual references

Detailed notes are in [`maps/ismailia/refs/README.md`](../maps/ismailia/refs/README.md). Short version:

- **SCA Irshad (Guidance) building:** long white modernist ~9-storey slab, dense grid of horizontal sun-shade louvres, taller tower at the west end with a round glass control cab, antennas and a floodlight mast; a row of small vaults along the roof edge. Hero landmark of the level.
- **De Lesseps House (1862):** two-storey cream chalet with dark-green wooden half-timbering, gables and balcony, among tall palms, white railing fence.
- **SCA 1920s admin building:** cubic, green-brown-and-white facade, balconies, flat roof with balustrade.
- **Suez Canal Museum:** long mustard-yellow colonial block with a white arcade (round arches) around a paved courtyard.
- **Quay villas (1907):** two-storey villas, terracotta hipped roofs, cream walls, green wooden wrap-around verandas.
- **Railway station:** low beige Arab-revival building with an arched entrance and a fountain in Orabi Square.
- **Abu Bakr mosque:** white, twin tall minarets, central dome.
- **St. Mark church:** ochre-brick Romanesque church with a square bell tower.
- **Ismailia Museum:** small cream/yellow neoclassical pavilion with columns, in a garden.
- **Mallaha Park:** dense casuarina / eucalyptus woodland with lawns and low fences.
- **Suez Canal stadium / Ismailia stadium:** blue seating (SCA), yellow-blue seating (Ismaily).

## Mockups (style test only)

Both mockups show the **same zone** (Sweet-Water canal waterfront → SCA Irshad building → Lake Timsah → El-Forsan), with the reference layout and photos given to the image model.

- `mockups/ismailia-2d-topdown.png` — 2D top-down with a 3/4 tilt (second attempt; the first, `raw-topdown-v1-rejected.jpg`, put the canal south of the Irshad building, which is wrong).
- `mockups/ismailia-isometric.png` — isometric.

What matches the real layout in both: lake to the south, Irshad building on the north shore at the centre, Sweet-Water canal north/east of it, Mallaha Park to the north-east (with the SCA stadium beyond it in the 2D one), colonial villas to the west, railway in the north-west, Forsan beach to the south-east.

Known gaps (AI-imagined): distances are squeezed; the 2D one is still more oblique than a real top-down camera and adds an extra canal branch at the top; harbour piers, boats, the islet shape, most small houses and all neon signs are invented; Arabic text on signs is not reliable. Building shapes are close in spirit, not exact.

## 2D top-down vs isometric

**Decision (2026-11-27): 2D top-down (3/4 view).** Isometric was considered and rejected. The isometric mockup is kept for reference only.

Reasons (unchanged from the earlier recommendation):

- AI pixel art is cleaner and more consistent in top-down; isometric needs every character in 4–8 diagonal directions at an exact angle.
- Phaser + Tiled orthogonal maps are simpler (collision, pathing, depth sorting).
- Clearer touch controls and lighter on phones; easier multiplayer sync.
- The landmark grid in `landmarks.json` maps 1:1 to an orthogonal Tiled map. Isometric needs an extra projection step and makes the "real map" harder to read for players.

Isometric can look richer in a still image but would roughly double art effort.

## Next steps

1. The storyline is written (*Nile Grid*); the full Ismailia mission is in [11-chapter-ismailia.md](11-chapter-ismailia.md).
2. The first playable slice is **missions 1–3** (railway station / Orabi Square → Hay el-Afrang → the quay and the Sweet-Water Canal crossing). The full chapter spine still runs on to Mallaha Park, the Irshad building, and the canal mouth after review. Tile windows must be computed at ~3.5 m/tile (an older sketch at 20 m/tile, roughly x 35–130, y 50–105, is historical only).
3. Rebuild `landmarks.json` and `layout.png` at ~3.5 m/tile.
4. Build a **chunked** Tiled map using `features.geojson` as an underlay (roads, water, parks), then hand-place landmark set pieces on their real coordinates.
5. Add a **minimap**.
6. Draw each landmark sprite from its reference photos, for the 2D top-down (3/4) view, then neon pass.
7. Add OSM attribution to the game credits.
