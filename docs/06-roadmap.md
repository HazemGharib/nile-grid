# 06 — Development roadmap

The project is at the end of Phase 0 decisions on theme, view, camera, map scale, storyline, gameplay genre, crew, and the first playable slice. Later phases do not begin automatically; they start when the owner names a GitHub repository and asks for implementation. **The immediate next step is to build Ismailia missions 1–3 and wait for Hazem’s review.**

## Phase 0 — Concepts and documentation (current)

- Record every product and infrastructure agreement in English Markdown (this folder).
- Produce five distinct roster sprite-sheet concepts, processed through the art pipeline.
- Theme is chosen (Nile Neon / Egyptian cyberpunk; levels = governorates). Ismailia landmark research and layout are done ([09-ismailia-map.md](09-ismailia-map.md)). Ismailia is the first map **being designed**, not a required first level.
- **View, camera, and map scale are decided (2026-11-27):** 2D top-down (3/4), not isometric; each player's camera is client-side and follows only their own character, with area-of-interest filtering later in Colyseus; Ismailia is ~3.5 m/tile and ~1500 × ~800 tiles (about five minutes to cross at ~5 tiles/s), which supersedes the earlier 20 m/tile proposal. Chunked map loading and a minimap are required.
- **Storyline is chosen (2026-11-27):** *Nile Grid* ([10-storyline.md](10-storyline.md)). Horus Corp; one distinct mission per governorate; **non-linear chapters** (any order); the story is won only when **all** shipped chapters are complete, then a **pixel-art ending cutscene** ([14-ending-cutscene.md](14-ending-cutscene.md)). Ismailia’s *internal* mission order stays west → east ([11-chapter-ismailia.md](11-chapter-ismailia.md)).
- **Gameplay (2026-11-27):** action combined with stealth and puzzle-solving. Crew names are approved; personas and the power matrix are in [12-characters.md](12-characters.md). Dialogue rules and Ismailia samples are in [13-dialogue.md](13-dialogue.md).
- Still needed before Phase 1 code lands on GitHub: a **repository name** under `HazemGharib`. Character sprites are decided at **24×32 px** (portraits 64×64). See [08-open-questions.md](08-open-questions.md).

## Phase 1 — Vertical slice (single-player PWA)

- Scaffold Phaser 3 + TypeScript + Vite + PWA manifest and service worker.
- **First playable build:** Ismailia **missions 1–3** (station / Orabi Square, Hay el-Afrang, de Lesseps House / canal museum / Bridge 3). Hazem reviews this slice before the rest of the chapter is built.
- Touch controls; the three approved crew members available to switch (default spawn: Nour); one enemy type (Horus Corp security); action + stealth + puzzles; a win/lose result for the slice.
- **2D top-down (3/4)** orthogonal Tiled map, with **chunked loading** around the player, a **minimap**, and a client camera that follows the local character.
- Production art starts from the chosen Nile Neon concept, then **manual cleanup** of a small animation set (idle, run, attack) drawn for the top-down view.
- Deploy the static build to GitHub Pages or Vercel.
- Success looks like: the owner can add the game to a phone home screen and play the three-mission loop, including offline.

## Phase 2 — Content and feel

- After review, finish the Ismailia chapter (missions 4–6: Mallaha Park, the Irshad building, the canal mouth), then juice (hit stop, land particles), audio, a title screen.
- Expand the atlas only as needed. Do not grow the roster until the first three characters play well.
- Grow the playable area of Ismailia (more chunks, more landmarks) only as the slice feels good.
- Keep the client structured so a network room can later replace the local simulation, including interest management hooks.
- Other governorate maps can be designed in any order; none is gated on Ismailia being “first.”

## Phase 3 — Real-time multiplayer

- Colyseus server, one room type, small player counts.
- Independent client cameras; the server sends positions; clients render nearby players only (**area-of-interest filtering**).
- Co-op role split (courier / hacker / mechanic) on the Ismailia objectives, as designed in [11-chapter-ismailia.md](11-chapter-ismailia.md) and [12-characters.md](12-characters.md).
- Eager server wake, themed loading screen, automatic reconnect ([05-ux-and-loading.md](05-ux-and-loading.md)).
- First deploy on Render free or a Railway trial; move to a non-sleeping host before inviting a wider audience.

## Later (after the shipped chapters)

- When every shipped governorate chapter is complete, play the pixel-art ending cutscene ([14-ending-cutscene.md](14-ending-cutscene.md)).

## Out of order on purpose

- App-store wrappers, accounts, cosmetics shops, and anti-cheat are not part of Phases 1–3.
- A native APK is optional and only worth discussing after the PWA feels good.

## Immediate next step

After a GitHub repository name is chosen, start the Phase 1 scaffold in a pull request and build **Ismailia missions 1–3**. Stop there for Hazem’s review before continuing the chapter.
