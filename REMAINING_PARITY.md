# Remaining parity and release checklist

This tracker is UTF-8 and reflects the current web port. QR Shop/payment is excluded by product decision and is not a completion criterion.

## Completed gameplay parity

- [x] All 56 quest counters are instrumented and covered by regression tests.
- [x] Item, passive, status, rounding and combat-order audit is complete.
- [x] All recovered dungeon and raid scripts, loot, pets, doctrines, promotions, market and workshop mechanics are playable.
- [x] The 50 APK/Google Play achievements are represented in the web client with exact thresholds, durable progress and idempotent unlocks. Google Play XP is not an in-game reward.
- [x] Achievement unlocks now surface as an accessible in-game toast.

## Completed save and account work

- [x] Save schema v24 migrates every supported historical schema (v1–v23).
- [x] Missing achievement fields are repaired; malformed backups are rejected without replacing the current guild.
- [x] Export/import uses the same migration path as local and cloud saves.
- [x] Cloud saves retain revision conflict handling, deduplicated fingerprints and a persisted offline queue.
- [x] A newer local save from another tab is adopted without creating a second reward path.
- [x] E2E progression covers dungeon → chest → workshop → market → quest → raid setup.

## Completed web-release baseline

- [x] PWA manifest, service-worker offline shell and cache version (`guild-master-web-v24`) are present.
- [x] Error boundary, visible keyboard focus and modal focus trapping are present.
- [x] React, Supabase, localization and area-script chunks are separated from the main bundle.

## Remaining QA and polish

- [ ] Run final browser smoke at 320×640, 360×800 and 390×844 after each release candidate.
- [ ] Compare against the APK with matching screenshots when an Android runtime/device is available.
- [x] Vietnamese content pass complete: all 921 content descriptions, 17 King letters and 5 FAQ entries are localized. Any future English fallback is a targeted UI-string audit, not missing game content.
- [ ] Run real-device cloud tests: sign-in, offline queue recovery, revision conflict, restore and two-tab hand-off.
- [ ] Add production monitoring/error reporting and deployment-specific cache-busting policy. Bump the cache name in `public/sw.js` when deploying incompatible static content.
- [ ] Add a production deployment configuration after choosing the hosting domain.

## Explicitly excluded

- [x] Rewarded advertisements and ad-derived gems are not ported.
- [x] QR Shop remains a non-crediting placeholder until the QR asset and verified payment flow are supplied.
- [x] Payment, IAP, SePay/webhook settlement and redeem fulfillment remain out of scope.
