# Guild Master web port

This project is the browser port of the recovered Guild Master 2.147 Android
game. Payment code is intentionally out of scope until gameplay parity is
complete.

## Current playable slice

- Original four-tab shell, resource bars, tutorial strip, drawer and dialogs.
- Tavern recruitment and Quarters capacity.
- Adventurer roster, base stats, HP and XP progression.
- Dungeon/raid catalog backed by all extracted content tables.
- Team selection, one-second simulation clock, action timing, turn combat,
  respawn, XP, weighted loot, chest collection and retreat.
- Exact per-area scripts for all 11 dungeons, including darkness, traps,
  fixed encounters, long-running events, unique rewards and progression unlocks.
- Original one-try-per-day raid rules, local-midnight reset, gem refills and
  recovered team-size limits.
- Raid progression and all twelve complete raids: Ancient Grave Digging, The Slime
  Pond, Divine Archeology, Imperial Rescue, The Cultist Rebels, The Lost
  Expedition, Dreadful Ascent, Celestial Mothership, Dire Descent and Sleeping
  Planet, Kaunis and The Tower. Their
  fixed/rolled encounters, branching routes, stat and equipment gates,
  checkpoint skips, unique rewards and linked-death encounters are preserved.
- English/Vietnamese UI and localized combat/area narrative for the playable
  dungeon path.
- Original Market listing queue and Merchant daily/weekly stock economy.
- Full recovered 95-node promotion tree, tier-nine ascension reset, and
  ascended experience progression.
- Shelter pets with egg rarity rolls, all thirteen combat/exploration
  abilities, feeding, merging, expedition assignment, capacity upgrades and
  favourite-pet auto-feed.
- All 56 recovered quests with original difficulty targets, rarity rolls,
  gem/star rewards, doctrine-specific pools and Loyalty Point progression.
- All eight doctrines and forty doctrine abilities with their original costs,
  caps, level-derived points, ascended stat scaling and core combat modifiers.
- King's Messages with original 17 letters and area-unlock queue, plus the
  unlock-aware Bestiary with discovered-enemy details and drop tables.
- All eleven permanent stat potions with archetype/ascension caps, Geodes,
  Intercession, Potion of Rejuvenation and Potion of Clumsiness.
- Adventurer reordering, dismissal and the original 24-hour recall window.
- Original five-entry FAQ.
- Device-local saves and offline replay capped at 12 hours.
- Original image assets copied into the web manifest.

## Architecture

- `src/game`: serializable simulation and recovered arithmetic.
- `src/components`: renderer and DOM UI boundaries.
- `public/data`: extracted adventurers, enemies, areas, items, skills, recipes,
  pets, quests, King's messages and English strings.
- `public/assets`: extracted Android drawable assets.

## Local commands

```sh
npm run dev
npm test
npm run build
```

The remaining parity slices are rare-trait mutation/effects, the last
specialized quest-event counters, a browser-native achievements equivalent,
and final visual/localization parity. Real-money payment remains intentionally
deferred.
