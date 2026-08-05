# UI popup parity acceptance tracker (APK 2.147)

Payment/IAP surfaces (`DialogShop`, restore purchases, gem bundles and ads) are explicitly outside this parity scope. `web_game.zip` is a user-owned untracked artifact and is never part of this work.

| APK surface | Status | Acceptance evidence |
| --- | --- | --- |
| Drawer: Settings | Done | Persistent local/cloud preferences for amount defaults, confirmations, auto-open, logs and colorblind mode. |
| Drawer: Recall, Messages, FAQ, Bestiary | Done | Direct drawer routes with locked, empty and detail states. |
| Achievements | Done | Internal save-derived progress replaces the APK Google Play Games intent. |
| Community links | Done | Reddit and Cafe Naver links are in the drawer. |
| Redeem code | Deferred | Backend foundation remains versioned; client entry is hidden behind a disabled “coming soon” control until secure redemption is finalized. |
| Idle progress | Done | Meaningful offline elapsed time produces an in-game progress dialog. |
| Adventure report | Done | Each run records duration, clears, wipes, earned/lost XP and defeated enemies. |
| Entity detail | Done | Adventurer and battle detail expose combat data, traits, skills, equipment and statuses. |
| Item detail | Done | Inventory item data, stack/value and contextual hatch/consume actions. |
| Workshop and Market | Done | Craft/sale previews plus in-game cancellation confirmations. |
| Shelter and pet merge | Done | Detail, abilities, feed controls and separate merge-source/target flow. |
| Quests, equipment, doctrine and consumables | Done | Preview and in-game confirmations replace browser-native confirmations. |

Completion requires visible information, correct enabled/disabled state, confirmation for destructive actions and a smoke test. “Done” does not include payment/IAP surfaces.
