# Các phần còn thiếu để đạt clone 1:1

Tài liệu này là checklist còn lại của bản web game. Phần thanh toán và SePay **chưa nằm trong phạm vi hiện tại**; chỉ bắt đầu sau khi gameplay và UI đạt mức 1:1.

Quy ước:

- `[ ]` Chưa làm
- `[~]` Đã có một phần nhưng chưa đạt parity
- `[x]` Đã hoàn tất

## P0 — Gameplay còn thiếu

### 1. Hoàn thiện chính xác toàn bộ quest counter

Hiện đã có đủ 56 quest trong content và phần lớn event/counter đã hoạt động. Còn phải đối chiếu công thức và điều kiện kích hoạt chính xác cho các quest đặc biệt:

- [x] `Marathon`: xác minh đúng loại quãng đường/progress được tính.
- [x] `Thalassophobia`: nối đúng sự kiện hoàn thành cụ thể của game gốc.
- [x] `Fast Learner`: chỉ tính khi đạt đúng điều kiện XP 150%.
- [x] `Crystal Clear`: chỉ tính đúng sự kiện miễn nhiễm tương ứng.
- [x] `Falling Apart`: theo dõi decay đúng nguồn, đúng lượng và đúng thời điểm.
- [x] Audit lại 56/56 quest để bảo đảm không còn counter nào đang dùng điều kiện gần đúng.
- [x] Thêm test riêng cho từng quest đặc biệt và kiểm tra không tăng counter hai lần.

`Paleontologist`, `Long March`, `Student`, `Master Crafter`, `Light Bringer`, trap, `Miracle`, `Laroxian Power` và phần lớn quest tiêu diệt đã được nối.

### 2. Achievements

Game Android dùng Google Play Games; bản web cần một hệ achievement nội bộ có hành vi tương đương.

- [ ] Tạo schema lưu achievement, progress và trạng thái đã mở khóa.
- [ ] Theo dõi các số liệu lịch sử không thể suy ra từ state hiện tại:
  - wealth cao nhất;
  - số adventurer cao nhất;
  - tổng số lần craft/bán;
  - potion mastery;
  - doctrine mastery;
  - dungeon, raid và unique milestone.
- [ ] Port chính xác điều kiện/mốc của từng achievement từ code gốc.
- [ ] Làm màn hình achievement và trạng thái locked/unlocked/progress.
- [ ] Nối nút `Achievements` trong drawer; hiện nút này chưa thực hiện hành động.
- [ ] Thêm toast/animation khi achievement được mở khóa.
- [ ] Bảo đảm migration không làm mất progress của save cũ.

### 3. Audit cuối các mechanic item/passive

- [x] Lập ma trận toàn bộ field của item/passive trong content gốc với nơi xử lý tương ứng trong combat/economy engine.
- [x] Kiểm tra các hiệu ứng hiếm, hiệu ứng kết hợp và thứ tự áp dụng modifier.
- [x] Kiểm tra stacking, rounding, cap, immunity và thời điểm tick đầu/cuối turn.
- [x] Thêm test cho các tổ hợp item/passive có thể thay đổi kết quả combat.

Mechanic potion, geode, `Intercession`, `Rejuvenation`, `Clumsiness`, Evo23 và 14 rare trait đã được triển khai. Phần còn lại ở đây là audit parity, không phải làm lại các hệ đó.

#### Bằng chứng audit parity (2026-08-03)

- `public/data/quests.json` có đúng 56 quest: 40 counter trực tiếp trong combat/economy và 16 counter tiêu diệt qua bảng enemy + area; static coverage là 56/56, không còn quest ID thiếu instrumentation.
- Counter kill chỉ tính enemy còn trong roster với `hp <= 0`; enemy dùng `ACTIVE_ESCAPE` không bị tính là kill. Các điều kiện đặc biệt được khóa theo đúng area/event: Shahuri trio, Sand Statue, Insane Citizen, Claris + Thorvus, Tabula Rasa theo số corpse trong turn và Delirious chỉ ở Angry Eye.
- 607 item definitions có 42 field khác nhau: 38 field mechanic/economy được nối qua `stats.ts`, `combatants()`/combat reaction chain và merchant/market/chest/workshop lifecycle; `idName`, `idDescription`, `idImage`, `idEffect` là 4 field metadata hiển thị, không phải mechanic.
- Rare weapon overrides đã được khóa gồm Colossal/Void, Serpent trio, Staff of the Archmage và Unstable Staff; item poison potency, duplicate status stacking, BLEED stacking, team targeting, rounding, damage/heal cap, retaliation order và status tick order đều có regression coverage.
- 124 passive IDs duy nhất trong content (59 adventurer + 69 enemy) được xử lý qua field-driven combat data hoặc 20 nhánh engine đặc biệt; enemy `team` nằm trong `fields.team` và đã được nối đúng cho Banshee/Celestial/Iconoclast/Oculus.

## P0 — UI battle 1:1

Battle UI đã được đối chiếu với `dialog_dungeon_detail.xml`, `layout_entity_fighting.xml` và `DialogDungeonDetail.java`, sau đó kiểm tra runtime ở mobile. Phần pixel-diff Android/web vẫn cần Android runtime để chụp đúng cùng một frame.

- [x] Đối chiếu và chỉnh chính xác bố cục battlefield, party, enemy, thanh máu/mana, turn/progress và combat log.
- [x] Kiểm tra layout ở các trạng thái:
  - đòn đánh thường;
  - cast skill;
  - miss, crit, block và immunity;
  - buff/debuff/status tick;
  - summon;
  - chết, hồi sinh và respawn;
  - đội hình đông và raid.
- [x] Khớp kích thước, khoảng cách, typography, màu, border, shadow và layering với bản gốc.
- [x] Làm đầy đủ animation damage/heal number, hit, miss, crit, status, death và resurrection.
- [x] Làm transition vào/ra battle, kết quả trận, loot và mở khóa; result raid phân biệt victory/defeat/retreat và không đóng mất result khi kho đầy.
- [~] Chụp screenshot cùng trạng thái giữa Android và web để làm visual diff; đã có web runtime screenshot, nhưng workspace không có `adb`/Android emulator để chụp APK gốc.
- [x] Chốt parity trên màn hình 360×800 và 390×844.

#### Bằng chứng QA battle (2026-08-03)

- `DialogDungeonDetail`/`layout_entity_fighting` đã được map vào `src/App.tsx` và `src/App.css`: 5 enemy, 15 party theo 3 hàng, pet/moon, status, HP/shield/mana, progress hai phía, log tối đa 100 dòng, click detail, retreat/close và result/loot.
- Đã khóa lại các chi tiết từ XML/runtime: entity 62dp với mana nằm trên HP, padding đội hình >8 người, log mặc định trong suốt (`darkLog=true`), damage shake 800ms, status/death/revive animation, và darkness động cho Ancient Grave, Tower, Blizzard và Obsidian Mines.
- Entity detail battle hiện có current HP/shield/mana, stat, active/passive, trait, equipment, status và enemy drops; raid result giữ lại dialog khi collect thất bại vì storage đầy.
- Browser smoke đã kiểm tra ở 360×800 và 390×844: đòn đánh thường, cast skill, miss/mitigation, damage number, tombstone/respawn, log mới nhất, click enemy, click adventurer và xác nhận retreat; không có overflow ở đáy dialog.
- `npm test -- --run`: 157/157; `npm run build`: pass; `npm run lint`: pass với 6 cảnh báo Fast Refresh tồn tại từ trước.

## P1 — Visual parity toàn game

- [~] Screenshot-diff các màn hình chính được bỏ qua theo yêu cầu ngày 2026-08-03; parity được kiểm tra bằng XML/layout gốc và DOM metrics:
  - Headquarters;
  - Adventurers;
  - Dungeons và Raids;
  - Market/Merchant;
  - Blacksmith/Workshop;
  - Academy/Promotion;
  - Shelter/Pets;
  - Messages;
  - Bestiary;
  - FAQ;
  - toàn bộ dialog và drawer.
- [x] Khớp top bar, bottom navigation, drawer, modal, button state và badge theo `activity_main.xml`, drawable shape và màu gốc.
- [x] Hoàn thiện animation craft/market completion, unlock/view transition, thư chưa đọc và loot/chest có thể nhận; tôn trọng `prefers-reduced-motion`.
- [x] Kiểm tra safe area, chiều cao viewport động và thao tác chạm ở 320×640, 360×800 và 390×844.
- [x] Sửa overflow trên màn hình nhỏ, card adventurer đủ ba equipment slot và chuỗi dài tự ellipsis.
- [x] Giữ styling/animation mới nhưng không làm thay đổi vị trí, luồng thao tác hoặc thông tin của UI gốc.

#### Bằng chứng visual parity không dùng screenshot (2026-08-03)

- Design token đã khớp resources gốc: app `#303030`, dialog `#424242`, drawer `#282828/#505050`, text/border `#c8c8c8`, brass `#faa03e`.
- Shape dùng đúng drawable gốc: overlay trắng 12%, stroke 1dp, radius 10dp; dialog stroke đen 3dp, radius 10dp.
- Headquarters khớp `fragment_headquarters.xml`: padding 16dp, card một cột, gap 16dp, sign 42×54 tại offset trái 24dp, title 20sp.
- Adventurers khớp `layout_adventurer.xml`: portrait 60dp, tên/trait và ba equipment slot 44dp cách nhau 8dp.
- Dungeon/Raid khớp `layout_dungeon.xml`: card cao 150dp, ảnh khu vực rộng cố định 300dp, title 24sp, loot 46dp.
- Dialog thường/wide, inventory, quest, doctrine, pet, bestiary, roster, team picker và battle overlays đã dùng chung palette/shape Android.
- DOM QA xác nhận không tràn ngang ở 320px, bottom navigation cố định 56px, drawer 72vw tối đa 280px và không có console error.

## P1 — Content và localization

- [ ] Việt hóa đầy đủ title/body của 17 lá thư nhà vua; hiện content gốc chủ yếu vẫn là tiếng Anh.
- [ ] Audit tên và mô tả của enemy, item, adventurer, quest, doctrine và trait.
- [ ] Thay enum/ID kỹ thuật trong UI bằng tên và mô tả đúng của game:
  - doctrine ability;
  - rare trait;
  - một số effect/passive.
- [ ] Hiển thị mô tả rare trait trong màn chọn Evo23 thay vì chỉ tên enum viết hoa.
- [ ] Đối chiếu FAQ với nguyên văn game gốc; bản hiện tại là bản diễn giải ngắn.
- [ ] Kiểm tra toàn bộ placeholder trong chuỗi động: số lượng, tên, phần trăm, thời gian và số nhiều.
- [ ] Kiểm tra font, ký tự đặc biệt và xuống dòng của cả tiếng Việt lẫn tiếng Anh.

## P1 — Save, migration và độ ổn định

- [ ] Thêm fixture/test migration cho mọi version save từ `1` đến `18`.
- [ ] Kiểm tra các field mới như achievements, quest event, potion count, dismissed adventurer, message và bestiary.
- [ ] Kiểm tra save cũ thiếu field, field sai kiểu và dữ liệu bị dở dang.
- [ ] Chạy thử offline progression đủ giới hạn 12 giờ với save lớn.
- [ ] Kiểm tra reload/tab close giữa lúc craft, market, mission và combat.
- [ ] Bảo đảm không thể nhân đôi reward qua reload hoặc thao tác nhiều tab.
- [ ] Thêm phương án backup/export-import save nếu cần cho bản phát hành.

## P1 — Test và QA trước khi gọi là hoàn tất

- [ ] Component test cho các màn hình và dialog quan trọng.
- [ ] Browser E2E cho luồng từ guild mới đến dungeon, promotion, pet, raid và endgame.
- [ ] Một progression smoke test xuyên suốt từ new game đến toàn bộ raid.
- [ ] Visual regression ở các độ phân giải mobile mục tiêu.
- [ ] Test toàn bộ button/action để không còn nút no-op ngoài Shop bị khóa có chủ đích.
- [ ] Performance test cho combat dài, raid đông, offline progression và save lớn.
- [ ] Tách bundle/code-splitting để xử lý cảnh báo chunk lớn hơn 500 kB.
- [ ] Chạy lại các gate cuối: unit tests, build, lint và browser smoke test.

Baseline hiện tại: `157` test đã pass; build pass; lint pass với `6` cảnh báo Fast Refresh tồn tại từ trước.

## P2 — Hoàn thiện bản web

Các mục này phục vụ chất lượng phát hành web, không phải mechanic gốc:

- [ ] Keyboard/focus state và accessibility cơ bản.
- [ ] PWA manifest, icon, offline asset cache và install flow nếu phát hành dạng PWA.
- [ ] Production error boundary, logging và version hiển thị trong game.
- [ ] Kiểm tra cache invalidation khi cập nhật content hoặc save schema.
- [ ] Thiết lập deploy production sau khi chốt parity.

## Ngoài phạm vi hiện tại — Shop, gem bundle và SePay

- [ ] Nút `Shop` hiện vẫn bị disable có chủ đích.
- [ ] Chưa làm danh sách gem bundle.
- [ ] Chưa tích hợp tạo giao dịch SePay, QR/chuyển khoản hoặc webhook.
- [ ] Chưa có server xác minh thanh toán/idempotency/chống cộng gem hai lần.
- [ ] Chưa có lịch sử giao dịch, trạng thái pending/expired/paid/refunded.
- [ ] Chưa có kiểm soát bảo mật, rate limit và đối soát.

Chỉ bắt đầu phase này sau khi checklist clone 1:1 phía trên được nghiệm thu.

## Thứ tự thực hiện đề xuất

1. Hoàn thiện và test các quest counter đặc biệt.
2. Port achievement và nối nút drawer.
3. Audit toàn bộ item/passive edge case.
4. Làm lại battle UI bằng screenshot diff với game gốc.
5. Visual parity và localization toàn game.
6. Save migration, E2E, progression test và performance.
7. Chốt clone 1:1.
8. Sau đó mới thiết kế Shop và tích hợp SePay.

## Definition of Done cho clone 1:1

Bản clone chỉ được xem là hoàn tất khi:

- [x] 56/56 quest có điều kiện và counter đúng.
- [x] Tất cả mechanic/item/passive đã có mapping và test.
- [ ] Achievement có bản web tương đương và lưu progress đúng.
- [ ] Không còn nút no-op hoặc placeholder trong luồng gameplay.
- [x] Battle UI và các màn hình chính được đối chiếu bằng XML/layout gốc và DOM metrics; screenshot comparison được miễn theo yêu cầu hiện tại.
- [ ] Save version cũ migrate an toàn và không nhân đôi reward.
- [ ] Unit test, E2E, build và lint đều đạt.
- [ ] Shop/SePay vẫn được loại khỏi tiêu chí này theo quyết định hiện tại.
