# 13 — Dialogue system

Dialogue in *Nile Grid* is short, skippable, and written for a phone screen. It is there to give the crew a voice, to root a chapter in a real city, and to make NPCs feel local — not to deliver long cutscenes in the middle of a run.

Crew names are approved: **Nour Hassan** (male), **Adel Mansour** (male), and **Laila Farouk** (the only girl). Nour’s spoken grammar is masculine; نور is a unisex name in Egypt and stays. Personas and speech styles are in [12-characters.md](12-characters.md).

## Design

### Kinds of talk

- **Crew-to-crew banter.** Short lines between Nour, Adel, and Laila while moving, after an objective, or when a plan goes loud. One or two speakers, one or two lines each. It should sound like people who already know each other, not like a briefing.
- **Crew-to-NPC.** Contacts, fixers, and experts (see the archetypes in the characters doc). A greeting, a fact, a direction. Optional **short branches**: at most two player choices, both brief, never a tree that hides a required key behind the “right” line.
- **System / Eye lines.** Rare. A calm branded warning from a checkpoint or a tower is fine. It should not monologue, and it is never a real person’s voice.

### Length

- Prefer **one to two short sentences** per speaker.
- A line must be readable without covering the objective for long.
- Banter has a cooldown so streets do not chatter over every step.

### UI — hybrid (decided 2026-11-27)

Two presentations, not one:

1. **Speech bubbles** above the speaking character, for short ambient lines and crew or NPC banter **during play**. These are **non-blocking**: the player can keep moving, fighting, or hiding. All of this talk stays skippable (it times out or can be dismissed). The player can walk away from a non-essential NPC.
2. **A bottom dialogue box**, with a **64×64 px pixel-art portrait** (with facial expressions) and the **speaker’s name**, **only for key story scenes** (briefings, objective-critical NPC talks, chapter beats that need a face). Optional short branches (at most two choices) live here, not in bubbles. Portraits are a separate asset from the 24×32 in-game sprites ([03-art-pipeline.md](03-art-pipeline.md)). The exact expression set is not locked; plan for at least a neutral/talking face, and add more (concern, a smile, alarm) as scenes need them.

The camera must not be stolen by a mid-mission cinematic (cameras stay client-side and follow the local player, as already decided). Key-story boxes should still be skippable, and any fact needed to finish an objective is also repeated on the objective tracker.

**Multiplayer:** the bottom dialogue box appears **only for the player who triggered** the scene. Other players see a **small dialogue icon** above that character and **are never paused**. Bubbles stay local to each client in the usual way and must not freeze anyone else’s game. See also [05-ux-and-loading.md](05-ux-and-loading.md).

### Triggers

- **Objectives:** start, success, and failure of a main mission (and a short recover line on retry).
- **Landmarks:** a one-line reaction when the crew first enters a named place (the station façade, Gumhuriya Square, de Lesseps House, the lake shore, and so on). Keep it respectful at mosques, churches, museums, and memorials — recognition, not jokes, and no combat talk on those grounds.
- **Role moments:** a successful hack, a finished repair, a close sprint, an alarm.
- **NPCs:** approaching a contact. If the contact matters to the objective, the needed fact is also repeated on the objective tracker so skipped talk cannot soft-lock the mission.

### Local culture and dialect (rule)

**Dialogue should reflect the governorate the chapter is set in.** That means local *references*, *work words*, and, where it is natural, a lighter local colour in the Egyptian Arabic — not a caricature accent, and never a mockery of a city, a community, a faith, or a club.

- Write in **Egyptian Arabic** for spoken lines, with a brief English gloss in the script docs (as below).
- Prefer words and places that belong to that city (in Ismailia: the canal, the guidance building, Lake Timsah, the Sweet-Water Canal, Hay el-Afrang, the ferry).
- Use cultural facts that are well attested, or keep the line generic and respectful. For Ismailia and the Canal cities, it is fair to use the **simsimiyya** music tradition and **El-Ismaily** football pride, including the long-standing nickname **“Brazil of Egypt”** (برازيل مصر), as pride, not as a joke.
- Ismailia’s farms are widely known for **mangoes**; that may appear as smell, shade, or a stall, without turning the city into a single gag. Do not invent festivals, dishes, or slang we have not checked.
- Sacred buildings and the 1973 memorial get quiet, dignified lines only.

When a later governorate is written, its sample dialogue should be drafted with the same rule (Alexandrian sea words, Upper Egyptian references in Luxor and Aswan, and so on) and checked before it ships.

## Sample dialogue — Ismailia, first three missions

Spoken lines are Egyptian Arabic. The English is a gloss, not a voice-over. These are examples for the first playable build ([11-chapter-ismailia.md](11-chapter-ismailia.md) objectives 1–3). They can be edited; the tone should stay. Address and describe **Nour in the masculine** (e.g. متأخرش, not متأخريش). Laila stays feminine. First-person verbs in Egyptian Arabic are the same for all three and were left as they were.

Ambient and banter lines below are meant for **bubbles**. Umm Sayed, Karim, and Hajj Rashid, when they give objective-critical facts, are meant for the **bottom dialogue box**.

### Mission 1 — Railway Station and Orabi Square

*Trigger: the crew steps into the station forecourt. A kiosk radio is playing a quiet simsimiyya, under the checkpoint hum.*

**Nour:** المحطة مليانة عيون يا عادل. حتى النافورة في عرابي بتتفرج.
*(The station is full of eyes, Adel. Even the fountain in Orabi is watching.)*

**Adel:** استنى.. بولبول هيحساس البوابة. ليلى، الكاميرات؟
*(Wait. Bolbol will feel out the gate. Laila — the cameras?)*

**Laila:** على الواجهة. هلفّهم كام ثانية. متتأخرش.
*(On the façade. I’ll loop them for a few seconds. Don’t be late.)*

*Trigger: Umm Sayed, tea vendor, if the player approaches her stall.*

**Umm Sayed:** اشربوا ديل قهوة. المراكب واقفة على التمساح من أيام، والقطر نفسه بقى زيهم. الحارة الجنوبي تبقى أهدى لما النور يطفي.
*(Have a sip. The boats have been sitting on Timsah for days, and the train has started to look like them. The south alley is quieter when the light goes out.)*

**Nour:** هنعدّي يا أم سيد. أول ما الكاميرا تنام.
*(We’ll cross, Umm Sayed. The moment the camera goes to sleep.)*

### Mission 2 — Hay el-Afrang

*Trigger: entering Gumhuriya Square. An El-Ismaily flag on a balcony, treated as local pride, not a gag.*

**Nour:** الإفرنج ضيق زي ما هو. ده الميدان؟
*(Afrang is as tight as ever. Is this the square?)*

**Adel:** العلم على البلكونة لسه إسماعيلي. برازيل مصر ما بيحبوش البلد تتقفل.
*(The flag on the balcony is still Ismaily. The Brazil of Egypt doesn’t like a city that’s been shut.)*

**Laila:** الجدول عند الكشك. الشغل في الشارع.. مش عند الجامع ولا الكنيسة.
*(The schedule is at the kiosk. The work is in the street — not at the mosque, and not at the church.)*

*Trigger: talking to Karim, the fixer.*

**Karim:** الدوريات بتلف الجمهورية كل تسع دقايق. انسخوا الشبكة وامشوا. الحي ده عارف بعضه، متخلّوش يبقى حرب.
*(The patrols loop Gumhuriya every nine minutes. Copy the mesh and go. This quarter knows itself — don’t let it turn into a war.)*

**Laila:** هانسخ ونمشي.
*(We’ll copy it and we’ll go.)*

**Nour:** أنا بعدّي الميدان. عادل يمسك الحارة.
*(I’ll cross the square. Adel holds the alley.)*

### Mission 3 — de Lesseps House, the Canal Museum, Bridge 3

*Trigger: the quay, a hint of mango trees in a garden behind the old houses — a real, ordinary Ismailia detail, not a punchline.*

**Hajj Rashid:** المفتاح القديم في البيت هناك، والتوقيع بتاعه في المتحف. من غيرهم، الإرشاد مش هيسمعكم. الترعة قدامكم؛ كوبري تلاتة عطلان.
*(The old key is in the house there, and its handshake is in the museum. Without them, Guidance will not hear you. The Sweet-Water Canal is in front of you; Bridge 3 is jammed.)*

**Laila:** أقفال المتحف قديمة. سيب الكاميرات عليا.
*(The museum locks are old. Leave the cameras to me.)*

**Adel:** الكوبري عليا. أنا ما بحبش ترعة واقفة.
*(The bridge is mine. I don’t like a canal that isn’t moving.)*

**Nour:** وأنا أجيب المفتاح وألحقكوا. قبل ما المراكب تفضل على البحيرة كمان أسبوع.
*(And I’ll get the key and catch up. Before the boats sit on the lake another week.)*

*Trigger: after Bridge 3 opens, looking toward the lake.*

**Adel:** اتفضلي يا ترعة.
*(There you go, canal.)*

**Nour:** ريحة المانجا لسه في الجنينة.. وريحة الحديد من هناك. يلا، الحديقة بعدها.
*(The garden still smells of mango… and of iron from over there. Come on. The park is next.)*

**Laila:** الإرشاد بقى قريب. نكمّل بعدين.
*(Guidance is close now. We finish the rest later.)*

*(That last line fits the first playable build, which stops after mission 3 for review.)*

## Notes for later missions and later cities

- Missions 4–6 in Ismailia (Mallaha Park, the Irshad building, the canal mouth) will need their own short scripts when that slice is built. The 1973 memorial gets dignified lines only.
- Do not reuse these Ismailia samples as a template in another governorate without changing the local words and the cultural references.
