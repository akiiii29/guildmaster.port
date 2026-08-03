/// <reference types="node" />
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { localizeLog, localizeName } from './i18n'

interface ExtractedArea {
  name: string
}

describe('Vietnamese content localization', () => {
  it('covers every extracted area name', () => {
    const areas = JSON.parse(
      readFileSync(new URL('../../public/data/areas.json', import.meta.url), 'utf8'),
    ) as ExtractedArea[]

    for (const area of areas) {
      const localized = localizeName('vi', area.name)
      expect(localized, `missing Vietnamese name for ${area.name}`).not.toBe('')
      if (area.name !== 'Kaunis') expect(localized).not.toBe(area.name)
    }
  })

  it('uses localized area names in expedition and unlock logs', () => {
    expect(localizeLog('vi', 'The party entered The Desert.')).toBe('Đội đã tiến vào Sa Mạc.')
    expect(localizeLog('vi', 'The Golden City has been unlocked.')).toBe('Đã mở khóa Thành Phố Hoàng Kim.')
  })

  it('localizes The Desert event and search logs', () => {
    expect(localizeLog('vi', "Sha'huri deterrent system activated, threat level: [37/100]"))
      .toBe("Hệ thống răn đe Sha'huri đã kích hoạt, mức đe dọa: [37/100]")
    expect(localizeLog('vi', 'Looking around the place, you found 1 Quartz.'))
      .toBe('Tìm kiếm xung quanh, bạn tìm thấy 1 Thạch anh.')
  })

  it('removes Java resource escaping from both languages', () => {
    expect(localizeName('en', "Sha\\'huri Warrior")).toBe("Sha'huri Warrior")
    expect(localizeName('vi', "Sha\\'huri Warrior")).toBe("Chiến binh Sha'huri")
    expect(localizeLog('en', "Sha\\'huri Warrior dealt 7 damage to Footman."))
      .toBe("Sha'huri Warrior dealt 7 damage to Footman.")
  })

  it('localizes Enchanted Forest narrative and trap results', () => {
    expect(localizeLog('vi', 'There is a sound of a branch cracking. The team turns around.'))
      .toBe('Tiếng cành cây gãy vang lên. Cả đội lập tức quay lại.')
    expect(localizeLog('vi', "Footman couldn't avoid the trap and took 7 damage. Dodge chance was 28%."))
      .toBe('Bộ binh không né được bẫy và chịu 7 sát thương. Tỷ lệ né là 28%.')
  })

  it('localizes Eternal Battlefield hunt and darkness trap logs', () => {
    expect(localizeLog('vi', "The Will o' Wisp thanks you for freeing it from its mortal body. [Will o' Wisps slain: 88/200]"))
      .toBe('Ma trơi cảm ơn bạn đã giải thoát nó khỏi thể xác phàm trần. [Ma trơi đã tiêu diệt: 88/200]')
    expect(localizeLog('vi', 'Dodge roll is made with Intelligence. Difficulty is 21.'))
      .toBe('Kiểm tra né tránh bằng Trí tuệ. Độ khó là 21.')
  })

  it('localizes Golden City enemies, narrative, and eye drain logs', () => {
    expect(localizeName('vi', 'Arcane Assassin')).toBe('Sát thủ Bí thuật')
    expect(localizeLog('vi', 'After turning a corner, angry citizen attack the group.'))
      .toBe('Vừa rẽ qua một góc phố, những cư dân giận dữ lao vào tấn công cả đội.')
    expect(localizeLog('vi', '17 HP was drawn from Footman.'))
      .toBe('17 HP đã bị rút khỏi Bộ binh.')
  })

  it('localizes Blackwater Port narrative, loot, and Constitution traps', () => {
    expect(localizeName('vi', 'Mysterious Tentacle')).toBe('Xúc tu bí ẩn')
    expect(localizeLog('vi', 'The unknown mass goes back to the dark ocean depths.'))
      .toBe('Khối vật thể bí ẩn rút trở lại vực sâu tăm tối của đại dương.')
    expect(localizeLog('vi', 'Dodge roll is made with Constitution. Difficulty is 20.'))
      .toBe('Kiểm tra né tránh bằng Thể chất. Độ khó là 20.')
  })

  it('localizes Frostbite Peaks Blizzard and locked-crate logs', () => {
    expect(localizeName('vi', 'Snow Wyvern')).toBe('Wyvern Tuyết')
    expect(localizeLog('vi', 'The blizzard has ceased.')).toBe('Trận bão tuyết đã ngừng.')
    expect(localizeLog('vi', 'Footman succeeded!')).toBe('Bộ binh đã thành công!')
    expect(localizeLog('vi', 'Footman failed, breaking the lock.')).toBe('Bộ binh thất bại và làm hỏng ổ khóa.')
  })

  it('localizes Obsidian Mines horror and enemy content', () => {
    expect(localizeName('vi', 'Pale Hermit')).toBe('Ẩn sĩ nhợt nhạt')
    expect(localizeName('vi', 'Obsidian Chunk')).toBe('Khối hắc diện thạch')
    expect(localizeLog('vi', 'An unspeakable horror noticed your presence.'))
      .toBe('Một nỗi kinh hoàng không thể gọi tên đã nhận ra sự hiện diện của cả đội.')
  })

  it('localizes The Dreadful Ascent enemies, artifact, and final narrative', () => {
    expect(localizeName('vi', 'Ethereal Soul')).toBe('Linh hồn hư ảo')
    expect(localizeName('vi', 'Kasimir, the Seer')).toBe('Kasimir, Nhà Tiên Tri')
    expect(localizeName('vi', 'Herald Kali')).toBe('Sứ giả Kali')
    expect(localizeName('vi', 'Serpent Staff')).toBe('Trượng Xà Thần')
    expect(localizeLog('vi', 'The team takes a deep breath and begins the dreadful ascent.'))
      .toBe('Cả đội hít một hơi thật sâu và bắt đầu cuộc leo lên kinh hoàng.')
    expect(localizeLog('vi', 'The purple pillar ascending into the sky instantly snaps, twisting like a cut appendage. As the mountain quickly deflates, the clouds start dissipating showing the stars behind. Two colossal maws, each bigger than a whole mountain, close violently around the body of the Seer. They slowly retreat into the vastness of the night, leaving behind nothing but a small, unremarkable red book.'))
      .toContain('Hai chiếc hàm khổng lồ')
  })

  it('localizes Celestial Mothership units, loot, and raid narrative', () => {
    expect(localizeName('vi', 'Celestial Mothership')).toBe('Mẫu Hạm Thiên Giới')
    expect(localizeName('vi', 'Reinforced Door')).toBe('Cửa gia cố')
    expect(localizeName('vi', 'Legate Hadrian')).toBe('Sứ thần Hadrian')
    expect(localizeName('vi', 'Evo-23 Vial')).toBe('Lọ Evo-23')
    expect(localizeLog('vi', 'With its source of power irreversibly compromised, the G.C.S.S. deactivates.'))
      .toContain('ngừng hoạt động')
    expect(localizeLog('vi', 'As the room begins to collapse, someone pulls a lever on the right wall. In an instant, the team is teleported to high ground miles away, where they watch the building crumble from a safe distance.'))
      .toContain('được dịch chuyển')
  })

  it('localizes The Dire Descent Heralds, artifacts, and raid narrative', () => {
    expect(localizeName('vi', 'Herald Xavi')).toBe('Sứ giả Xavi')
    expect(localizeName('vi', 'Herald Maya')).toBe('Sứ giả Maya')
    expect(localizeName('vi', 'Herald Shoran')).toBe('Sứ giả Shoran')
    expect(localizeName('vi', 'Serpent Lunge')).toBe('Xà Đột')
    expect(localizeName('vi', 'Serpent Sting')).toBe('Xà Thứ')
    expect(localizeName('vi', 'Serpent Bite')).toBe('Xà Phệ')
    expect(localizeLog('vi', "Beneath the fiery volcano, a network of tunnels descends into the planet's depths. The heat is unbearable, yet the expedition presses on with unwavering determination."))
      .toContain('mạng lưới đường hầm')
    expect(localizeLog('vi', '“Your quest ends here, Adventurers.”'))
      .toBe('“Hành trình của các ngươi kết thúc tại đây, hỡi các Mạo hiểm giả.”')
    expect(localizeLog('vi', 'Herald Xavi used Botched Sacrifice, but no one answers the call.'))
      .toBe('Sứ giả Xavi dùng Hiến tế thất bại, nhưng không ai đáp lại lời triệu gọi.')
    expect(localizeLog('vi', "The guild's expedition is over. They slowly ascend towards the surface, eager to see the sunlight once more."))
      .toContain('nhìn thấy ánh mặt trời')
  })

  it("localizes Ancient Grave Digging enemies, boss event, and raid narrative", () => {
    expect(localizeName('vi', 'Undead General')).toBe('Tướng xác sống')
    expect(localizeName('vi', "Ka\\'Bar, the Rotten")).toBe("Ka'Bar, Kẻ Mục Rữa")
    expect(localizeName('vi', 'Necrolith')).toBe('Cự Tượng Cốt Linh')
    expect(localizeLog('vi', 'The adventurers take the first step beyond the open door.'))
      .toBe('Các mạo hiểm giả bước bước đầu tiên qua cánh cửa đang mở.')
    expect(localizeLog('vi', "Without its master's magic to hold the pieces together, the Necrolith crumbles to dust."))
      .toContain('vỡ vụn thành bụi')
    expect(localizeLog('vi', "The room is now empty, and the screams have stopped. There isn't really a way to kill a lich, but it should stay quiet for a while. The team turns back and reaches for the surface."))
      .toContain('tiến lên mặt đất')
  })

  it('localizes The Slime Pond variants, encounters, and ending', () => {
    expect(localizeName('vi', 'Slime')).toBe('Khối nhầy')
    expect(localizeName('vi', 'Fire Slime')).toBe('Slime Lửa')
    expect(localizeName('vi', 'Electric Slime')).toBe('Slime Điện')
    expect(localizeName('vi', 'Frozen Slime')).toBe('Slime Băng')
    expect(localizeName('vi', 'Void Slime')).toBe('Slime Hư Không')
    expect(localizeName('vi', 'Slime King')).toBe('Vua Slime')
    expect(localizeLog('vi', 'The slimes attack!')).toBe('Lũ slime tấn công!')
    expect(localizeLog('vi', 'With unnatural agility, it makes a higher leap and lands exactly in front of the team.'))
      .toContain('đáp xuống ngay trước mặt')
    expect(localizeLog('vi', "The King of the Slimes slowly loses consistency, becoming almost liquid. It seeps into the ground like rainwater leaving no trace, while the other slimes scatter in panic. You wonder if these creatures were peaceful before the corruption, and will make sure to report your findings to the kingdom's taxonomists to understand more of their nature."))
      .toContain('các nhà phân loại học')
  })

  it('localizes Divine Archeology bosses, artifacts, and Constitution gate', () => {
    expect(localizeName('vi', 'Sand Demon')).toBe('Quỷ Cát')
    expect(localizeName('vi', "Sha\\'kire, First Swordsman")).toBe("Sha'kire, Đệ Nhất Kiếm Sĩ")
    expect(localizeName('vi', 'Sha, the Hidden God')).toBe('Sha, Vị Thần Ẩn Giấu')
    expect(localizeName('vi', 'Eyes of the Swordsman')).toBe('Đôi Mắt Kiếm Sĩ')
    expect(localizeName('vi', 'Divine Zygote')).toBe('Hợp Tử Thần Thánh')
    expect(localizeLog('vi', "Sha'huri deterrent system activated, threat level: EXTINCTION."))
      .toContain('mức đe dọa: TUYỆT DIỆT')
    expect(localizeLog('vi', "Together, the adventurers push the door with all their strength. However, it doesn't seem to move. [Global Constitution required: 200]"))
      .toContain('[Tổng Thể chất yêu cầu: 200]')
    expect(localizeLog('vi', 'Cracks starts forming on the alien being surface, as its eye look around frantically, almost scared. Suddenly, it explodes in a thousand pieces, leaving almost no trace. Almost, because on the ground lies a strange trinket…'))
      .toContain('món trang sức kỳ lạ')
  })

  it('localizes Imperial Rescue boss, artifact, and palace narrative', () => {
    expect(localizeName('vi', 'Emperor Clovis XXVIII')).toBe('Hoàng đế Clovis XXVIII')
    expect(localizeName('vi', 'Skeleton Key')).toBe('Chìa Khóa Xương')
    expect(localizeLog('vi', 'An inhumane scream comes from above the opened door, behind the team. Looking up, a hideous creature, still dressed in royal insignia, leaps down from the ceiling.'))
      .toContain('vương hiệu')
    expect(localizeLog('vi', "The open door reveals the Emperor's Throne Room. It has been thrashed, without a single furniture being intact or in it's supposed place."))
      .toContain('Phòng Ngai')
    expect(localizeLog('vi', 'With the Emperor finally at rest, the team leaves the forsaken palace to report the events to the King.'))
      .toContain('đã được yên nghỉ')
  })

  it('localizes both Cultist Rebels routes and experiment notes', () => {
    expect(localizeName('vi', 'Crusader')).toBe('Thập Tự Quân')
    expect(localizeName('vi', 'Lesser Titan')).toBe('Tiểu Titan')
    expect(localizeName('vi', 'Primordial Titan')).toBe('Titan Nguyên Thủy')
    expect(localizeLog('vi', 'Noticing a resemblance between the symbol and the handle of the Skeleton Key, they try to see if it fits. It does! The door unlocks.'))
      .toContain('Chìa Khóa Xương')
    expect(localizeLog('vi', 'The next room is perfectly circular. In the middle, a gigantic construct made of white marble is standing, surrounded by magic devices and held in place by enormous steel chains.'))
      .toContain('xích thép đồ sộ')
    expect(localizeLog('vi', 'The notes read:\n\nExperiment n.1:\nSubjects: 2 farmers, male and female, taken last night from the village in the eartern valley. Low to moderate psyonic capabilities.\nResult: failure, two lesser titans produced.'))
      .toContain('Thí nghiệm số 1')
  })

  it('localizes both Lost Expedition routes and dynamic fall damage', () => {
    expect(localizeName('vi', 'Bleak Disciple')).toBe('Môn Đồ U Ám')
    expect(localizeName('vi', 'Eldritch Hound')).toBe('Chó Săn Dị Giới')
    expect(localizeName('vi', "Tekeli\\'li, First Apostle")).toBe("Tekeli'li, Tông Đồ Đầu Tiên")
    expect(localizeName('vi', 'Avatar of the Ancient')).toBe('Hóa Thân Cổ Thần')
    expect(localizeLog('vi', 'Footman lost 31 HP from the fall.')).toBe('Bộ binh mất 31 HP do cú rơi.')
    expect(localizeLog('vi', 'At the end of the corridor lies a vast, semi-spherical room. In the center, something that defies human comprehension is being fed the corpse of a massive beholder by obedient servants.'))
      .toContain('vượt ngoài hiểu biết con người')
    expect(localizeLog('vi', "Shaken by the terrible monster they just vanquished, the team begins to climb the endless stairs towards the temple's entrance."))
      .toContain('cầu thang vô tận')
  })

  it('localizes Sleeping Planet enemies and the complete raid narrative', () => {
    expect(localizeName('vi', 'Dreamwrought Beast')).toBe('Dã Thú Dệt Mộng')
    expect(localizeName('vi', 'Dreamwrought Dragon')).toBe('Cự Long Dệt Mộng')
    expect(localizeName('vi', 'Dreamwrought Swarm')).toBe('Bầy Đàn Dệt Mộng')
    expect(localizeName('vi', 'Dreamwrought Forge')).toBe('Lò Rèn Dệt Mộng')
    expect(localizeName('vi', 'Singularity')).toBe('Điểm Kỳ Dị')
    expect(localizeLog('vi', 'The machine lights up, and the molten core reveals a passage into an eerie world teeming with alien flora. The expedition steps through the portal and finds itself surrounded by towering mushrooms, as tall as trees.'))
      .toContain('hệ thực vật ngoài hành tinh')
    expect(localizeLog('vi', '"We won\'t allow you to hurt the Singularity!"'))
      .toContain('Điểm Kỳ Dị')
    expect(localizeLog('vi', 'The images of three horses materialize before the adventurers.'))
      .toContain('ba con ngựa')
    expect(localizeLog('vi', '"And then, when death was abolished and defenses were lowered, the Serpent manifested in our skies, and started eating it. Forever.'))
      .toContain('Xà Thần')
    expect(localizeLog('vi', 'The Singularity stops moving, deprived of its energy. It goes back to a peaceful sleep.'))
      .toContain('giấc ngủ yên bình')
  })

  it('localizes Kaunis enemies, council, and the complete raid narrative', () => {
    expect(localizeName('vi', 'Necrobot')).toBe('Tử Cơ Nhân')
    expect(localizeName('vi', 'Enforcer')).toBe('Đao Phủ')
    expect(localizeName('vi', 'Phantasm')).toBe('Ảo Linh')
    expect(localizeName('vi', 'Cerebrum')).toBe('Khối Não')
    expect(localizeName('vi', 'Chief Scientist Ava')).toBe('Trưởng Khoa Học Gia Ava')
    expect(localizeName('vi', 'King Aino')).toBe('Vua Aino')
    expect(localizeName('vi', 'First Minister Atos')).toBe('Tể Tướng Atos')
    expect(localizeLog('vi', 'The machine lights up, and the molten core reveals a passage to a desolate land, with a sky darkened by ominous clouds. The expedition steps through and arrives at the edge of a dilapidated village, marked by strange, unfamiliar architecture.'))
      .toContain('ngôi làng đổ nát')
    expect(localizeLog('vi', 'He speaks of the discovery of immortality, and of the mental decay triggered by the repeated return of the Black Serpent.'))
      .toContain('Hắc Xà')
    expect(localizeLog('vi', 'Beyond the door, the Royal Council sits around a table, strewn with rotten food and shattered bottles.'))
      .toContain('Hội Đồng Hoàng Gia')
    expect(localizeLog('vi', 'They raise from their seats and attack.'))
      .toBe('Chúng đứng dậy khỏi ghế và tấn công.')
    expect(localizeLog('vi', 'The council members lie on the ground, with the mysterious technology already repairing their wounds. The adventurers start their travel back to the portal.'))
      .toContain('trở lại cánh cổng')
  })

  it('localizes The Tower prisoners, rest events, and finale', () => {
    expect(localizeName('vi', 'Headless Knight')).toBe('Kỵ Sĩ Không Đầu')
    expect(localizeName('vi', 'The Ancient')).toBe('Cổ Thần')
    expect(localizeName('vi', 'The Machine')).toBe('Cỗ Máy')
    expect(localizeLog('vi', "Adventurer's HP have been replenished")).toContain('hồi đầy')
    expect(localizeLog('vi', 'An Adventurer was resurrected')).toContain('hồi sinh')
    expect(localizeLog('vi', '"A wound on this universe, barely contained but never healed. Eternal glory will come to its saviour, unending suffering to everything else."'))
      .toContain('vết thương của vũ trụ')
    expect(localizeLog('vi', '"But I digress. You reached a legendary achievement not many can boast. Tales will be written about your victory. I had a lot of fun, and hope you come try again in the future!"'))
      .toContain('kỳ tích huyền thoại')
  })

  it('localizes The Southern Grove chase, enemies, and materials', () => {
    expect(localizeName('vi', 'Primeval Wurm')).toBe('Cự trùng nguyên thủy')
    expect(localizeName('vi', 'Giant Tortoise')).toBe('Rùa khổng lồ')
    expect(localizeName('vi', 'Elysian Wood')).toBe('Gỗ Elysian')
    expect(localizeLog('vi', 'A rumbling sound is quickly approaching. With an average dexterity of 83, it will reach the team in 65 turns.'))
      .toBe('Tiếng ầm ầm đang nhanh chóng tiến lại gần. Với Nhanh nhẹn trung bình 83, nó sẽ đuổi kịp cả đội sau 65 lượt.')
    expect(localizeLog('vi', 'The Primeval Wurm stands as tall as a mountain. It tries to devour the team with unexpected speed.'))
      .toContain('Cự Trùng Nguyên Thủy')
  })

  it('localizes Barren Wastelands enemies and alien trap narrative', () => {
    expect(localizeName('vi', 'Celestial Destroyer')).toBe('Kẻ hủy diệt Thiên Giới')
    expect(localizeName('vi', 'Oculus')).toBe('Nhãn cầu')
    expect(localizeName('vi', 'Elastic Membrane')).toBe('Màng đàn hồi')
    expect(localizeLog('vi', 'The team steps into an unavoidable fight.'))
      .toBe('Cả đội bước vào một trận chiến không thể tránh khỏi.')
    expect(localizeLog('vi', 'In the ground, in an abandoned Banshee burrow, lies a poorly concealed alien weapon. The team is about to step on the tripwire.'))
      .toContain('vũ khí ngoài hành tinh')
  })

  it('localizes Hidden City of Larox Nexus state and content', () => {
    expect(localizeName('vi', 'Archmage of Larox')).toBe('Đại pháp sư Larox')
    expect(localizeName('vi', 'Magic Armor')).toBe('Giáp ma pháp')
    expect(localizeName('vi', 'Unstable Gem')).toBe('Ngọc bất ổn')
    expect(localizeLog('vi', 'In the distance, the Nexus shifts rapidly, forming shapes that defy human understanding. It emits a pulsating light before settling into a new, enigmatic configuration.\nMagic Damage amplification is now -50%'))
      .toContain('Khuếch đại sát thương phép hiện là -50%')
    expect(localizeLog('vi', "An old man pulls the team aside. He praises your actions on the surface and, unlike the haughty members of the council, expresses genuine hope that you succeed in reaching the lower caverns. He uncorks a vial with a dark liquid.\nAdventurers' HP are fully restored, harmful effects are cleansed."))
      .toContain('mọi hiệu ứng bất lợi được thanh tẩy')
  })

  it('localizes Lost Lands Fire Ritual, Titan, and Diamond discovery', () => {
    expect(localizeName('vi', 'Smoldering Titan')).toBe('Titan Rực Than')
    expect(localizeName('vi', 'Stone Shaman')).toBe('Shaman Đá')
    expect(localizeName('vi', 'Diamond')).toBe('Kim cương')
    expect(localizeLog('vi', 'The Fire Ritual is 73% complete.')).toBe('Nghi lễ Lửa đã hoàn thành 73%.')
    expect(localizeLog('vi', 'An immense being, as tall as the ceiling of the cavern, emerges from the raging volcano.'))
      .toContain('sinh vật khổng lồ')
  })
})
