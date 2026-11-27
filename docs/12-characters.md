# 12 — Characters and power matrix

Crew names were **approved on 2026-11-27:** **Nour Hassan** (courier), **Adel Mansour** (mechanic, with a shoulder drone), and **Laila Farouk** (hacker).

**Gender (corrected 2026-11-27):** the playable crew is **two boys and one girl**. **Nour Hassan** is **male** — نور is a unisex name in Egypt, and the name stays. **Adel Mansour** is male. **Laila Farouk** is the only girl. Production art and pronouns must follow this; the *Nile Neon* concept sheet is a style reference only and the courier should be drawn as a young man.

Personas and the numbers below are the working design. Ability names, exact cooldown seconds, and UI can be tuned in playtests; the roles and the 1–5 spread should stay balanced as written. **Stats were not changed for this correction** — the matrix was never justified by gender.

Looks follow the *Nile Neon* sheet (`concepts/05-nile-neon.png`). Contrast and animation caveats on that sheet still apply. No real living people.

**Production sprite sizes (decided 2026-11-27):** in-game character sprites are **24×32 px** (24 wide, 32 tall) on 16 px map tiles (~1.5 × 2 tiles), so Nour’s LED jacket, Adel’s drone **Bolbol**, and Laila’s hoodie stay readable on a phone without a square 32×32 frame wasting width. Dialogue-box portraits are **64×64 px** with facial expressions ([13-dialogue.md](13-dialogue.md)). Details and the size rationale are in [03-art-pipeline.md](03-art-pipeline.md).

Gameplay, decided the same day, is **action combined with stealth and puzzle-solving**. The three roles are built so a loud fight, a quiet crossing, and a terminal or a cranked bridge are all first-class, and so no one character can do all three well.

## Nour Hassan — courier

**نور حسن.** Male. Magenta LED jacket, street courier. Default spawn in the first playable build; the player may switch (see [Solo play](#solo-play)).

**Background.** Nour grew up running packages through alleys, station forecourts, and night trains — letters, parts, and crates, anything that had to arrive before morning. When Horus Corp closed the Grid’s unofficial routes, the work dried up and the streets got slower. He still knows cities as sequences of exits. The LED jacket is a work tool he keeps patched himself: visible to the people he delivers to, easy to dim when he does not want the Eye.

**Personality.** Fast, restless, loyal. Dry humour under stress. He treats a map as a route he has almost already walked. Impatient with a job left half-started, but he will wait if waiting is the route.

**Motivation.** Movement is freedom. He wants the streets, the trains, and the water open again so ordinary people can get where they are going — and so he is not a courier in a locked country.

**Quirks.** Always clocks the exits of a square. Names streets the way other people name friends. Eats on the move. Taps the jacket’s LED strip when he is thinking.

**Voice.** Egyptian Arabic, masculine grammar, street-level, short sentences, jokes that do not punch down. He rushes a plan into a verb: *يلا نعدّي.* Not vulgar, not formal.

**Relationships.** Teases Adel the way a younger friend teases an older brother who will not walk faster. Trusts Laila’s silences and does not fill them. Gets sharp only when the crew stands still in an open street.

## Adel Mansour — mechanic

**عادل منصور.** Male. Mechanic with a shoulder drone (working pet name: **Bolbol** / بلبل — affectionate, changeable).

**Background.** Adel kept neighbourhood generators, pumps, and shop motors alive after the rationing. The drone is scrap he refuses to call scrap. He understands water and power as machines that should serve a street, not a logo. He has the hands for lift-bridges, boat engines, and stubborn gates.

**Personality.** Warm, stubborn, unhurried unless someone is bleeding. He talks to machines as if they were neighbours, and to neighbours as if they deserved a working light. Hates leaving a generator half-fixed.

**Motivation.** Things should work for people. He is in the Current because a locked pump is an insult, and because Nour and Laila will walk into places that need a door held open.

**Quirks.** Names and scolds the drone. Wipes his hands before he touches a historic latch. Will stop mid-run to tighten one last bolt, then apologise by doing it faster next time.

**Voice.** Warm, slightly slower Egyptian Arabic. Mild complaint, then action: *استنى أوظبطها.* Complements a machine that behaves. Not a speech-maker.

**Relationships.** Protective of both. Proud when Laila opens a door he could not crank. Tells Nour to wait, then covers him when he does not.

## Laila Farouk — hacker

**ليلى فاروق.** Female; the only girl in the playable crew. Graffiti hacker, teal hoodie and keffiyeh-scarf.

**Background.** Laila read walls before she read networks: paint, cameras, the places a city watches itself. She started tagging over corporate lenses for herself, then for neighbours who wanted a street without an Eye. She treats a backdoor like a clean line — finish it, don’t leave a mess.

**Personality.** Quiet, sharp, economical with words. Not cold. She notices the camera first and the speech last. A small tag, when a lens dies, is a signature, not a boast.

**Motivation.** People should be able to walk unwatched. She wants the Eye off the corners, and she wants the Grid’s locks to answer to the street again.

**Quirks.** Hums under her breath while a terminal yields. Keeps a small can or a stylus. Will not rush a decrypt just to match Nour’s pace — and will then finish faster than expected.

**Voice.** Short, precise Egyptian Arabic. Dry, not theatrical. *الكاميرا اتعورت.* She does not give speeches; she reports what the system just did.

**Relationships.** Lets Nour talk. Stands where Adel can see her in a fight. Offers warmth in one line, rarely in three.

## NPC archetypes

All fictional. Recurring types, with local faces in each governorate (Ismailia’s named examples are in [11-chapter-ismailia.md](11-chapter-ismailia.md)):

- **The contact** — a tea vendor, kiosk owner, or porter who can point the crew down a safe alley (e.g. Umm Sayed).
- **The fixer** — a neighbour who knows patrol times, gossip, and which doors still have old keys (e.g. Karim).
- **The expert** — a retired pilot, technician, or gardener who remembers how a real machine is supposed to work (e.g. Hajj Rashid, Mina).
- **The water worker** — a deckhand, ferry hand, or pump-keeper who wants the channel open, not a speech.
- **Civilians** — families, shopkeepers, museum or park staff. They give the map life and side jobs. They are not cannon fodder, and they are not combatants.

## Horus Corp (antagonist side)

Horus Corp is a fictional monopoly on water, power, and seeing. It has no real-world officers and no living names.

- **Corporate security** — the *Nile Neon* enemy unit. Patrols, checkpoints, tower guards. Faceless on purpose.
- **Local warden units** — a heavier fictional elite at a governorate tower or a lock. A function, not a celebrity villain.
- **The Eye** — the camera net and, sometimes, a calm branded system voice (“order, water, and light”). It is a system, not a person.
- **Dispatchers and clerks** — invented, replaceable, never modelled on real officials.

The Corp occupies civic-looking buildings in the fiction; that is not a statement about any real authority.

## Power matrix

Ratings are **1 (weak) to 5 (excellent)** in that column. Totals are close, not identical: Nour’s slightly lower sum is offset by Speed 5, which changes how he crosses a map under pressure. Adel and Laila are stronger in a hold or at a terminal, and weaker at a long exposed run.

| Stat | Nour (courier) | Adel (mechanic) | Laila (hacker) |
|------|:---:|:---:|:---:|
| **Speed** | 5 | 2 | 3 |
| **Health** | 2 | 5 | 2 |
| **Stealth** | 4 | 2 | 4 |
| **Hacking** | 2 | 2 | 5 |
| **Combat / damage** | 3 | 4 | 2 |
| **Support / repair** | 1 | 5 | 2 |
| **Puzzle skill** | 3 | 3 | 5 |
| *Total* | *20* | *23* | *23* |

**How to read puzzle skill.** Nour is strong on *route and timing* puzzles (when to cross, which alley). Adel is strong on *mechanical* puzzles (bridges, cranks, generators). Laila is strong on *system* puzzles (circuits, codes, camera logic). The shared 3 / 3 / 5 split means a solo player should still be able to finish a puzzle of another type, just more slowly or with a clearer tell.

### Abilities

Cooldowns are starting ideas for a mobile session (short enough to use in a mission, long enough that ultimate is a decision). Tune in playtests.

**Nour**

- **Primary — The Route.** Sprint and vault. He is the one who delivers a pass, a token, or the crew itself across a watched square.
- **Secondary — Decoy packet.** A short-lived dummy package or flash that pulls a patrol off a lane for a few seconds. Cooldown about 15–20 s.
- **Ultimate — Open Road.** A brief burst (about 8 s) of top speed and a thin afterimage, enough to carry an objective through a checkpoint. Cooldown about 90 s.
- **Weakness.** Low health. He loses a long stand-up fight. He cannot deep-hack a tower or repair a lift-bridge.

**Adel**

- **Primary — Overhaul hands.** Repair, crank, and hold. Opens mechanical gates, restores power to a street, finishes a jammed bridge. The drone **Bolbol** can scout a short line of sight or touch a nearby device.
- **Secondary — Hold the door.** A temporary barrier or a drone stun bolt, so Nour or Laila can finish. Cooldown about 18–25 s. If the drone is destroyed, it returns after a longer wait (about 40 s).
- **Ultimate — Full Power.** Instantly completes (or nearly completes) one large mechanical objective and throws a short overshield on the crew. Cooldown about 100 s.
- **Weakness.** Slow and noisy. Poor stealth. He cannot slip a dense camera net alone, and he cannot outrun a lockdown.

**Laila**

- **Primary — Backdoor.** Loop or blind cameras, crack electronic locks, decrypt a token or a patrol mesh.
- **Secondary — Tag.** Mark enemies or cameras for the crew on the minimap for a short time. Cooldown about 15–20 s.
- **Ultimate — Blackout.** The local Eye — cameras and electronic locks in a modest radius — goes dark for several seconds. Cooldown about 90 s.
- **Weakness.** Fragile in a loud fight. If the alarm is already fully up, she needs Adel’s cover or Nour’s exit.

### How the roles complement (co-op)

The intended loop is **deliver / hack / protect**, plus a puzzle that usually favours one role:

- Nour crosses and delivers while Laila opens the lens and Adel holds the alley.
- A mechanical puzzle (Bridge 3, a boom, a generator) wants Adel on the crank, Laila on any electronic interlock, and Nour keeping reinforcements off the short path.
- A system puzzle (patrol mesh, guidance cab, camera logic) wants Laila on the terminal, Nour on a timed run, Adel on the door.
- A failed stealth beat should still be recoverable with Adel’s health and Nour’s disengage, not an instant mission fail.

Two-player rooms can cover two roles; the third is assisted as in solo (below). Three-player rooms map one human to each role.

### Solo play

Every main objective must be completable alone.

- The player may **switch characters at safe points** (a tea stall, a cleared alley, a park bench, a service room). Nour is the default spawn.
- Off-role actions stay available as **slower contextual assists**: a simpler hack on a terminal if Laila is not active, a shorter drone pop or a slower crank if Adel is not active, a brief sprint if Nour is not active. Assists should be enough to avoid a soft-lock, not so strong that switching is pointless.
- In the first playable build (Ismailia missions 1–3), all three characters are available to switch. Companion AI is a later polish option, not a requirement for that slice.
