# Guild Hall & Legacy System

## Trạng thái

Tài liệu đề xuất. Chưa triển khai.

## Mục tiêu

- Thay màn hình Headquarters dạng danh sách bằng một không gian có bản sắc hơn.
- Cho người chơi nhìn thấy hoạt động của guild mà không biến giao diện thành dashboard quản trị.
- Tạo vòng đời dài hạn cho Adventurer đã Ascend và đạt cấp cao.
- Giữ Tavern hữu ích ở endgame bằng cơ chế Mentor và người kế thừa.
- Không làm mất giá trị của promotion, rare trait, Doctrine hoặc equipment.

---

## 1. Guild Hall

Guild Hall là màn hình trung tâm của guild. Đây là một căn phòng tương tác, nơi các chức năng hiện tại được biểu diễn bằng vật thể, NPC và trạng thái trực quan.

### Bố cục đề xuất

```text
          [Trophy Wall]         [King's Banner]

  [Notice Board]     [War Table]     [Guild Ledger]

        [Adventurers nghỉ ngơi và trò chuyện]

  [Tavern] [Workshop] [Storage] [Market] [Shelter]
```

### Khu vực chính

#### War Table

- Hiển thị các expedition và raid đang chạy.
- Mở nhanh chi tiết trận đấu hoặc báo cáo chuyến đi.
- Hiển thị các team preset đã lưu.
- Báo raid còn lượt và khu vực tiếp theo sắp mở khóa.
- Phát sáng khi một expedition đã kết thúc hoặc có chest chưa nhận.

#### Notice Board

- Quest đang hoạt động và quest đã hoàn thành.
- King's Messages chưa đọc.
- Thông báo quan trọng của guild.
- Cho phép mở thẳng đúng quest hoặc lá thư liên quan.

#### Trophy Wall

- Boss và raid đã hoàn thành.
- Achievement nổi bật.
- Vật phẩm độc nhất hoặc trophy quan trọng.
- Chân dung các Adventurer đã retire vào Hall of Legends.

#### Guild Ledger

- Market listing đang hoạt động.
- Coin từ vật phẩm đã bán đang chờ nhận.
- Workshop job đã hoàn thành.
- Lịch sử hoạt động gần đây của guild.
- Không hiển thị toàn bộ inventory hoặc các biểu đồ quản trị phức tạp.

#### Roster Area

- Adventurer đang rảnh xuất hiện trong Hall.
- Adventurer đang đi dungeon hoặc raid không xuất hiện.
- Pet yêu thích có thể xuất hiện cạnh chủ.
- Nhấn vào Adventurer để mở detail, equipment, promotion, Doctrine và Legacy.
- Adventurer vừa trở về có thể hiện biểu tượng loot hoặc một lời thoại ngắn.

### Thông báo bằng môi trường

Guild Hall không cần một danh sách cảnh báo lớn. Trạng thái nên được thể hiện trực tiếp trên vật thể:

- Notice Board sáng khi có quest hoàn thành.
- Guild Ledger có túi coin khi Market bán xong.
- Workshop có hiệu ứng lửa khi craft hoàn tất.
- War Table phát sáng khi expedition kết thúc.
- King's Banner chuyển động khi có thư mới.
- Storage có cảnh báo khi gần hoặc đã đầy.

### Cấp độ Guild Hall

| Cấp | Hình thức | Tiện ích chính |
| --- | --- | --- |
| 1 | Phòng gỗ nhỏ | War Table và Notice Board |
| 2 | Đại sảnh được mở rộng | Trophy Wall và thêm team preset |
| 3 | Công trình bằng đá | Hall of Legends và banner Doctrine |
| 4 | Đại sảnh hoàng gia | Nhiều vị trí trophy và hiệu ứng Adventurer |
| 5 | Guild Hall huyền thoại | Tượng Legend, khung và hiệu ứng đặc biệt |

Nâng cấp Guild Hall nên tập trung vào hình ảnh và tiện ích. Không nên cung cấp buff combat lớn.

### Phạm vi MVP

Phiên bản đầu chỉ cần:

1. War Table.
2. Notice Board.
3. Trophy Wall/Hall of Legends.
4. Adventurer đang rảnh xuất hiện trong Hall.
5. Badge trạng thái trên các khu vực tương tác.

Animation, pet đi lại, lời thoại và nhiều cấp trang trí có thể bổ sung sau.

---

## 2. Heritage / Legacy System

Legacy được thể hiện dưới dạng truyền thừa giữa Mentor và người kế thừa. Không bắt buộc sử dụng quan hệ huyết thống vì Adventurer được tuyển từ Tavern.

### Vòng lặp chính

1. Một Adventurer đã Ascend và đạt điều kiện Legacy.
2. Người chơi đưa Adventurer vào Hall of Legends bằng hành động **Retire as Legend**.
3. Adventurer rời roster vĩnh viễn và để lại một Legacy.
4. Người chơi chọn một Adventurer mới làm Heir/Student.
5. Người kế thừa nhận một Heritage Trait có nguồn gốc từ class, Doctrine hoặc thành tích của Mentor.
6. Legend được lưu vĩnh viễn trong lịch sử Guild Hall.

### Điều kiện retire đề xuất

- Adventurer đã Ascend.
- Đã trở lại class cấp cao và đạt level yêu cầu.
- Đã hoàn thành một số dungeon hoặc raid tối thiểu.
- Không tham gia expedition tại thời điểm retire.
- Storage còn đủ chỗ nhận lại equipment.

Điều kiện chính xác cần được cân bằng sau khi đo thời gian progression thực tế.

### Hậu quả của retire

- Adventurer rời roster vĩnh viễn.
- Không thể dùng Recall.
- Equipment được trả về Storage.
- Pet không bị mất và trở về Shelter.
- Adventurer xuất hiện trong Hall of Legends.
- Một Legacy được tạo từ hành trình thực tế của nhân vật.

Màn xác nhận phải hiển thị rõ đây là hành động không thể hoàn tác. Có thể yêu cầu nhập tên Adventurer để xác nhận.

### Nguồn tạo Legacy

#### Class Heritage

- Sword/Tank: HP, threat, defense hoặc khả năng bảo vệ đội.
- Rogue: dodge, critical hoặc hiệu quả với trap.
- Archer: accuracy, initiative hoặc sát thương tầm xa.
- Mage: Intelligence, mana hoặc hiệu quả status.

#### Doctrine Echo

- Affliction: poison, curse hoặc lifesteal.
- Control: khả năng áp dụng và chống status.
- Fortitude: HP, defense hoặc khả năng sống sót.
- Grace: healing và hỗ trợ đồng đội.
- Illusion: dodge và khả năng tránh nguy hiểm.
- Knowledge: EXP, mana hoặc chỉ số tổng hợp.
- Ruin: critical damage và tấn công dồn sát thương.
- War: counterattack và sức mạnh vũ khí.

Doctrine Echo chỉ nên cho một bonus nhỏ hoặc hiệu ứng đặc trưng. Không nên cấp quá nhiều Loyalty Point trực tiếp.

#### Deed Legacy

Legacy có thể được mở khóa bởi thành tích thực tế:

- Boss Slayer: tiêu diệt nhiều boss.
- Survivor: hoàn thành raid mà không gục ngã.
- Pathfinder: khám phá nhiều area.
- Beast Hunter: tiêu diệt nhiều loại enemy.
- Veteran: hoàn thành nhiều expedition.
- Guardian: chịu lượng sát thương lớn trong khi bảo vệ đồng đội.

### Quy tắc kế thừa

- Mỗi Adventurer có một Heritage slot.
- Heritage độc lập với normal trait và rare trait.
- Một Legacy có thể giới hạn theo class family hoặc weapon family.
- Heritage không tương thích vẫn được lưu nhưng tạm vô hiệu.
- Người chơi được chọn người kế thừa; không sử dụng roll ngẫu nhiên.
- Không cộng dồn nhiều bản sao của cùng một Legacy.
- Thế hệ sau không tự động mạnh hơn thế hệ trước.
- Generation chủ yếu mở danh hiệu, lịch sử, khung và cosmetic.

### Cân bằng và PvP

- Bonus nên có giới hạn thấp và thiên về bản sắc thay vì cộng stat lớn.
- Không truyền toàn bộ skill, Doctrine ability hoặc equipment effect của Mentor.
- Matchmaking PvP cần tính Heritage vào team power.
- Chế độ ranked có thể giới hạn số Heritage hoặc sử dụng bracket riêng.
- Không nên bán Legacy power trực tiếp bằng gem hoặc tiền thật.

---

## 3. Ví dụ hoàn chỉnh: Eternal Fortress retire

### Legend

- Tên: **Bran**
- Class: **Eternal Fortress**
- Trạng thái: Ascended, level 45
- Doctrine: **Fortitude**
- Thành tích: hoàn thành 20 raid, chịu lượng sát thương lớn và nhiều lần sống sót dưới 10% HP

Khi đủ điều kiện, Guild Hall hiển thị:

> Bran đã đạt đến đỉnh cao sự nghiệp và có thể nghỉ hưu để đào tạo thế hệ tiếp theo.

### Xác nhận retire

```text
RETIRE AS LEGEND

Bran sẽ:
- Rời roster vĩnh viễn
- Trả toàn bộ trang bị về Storage
- Không thể Recall
- Xuất hiện trong Hall of Legends
- Tạo Legacy: The Unbroken Wall
```

### Legacy: The Unbroken Wall

Tương thích với dòng Footman/Warrior và các class sword/tank.

- Tăng 5% Max HP.
- Lần đầu HP xuống dưới 30% trong mỗi encounter, nhận shield bằng 8% Max HP.
- Hiệu ứng shield chỉ kích hoạt một lần trong mỗi encounter.

Legacy này mang dấu ấn của Eternal Fortress nhưng không truyền nguyên bộ chỉ số hoặc skill của class.

### Người kế thừa

Người chơi tuyển một Footman mới tên **Mira** và chỉ định cô làm người kế thừa.

```text
Mentor: Bran, The Eternal Fortress
Heir: Mira, Footman
Legacy: The Unbroken Wall

[CONFIRM INHERITANCE]
```

Mira nhận:

- Danh hiệu **Heir of Bran**.
- Biểu tượng Heritage bên cạnh rare trait.
- Legacy **The Unbroken Wall**.
- Một dòng tiểu sử ghi nhận Mentor.

> Được huấn luyện bởi Bran, người từng đứng vững khi cả đội hình phía sau đã gục ngã.

Mira vẫn bắt đầu ở level 1 và phải promotion bình thường:

```text
Footman
  -> Warrior
    -> Guard
      -> Iron Warden
        -> Iron Defender
          -> Juggernaut
            -> Titan
              -> Undying Bastion
                -> Eternal Fortress
```

Nếu Mira chuyển sang class không tương thích, Heritage vẫn được giữ nhưng tạm vô hiệu.

### Bản ghi trong Hall of Legends

```text
BRAN - THE ETERNAL FORTRESS

Doctrine: Fortitude
Raid completed: 20
Highest damage endured: 18,450
Legacy: The Unbroken Wall
Current heir: Mira
Generation: I
```

Người chơi có thể mở chân dung Bran để xem:

- Lịch sử promotion.
- Trang bị cuối cùng từng sử dụng.
- Raid đáng nhớ nhất.
- Thành tích cá nhân.
- Người kế thừa hiện tại.

### Khi Mira retire

Nếu Mira sau này đạt điều kiện retire:

- Cô chỉ được truyền một Legacy.
- Có thể tiếp tục truyền The Unbroken Wall hoặc tạo Legacy từ thành tích của chính mình.
- Legacy không tự động tăng sức mạnh theo số thế hệ.
- Generation II mở thêm danh hiệu, lịch sử và cosmetic cho dòng truyền thừa.

---

## 4. Các quyết định cần chốt trước khi triển khai

1. Điều kiện level và thành tích tối thiểu để retire.
2. Một Legacy được gắn với một Heir hay có thể dùng cho nhiều Adventurer.
3. Có cho phép đổi Heir trước khi Heritage được kích hoạt hay không.
4. Heritage có hoạt động trong PvP ranked hay chỉ PvE.
5. Số lượng Legend tối đa được trưng bày trực tiếp trong Guild Hall.
6. Guild Hall là màn thay thế Headquarters hay một building riêng.
7. Chỉ số và trigger chính xác của từng Legacy cần được cân bằng bằng dữ liệu progression thực tế.
