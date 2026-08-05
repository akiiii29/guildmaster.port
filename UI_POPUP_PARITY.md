# UI popup parity audit (APK 2.147)

Reviewed against the decompiled APK layouts, dialog classes and English strings in `../jadx_decompiled`. A status of **Verified** means the equivalent information and action are present in the web UI; it does not mean the layout is pixel-identical. `web_game.zip` is user-owned and is not part of this work.

## Fixed in this pass

| Surface | Status | Evidence |
| --- | --- | --- |
| Tavern guest detail | **Implemented** | Selecting a visitor now exposes its base stats, normal/rare traits, active/passive skills, and a data-derived strengths/weaknesses assessment. The APK's `DialogTavern` only exposes a recruit row; this is a useful web extension rather than an invented replacement for an APK dialog. |
| Tavern list and upgrades | **Verified** | Capacity, arrival interval/countdown, lock, empty state, both upgrades, recruit state, help and no-quarters state match `DialogTavern`. |
| Storage | **Verified** | Type filters, five sort modes, capacity/upgrade, item grid and contextual item actions match `DialogStorage`. |
| Market and sell flow | **Verified** | Listing queue, sold collection, cancellation, item price preview, quantity selector, sale time and upgrades cover `DialogMarket` + `DialogSell`. |
| Send team and active dungeon | **Verified** | Team slots, pet, load/save/clear, raid refill, active combat, darkness, entity inspect, result loot and report cover the APK dialog flow. |
| Quests, roster/recall, equipment and consumables | **Verified** | Equivalent lists, locked/empty states and destructive-action confirmations are present. |
| Messages, Bestiary, FAQ, Settings and idle progress | **Verified** | Equivalent navigation and content states are present; web-only cloud settings are additional. |

## Open content gaps found by the APK audit

| APK dialog / source evidence | Missing or incomplete in web port | Status |
| --- | --- | --- |
| `DialogEntityDetail` / `dialog_entity_detail.xml` | Added crit damage, retaliation, darkness reduction, XP bonus, healing modifier, decay and all eleven potion counters to the web combat-stat detail. | **Implemented** |
| `DialogItemDetail` / `dialog_item_detail.xml` | Item detail now renders readable effect fields, enemy sources, builds-from/builds-into relations and a direct route into the preselected Market sell flow. | **Implemented** |
| `DialogPetDetail` / `dialog_pet_detail.xml` | Added pet family, localized ability names, lock levels, current strength and effect descriptions calculated from the same combat formulas. | **Implemented** |
| `DialogDoctrine` / `dialog_doctrine.xml` | Selecting an ability now reveals its current effect, rank and LP cost alongside the existing spend controls. | **Implemented** |
| `DialogRecipes` / `dialog_recipes.xml` | Added category filter, type/craftable/alphabetical sort and hide-insufficient toggle. | **Implemented** |
| `DialogMerchant` / `dialog_merchant.xml` | Added live regular and special-stock countdowns. The APK has automatic refresh only; it has no manual refresh buttons. | **Implemented** |

## Deliberately excluded or web-only

| Surface | Status | Reason |
| --- | --- | --- |
| Gem shop / IAP and purchase restoration | Excluded | The agreed QR/payment work is separate; gems must not be credited without verified payment. |
| Rewarded ads | Excluded | No ad reward implementation in the web port. |
| Redeem code | Hidden | Existing redeem foundation remains hidden behind “coming soon” until server-side validation is available. |
| Account sync and achievements | Web-only | These are web additions, not APK parity gaps. |

## Acceptance rule for closing an open row

Each row needs: visible information equivalent to the APK, correct empty/locked/insufficient-resource state, confirmation where an action is destructive, and a smoke test in the running web game. No known content-parity row remains open outside the deliberately excluded payment/redeem surfaces.
