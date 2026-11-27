# 14 — Ending cutscene

**Decided (2026-11-27):** the story is **won only when every shipped governorate chapter is complete**. The reward is a **pixel-art ending cutscene**. Chapters can be played in **any order** (see [10-storyline.md](10-storyline.md)), so this scene must not assume that Cairo, Aswan, or Ismailia was finished last.

It is a gift to the player, not a mid-game cinematic. It is skippable, but it should feel worth watching once.

## Concept

A short, silent-or-lightly-scored sequence in the same **2D pixel-art** language as the game (hard edges, short palette, nearest-neighbour, no photorealism or live action). The tone is restoration: water and light returning to ordinary streets, not a victory parade and not a fantasy of ruling the country.

Horus Corp’s Eye goes dark as a *system*. There is no real official, no real institution, and no speech from a living person. The Grid is suggested to return to a fictional civilian compact, as in the storyline doc.

## Beats

1. **The last node.** Wherever the player just was, the last governorate tower’s branded light goes out. A single quiet moment on that map, then a pull back.
2. **The country as a board.** A stylised pixel map of Egypt: the shipped governorate towers wink out one by one, in whatever order the player freed them, until none remain lit.
3. **Water.** The Nile and the canal read as moving again — a ship’s light on a dark waterway, a pump, a short stretch of current. No single city is treated as the only hero.
4. **Light.** Streetlamps and windows return in a few ordinary streets from more than one chapter (a quay, a corniche, a lane of old houses), in the same art style as the maps.
5. **The crew.** Nour, Adel (and Bolbol), and Laila together on a street at ease: jackets dim, tools down, a small tag on a dead camera. No speech required; a single optional line at most.
6. **Title card.** *Nile Grid*, then a quiet credit to the cities and to OpenStreetMap if derived map data shipped. Fade.

Keep the whole sequence short enough for a phone (a rough target: about 45–90 seconds). The player can skip to the credits.

## Pixel-art storyboard (idea)

Eight shots, each a held or slowly panned pixel frame, not a video edit:

1. A tower cab or Eye logo, palette already dimming, one last red pixel going out.
2. Wide night map of Egypt, dots extinguishing in the player’s completion order.
3. Water in close-up: canal ripples, a hull light, a 16 px wake.
4. A familiar Ismailia-scale quay or lake edge, lamps warming up (used even if Ismailia was not last).
5. A second city fragment (a corniche, a river bank, or a temple silhouette left dark and unharmed), lights only in the town, not on the stones.
6. A narrow street: laundry, a tea stall, a window, Nour (male, magenta jacket) walking into frame.
7. The three of them still, drone on Adel’s shoulder, Laila’s tag small and neat on a blind lens.
8. Title card on a flat night sky, short palette, then credits.

Audio, when it exists, should be gentle and original. A hint of **simsimiyya** is appropriate if Ismailia or another Canal city is on screen; it should not be the only colour of a national ending, and it must be respectful, not a pastiche joke.

## What this file does not decide

- Final shot count, music, and whether a post-credits gag exists (default: no gag).
- The exact list of shipped chapters that count as “all.” The rule is: every governorate chapter that ships must be complete before this plays.
- Implementation (pre-rendered pixel sequence versus in-engine cameras). Either is fine if the look stays true pixel art.
