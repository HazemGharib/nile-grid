# 08 — Open questions

These items are **not decided**. Do not assume an answer in code or art until they are.

Resolved on 2026-11-27 and removed from this list (see the decisions log in [README.md](../README.md), [10-storyline.md](10-storyline.md), and [12-characters.md](12-characters.md)):

- **View:** 2D top-down (3/4), not isometric.
- **Camera:** client-side and independent, following only the local character; nearby players only (Colyseus area-of-interest filtering).
- **Map scale:** ~5 minutes to cross at ~5 tiles/s (80 px/s with 16 px tiles) → ~1500 tiles wide → **~3.5 m/tile** and **~1500 × ~800 tiles** for Ismailia. This supersedes the earlier 20 m/tile proposal. Chunked loading and a minimap are required; landmarks stay on real coordinates.
- **Storyline:** *Nile Grid*. Horus Corp, distinct missions per governorate. See [10-storyline.md](10-storyline.md) and [11-chapter-ismailia.md](11-chapter-ismailia.md).
- **Chapter play order:** **non-linear.** Players may play any shipped governorate in any order. Ismailia is being designed first but is not necessarily the first level. Ismailia’s *internal* mission order remains west → east.
- **Win condition:** the story is won only when **all** shipped governorate chapters are complete, then a **pixel-art ending cutscene** ([14-ending-cutscene.md](14-ending-cutscene.md)).
- **Gameplay genre:** action combined with stealth and puzzle-solving.
- **Crew names and gender:** **Nour Hassan** (courier, male; نور is unisex and the name stays), **Adel Mansour** (mechanic + drone, male), **Laila Farouk** (hacker, the only girl). Personas and power matrix: [12-characters.md](12-characters.md). Stats were not changed when Nour’s gender was corrected.
- **First playable slice:** Ismailia missions **1–3** (station / Orabi, Afrang, de Lesseps / museum / Sweet-Water Canal crossing). Hazem will review before the rest of the chapter is built.
- **Dialogue UI:** **hybrid** — bubbles for short ambient/banter lines during play (non-blocking); a bottom box with pixel-art portrait and speaker name for key story scenes. In multiplayer the box is only for the triggering player; others see an icon and are not paused. See [13-dialogue.md](13-dialogue.md) and [05-ux-and-loading.md](05-ux-and-loading.md).
- **Sprite sizes:** in-game characters **24×32 px** (24 wide, 32 tall) on 16 px tiles (~1.5 × 2 tiles); dialogue portraits **64×64 px** with facial expressions. See [03-art-pipeline.md](03-art-pipeline.md).

| # | Question | Notes / options |
|---|---------|-----------------|
| 1 | **Combat and puzzle tuning** | The genre is decided. Enemy counts, timers, puzzle difficulty, and ability cooldowns in [12-characters.md](12-characters.md) are starting ideas to tune in the first three-mission build. |
| 2 | **Which later chapters ship** | Candidate missions exist for Port Said, Suez, Alexandria, Luxor, Aswan, and Cairo. Play order is not a decision. Which of these maps are actually built is still open. |
| 3 | **GitHub repository name** | Account is **HazemGharib**. The repository does not exist yet. Work will go in as pull requests for review. *Nile Grid* is a candidate game title only, not a repo name decision. |
| 4 | **Players per match** | Real-time multiplayer is agreed; the number of players in one room is not. The Ismailia co-op design assumes two or three roles. Small rooms (2–4) are the working assumption, not a decision. |
| 5 | **Final multiplayer host** | Recommendation only, as of 2026-11-27: Render Free or a Railway trial for tests; Northflank or Oracle Always Free for unpaid always-on; Fly.io Singapore (~USD 8.50 / month) as a first paid step. Re-verify official pricing before a card is added or a plan is paid. |
| 6 | **Static host for the PWA** | GitHub Pages or Vercel — either is fine; not locked in. |
| 7 | **Retry / timeout values** for server wake-up | Behaviour is decided in [05-ux-and-loading.md](05-ux-and-loading.md); exact intervals are not. Tune against a real cold start (~one minute on Render Free). |
| 8 | **Minimap features and chunk size** | A minimap and chunked map streaming are required. Exact chunk size, preload radius, and minimap features (pins, fog of war, and so on) are not decided. |
| 9 | **Ending cutscene implementation** | The concept is decided ([14-ending-cutscene.md](14-ending-cutscene.md)). Shot count, music, and pre-rendered versus in-engine are not. |

When one of these is answered, update this list and the relevant numbered doc.
