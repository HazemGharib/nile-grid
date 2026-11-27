# 02 — Tech stack

Decided for the first implementation. Alternatives are noted only where a later swap is likely.

## Game client

| Piece | Choice | Why |
|-------|--------|-----|
| Engine | [Phaser 3](https://phaser.io/) | Mature 2D API, sprite/atlas/animation support, touch input, large examples, works as a plain web app. |
| Language | TypeScript | Same language as the planned Colyseus server. Safer refactors as multiplayer appears. |
| Bundler / dev server | Vite | Fast local loop, simple PWA plugin options, easy GitHub Pages / Vercel deploy. |
| Target | Mobile-first PWA | No APK required. Installable from the browser. Offline play for the single-player slice. |
| View | **2D top-down (3/4)**, not isometric | Cleaner, more consistent AI pixel art; simpler Phaser + Tiled orthogonal maps (collision, pathing, depth sorting); lighter on phones and easier to sync in multiplayer. Decided 2026-11-27. |
| Map editor | [Tiled](https://www.mapeditor.org/) (orthogonal) | Landmark coordinates map 1:1 onto an orthogonal tile map. |

### View, camera, and maps

- **Camera:** implemented on the **client**, **independently for each player**, and follows **only that player's own character**. Other players never drive this camera.
- **Map tile size:** **16 px** (decided for Ismailia; see [09-ismailia-map.md](09-ismailia-map.md)).
- **Character sprites:** **24×32 px** (24 wide, 32 tall), about 1.5 × 2 tiles. Dialogue portraits: **64×64 px**. See [03-art-pipeline.md](03-art-pipeline.md).
- **Streaming:** the Ismailia map is large (~1500 × ~800 tiles, ~24 000 × 12 800 px at 16 px/tile). Split the Tiled map into **chunks** and **load/unload chunks around the player**. Do not hold the whole map in memory at once.
- **Minimap:** required, so the player can orient themselves on a map this size.
- Runtime camera and tile scaling use **nearest-neighbour only**. Phaser should use `pixelArt: true` (and rounded pixels / no mip-maps).

### PWA expectations (phase 1)

- A web app manifest (name, icons, display `standalone`, theme color).
- A service worker that caches the shell, the first stage, and art, so the single-player slice works without a network after the first visit. The full Ismailia map should not be pre-cached as one blob; cache the shell plus nearby / first-slice chunks.
- On-screen touch controls (virtual d-pad or left-side stick + right-side action button). Keyboard input should still work on desktop for development.
- A later multiplayer session may require a network; the app should degrade clearly (“online features need a connection”) rather than hanging.

## Art and tooling

- Concept and first-pass sprites: image generation, then a Python script using **Pillow**.
- Pipeline details: [03-art-pipeline.md](03-art-pipeline.md).
- Production environment and character art are drawn for **2D top-down (3/4)**, not isometric and not a side-view beat-'em-up camera.
- Production character frames are **24×32 px**. Tiles and tiny props can stay on the **16 px** grid. Final display upscales with nearest-neighbour only. Never bilinear-scale pixel art at runtime in a way that blurs it.

## Multiplayer (phase 3, not phase 1)

| Piece | Choice | Why |
|-------|--------|-----|
| Server | [Colyseus](https://colyseus.io/) | Open-source, TypeScript, room model, schema synchronization, official Phaser examples. |
| Transport | WebSockets | Standard for real-time browser games. Works on mobile browsers. |
| Authority | Server-authoritative once multiplayer exists | Clients send inputs; the server confirms positions and hits. Phase 1 can still be client-authoritative. |
| Interest management | Area-of-interest filtering in Colyseus | The server sends positions; each client renders **nearby players only**. Needed because the map is large and cameras are independent. |

WebRTC peer-to-peer was considered for tiny friend groups. It is not the default, because a later “more than a few players / matchmaking” path is easier with a dedicated room server.

## Hosting and source control

- **Code:** GitHub, owner account `HazemGharib`. Work via pull requests.
- **Single-player web build:** GitHub Pages (simplest) or Vercel. Both can be free.
- **Colyseus server:** see [04-multiplayer-and-hosting.md](04-multiplayer-and-hosting.md). Not needed until phase 3.

## Explicitly out of scope for v1

- A custom engine written from scratch.
- Unity / Godot (possible later if a native store build is required; not the PWA path).
- Firebase/Supabase as the real-time game loop (they are fine for later accounts or a turn-based mode, not for this real-time plan).
- Cloudflare Workers as the game server (would mean abandoning Colyseus).
- An isometric camera or an isometric Tiled map.
