# UI popup parity audit (APK 2.147)

Second-pass status (2026-08-05): this checklist is not an acceptance sign-off. The APK menu has additional non-payment surfaces (Settings, Redeem code, achievement intent, and adventure Report). The web drawer also had text-click no-op paths for Messages/FAQ/Bestiary; those were fixed, but the remaining items below must be ported before UI parity can be claimed.

## Acceptance backlog — confirmed before implementation

Payment/IAP surfaces (`DialogShop`, restore purchases, gem bundles, advertisements) are explicitly excluded. `web_game.zip` is an untracked user artifact and is not part of this work.

| APK surface | Web status | Required for parity |
| --- | --- | --- |
| Drawer: Settings | Done | Persisted in local/cloud save; sell/craft defaults, confirmations, auto-open, verbose log and colorblind mode are applied. |
| Drawer: Recall Adventurers | Done | Existing roster/recall flow is exposed from the drawer. |
| Drawer: Messages / FAQ / Bestiary | Present | Direct click paths fixed; audit details below. |
| Drawer: Achievements | Done | Internal, save-derived achievement progress replaces the APK Google Play Games intent. |
| Drawer: Redeem code | Missing | Web-safe gameplay-code entry; exclude gem/IAP codes. |
| Drawer: Reddit / Cafe Naver | Done | External community links are available in the drawer. |
| `DialogIdleProgress` | Missing | Offline processing indicator. |
| `DialogReport` | Missing | Adventure recap with duration, clears, wipes, XP and killed enemies. |
| `DialogEntityDetail` | Partial | Full primary/secondary/tertiary/potion pages for adventurer, visitor and enemy detail. |
| `DialogItemDetail` | Partial | Full equipment/effect detail plus contextual craft, consume and sell actions. |
| `DialogWorkshop` / `DialogCraft` | Partial | Job-item detail and cancel confirmation. |
| `DialogMarket` / `DialogSell` | Partial | Item detail before sale and APK-equivalent confirmation. |
| `DialogShelter` / `DialogPetDetail` / `DialogMergePet` | Partial | Separate merge-source flow and complete ability detail. |
| `DialogQuests` / `DialogRefreshQuests` | Partial | Confirm quest refresh. |
| `DialogSelectEquipment` | Partial | Equipment detail/preview before commit. |
| `DialogDoctrineReset` / `DialogConsume*` | Partial | In-game confirmations and detailed effect copy instead of browser-native confirms. |

Completion rule: each row needs visible information, enabled/disabled states, confirmation where APK has one, and a smoke test. No row is considered complete merely because its dialog can open.

Nguồn đối chiếu: `../jadx_decompiled/sources/it/paranoidsquirrels/idleguildmaster/ui/dialogs`.

## Đã có luồng tương ứng, cần hoàn thiện chi tiết

- [~] `DialogEntityDetail` → Adventurer, Tavern guest, Bestiary, battle inspect. Adventurer đã có XP, trait, Active/Passive skill; còn thiếu các trang secondary/tertiary stat và potion history. Tavern guest/Bestiary còn phải dùng cùng detail đầy đủ.
- [~] `DialogItemDetail` → Storage item detail. Còn thiếu stat/effect đầy đủ của equipment và hành động sell từ inventory.
- [~] `DialogWorkshop` / `DialogRecipes` / `DialogCraft` → recipe, batch craft, queue đã có; còn thiếu item detail của job và xác nhận cancel.
- [~] `DialogMarket` / `DialogSell` → bán batch và giá đã có; còn thiếu item detail/confirmation theo flow APK.
- [~] `DialogMerchant` / `DialogBuyFromMerchant` → stock/buy có; còn thiếu popup preview item + xác nhận mua.
- [~] `DialogShelter` / `DialogPetDetail` / `DialogMergePet` → hatch/feed/detail/merge có; còn thiếu flow chọn nguồn merge riêng và full ability detail theo APK.
- [~] `DialogQuests` / `DialogRefreshQuests` → list/claim có; còn thiếu popup xác nhận refresh.
- [~] `DialogTavern` → visitor, lock, recruit có; Tavern guest detail còn thiếu pages stat/skill parity.
- [~] `DialogSelectEquipment` → chọn/equip/unequip có; còn thiếu detail đầy đủ của item trước khi equip.
- [~] `DialogPromotionChoices` / `DialogDoctrine` / `DialogDoctrineReset` → đã có trong Adventurer; cần tách reset confirmation và mô tả ability.
- [~] `DialogConsume*` → potion/geode/Evo23 có; cần tách confirmation/description theo từng potion thay vì native confirm.
- [~] `DialogMessagesReceived`, `DialogFaq`, `DialogBestiary`, `DialogRecallAdventurers`, `DialogSendTeam`, `DialogRefillRaidTry`, `DialogDungeonDetail` → có luồng tương ứng; cần đối chiếu text/action từng popup.

## Chưa có popup/luồng APK

- [ ] `DialogIdleProgress`: báo cáo offline progress khi mở lại game.
- [ ] `DialogSettings`: cài đặt sell/craft amount, confirmation, auto-open, verbose log và colorblind mode; riêng restore purchase bị loại khỏi scope IAP.
- [ ] `DialogReport`: báo cáo kết quả adventure (thời gian, area clear, wipe, XP và enemy kill).
- [ ] `DialogRedeemCode`: nhập/redeem code; các code cấp gem/IAP sẽ không được port theo phạm vi payment/IAP, còn code gameplay phải có policy server-side trước khi public.
- [ ] `DialogShop`: vẫn bị khóa theo quyết định trước đó (không thanh toán); cần quyết định có hiển thị UI shop read-only hay vẫn coi là ngoài phạm vi.
- [ ] Achievements drawer/popup: APK mở Google Play Games achievement intent. Web cần màn achievement nội bộ; nút hiện chưa có hành động và hệ tracking chưa hoàn tất.

## Quy tắc nghiệm thu

Không tick hoàn tất một popup chỉ vì mở được: phải có đủ thông tin, trạng thái disabled/locked, confirmation, và action mà APK cung cấp; mỗi popup có action sẽ được smoke-test ở save mới và save có progression.
