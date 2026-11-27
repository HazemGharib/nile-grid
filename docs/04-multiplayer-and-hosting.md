# 04 — Multiplayer plan and hosting

**Pricing and limits below were checked against official pages on 2026-11-27.** They change often. Re-verify before a card is added or a host is paid for. Singapore is the preferred region where a host offers it (lower latency for the project owner in Malaysia / the region).

## Multiplayer shape

- **Mode:** real-time action, not turn-based.
- **Phase 1:** one local player. No game server.
- **Later:** more than one player in a session. Start with small rooms (for example 2–4), not a huge MMO. The exact players-per-match number is still open.
- **Server:** Colyseus over WebSockets, server-authoritative once this phase exists.
- **Cameras (decided 2026-11-27):** each player's camera is **client-side and independent**. It follows **only that player's own character**. The server does not run a shared camera.
- **What the server sends:** positions (and later hits / game events). It does not stream the whole map or every player on the map to every client.
- **Interest management:** each client renders **nearby players only**. Use Colyseus **area-of-interest (AoI) filtering** so a client is not updated about players far across the ~1500 × ~800-tile Ismailia map. Combined with **chunked map streaming** on the client (see [05-ux-and-loading.md](05-ux-and-loading.md) and [09-ismailia-map.md](09-ismailia-map.md)), this keeps mobile bandwidth and draw cost in check.

A turn-based or “slow” stack (Supabase / Firebase) was considered and rejected for the live action case.

## When a server is needed

| Phase | Server? | Host |
|-------|---------|------|
| Concept art and docs | No | Local files only |
| Phase 1 single-player PWA | No | GitHub Pages or Vercel, free |
| Phase 3 real-time multiplayer | Yes | See options below |

## Free hosts that do not sleep (better for real play)

### Northflank

- Roughly **USD 20 / month of resources in a free allowance**.
- Instances **do not sleep**.
- Singapore region is available.
- A **card is required** for verification. It should not be charged unless the free allowance is exceeded.
- Good default if adding a card is acceptable.

### Oracle Always Free

- The strongest free machine class in this comparison: up to **4 ARM cores, 24 GB RAM**, **10 TB** monthly egress, regions including **Singapore and Malaysia**.
- The project owner would administer the VM (install Node, process manager, TLS, updates).
- Capacity is sometimes unavailable at account creation.
- An idle instance may be reclaimed if it stays unused for about a week.
- A card is typically required.

## Free or trial hosts that sleep, or that are time-limited (fine for experiments)

### Render (free web service)

- **No card** required.
- Singapore region is available.
- The instance **spins down after 15 minutes of inactivity** and takes on the order of **one minute** to wake.
- Hardware on the free tier is modest (a fraction of a CPU, 512 MB RAM). Enough for a small test room, not for a busy production game.
- Acceptable as the **first multiplayer experiment**, if and only if eager wake + a loading screen are implemented ([05-ux-and-loading.md](05-ux-and-loading.md)).

### Railway

- A **30-day trial** with USD 5 of credit, no card, and no sleep during the trial, is useful for a first deploy.
- After that, the free plan is about **USD 1 / month** and **does sleep**. Singapore is not a free-plan region choice.
- Hobby plan starts around **USD 5 / month** and then tracks usage.

### Fly.io

- Without a card: about **USD 1 for one week**.
- With a card: about **USD 5 / month** of credit, which can cover a small VM, often in a US region rather than Singapore.
- A **1 GB instance in Singapore is around USD 8.50 / month** (paid). That is the realistic “always on, close to us” Fly.io number.

## Inexpensive paid options (when free sleep is no longer acceptable)

| Option | Ballpark (2026-11-27) | Notes |
|--------|------------------------|-------|
| Fly.io, 1 GB, Singapore | ~USD 8.50 / month | Simple, close region, always on |
| Render paid instance | USD 7 / month | Same product as the free test, without spin-down |
| Railway Hobby | from USD 5 / month, plus usage | Flexible, watch the bill |
| Colyseus Cloud | from USD 15 / month | Least ops work; Colyseus-specific |

## Do not use (for this project’s real-time plan)

- **Koyeb** — no longer a useful free option; paid plans started around USD 29 in this check.
- **Google Cloud Run** — request timeouts can drop a long-lived WebSocket (around one hour). A bad fit for a match that stays open.
- **Hathora** — service was shutting down.
- **Deno Deploy** — scheduled to shut down in **April 2027**.
- **Cloudflare Workers** as the game server — possible in general, but it means not using Colyseus.

## Recommendation (agreed direction)

1. **Phase 1:** no game server. Ship the PWA to GitHub Pages or Vercel.
2. **First multiplayer tests:** Render free, or Railway’s trial if the dates still fit. Implement eager wake and a loading screen before anyone outside the project tries a match.
3. **Serious unpaid multiplayer:** Northflank, or Oracle Always Free, if a verification card is acceptable.
4. **Simple paid safety net:** Fly.io in Singapore (~USD 8.50 / month) or Render’s USD 7 always-on instance.

Latency from a Singapore region should be acceptable for the owner and for many nearby players. Players in Europe or the Americas will see higher ping on that same instance. A second region is a later problem.
