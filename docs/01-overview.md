# 01 — Project overview

## Vision

Build a small, good-looking **2D pixel-art game** that a player can open on a phone in the browser, then optionally “install” as a PWA (Add to Home Screen). The first public version is a tight single-player slice. Real-time multiplayer is a planned later phase, not an afterthought: the client and folder structure should leave a clean place for a Colyseus room later.

The game should feel like a handheld action title: readable pixels, a limited palette, short sessions, and touch controls that work with a thumb. Gameplay is **action combined with stealth and puzzle-solving**. The player explores a **2D top-down (3/4)** map of a real Egyptian city, with a camera that follows their own character. Ismailia is the first city being designed, not a required first level.

## Design principles

1. **Start tiny, ship something playable.** Phase 1 is Ismailia missions 1–3, the three approved crew members (switchable), one enemy type, on a phone. Expand only after that feels right.
2. **Architect for multiplayer without building it yet.** Shared simulation ideas (fixed tick, serialized inputs, room-friendly scene data) can be sketched in the client so a later server is not a rewrite. Each player's camera stays on the client. Phase 1 must still run fully offline as a PWA.
3. **Free-first hosting.** Single-player has no server cost. Multiplayer experiments may use a free host that sleeps; production multiplayer should use a host that does not sleep (see [04-multiplayer-and-hosting.md](04-multiplayer-and-hosting.md)).
4. **Honest pixel art.** AI images are a starting point. They are always downscaled onto a real pixel grid and quantized to a short palette. Animation frames will need manual cleanup before they ship. Production art is **2D top-down (3/4)**, not isometric.
5. **Reviewable work.** Code and assets go to GitHub as pull requests, not as direct unreviewed dumps to `main`.

## Players and platforms

- **Primary:** mobile browser (iOS Safari and Android Chrome), portrait or landscape to be decided with the chosen genre.
- **Secondary:** desktop browser, for development and for anyone who opens the same URL.
- **Not required for v1:** native app stores, APK/IPA builds, accounts, or payments.

## Current status (2026-11-27)

- Theme is **Nile Neon** (Egyptian cyberpunk). Each level is a map of one Egyptian governorate. **Ismailia is being designed first**, but chapters are **non-linear**. See [07-concept-ideas.md](07-concept-ideas.md) and [09-ismailia-map.md](09-ismailia-map.md).
- **View** is 2D top-down (3/4), not isometric. Each player's **camera** is client-side and follows only their own character. Nearby players are what get rendered in multiplayer (area-of-interest filtering).
- **Ismailia map scale** is decided: about **5 minutes** to cross west–east at ~5 tiles/s, which is **~3.5 m per tile** and **~1500 × ~800 tiles**. Chunked map loading and a minimap are required. This supersedes the earlier 20 m/tile proposal.
- Agreements on stack, multiplayer direction, hosting, and UX for a sleeping server are documented in this folder.
- Five art concepts and processed sprite sheets exist under `concepts/`. Nile Neon is the chosen direction.
- **Storyline** is *Nile Grid* ([10-storyline.md](10-storyline.md)); the Ismailia chapter is designed in [11-chapter-ismailia.md](11-chapter-ismailia.md). The story is won when all shipped chapters are complete, then a pixel-art ending cutscene plays ([14-ending-cutscene.md](14-ending-cutscene.md)).
- **Gameplay** is action + stealth + puzzles. Crew names are approved; see [12-characters.md](12-characters.md) and [13-dialogue.md](13-dialogue.md).
- **First playable build:** Ismailia missions 1–3. No GitHub repository has been created yet, and no Phaser project has been scaffolded.
- **Next step:** build that three-mission slice (a repository name is still needed for GitHub). Remaining open questions are listed in [08-open-questions.md](08-open-questions.md).

## Language

Project documentation is written in **English**, in Markdown, so it can live in the repo and be used as a brief for implementation. Conversations with the project owner may stay in Egyptian Arabic; this folder is the English source of truth.
