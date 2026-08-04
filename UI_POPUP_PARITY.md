# UI popup parity audit (APK 2.147)

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
- [ ] `DialogSettings`: màn cài đặt APK (ngoài ngôn ngữ và cloud account hiện có).
- [ ] `DialogReport`: báo cáo/feedback.
- [ ] `DialogRedeemCode`: redeem code.
- [ ] `DialogShop`: vẫn bị khóa theo quyết định trước đó (không thanh toán); cần quyết định có hiển thị UI shop read-only hay vẫn coi là ngoài phạm vi.
- [ ] Achievements drawer/popup: nút hiện chưa có hành động và hệ achievement cũng chưa hoàn tất.

## Quy tắc nghiệm thu

Không tick hoàn tất một popup chỉ vì mở được: phải có đủ thông tin, trạng thái disabled/locked, confirmation, và action mà APK cung cấp; mỗi popup có action sẽ được smoke-test ở save mới và save có progression.
