import type { GameState, InventoryStack } from './types'

export interface RecipeDefinition {
  id: string
  result: InventoryStack
  ingredients: InventoryStack[]
}

// Generated from the APK Recipes enum. Keep this data-driven list in sync with it.
export const RECIPES: RecipeDefinition[] = [
  {
    id: "Cloth",
    result: {
      itemId: "Cloth",
      stack: 1
    },
    ingredients: [
      {
        itemId: "PlantFiber",
        stack: 4
      }
    ]
  },
  {
    id: "Leather",
    result: {
      itemId: "Leather",
      stack: 1
    },
    ingredients: [
      {
        itemId: "BeastPelt",
        stack: 2
      }
    ]
  },
  {
    id: "CopperIngot",
    result: {
      itemId: "CopperIngot",
      stack: 1
    },
    ingredients: [
      {
        itemId: "CopperOre",
        stack: 3
      }
    ]
  },
  {
    id: "TuskNecklace",
    result: {
      itemId: "TuskNecklace",
      stack: 1
    },
    ingredients: [
      {
        itemId: "BoarTusk",
        stack: 4
      },
      {
        itemId: "PlantFiber",
        stack: 1
      }
    ]
  },
  {
    id: "LeatherJacket",
    result: {
      itemId: "LeatherJacket",
      stack: 1
    },
    ingredients: [
      {
        itemId: "Leather",
        stack: 2
      },
      {
        itemId: "Cloth",
        stack: 2
      }
    ]
  },
  {
    id: "FangDagger",
    result: {
      itemId: "FangDagger",
      stack: 1
    },
    ingredients: [
      {
        itemId: "Wood",
        stack: 6
      },
      {
        itemId: "AlphaWolfFang",
        stack: 1
      }
    ]
  },
  {
    id: "FullmoonDagger",
    result: {
      itemId: "FullmoonDagger",
      stack: 1
    },
    ingredients: [
      {
        itemId: "Wood",
        stack: 6
      },
      {
        itemId: "WerewolfFang",
        stack: 1
      }
    ]
  },
  {
    id: "ClothRobe",
    result: {
      itemId: "ClothRobe",
      stack: 1
    },
    ingredients: [
      {
        itemId: "Cloth",
        stack: 3
      }
    ]
  },
  {
    id: "EnchantedStaff",
    result: {
      itemId: "EnchantedStaff",
      stack: 1
    },
    ingredients: [
      {
        itemId: "Wood",
        stack: 10
      },
      {
        itemId: "AncientSeed",
        stack: 1
      }
    ]
  },
  {
    id: "CopperSword",
    result: {
      itemId: "CopperSword",
      stack: 1
    },
    ingredients: [
      {
        itemId: "Wood",
        stack: 3
      },
      {
        itemId: "CopperIngot",
        stack: 2
      }
    ]
  },
  {
    id: "CopperArmor",
    result: {
      itemId: "CopperArmor",
      stack: 1
    },
    ingredients: [
      {
        itemId: "Leather",
        stack: 1
      },
      {
        itemId: "CopperIngot",
        stack: 2
      }
    ]
  },
  {
    id: "InfusedNecklace",
    result: {
      itemId: "InfusedNecklace",
      stack: 1
    },
    ingredients: [
      {
        itemId: "TuskNecklace",
        stack: 1
      },
      {
        itemId: "LivingSap",
        stack: 1
      }
    ]
  },
  {
    id: "WoodenBow",
    result: {
      itemId: "WoodenBow",
      stack: 1
    },
    ingredients: [
      {
        itemId: "Wood",
        stack: 5
      },
      {
        itemId: "PlantFiber",
        stack: 1
      }
    ]
  },
  {
    id: "LeatherBoots",
    result: {
      itemId: "LeatherBoots",
      stack: 1
    },
    ingredients: [
      {
        itemId: "Leather",
        stack: 2
      },
      {
        itemId: "Cloth",
        stack: 1
      }
    ]
  },
  {
    id: "LeatherGloves",
    result: {
      itemId: "LeatherGloves",
      stack: 1
    },
    ingredients: [
      {
        itemId: "Leather",
        stack: 1
      },
      {
        itemId: "Cloth",
        stack: 2
      }
    ]
  },
  {
    id: "CopperHelmet",
    result: {
      itemId: "CopperHelmet",
      stack: 1
    },
    ingredients: [
      {
        itemId: "CopperIngot",
        stack: 2
      },
      {
        itemId: "Leather",
        stack: 2
      }
    ]
  },
  {
    id: "WoodenBuckler",
    result: {
      itemId: "WoodenBuckler",
      stack: 1
    },
    ingredients: [
      {
        itemId: "Wood",
        stack: 6
      }
    ]
  },
  {
    id: "GhostRabbitCloak",
    result: {
      itemId: "GhostRabbitCloak",
      stack: 1
    },
    ingredients: [
      {
        itemId: "CottontailFur",
        stack: 4
      },
      {
        itemId: "SpectralCloth",
        stack: 10
      }
    ]
  },
  {
    id: "CottontailJacket",
    result: {
      itemId: "CottontailJacket",
      stack: 1
    },
    ingredients: [
      {
        itemId: "CottontailFur",
        stack: 4
      },
      {
        itemId: "Leather",
        stack: 10
      }
    ]
  },
  {
    id: "PatricianArmor",
    result: {
      itemId: "PatricianArmor",
      stack: 1
    },
    ingredients: [
      {
        itemId: "CottontailFur",
        stack: 4
      },
      {
        itemId: "GoldIngot",
        stack: 10
      }
    ]
  },
  {
    id: "SageCloak",
    result: {
      itemId: "SageCloak",
      stack: 1
    },
    ingredients: [
      {
        itemId: "GhostRabbitCloak",
        stack: 1
      },
      {
        itemId: "InfusionOfWisdom",
        stack: 1
      }
    ]
  },
  {
    id: "SageJacket",
    result: {
      itemId: "SageJacket",
      stack: 1
    },
    ingredients: [
      {
        itemId: "CottontailJacket",
        stack: 1
      },
      {
        itemId: "InfusionOfWisdom",
        stack: 1
      }
    ]
  },
  {
    id: "SageArmor",
    result: {
      itemId: "SageArmor",
      stack: 1
    },
    ingredients: [
      {
        itemId: "PatricianArmor",
        stack: 1
      },
      {
        itemId: "InfusionOfWisdom",
        stack: 1
      }
    ]
  },
  {
    id: "IronIngot",
    result: {
      itemId: "IronIngot",
      stack: 1
    },
    ingredients: [
      {
        itemId: "ScrapMetal",
        stack: 3
      }
    ]
  },
  {
    id: "Glass",
    result: {
      itemId: "Glass",
      stack: 1
    },
    ingredients: [
      {
        itemId: "Sandstone",
        stack: 5
      }
    ]
  },
  {
    id: "GlassKnife",
    result: {
      itemId: "GlassKnife",
      stack: 1
    },
    ingredients: [
      {
        itemId: "Glass",
        stack: 4
      },
      {
        itemId: "Quartz",
        stack: 1
      }
    ]
  },
  {
    id: "WurmscalesShield",
    result: {
      itemId: "WurmscalesShield",
      stack: 1
    },
    ingredients: [
      {
        itemId: "WurmScale",
        stack: 8
      },
      {
        itemId: "IronIngot",
        stack: 3
      }
    ]
  },
  {
    id: "MetamorphicShield",
    result: {
      itemId: "MetamorphicShield",
      stack: 1
    },
    ingredients: [
      {
        itemId: "WurmscalesShield",
        stack: 1
      },
      {
        itemId: "MetamorphicSand",
        stack: 30
      }
    ]
  },
  {
    id: "FeatherRobe",
    result: {
      itemId: "FeatherRobe",
      stack: 1
    },
    ingredients: [
      {
        itemId: "Feather",
        stack: 24
      }
    ]
  },
  {
    id: "WurmscalesGloves",
    result: {
      itemId: "WurmscalesGloves",
      stack: 1
    },
    ingredients: [
      {
        itemId: "WurmScale",
        stack: 8
      },
      {
        itemId: "Feather",
        stack: 8
      }
    ]
  },
  {
    id: "Scimitar",
    result: {
      itemId: "Scimitar",
      stack: 1
    },
    ingredients: [
      {
        itemId: "Wood",
        stack: 12
      },
      {
        itemId: "IronIngot",
        stack: 2
      },
      {
        itemId: "RecurveBlade",
        stack: 1
      }
    ]
  },
  {
    id: "LivingScimitar",
    result: {
      itemId: "LivingScimitar",
      stack: 1
    },
    ingredients: [
      {
        itemId: "Scimitar",
        stack: 1
      },
      {
        itemId: "BottledSandSpirit",
        stack: 1
      }
    ]
  },
  {
    id: "DjinnTonic",
    result: {
      itemId: "DjinnTonic",
      stack: 1
    },
    ingredients: [
      {
        itemId: "Glass",
        stack: 5
      },
      {
        itemId: "IronIngot",
        stack: 1
      },
      {
        itemId: "BottledSandSpirit",
        stack: 1
      }
    ]
  },
  {
    id: "ShahuriBow",
    result: {
      itemId: "ShahuriBow",
      stack: 1
    },
    ingredients: [
      {
        itemId: "ShahuriBowFrame",
        stack: 1
      },
      {
        itemId: "PlantFiber",
        stack: 1
      }
    ]
  },
  {
    id: "IronChainmail",
    result: {
      itemId: "IronChainmail",
      stack: 1
    },
    ingredients: [
      {
        itemId: "WurmScale",
        stack: 9
      },
      {
        itemId: "IronIngot",
        stack: 5
      }
    ]
  },
  {
    id: "WurmscalesJacket",
    result: {
      itemId: "WurmscalesJacket",
      stack: 1
    },
    ingredients: [
      {
        itemId: "WurmScale",
        stack: 18
      },
      {
        itemId: "Feather",
        stack: 6
      }
    ]
  },
  {
    id: "WurmscalesBoots",
    result: {
      itemId: "WurmscalesBoots",
      stack: 1
    },
    ingredients: [
      {
        itemId: "WurmScale",
        stack: 12
      },
      {
        itemId: "Feather",
        stack: 4
      }
    ]
  },
  {
    id: "IronHelm",
    result: {
      itemId: "IronHelm",
      stack: 1
    },
    ingredients: [
      {
        itemId: "IronIngot",
        stack: 4
      },
      {
        itemId: "Leather",
        stack: 2
      }
    ]
  },
  {
    id: "MoltenStaff",
    result: {
      itemId: "MoltenStaff",
      stack: 1
    },
    ingredients: [
      {
        itemId: "Glass",
        stack: 5
      },
      {
        itemId: "IronIngot",
        stack: 10
      },
      {
        itemId: "SunfireCore",
        stack: 2
      }
    ]
  },
  {
    id: "ContainmentOrb",
    result: {
      itemId: "ContainmentOrb",
      stack: 1
    },
    ingredients: [
      {
        itemId: "Glass",
        stack: 5
      },
      {
        itemId: "SoulShard",
        stack: 1
      }
    ]
  },
  {
    id: "UndeadGreaves",
    result: {
      itemId: "UndeadGreaves",
      stack: 1
    },
    ingredients: [
      {
        itemId: "BoneFragment",
        stack: 20
      },
      {
        itemId: "SpectralCloth",
        stack: 3
      },
      {
        itemId: "ElongatedBone",
        stack: 2
      }
    ]
  },
  {
    id: "UndeadHelm",
    result: {
      itemId: "UndeadHelm",
      stack: 1
    },
    ingredients: [
      {
        itemId: "BoneFragment",
        stack: 20
      },
      {
        itemId: "TatteredHide",
        stack: 4
      }
    ]
  },
  {
    id: "UndeadGloves",
    result: {
      itemId: "UndeadGloves",
      stack: 1
    },
    ingredients: [
      {
        itemId: "BoneFragment",
        stack: 14
      },
      {
        itemId: "SpectralCloth",
        stack: 4
      },
      {
        itemId: "SharpRib",
        stack: 2
      }
    ]
  },
  {
    id: "UndeadStaff",
    result: {
      itemId: "UndeadStaff",
      stack: 1
    },
    ingredients: [
      {
        itemId: "BoneFragment",
        stack: 30
      },
      {
        itemId: "ElongatedBone",
        stack: 1
      },
      {
        itemId: "WarlordSkull",
        stack: 1
      }
    ]
  },
  {
    id: "UndeadShield",
    result: {
      itemId: "UndeadShield",
      stack: 1
    },
    ingredients: [
      {
        itemId: "BoneFragment",
        stack: 10
      },
      {
        itemId: "IronIngot",
        stack: 5
      }
    ]
  },
  {
    id: "UndeadSword",
    result: {
      itemId: "UndeadSword",
      stack: 1
    },
    ingredients: [
      {
        itemId: "BoneFragment",
        stack: 30
      },
      {
        itemId: "ElongatedBone",
        stack: 1
      }
    ]
  },
  {
    id: "UndeadJacket",
    result: {
      itemId: "UndeadJacket",
      stack: 1
    },
    ingredients: [
      {
        itemId: "BoneFragment",
        stack: 24
      },
      {
        itemId: "TatteredHide",
        stack: 12
      }
    ]
  },
  {
    id: "UndeadCuirass",
    result: {
      itemId: "UndeadCuirass",
      stack: 1
    },
    ingredients: [
      {
        itemId: "TatteredHide",
        stack: 12
      },
      {
        itemId: "BoneFragment",
        stack: 24
      }
    ]
  },
  {
    id: "GhastlyCuirass",
    result: {
      itemId: "GhastlyCuirass",
      stack: 1
    },
    ingredients: [
      {
        itemId: "TatteredHide",
        stack: 12
      },
      {
        itemId: "BoneFragment",
        stack: 1000
      },
      {
        itemId: "OrbOfEctoplasm",
        stack: 2
      }
    ]
  },
  {
    id: "GhastlyScimitar",
    result: {
      itemId: "GhastlyScimitar",
      stack: 1
    },
    ingredients: [
      {
        itemId: "LivingScimitar",
        stack: 1
      },
      {
        itemId: "OrbOfEctoplasm",
        stack: 1
      }
    ]
  },
  {
    id: "GhastlyShield",
    result: {
      itemId: "GhastlyShield",
      stack: 1
    },
    ingredients: [
      {
        itemId: "UndeadShield",
        stack: 1
      },
      {
        itemId: "OrbOfEctoplasm",
        stack: 1
      }
    ]
  },
  {
    id: "UndeadKnife",
    result: {
      itemId: "UndeadKnife",
      stack: 1
    },
    ingredients: [
      {
        itemId: "BoneFragment",
        stack: 30
      },
      {
        itemId: "SharpRib",
        stack: 1
      }
    ]
  },
  {
    id: "SkullCandle",
    result: {
      itemId: "SkullCandle",
      stack: 1
    },
    ingredients: [
      {
        itemId: "WarlordSkull",
        stack: 1
      },
      {
        itemId: "SpiritCandle",
        stack: 1
      }
    ]
  },
  {
    id: "ThaumaturgicBlood",
    result: {
      itemId: "ThaumaturgicBlood",
      stack: 1
    },
    ingredients: [
      {
        itemId: "InfectedBlood",
        stack: 3
      },
      {
        itemId: "AncientSeed",
        stack: 1
      }
    ]
  },
  {
    id: "BurningCenser",
    result: {
      itemId: "BurningCenser",
      stack: 1
    },
    ingredients: [
      {
        itemId: "IronIngot",
        stack: 8
      },
      {
        itemId: "SkullCandle",
        stack: 1
      },
      {
        itemId: "ThaumaturgicBlood",
        stack: 3
      }
    ]
  },
  {
    id: "SpectralRobe",
    result: {
      itemId: "SpectralRobe",
      stack: 1
    },
    ingredients: [
      {
        itemId: "SpectralCloth",
        stack: 15
      }
    ]
  },
  {
    id: "AscendedBow",
    result: {
      itemId: "AscendedBow",
      stack: 1
    },
    ingredients: [
      {
        itemId: "ShahuriBow",
        stack: 1
      },
      {
        itemId: "StaticCore",
        stack: 2
      }
    ]
  },
  {
    id: "SinisterStabilizer",
    result: {
      itemId: "SinisterStabilizer",
      stack: 1
    },
    ingredients: [
      {
        itemId: "HolyWater",
        stack: 5
      },
      {
        itemId: "OrbOfEctoplasm",
        stack: 3
      },
      {
        itemId: "PrimordialEssence",
        stack: 3
      }
    ]
  },
  {
    id: "RedwoodBow",
    result: {
      itemId: "RedwoodBow",
      stack: 1
    },
    ingredients: [
      {
        itemId: "Redwood",
        stack: 40
      },
      {
        itemId: "SilkThread",
        stack: 1
      }
    ]
  },
  {
    id: "CrimsonLeech",
    result: {
      itemId: "CrimsonLeech",
      stack: 1
    },
    ingredients: [
      {
        itemId: "Redwood",
        stack: 48
      },
      {
        itemId: "Ruby",
        stack: 4
      },
      {
        itemId: "EssenceOfCorruption",
        stack: 1
      }
    ]
  },
  {
    id: "SilkFabric",
    result: {
      itemId: "SilkFabric",
      stack: 1
    },
    ingredients: [
      {
        itemId: "SilkThread",
        stack: 4
      }
    ]
  },
  {
    id: "SilkRobe",
    result: {
      itemId: "SilkRobe",
      stack: 1
    },
    ingredients: [
      {
        itemId: "SilkFabric",
        stack: 12
      }
    ]
  },
  {
    id: "RubyRing",
    result: {
      itemId: "RubyRing",
      stack: 1
    },
    ingredients: [
      {
        itemId: "SilverRing",
        stack: 1
      },
      {
        itemId: "Ruby",
        stack: 1
      }
    ]
  },
  {
    id: "EmeraldRing",
    result: {
      itemId: "EmeraldRing",
      stack: 1
    },
    ingredients: [
      {
        itemId: "SilverRing",
        stack: 1
      },
      {
        itemId: "Emerald",
        stack: 1
      }
    ]
  },
  {
    id: "BeltJacket",
    result: {
      itemId: "BeltJacket",
      stack: 1
    },
    ingredients: [
      {
        itemId: "WardenBelt",
        stack: 16
      },
      {
        itemId: "SilkFabric",
        stack: 8
      }
    ]
  },
  {
    id: "IvoryJacket",
    result: {
      itemId: "IvoryJacket",
      stack: 1
    },
    ingredients: [
      {
        itemId: "BeltJacket",
        stack: 1
      },
      {
        itemId: "Ivory",
        stack: 5
      }
    ]
  },
  {
    id: "GoldIngot",
    result: {
      itemId: "GoldIngot",
      stack: 1
    },
    ingredients: [
      {
        itemId: "GoldScraps",
        stack: 3
      }
    ]
  },
  {
    id: "EssenceOfCorruption",
    result: {
      itemId: "EssenceOfCorruption",
      stack: 1
    },
    ingredients: [
      {
        itemId: "BlackOoze",
        stack: 30
      },
      {
        itemId: "PrimordialEssence",
        stack: 1
      }
    ]
  },
  {
    id: "CleansingPotion",
    result: {
      itemId: "CleansingPotion",
      stack: 1
    },
    ingredients: [
      {
        itemId: "EssenceOfCorruption",
        stack: 1
      },
      {
        itemId: "HolyWater",
        stack: 1
      }
    ]
  },
  {
    id: "ImperialShield",
    result: {
      itemId: "ImperialShield",
      stack: 1
    },
    ingredients: [
      {
        itemId: "CorruptedShield",
        stack: 1
      },
      {
        itemId: "CleansingPotion",
        stack: 1
      }
    ]
  },
  {
    id: "ImperialStaff",
    result: {
      itemId: "ImperialStaff",
      stack: 1
    },
    ingredients: [
      {
        itemId: "CorruptedStaff",
        stack: 1
      },
      {
        itemId: "CleansingPotion",
        stack: 1
      }
    ]
  },
  {
    id: "ArcaneDagger",
    result: {
      itemId: "ArcaneDagger",
      stack: 1
    },
    ingredients: [
      {
        itemId: "CorruptedDagger",
        stack: 1
      },
      {
        itemId: "CleansingPotion",
        stack: 1
      }
    ]
  },
  {
    id: "GoldenArmor",
    result: {
      itemId: "GoldenArmor",
      stack: 1
    },
    ingredients: [
      {
        itemId: "GoldIngot",
        stack: 16
      }
    ]
  },
  {
    id: "MetamorphicArmor",
    result: {
      itemId: "MetamorphicArmor",
      stack: 1
    },
    ingredients: [
      {
        itemId: "GoldenArmor",
        stack: 1
      },
      {
        itemId: "MetamorphicSand",
        stack: 120
      }
    ]
  },
  {
    id: "GoldenSword",
    result: {
      itemId: "GoldenSword",
      stack: 1
    },
    ingredients: [
      {
        itemId: "GoldIngot",
        stack: 14
      }
    ]
  },
  {
    id: "GoldenBoots",
    result: {
      itemId: "GoldenBoots",
      stack: 1
    },
    ingredients: [
      {
        itemId: "GoldIngot",
        stack: 8
      },
      {
        itemId: "SilkFabric",
        stack: 2
      }
    ]
  },
  {
    id: "GoldenGauntlets",
    result: {
      itemId: "GoldenGauntlets",
      stack: 1
    },
    ingredients: [
      {
        itemId: "GoldIngot",
        stack: 4
      },
      {
        itemId: "SilkFabric",
        stack: 5
      }
    ]
  },
  {
    id: "GoldenHelm",
    result: {
      itemId: "GoldenHelm",
      stack: 1
    },
    ingredients: [
      {
        itemId: "GoldIngot",
        stack: 10
      },
      {
        itemId: "SilkFabric",
        stack: 1
      }
    ]
  },
  {
    id: "GoldenShield",
    result: {
      itemId: "GoldenShield",
      stack: 1
    },
    ingredients: [
      {
        itemId: "GoldIngot",
        stack: 12
      }
    ]
  },
  {
    id: "JeweledCrown",
    result: {
      itemId: "JeweledCrown",
      stack: 1
    },
    ingredients: [
      {
        itemId: "GoldIngot",
        stack: 20
      },
      {
        itemId: "Ruby",
        stack: 10
      },
      {
        itemId: "Emerald",
        stack: 10
      }
    ]
  },
  {
    id: "GhostwoodBoard",
    result: {
      itemId: "GhostwoodBoard",
      stack: 1
    },
    ingredients: [
      {
        itemId: "GhostwoodStump",
        stack: 3
      }
    ]
  },
  {
    id: "BlackIronIngot",
    result: {
      itemId: "BlackIronIngot",
      stack: 1
    },
    ingredients: [
      {
        itemId: "BlackIronScraps",
        stack: 3
      }
    ]
  },
  {
    id: "CorsairLeather",
    result: {
      itemId: "CorsairLeather",
      stack: 1
    },
    ingredients: [
      {
        itemId: "MonkeyHide",
        stack: 2
      }
    ]
  },
  {
    id: "BlackIronArmor",
    result: {
      itemId: "BlackIronArmor",
      stack: 1
    },
    ingredients: [
      {
        itemId: "BlackIronIngot",
        stack: 18
      },
      {
        itemId: "CorsairLeather",
        stack: 3
      }
    ]
  },
  {
    id: "ExoticRobe",
    result: {
      itemId: "ExoticRobe",
      stack: 1
    },
    ingredients: [
      {
        itemId: "ExoticVelvet",
        stack: 30
      }
    ]
  },
  {
    id: "BlackIronHelm",
    result: {
      itemId: "BlackIronHelm",
      stack: 1
    },
    ingredients: [
      {
        itemId: "BlackIronIngot",
        stack: 12
      },
      {
        itemId: "CorsairLeather",
        stack: 2
      }
    ]
  },
  {
    id: "ExoticBoots",
    result: {
      itemId: "ExoticBoots",
      stack: 1
    },
    ingredients: [
      {
        itemId: "ExoticVelvet",
        stack: 4
      },
      {
        itemId: "CorsairLeather",
        stack: 16
      }
    ]
  },
  {
    id: "BlackIronGauntlets",
    result: {
      itemId: "BlackIronGauntlets",
      stack: 1
    },
    ingredients: [
      {
        itemId: "BlackIronIngot",
        stack: 10
      },
      {
        itemId: "CorsairLeather",
        stack: 5
      }
    ]
  },
  {
    id: "GhostwoodShield",
    result: {
      itemId: "GhostwoodShield",
      stack: 1
    },
    ingredients: [
      {
        itemId: "GhostwoodBoard",
        stack: 10
      },
      {
        itemId: "CorsairLeather",
        stack: 5
      }
    ]
  },
  {
    id: "BlackIronCutlass",
    result: {
      itemId: "BlackIronCutlass",
      stack: 1
    },
    ingredients: [
      {
        itemId: "GhostwoodBoard",
        stack: 5
      },
      {
        itemId: "BlackIronIngot",
        stack: 14
      }
    ]
  },
  {
    id: "BlackIronScepter",
    result: {
      itemId: "BlackIronScepter",
      stack: 1
    },
    ingredients: [
      {
        itemId: "BlackIronIngot",
        stack: 16
      }
    ]
  },
  {
    id: "BlackIronDagger",
    result: {
      itemId: "BlackIronDagger",
      stack: 1
    },
    ingredients: [
      {
        itemId: "GhostwoodBoard",
        stack: 2
      },
      {
        itemId: "BlackIronIngot",
        stack: 15
      }
    ]
  },
  {
    id: "GhostwoodBow",
    result: {
      itemId: "GhostwoodBow",
      stack: 1
    },
    ingredients: [
      {
        itemId: "ExoticVelvet",
        stack: 1
      },
      {
        itemId: "GhostwoodBoard",
        stack: 15
      }
    ]
  },
  {
    id: "AbyssalGoo",
    result: {
      itemId: "AbyssalGoo",
      stack: 1
    },
    ingredients: [
      {
        itemId: "AbyssalSeashell",
        stack: 30
      },
      {
        itemId: "MysteriousAppendage",
        stack: 24
      },
      {
        itemId: "EyeOfTheAbyss",
        stack: 1
      }
    ]
  },
  {
    id: "AbyssalIngot",
    result: {
      itemId: "AbyssalIngot",
      stack: 1
    },
    ingredients: [
      {
        itemId: "AbyssalGoo",
        stack: 1
      },
      {
        itemId: "BlackIronIngot",
        stack: 1
      }
    ]
  },
  {
    id: "DeepSeaVelvet",
    result: {
      itemId: "DeepSeaVelvet",
      stack: 1
    },
    ingredients: [
      {
        itemId: "AbyssalGoo",
        stack: 1
      },
      {
        itemId: "ExoticVelvet",
        stack: 1
      }
    ]
  },
  {
    id: "DeepSeaRobe",
    result: {
      itemId: "DeepSeaRobe",
      stack: 1
    },
    ingredients: [
      {
        itemId: "DeepSeaVelvet",
        stack: 2
      }
    ]
  },
  {
    id: "DeepSeaJacket",
    result: {
      itemId: "DeepSeaJacket",
      stack: 1
    },
    ingredients: [
      {
        itemId: "DeepSeaVelvet",
        stack: 2
      },
      {
        itemId: "CorsairLeather",
        stack: 8
      },
      {
        itemId: "AbyssalSeashell",
        stack: 15
      }
    ]
  },
  {
    id: "MonkeyHideJacket",
    result: {
      itemId: "MonkeyHideJacket",
      stack: 1
    },
    ingredients: [
      {
        itemId: "ExoticVelvet",
        stack: 10
      },
      {
        itemId: "CorsairLeather",
        stack: 8
      },
      {
        itemId: "AbyssalSeashell",
        stack: 15
      }
    ]
  },
  {
    id: "AbyssalCutlass",
    result: {
      itemId: "AbyssalCutlass",
      stack: 1
    },
    ingredients: [
      {
        itemId: "GhostwoodBoard",
        stack: 5
      },
      {
        itemId: "AbyssalIngot",
        stack: 2
      }
    ]
  },
  {
    id: "CrushingDepth",
    result: {
      itemId: "CrushingDepth",
      stack: 1
    },
    ingredients: [
      {
        itemId: "AscendedBow",
        stack: 1
      },
      {
        itemId: "StaticEssence",
        stack: 1
      },
      {
        itemId: "DeepSeaVelvet",
        stack: 1
      }
    ]
  },
  {
    id: "AbyssalCompendium",
    result: {
      itemId: "AbyssalCompendium",
      stack: 1
    },
    ingredients: [
      {
        itemId: "MissingPage",
        stack: 50
      }
    ]
  },
  {
    id: "PirateKingTricorn",
    result: {
      itemId: "PirateKingTricorn",
      stack: 1
    },
    ingredients: [
      {
        itemId: "ExoticVelvet",
        stack: 20
      },
      {
        itemId: "DeepSeaVelvet",
        stack: 5
      }
    ]
  },
  {
    id: "Wintercloth",
    result: {
      itemId: "Wintercloth",
      stack: 1
    },
    ingredients: [
      {
        itemId: "IceFiber",
        stack: 4
      }
    ]
  },
  {
    id: "FrostmetalIngot",
    result: {
      itemId: "FrostmetalIngot",
      stack: 1
    },
    ingredients: [
      {
        itemId: "FrostmetalOre",
        stack: 3
      }
    ]
  },
  {
    id: "FrostmetalSword",
    result: {
      itemId: "FrostmetalSword",
      stack: 1
    },
    ingredients: [
      {
        itemId: "Winterwood",
        stack: 6
      },
      {
        itemId: "FrostmetalIngot",
        stack: 18
      }
    ]
  },
  {
    id: "WinterwoodBow",
    result: {
      itemId: "WinterwoodBow",
      stack: 1
    },
    ingredients: [
      {
        itemId: "Winterwood",
        stack: 60
      },
      {
        itemId: "IceFiber",
        stack: 1
      }
    ]
  },
  {
    id: "WinterwoodStaff",
    result: {
      itemId: "WinterwoodStaff",
      stack: 1
    },
    ingredients: [
      {
        itemId: "Winterwood",
        stack: 50
      },
      {
        itemId: "FrostCrystal",
        stack: 1
      }
    ]
  },
  {
    id: "FrostmetalDagger",
    result: {
      itemId: "FrostmetalDagger",
      stack: 1
    },
    ingredients: [
      {
        itemId: "Winterwood",
        stack: 4
      },
      {
        itemId: "FrostmetalIngot",
        stack: 16
      }
    ]
  },
  {
    id: "WinterCape",
    result: {
      itemId: "WinterCape",
      stack: 1
    },
    ingredients: [
      {
        itemId: "Wintercloth",
        stack: 18
      }
    ]
  },
  {
    id: "TrollskinJacket",
    result: {
      itemId: "TrollskinJacket",
      stack: 1
    },
    ingredients: [
      {
        itemId: "TrollHide",
        stack: 48
      },
      {
        itemId: "Wintercloth",
        stack: 6
      }
    ]
  },
  {
    id: "FrostmetalArmor",
    result: {
      itemId: "FrostmetalArmor",
      stack: 1
    },
    ingredients: [
      {
        itemId: "TrollHide",
        stack: 24
      },
      {
        itemId: "FrostmetalIngot",
        stack: 16
      }
    ]
  },
  {
    id: "WinterBoots",
    result: {
      itemId: "WinterBoots",
      stack: 1
    },
    ingredients: [
      {
        itemId: "TrollHide",
        stack: 32
      },
      {
        itemId: "Wintercloth",
        stack: 4
      }
    ]
  },
  {
    id: "WinterGloves",
    result: {
      itemId: "WinterGloves",
      stack: 1
    },
    ingredients: [
      {
        itemId: "TrollHide",
        stack: 16
      },
      {
        itemId: "Wintercloth",
        stack: 8
      }
    ]
  },
  {
    id: "WinterHelm",
    result: {
      itemId: "WinterHelm",
      stack: 1
    },
    ingredients: [
      {
        itemId: "FrostmetalIngot",
        stack: 10
      },
      {
        itemId: "Wintercloth",
        stack: 4
      }
    ]
  },
  {
    id: "WinterShield",
    result: {
      itemId: "WinterShield",
      stack: 1
    },
    ingredients: [
      {
        itemId: "Winterwood",
        stack: 40
      },
      {
        itemId: "FrostmetalIngot",
        stack: 3
      }
    ]
  },
  {
    id: "CrystalStaff",
    result: {
      itemId: "CrystalStaff",
      stack: 1
    },
    ingredients: [
      {
        itemId: "FrostCrystal",
        stack: 10
      },
      {
        itemId: "FrostNucleus",
        stack: 1
      }
    ]
  },
  {
    id: "CrystalDagger",
    result: {
      itemId: "CrystalDagger",
      stack: 1
    },
    ingredients: [
      {
        itemId: "Winterwood",
        stack: 4
      },
      {
        itemId: "FrostCrystal",
        stack: 15
      }
    ]
  },
  {
    id: "CeremonialDagger",
    result: {
      itemId: "CeremonialDagger",
      stack: 1
    },
    ingredients: [
      {
        itemId: "FrostmetalIngot",
        stack: 16
      },
      {
        itemId: "FrozenScale",
        stack: 8
      },
      {
        itemId: "FrostNucleus",
        stack: 2
      }
    ]
  },
  {
    id: "FrozenEggPendant",
    result: {
      itemId: "FrozenEggPendant",
      stack: 1
    },
    ingredients: [
      {
        itemId: "IceFiber",
        stack: 1
      },
      {
        itemId: "FrozenScale",
        stack: 4
      },
      {
        itemId: "FrozenEgg",
        stack: 1
      }
    ]
  },
  {
    id: "IceCage",
    result: {
      itemId: "IceCage",
      stack: 1
    },
    ingredients: [
      {
        itemId: "FrozenEmbrace",
        stack: 1
      },
      {
        itemId: "FrozenEgg",
        stack: 1
      }
    ]
  },
  {
    id: "WyvernCape",
    result: {
      itemId: "WyvernCape",
      stack: 1
    },
    ingredients: [
      {
        itemId: "FrozenScale",
        stack: 6
      },
      {
        itemId: "Wintercloth",
        stack: 18
      }
    ]
  },
  {
    id: "NightwingLeather",
    result: {
      itemId: "NightwingLeather",
      stack: 1
    },
    ingredients: [
      {
        itemId: "BatWing",
        stack: 2
      }
    ]
  },
  {
    id: "SpiderSilk",
    result: {
      itemId: "SpiderSilk",
      stack: 1
    },
    ingredients: [
      {
        itemId: "CobwebBundle",
        stack: 4
      }
    ]
  },
  {
    id: "CrimsonBrew",
    result: {
      itemId: "CrimsonBrew",
      stack: 1
    },
    ingredients: [
      {
        itemId: "BatTooth",
        stack: 28
      },
      {
        itemId: "SpiderLeg",
        stack: 28
      },
      {
        itemId: "EldritchTendril",
        stack: 16
      }
    ]
  },
  {
    id: "ShadowPotion",
    result: {
      itemId: "ShadowPotion",
      stack: 1
    },
    ingredients: [
      {
        itemId: "CrimsonBrew",
        stack: 1
      },
      {
        itemId: "ShadowGem",
        stack: 1
      }
    ]
  },
  {
    id: "UnholyPotion",
    result: {
      itemId: "UnholyPotion",
      stack: 1
    },
    ingredients: [
      {
        itemId: "CrimsonBrew",
        stack: 1
      },
      {
        itemId: "VoodooDoll",
        stack: 1
      }
    ]
  },
  {
    id: "InfusionOfWisdom",
    result: {
      itemId: "InfusionOfWisdom",
      stack: 1
    },
    ingredients: [
      {
        itemId: "ElixirOfLearning",
        stack: 1
      },
      {
        itemId: "CrimsonBrew",
        stack: 1
      },
      {
        itemId: "SinisterStabilizer",
        stack: 1
      }
    ]
  },
  {
    id: "SpiderGloves",
    result: {
      itemId: "SpiderGloves",
      stack: 1
    },
    ingredients: [
      {
        itemId: "SpiderSilk",
        stack: 10
      },
      {
        itemId: "NightwingLeather",
        stack: 8
      }
    ]
  },
  {
    id: "SpiderBoots",
    result: {
      itemId: "SpiderBoots",
      stack: 1
    },
    ingredients: [
      {
        itemId: "SpiderSilk",
        stack: 6
      },
      {
        itemId: "NightwingLeather",
        stack: 16
      }
    ]
  },
  {
    id: "ObsidianHelm",
    result: {
      itemId: "ObsidianHelm",
      stack: 1
    },
    ingredients: [
      {
        itemId: "ObsidianChunk",
        stack: 48
      },
      {
        itemId: "SpiderSilk",
        stack: 2
      }
    ]
  },
  {
    id: "ObsidianShield",
    result: {
      itemId: "ObsidianShield",
      stack: 1
    },
    ingredients: [
      {
        itemId: "ObsidianChunk",
        stack: 56
      }
    ]
  },
  {
    id: "SpiderRobe",
    result: {
      itemId: "SpiderRobe",
      stack: 1
    },
    ingredients: [
      {
        itemId: "SpiderSilk",
        stack: 20
      }
    ]
  },
  {
    id: "NightwingJacket",
    result: {
      itemId: "NightwingJacket",
      stack: 1
    },
    ingredients: [
      {
        itemId: "SpiderSilk",
        stack: 6
      },
      {
        itemId: "NightwingLeather",
        stack: 30
      }
    ]
  },
  {
    id: "ObsidianCuirass",
    result: {
      itemId: "ObsidianCuirass",
      stack: 1
    },
    ingredients: [
      {
        itemId: "NightwingLeather",
        stack: 5
      },
      {
        itemId: "ObsidianChunk",
        stack: 75
      }
    ]
  },
  {
    id: "ObsidianSword",
    result: {
      itemId: "ObsidianSword",
      stack: 1
    },
    ingredients: [
      {
        itemId: "ObsidianChunk",
        stack: 72
      }
    ]
  },
  {
    id: "ObsidianDagger",
    result: {
      itemId: "ObsidianDagger",
      stack: 1
    },
    ingredients: [
      {
        itemId: "ObsidianChunk",
        stack: 68
      }
    ]
  },
  {
    id: "ObsidianBow",
    result: {
      itemId: "ObsidianBow",
      stack: 1
    },
    ingredients: [
      {
        itemId: "ObsidianChunk",
        stack: 62
      },
      {
        itemId: "SpiderSilk",
        stack: 2
      }
    ]
  },
  {
    id: "ObsidianScepter",
    result: {
      itemId: "ObsidianScepter",
      stack: 1
    },
    ingredients: [
      {
        itemId: "ObsidianChunk",
        stack: 72
      }
    ]
  },
  {
    id: "VampireSword",
    result: {
      itemId: "VampireSword",
      stack: 1
    },
    ingredients: [
      {
        itemId: "ObsidianSword",
        stack: 1
      },
      {
        itemId: "CrimsonBrew",
        stack: 1
      }
    ]
  },
  {
    id: "VampireDagger",
    result: {
      itemId: "VampireDagger",
      stack: 1
    },
    ingredients: [
      {
        itemId: "ObsidianDagger",
        stack: 1
      },
      {
        itemId: "CrimsonBrew",
        stack: 1
      }
    ]
  },
  {
    id: "VampireBow",
    result: {
      itemId: "VampireBow",
      stack: 1
    },
    ingredients: [
      {
        itemId: "ObsidianBow",
        stack: 1
      },
      {
        itemId: "CrimsonBrew",
        stack: 1
      }
    ]
  },
  {
    id: "VampireScepter",
    result: {
      itemId: "VampireScepter",
      stack: 1
    },
    ingredients: [
      {
        itemId: "ObsidianScepter",
        stack: 1
      },
      {
        itemId: "CrimsonBrew",
        stack: 1
      }
    ]
  },
  {
    id: "PanopticonStaff",
    result: {
      itemId: "PanopticonStaff",
      stack: 1
    },
    ingredients: [
      {
        itemId: "ObsidianChunk",
        stack: 120
      },
      {
        itemId: "LargeIris",
        stack: 4
      }
    ]
  },
  {
    id: "ShadowBow",
    result: {
      itemId: "ShadowBow",
      stack: 1
    },
    ingredients: [
      {
        itemId: "ObsidianBow",
        stack: 1
      },
      {
        itemId: "ShadowPotion",
        stack: 1
      }
    ]
  },
  {
    id: "ShadowDagger",
    result: {
      itemId: "ShadowDagger",
      stack: 1
    },
    ingredients: [
      {
        itemId: "ObsidianDagger",
        stack: 1
      },
      {
        itemId: "ShadowPotion",
        stack: 1
      }
    ]
  },
  {
    id: "UnholyCuirass",
    result: {
      itemId: "UnholyCuirass",
      stack: 1
    },
    ingredients: [
      {
        itemId: "ObsidianCuirass",
        stack: 1
      },
      {
        itemId: "UnholyPotion",
        stack: 1
      }
    ]
  },
  {
    id: "UnholySword",
    result: {
      itemId: "UnholySword",
      stack: 1
    },
    ingredients: [
      {
        itemId: "ObsidianSword",
        stack: 1
      },
      {
        itemId: "UnholyPotion",
        stack: 1
      }
    ]
  },
  {
    id: "ShadowRing",
    result: {
      itemId: "ShadowRing",
      stack: 1
    },
    ingredients: [
      {
        itemId: "SilverRing",
        stack: 1
      },
      {
        itemId: "ShadowGem",
        stack: 1
      }
    ]
  },
  {
    id: "WingFabric",
    result: {
      itemId: "WingFabric",
      stack: 1
    },
    ingredients: [
      {
        itemId: "GiantMothWing",
        stack: 4
      }
    ]
  },
  {
    id: "TortoiseArmor",
    result: {
      itemId: "TortoiseArmor",
      stack: 1
    },
    ingredients: [
      {
        itemId: "WingFabric",
        stack: 8
      },
      {
        itemId: "GiantShellFragment",
        stack: 92
      }
    ]
  },
  {
    id: "SpitfangJacket",
    result: {
      itemId: "SpitfangJacket",
      stack: 1
    },
    ingredients: [
      {
        itemId: "WingFabric",
        stack: 5
      },
      {
        itemId: "SpitfangScale",
        stack: 102
      }
    ]
  },
  {
    id: "MothRobe",
    result: {
      itemId: "MothRobe",
      stack: 1
    },
    ingredients: [
      {
        itemId: "WingFabric",
        stack: 29
      }
    ]
  },
  {
    id: "VerdantHelm",
    result: {
      itemId: "VerdantHelm",
      stack: 1
    },
    ingredients: [
      {
        itemId: "ElysianWood",
        stack: 84
      },
      {
        itemId: "GiantShellFragment",
        stack: 40
      }
    ]
  },
  {
    id: "TortoiseShield",
    result: {
      itemId: "TortoiseShield",
      stack: 1
    },
    ingredients: [
      {
        itemId: "GiantShellFragment",
        stack: 80
      }
    ]
  },
  {
    id: "VerdantBoots",
    result: {
      itemId: "VerdantBoots",
      stack: 1
    },
    ingredients: [
      {
        itemId: "WingFabric",
        stack: 5
      },
      {
        itemId: "ElysianWood",
        stack: 114
      }
    ]
  },
  {
    id: "VerdantGloves",
    result: {
      itemId: "VerdantGloves",
      stack: 1
    },
    ingredients: [
      {
        itemId: "WingFabric",
        stack: 8
      },
      {
        itemId: "ElysianWood",
        stack: 94
      }
    ]
  },
  {
    id: "FleetfootArmor",
    result: {
      itemId: "FleetfootArmor",
      stack: 1
    },
    ingredients: [
      {
        itemId: "TortoiseArmor",
        stack: 1
      },
      {
        itemId: "FleetfootFabric",
        stack: 38
      }
    ]
  },
  {
    id: "FleetfootJacket",
    result: {
      itemId: "FleetfootJacket",
      stack: 1
    },
    ingredients: [
      {
        itemId: "SpitfangJacket",
        stack: 1
      },
      {
        itemId: "FleetfootFabric",
        stack: 38
      }
    ]
  },
  {
    id: "FleetfootRobe",
    result: {
      itemId: "FleetfootRobe",
      stack: 1
    },
    ingredients: [
      {
        itemId: "MothRobe",
        stack: 1
      },
      {
        itemId: "FleetfootFabric",
        stack: 38
      }
    ]
  },
  {
    id: "FleetfootBoots",
    result: {
      itemId: "FleetfootBoots",
      stack: 1
    },
    ingredients: [
      {
        itemId: "VerdantBoots",
        stack: 1
      },
      {
        itemId: "FleetfootFabric",
        stack: 21
      }
    ]
  },
  {
    id: "FleetfootGloves",
    result: {
      itemId: "FleetfootGloves",
      stack: 1
    },
    ingredients: [
      {
        itemId: "VerdantGloves",
        stack: 1
      },
      {
        itemId: "FleetfootFabric",
        stack: 21
      }
    ]
  },
  {
    id: "PrimevalArmor",
    result: {
      itemId: "PrimevalArmor",
      stack: 1
    },
    ingredients: [
      {
        itemId: "PrimevalScale",
        stack: 8
      },
      {
        itemId: "WingFabric",
        stack: 8
      }
    ]
  },
  {
    id: "BreathtakingRobe",
    result: {
      itemId: "BreathtakingRobe",
      stack: 1
    },
    ingredients: [
      {
        itemId: "MothRobe",
        stack: 1
      },
      {
        itemId: "BagOfChokingPowder",
        stack: 12
      }
    ]
  },
  {
    id: "PrimevalShield",
    result: {
      itemId: "PrimevalShield",
      stack: 1
    },
    ingredients: [
      {
        itemId: "PrimevalScale",
        stack: 5
      }
    ]
  },
  {
    id: "PrimevalHelm",
    result: {
      itemId: "PrimevalHelm",
      stack: 1
    },
    ingredients: [
      {
        itemId: "PrimevalScale",
        stack: 4
      },
      {
        itemId: "ElysianWood",
        stack: 160
      }
    ]
  },
  {
    id: "SpikedTortoiseShield",
    result: {
      itemId: "SpikedTortoiseShield",
      stack: 1
    },
    ingredients: [
      {
        itemId: "TortoiseShield",
        stack: 1
      },
      {
        itemId: "TortoiseThorn",
        stack: 18
      }
    ]
  },
  {
    id: "SpikedPrimevalShield",
    result: {
      itemId: "SpikedPrimevalShield",
      stack: 1
    },
    ingredients: [
      {
        itemId: "PrimevalShield",
        stack: 1
      },
      {
        itemId: "TortoiseThorn",
        stack: 18
      }
    ]
  },
  {
    id: "LivingWhip",
    result: {
      itemId: "LivingWhip",
      stack: 1
    },
    ingredients: [
      {
        itemId: "ElysianWood",
        stack: 36
      },
      {
        itemId: "LivingVine",
        stack: 12
      },
      {
        itemId: "WhiteHair",
        stack: 1
      }
    ]
  },
  {
    id: "DryadsBlessing",
    result: {
      itemId: "DryadsBlessing",
      stack: 1
    },
    ingredients: [
      {
        itemId: "ElysianWood",
        stack: 200
      },
      {
        itemId: "WhiteHair",
        stack: 1
      }
    ]
  },
  {
    id: "VerdantBlade",
    result: {
      itemId: "VerdantBlade",
      stack: 1
    },
    ingredients: [
      {
        itemId: "ElysianWood",
        stack: 64
      },
      {
        itemId: "LongSerpentFang",
        stack: 1
      }
    ]
  },
  {
    id: "DryadsCurse",
    result: {
      itemId: "DryadsCurse",
      stack: 1
    },
    ingredients: [
      {
        itemId: "VerdantBlade",
        stack: 1
      },
      {
        itemId: "WhiteHair",
        stack: 1
      }
    ]
  },
  {
    id: "VerdantBow",
    result: {
      itemId: "VerdantBow",
      stack: 1
    },
    ingredients: [
      {
        itemId: "ElysianWood",
        stack: 200
      }
    ]
  },
  {
    id: "ArmorOfTheDryad",
    result: {
      itemId: "ArmorOfTheDryad",
      stack: 1
    },
    ingredients: [
      {
        itemId: "TortoiseArmor",
        stack: 1
      },
      {
        itemId: "WhiteHair",
        stack: 1
      }
    ]
  },
  {
    id: "ElixirOfAffinity",
    result: {
      itemId: "ElixirOfAffinity",
      stack: 1
    },
    ingredients: [
      {
        itemId: "VoodooDoll",
        stack: 3
      },
      {
        itemId: "BansheeHorn",
        stack: 3
      },
      {
        itemId: "CharredHeart",
        stack: 3
      }
    ]
  },
  {
    id: "ChainOfRedemption",
    result: {
      itemId: "ChainOfRedemption",
      stack: 1
    },
    ingredients: [
      {
        itemId: "ChainLink",
        stack: 8
      }
    ]
  },
  {
    id: "CelestialMetal",
    result: {
      itemId: "CelestialMetal",
      stack: 1
    },
    ingredients: [
      {
        itemId: "CelestialScraps",
        stack: 3
      }
    ]
  },
  {
    id: "CelestialArmor",
    result: {
      itemId: "CelestialArmor",
      stack: 1
    },
    ingredients: [
      {
        itemId: "CelestialMetal",
        stack: 45
      },
      {
        itemId: "ElasticMembrane",
        stack: 15
      }
    ]
  },
  {
    id: "BansheeJacket",
    result: {
      itemId: "BansheeJacket",
      stack: 1
    },
    ingredients: [
      {
        itemId: "BansheeScale",
        stack: 148
      }
    ]
  },
  {
    id: "ElasticRobe",
    result: {
      itemId: "ElasticRobe",
      stack: 1
    },
    ingredients: [
      {
        itemId: "ElasticMembrane",
        stack: 148
      }
    ]
  },
  {
    id: "CelestialHelmet",
    result: {
      itemId: "CelestialHelmet",
      stack: 1
    },
    ingredients: [
      {
        itemId: "CelestialMetal",
        stack: 28
      },
      {
        itemId: "ElasticMembrane",
        stack: 20
      }
    ]
  },
  {
    id: "CelestialShield",
    result: {
      itemId: "CelestialShield",
      stack: 1
    },
    ingredients: [
      {
        itemId: "CelestialMetal",
        stack: 35
      }
    ]
  },
  {
    id: "BansheeGloves",
    result: {
      itemId: "BansheeGloves",
      stack: 1
    },
    ingredients: [
      {
        itemId: "BansheeScale",
        stack: 104
      }
    ]
  },
  {
    id: "ElasticBoots",
    result: {
      itemId: "ElasticBoots",
      stack: 1
    },
    ingredients: [
      {
        itemId: "ElasticMembrane",
        stack: 104
      }
    ]
  },
  {
    id: "CloakOfRedemption",
    result: {
      itemId: "CloakOfRedemption",
      stack: 1
    },
    ingredients: [
      {
        itemId: "TunicaIgnis",
        stack: 1
      },
      {
        itemId: "ChainOfRedemption",
        stack: 4
      }
    ]
  },
  {
    id: "TacticalHelmet",
    result: {
      itemId: "TacticalHelmet",
      stack: 1
    },
    ingredients: [
      {
        itemId: "CelestialHelmet",
        stack: 1
      },
      {
        itemId: "Scanner",
        stack: 1
      },
      {
        itemId: "Synapse",
        stack: 5
      }
    ]
  },
  {
    id: "IgnitionOrb",
    result: {
      itemId: "IgnitionOrb",
      stack: 1
    },
    ingredients: [
      {
        itemId: "ContainmentOrb",
        stack: 1
      },
      {
        itemId: "AetherIgnis",
        stack: 12
      }
    ]
  },
  {
    id: "FocusedScepter",
    result: {
      itemId: "FocusedScepter",
      stack: 1
    },
    ingredients: [
      {
        itemId: "CelestialMetal",
        stack: 43
      },
      {
        itemId: "FluxLimiter",
        stack: 1
      },
      {
        itemId: "Synapse",
        stack: 3
      }
    ]
  },
  {
    id: "BansheeBow",
    result: {
      itemId: "BansheeBow",
      stack: 1
    },
    ingredients: [
      {
        itemId: "BansheeClaw",
        stack: 2
      },
      {
        itemId: "ElixirOfAffinity",
        stack: 1
      },
      {
        itemId: "ElasticMembrane",
        stack: 1
      }
    ]
  },
  {
    id: "BansheeScream",
    result: {
      itemId: "BansheeScream",
      stack: 1
    },
    ingredients: [
      {
        itemId: "BansheeBow",
        stack: 1
      },
      {
        itemId: "FluxLimiter",
        stack: 1
      },
      {
        itemId: "Synapse",
        stack: 2
      }
    ]
  },
  {
    id: "CelestialSword",
    result: {
      itemId: "CelestialSword",
      stack: 1
    },
    ingredients: [
      {
        itemId: "CelestialMetal",
        stack: 43
      }
    ]
  },
  {
    id: "CelestialMercy",
    result: {
      itemId: "CelestialMercy",
      stack: 1
    },
    ingredients: [
      {
        itemId: "CelestialSword",
        stack: 1
      },
      {
        itemId: "AetherIgnis",
        stack: 8
      }
    ]
  },
  {
    id: "BansheeDagger",
    result: {
      itemId: "BansheeDagger",
      stack: 1
    },
    ingredients: [
      {
        itemId: "BansheeScale",
        stack: 110
      },
      {
        itemId: "BansheeClaw",
        stack: 1
      }
    ]
  },
  {
    id: "SkinBlender",
    result: {
      itemId: "SkinBlender",
      stack: 1
    },
    ingredients: [
      {
        itemId: "BansheeGloves",
        stack: 1
      },
      {
        itemId: "BansheeClaw",
        stack: 5
      }
    ]
  },
  {
    id: "ShortCircuit",
    result: {
      itemId: "ShortCircuit",
      stack: 1
    },
    ingredients: [
      {
        itemId: "ElasticMembrane",
        stack: 1
      },
      {
        itemId: "Synapse",
        stack: 6
      },
      {
        itemId: "Scanner",
        stack: 2
      }
    ]
  },
  {
    id: "SpellwovenLeather",
    result: {
      itemId: "SpellwovenLeather",
      stack: 1
    },
    ingredients: [
      {
        itemId: "SpellwovenHide",
        stack: 2
      }
    ]
  },
  {
    id: "AnimatedIngot",
    result: {
      itemId: "AnimatedIngot",
      stack: 1
    },
    ingredients: [
      {
        itemId: "AnimatedScraps",
        stack: 3
      }
    ]
  },
  {
    id: "GemOfProtection",
    result: {
      itemId: "GemOfProtection",
      stack: 1
    },
    ingredients: [
      {
        itemId: "UnstableGem",
        stack: 1
      },
      {
        itemId: "VeilBreaker",
        stack: 1
      },
      {
        itemId: "RadiatingNucleus",
        stack: 1
      }
    ]
  },
  {
    id: "VeilShatterer",
    result: {
      itemId: "VeilShatterer",
      stack: 1
    },
    ingredients: [
      {
        itemId: "VeilBreaker",
        stack: 1
      },
      {
        itemId: "SpellCompendium",
        stack: 1
      }
    ]
  },
  {
    id: "SpellwovenJacket",
    result: {
      itemId: "SpellwovenJacket",
      stack: 1
    },
    ingredients: [
      {
        itemId: "SpellwovenLeather",
        stack: 79
      },
      {
        itemId: "LaroxianFabric",
        stack: 10
      }
    ]
  },
  {
    id: "AnimatedCuirass",
    result: {
      itemId: "AnimatedCuirass",
      stack: 1
    },
    ingredients: [
      {
        itemId: "AnimatedIngot",
        stack: 56
      }
    ]
  },
  {
    id: "LaroxianRobe",
    result: {
      itemId: "LaroxianRobe",
      stack: 1
    },
    ingredients: [
      {
        itemId: "LaroxianFabric",
        stack: 168
      }
    ]
  },
  {
    id: "AnimatedSword",
    result: {
      itemId: "AnimatedSword",
      stack: 1
    },
    ingredients: [
      {
        itemId: "AnimatedIngot",
        stack: 47
      }
    ]
  },
  {
    id: "AnimatedStaff",
    result: {
      itemId: "AnimatedStaff",
      stack: 1
    },
    ingredients: [
      {
        itemId: "AnimatedIngot",
        stack: 47
      }
    ]
  },
  {
    id: "AnimatedDagger",
    result: {
      itemId: "AnimatedDagger",
      stack: 1
    },
    ingredients: [
      {
        itemId: "AnimatedIngot",
        stack: 45
      }
    ]
  },
  {
    id: "AnimatedBow",
    result: {
      itemId: "AnimatedBow",
      stack: 1
    },
    ingredients: [
      {
        itemId: "AnimatedIngot",
        stack: 47
      },
      {
        itemId: "LaroxianFabric",
        stack: 1
      }
    ]
  },
  {
    id: "AnimatedHelm",
    result: {
      itemId: "AnimatedHelm",
      stack: 1
    },
    ingredients: [
      {
        itemId: "AnimatedIngot",
        stack: 30
      },
      {
        itemId: "LaroxianFabric",
        stack: 22
      }
    ]
  },
  {
    id: "AnimatedBuckler",
    result: {
      itemId: "AnimatedBuckler",
      stack: 1
    },
    ingredients: [
      {
        itemId: "AnimatedIngot",
        stack: 37
      }
    ]
  },
  {
    id: "LaroxianGloves",
    result: {
      itemId: "LaroxianGloves",
      stack: 1
    },
    ingredients: [
      {
        itemId: "LaroxianFabric",
        stack: 74
      },
      {
        itemId: "SpellwovenLeather",
        stack: 19
      }
    ]
  },
  {
    id: "LaroxianBoots",
    result: {
      itemId: "LaroxianBoots",
      stack: 1
    },
    ingredients: [
      {
        itemId: "LaroxianFabric",
        stack: 38
      },
      {
        itemId: "SpellwovenLeather",
        stack: 37
      }
    ]
  },
  {
    id: "UnstableStaff",
    result: {
      itemId: "UnstableStaff",
      stack: 1
    },
    ingredients: [
      {
        itemId: "AnimatedStaff",
        stack: 1
      },
      {
        itemId: "VeilBreaker",
        stack: 1
      },
      {
        itemId: "UnstableGem",
        stack: 1
      }
    ]
  },
  {
    id: "WickedScepter",
    result: {
      itemId: "WickedScepter",
      stack: 1
    },
    ingredients: [
      {
        itemId: "AnimatedIngot",
        stack: 47
      },
      {
        itemId: "VeilShatterer",
        stack: 1
      },
      {
        itemId: "WickedSeal",
        stack: 1
      }
    ]
  },
  {
    id: "ShieldingCuirass",
    result: {
      itemId: "ShieldingCuirass",
      stack: 1
    },
    ingredients: [
      {
        itemId: "AnimatedCuirass",
        stack: 1
      },
      {
        itemId: "GemOfProtection",
        stack: 1
      }
    ]
  },
  {
    id: "ShieldingJacket",
    result: {
      itemId: "ShieldingJacket",
      stack: 1
    },
    ingredients: [
      {
        itemId: "SpellwovenJacket",
        stack: 1
      },
      {
        itemId: "GemOfProtection",
        stack: 1
      }
    ]
  },
  {
    id: "ShieldingHelm",
    result: {
      itemId: "ShieldingHelm",
      stack: 1
    },
    ingredients: [
      {
        itemId: "AnimatedHelm",
        stack: 1
      },
      {
        itemId: "GemOfProtection",
        stack: 1
      }
    ]
  },
  {
    id: "ReassemblingJacket",
    result: {
      itemId: "ReassemblingJacket",
      stack: 1
    },
    ingredients: [
      {
        itemId: "ShieldingJacket",
        stack: 1
      },
      {
        itemId: "VeilShatterer",
        stack: 1
      },
      {
        itemId: "RuneOfPower",
        stack: 1
      }
    ]
  },
  {
    id: "RobeOfTheArchmage",
    result: {
      itemId: "RobeOfTheArchmage",
      stack: 1
    },
    ingredients: [
      {
        itemId: "LaroxianRobe",
        stack: 1
      },
      {
        itemId: "SpellCompendium",
        stack: 1
      },
      {
        itemId: "RuneOfPower",
        stack: 1
      }
    ]
  },
  {
    id: "StaffOfTheArchmage",
    result: {
      itemId: "StaffOfTheArchmage",
      stack: 1
    },
    ingredients: [
      {
        itemId: "UnstableStaff",
        stack: 1
      },
      {
        itemId: "SpellCompendium",
        stack: 1
      },
      {
        itemId: "RuneOfPower",
        stack: 1
      }
    ]
  },
  {
    id: "UnholySpellcage",
    result: {
      itemId: "UnholySpellcage",
      stack: 1
    },
    ingredients: [
      {
        itemId: "UnholyCuirass",
        stack: 1
      },
      {
        itemId: "RuneOfPower",
        stack: 2
      },
      {
        itemId: "WickedSeal",
        stack: 1
      }
    ]
  },
  {
    id: "PrehistoricMixture",
    result: {
      itemId: "PrehistoricMixture",
      stack: 1
    },
    ingredients: [
      {
        itemId: "PoisonousFlesh",
        stack: 3
      },
      {
        itemId: "PterodactylClaw",
        stack: 1
      },
      {
        itemId: "TerrorsaurusFang",
        stack: 1
      }
    ]
  },
  {
    id: "AncientBoots",
    result: {
      itemId: "AncientBoots",
      stack: 1
    },
    ingredients: [
      {
        itemId: "AncientHide",
        stack: 110
      },
      {
        itemId: "AncientMembrane",
        stack: 45
      }
    ]
  },
  {
    id: "AncientGloves",
    result: {
      itemId: "AncientGloves",
      stack: 1
    },
    ingredients: [
      {
        itemId: "AncientHide",
        stack: 78
      },
      {
        itemId: "AncientMembrane",
        stack: 78
      }
    ]
  },
  {
    id: "MithrilHelm",
    result: {
      itemId: "MithrilHelm",
      stack: 1
    },
    ingredients: [
      {
        itemId: "Mithril",
        stack: 110
      },
      {
        itemId: "AncientHide",
        stack: 30
      }
    ]
  },
  {
    id: "MithrilShield",
    result: {
      itemId: "MithrilShield",
      stack: 1
    },
    ingredients: [
      {
        itemId: "Mithril",
        stack: 135
      }
    ]
  },
  {
    id: "ToxinPouch",
    result: {
      itemId: "ToxinPouch",
      stack: 1
    },
    ingredients: [
      {
        itemId: "AncientHide",
        stack: 8
      },
      {
        itemId: "PoisonousFlesh",
        stack: 10
      }
    ]
  },
  {
    id: "ArchaicAmulet",
    result: {
      itemId: "ArchaicAmulet",
      stack: 1
    },
    ingredients: [
      {
        itemId: "Kindlequartz",
        stack: 1
      },
      {
        itemId: "PrehistoricMixture",
        stack: 1
      },
      {
        itemId: "AncientMembrane",
        stack: 1
      }
    ]
  },
  {
    id: "DiamondAmulet",
    result: {
      itemId: "DiamondAmulet",
      stack: 1
    },
    ingredients: [
      {
        itemId: "Diamond",
        stack: 1
      },
      {
        itemId: "AncientMembrane",
        stack: 1
      }
    ]
  },
  {
    id: "BurningEffigy",
    result: {
      itemId: "BurningEffigy",
      stack: 1
    },
    ingredients: [
      {
        itemId: "ShieldOfTheMartyr",
        stack: 1
      },
      {
        itemId: "PrehistoricMixture",
        stack: 1
      },
      {
        itemId: "Infernite",
        stack: 18
      }
    ]
  },
  {
    id: "AncientArmor",
    result: {
      itemId: "AncientArmor",
      stack: 1
    },
    ingredients: [
      {
        itemId: "Mithril",
        stack: 164
      },
      {
        itemId: "AncientHide",
        stack: 36
      }
    ]
  },
  {
    id: "AncientJacket",
    result: {
      itemId: "AncientJacket",
      stack: 1
    },
    ingredients: [
      {
        itemId: "AncientHide",
        stack: 186
      },
      {
        itemId: "AncientMembrane",
        stack: 14
      }
    ]
  },
  {
    id: "BeastmasterJacket",
    result: {
      itemId: "BeastmasterJacket",
      stack: 1
    },
    ingredients: [
      {
        itemId: "AncientHide",
        stack: 186
      },
      {
        itemId: "AncientMembrane",
        stack: 14
      },
      {
        itemId: "Kindlequartz",
        stack: 5
      }
    ]
  },
  {
    id: "AncientRobe",
    result: {
      itemId: "AncientRobe",
      stack: 1
    },
    ingredients: [
      {
        itemId: "AncientMembrane",
        stack: 200
      }
    ]
  },
  {
    id: "MithrilSword",
    result: {
      itemId: "MithrilSword",
      stack: 1
    },
    ingredients: [
      {
        itemId: "Mithril",
        stack: 170
      }
    ]
  },
  {
    id: "MithrilBow",
    result: {
      itemId: "MithrilBow",
      stack: 1
    },
    ingredients: [
      {
        itemId: "Mithril",
        stack: 170
      },
      {
        itemId: "AncientMembrane",
        stack: 1
      }
    ]
  },
  {
    id: "InfernalBow",
    result: {
      itemId: "InfernalBow",
      stack: 1
    },
    ingredients: [
      {
        itemId: "CursedBow",
        stack: 1
      },
      {
        itemId: "Infernite",
        stack: 10
      }
    ]
  },
  {
    id: "MithrilDagger",
    result: {
      itemId: "MithrilDagger",
      stack: 1
    },
    ingredients: [
      {
        itemId: "Mithril",
        stack: 166
      }
    ]
  },
  {
    id: "RitualBlade",
    result: {
      itemId: "RitualBlade",
      stack: 1
    },
    ingredients: [
      {
        itemId: "PterodactylClaw",
        stack: 1
      },
      {
        itemId: "Diamond",
        stack: 2
      },
      {
        itemId: "Kindlequartz",
        stack: 1
      }
    ]
  },
  {
    id: "InfernalChakram",
    result: {
      itemId: "InfernalChakram",
      stack: 1
    },
    ingredients: [
      {
        itemId: "Infernite",
        stack: 14
      }
    ]
  },
  {
    id: "FireCatalyst",
    result: {
      itemId: "FireCatalyst",
      stack: 1
    },
    ingredients: [
      {
        itemId: "Quartz",
        stack: 5
      },
      {
        itemId: "WurmBlood",
        stack: 30
      },
      {
        itemId: "ElongatedBone",
        stack: 5
      }
    ]
  },
  {
    id: "SunfireEssence",
    result: {
      itemId: "SunfireEssence",
      stack: 1
    },
    ingredients: [
      {
        itemId: "SunfireCore",
        stack: 5
      },
      {
        itemId: "FireCatalyst",
        stack: 1
      },
      {
        itemId: "ContainmentOrb",
        stack: 1
      }
    ]
  },
  {
    id: "IceCatalyst",
    result: {
      itemId: "IceCatalyst",
      stack: 1
    },
    ingredients: [
      {
        itemId: "Quartz",
        stack: 5
      },
      {
        itemId: "Ivory",
        stack: 2
      },
      {
        itemId: "BoarTusk",
        stack: 30
      }
    ]
  },
  {
    id: "PermafrostEssence",
    result: {
      itemId: "PermafrostEssence",
      stack: 1
    },
    ingredients: [
      {
        itemId: "PermafrostCore",
        stack: 5
      },
      {
        itemId: "IceCatalyst",
        stack: 1
      },
      {
        itemId: "ContainmentOrb",
        stack: 1
      }
    ]
  },
  {
    id: "ElectricCatalyst",
    result: {
      itemId: "ElectricCatalyst",
      stack: 1
    },
    ingredients: [
      {
        itemId: "Quartz",
        stack: 5
      },
      {
        itemId: "Feather",
        stack: 30
      },
      {
        itemId: "SharpRib",
        stack: 5
      }
    ]
  },
  {
    id: "StaticEssence",
    result: {
      itemId: "StaticEssence",
      stack: 1
    },
    ingredients: [
      {
        itemId: "StaticCore",
        stack: 5
      },
      {
        itemId: "ElectricCatalyst",
        stack: 1
      },
      {
        itemId: "ContainmentOrb",
        stack: 1
      }
    ]
  },
  {
    id: "PrismaticEssence",
    result: {
      itemId: "PrismaticEssence",
      stack: 1
    },
    ingredients: [
      {
        itemId: "SunfireEssence",
        stack: 3
      },
      {
        itemId: "PermafrostEssence",
        stack: 3
      },
      {
        itemId: "StaticEssence",
        stack: 3
      }
    ]
  },
  {
    id: "SlimeArmor",
    result: {
      itemId: "SlimeArmor",
      stack: 1
    },
    ingredients: [
      {
        itemId: "GreenSlime",
        stack: 140
      }
    ]
  },
  {
    id: "SlimeJacket",
    result: {
      itemId: "SlimeJacket",
      stack: 1
    },
    ingredients: [
      {
        itemId: "GreenSlime",
        stack: 140
      }
    ]
  },
  {
    id: "SlimeRobe",
    result: {
      itemId: "SlimeRobe",
      stack: 1
    },
    ingredients: [
      {
        itemId: "GreenSlime",
        stack: 140
      }
    ]
  },
  {
    id: "FrozenEmbrace",
    result: {
      itemId: "FrozenEmbrace",
      stack: 1
    },
    ingredients: [
      {
        itemId: "SlimeArmor",
        stack: 1
      },
      {
        itemId: "PermafrostEssence",
        stack: 1
      }
    ]
  },
  {
    id: "TunicaIgnis",
    result: {
      itemId: "TunicaIgnis",
      stack: 1
    },
    ingredients: [
      {
        itemId: "SlimeRobe",
        stack: 1
      },
      {
        itemId: "SunfireEssence",
        stack: 1
      }
    ]
  },
  {
    id: "SunStaff",
    result: {
      itemId: "SunStaff",
      stack: 1
    },
    ingredients: [
      {
        itemId: "Glass",
        stack: 5
      },
      {
        itemId: "IronIngot",
        stack: 10
      },
      {
        itemId: "SunfireEssence",
        stack: 1
      }
    ]
  },
  {
    id: "Icicle",
    result: {
      itemId: "Icicle",
      stack: 1
    },
    ingredients: [
      {
        itemId: "ImperialStaff",
        stack: 1
      },
      {
        itemId: "PermafrostEssence",
        stack: 1
      }
    ]
  },
  {
    id: "PrismaticPendant",
    result: {
      itemId: "PrismaticPendant",
      stack: 1
    },
    ingredients: [
      {
        itemId: "PrismaticEssence",
        stack: 1
      },
      {
        itemId: "PlantFiber",
        stack: 1
      }
    ]
  },
  {
    id: "VoidPendant",
    result: {
      itemId: "VoidPendant",
      stack: 1
    },
    ingredients: [
      {
        itemId: "PrismaticPendant",
        stack: 1
      },
      {
        itemId: "VoidCore",
        stack: 1
      }
    ]
  },
  {
    id: "PrismaticArmor",
    result: {
      itemId: "PrismaticArmor",
      stack: 1
    },
    ingredients: [
      {
        itemId: "SlimeArmor",
        stack: 1
      },
      {
        itemId: "PrismaticEssence",
        stack: 1
      }
    ]
  },
  {
    id: "VoidArmor",
    result: {
      itemId: "VoidArmor",
      stack: 1
    },
    ingredients: [
      {
        itemId: "PrismaticArmor",
        stack: 1
      },
      {
        itemId: "VoidCore",
        stack: 1
      }
    ]
  },
  {
    id: "PotionOfRejuvenation",
    result: {
      itemId: "PotionOfRejuvenation",
      stack: 1
    },
    ingredients: [
      {
        itemId: "GreenSlime",
        stack: 5
      },
      {
        itemId: "MetamorphicSand",
        stack: 1
      }
    ]
  },
  {
    id: "AmuletOfTheSwordsman",
    result: {
      itemId: "AmuletOfTheSwordsman",
      stack: 1
    },
    ingredients: [
      {
        itemId: "EyesOfTheSwordsman",
        stack: 1
      },
      {
        itemId: "Cloth",
        stack: 5
      }
    ]
  },
  {
    id: "DivineEmbryo",
    result: {
      itemId: "DivineEmbryo",
      stack: 1
    },
    ingredients: [
      {
        itemId: "DivineZygote",
        stack: 1
      },
      {
        itemId: "BottledSandSpirit",
        stack: 15
      }
    ]
  },
  {
    id: "CursedJacket",
    result: {
      itemId: "CursedJacket",
      stack: 1
    },
    ingredients: [
      {
        itemId: "CursedSilver",
        stack: 6
      }
    ]
  },
  {
    id: "CursedClaws",
    result: {
      itemId: "CursedClaws",
      stack: 1
    },
    ingredients: [
      {
        itemId: "CursedSilver",
        stack: 8
      }
    ]
  },
  {
    id: "CursedHelm",
    result: {
      itemId: "CursedHelm",
      stack: 1
    },
    ingredients: [
      {
        itemId: "CursedSilver",
        stack: 12
      }
    ]
  },
  {
    id: "CursedBow",
    result: {
      itemId: "CursedBow",
      stack: 1
    },
    ingredients: [
      {
        itemId: "CursedSilver",
        stack: 32
      },
      {
        itemId: "SilkThread",
        stack: 1
      }
    ]
  },
  {
    id: "Phylactery",
    result: {
      itemId: "Phylactery",
      stack: 1
    },
    ingredients: [
      {
        itemId: "PhylacteryFragment",
        stack: 13
      },
      {
        itemId: "SinisterStabilizer",
        stack: 1
      }
    ]
  },
  {
    id: "ArmorOfTheUndying",
    result: {
      itemId: "ArmorOfTheUndying",
      stack: 1
    },
    ingredients: [
      {
        itemId: "CursedSilver",
        stack: 16
      },
      {
        itemId: "Phylactery",
        stack: 3
      }
    ]
  },
  {
    id: "FlyingReaper",
    result: {
      itemId: "FlyingReaper",
      stack: 1
    },
    ingredients: [
      {
        itemId: "KabelianMetal",
        stack: 20
      }
    ]
  },
  {
    id: "KabelianArmor",
    result: {
      itemId: "KabelianArmor",
      stack: 1
    },
    ingredients: [
      {
        itemId: "KabelianMetal",
        stack: 26
      },
      {
        itemId: "CrusaderInsigna",
        stack: 2
      }
    ]
  },
  {
    id: "DuelistArmor",
    result: {
      itemId: "DuelistArmor",
      stack: 1
    },
    ingredients: [
      {
        itemId: "SentientSlab",
        stack: 5
      },
      {
        itemId: "AlchemicPowder",
        stack: 12
      },
      {
        itemId: "KabelianMetal",
        stack: 8
      }
    ]
  },
  {
    id: "ChampionArmor",
    result: {
      itemId: "ChampionArmor",
      stack: 1
    },
    ingredients: [
      {
        itemId: "DuelistArmor",
        stack: 1
      },
      {
        itemId: "ExaltedPowder",
        stack: 1
      }
    ]
  },
  {
    id: "MutualDespair",
    result: {
      itemId: "MutualDespair",
      stack: 1
    },
    ingredients: [
      {
        itemId: "KabelianMetal",
        stack: 50
      },
      {
        itemId: "AlchemicPowder",
        stack: 30
      }
    ]
  },
  {
    id: "KabelianClaws",
    result: {
      itemId: "KabelianClaws",
      stack: 1
    },
    ingredients: [
      {
        itemId: "CursedClaws",
        stack: 1
      },
      {
        itemId: "KabelianMetal",
        stack: 32
      }
    ]
  },
  {
    id: "CunningDownfall",
    result: {
      itemId: "CunningDownfall",
      stack: 1
    },
    ingredients: [
      {
        itemId: "KabelianMetal",
        stack: 36
      }
    ]
  },
  {
    id: "CunningDemise",
    result: {
      itemId: "CunningDemise",
      stack: 1
    },
    ingredients: [
      {
        itemId: "CunningDownfall",
        stack: 1
      },
      {
        itemId: "SealOfClaris",
        stack: 1
      }
    ]
  },
  {
    id: "TitanicMight",
    result: {
      itemId: "TitanicMight",
      stack: 1
    },
    ingredients: [
      {
        itemId: "CrushingDepth",
        stack: 1
      },
      {
        itemId: "ExaltedPowder",
        stack: 2
      }
    ]
  },
  {
    id: "ShieldOfTheTitan",
    result: {
      itemId: "ShieldOfTheTitan",
      stack: 1
    },
    ingredients: [
      {
        itemId: "SentientSlab",
        stack: 12
      }
    ]
  },
  {
    id: "ShieldOfTheMartyr",
    result: {
      itemId: "ShieldOfTheMartyr",
      stack: 1
    },
    ingredients: [
      {
        itemId: "ShieldOfTheTitan",
        stack: 1
      },
      {
        itemId: "ExaltedPowder",
        stack: 3
      }
    ]
  },
  {
    id: "BleakBoots",
    result: {
      itemId: "BleakBoots",
      stack: 1
    },
    ingredients: [
      {
        itemId: "AbherrantFabric",
        stack: 48
      },
      {
        itemId: "BlackHide",
        stack: 24
      }
    ]
  },
  {
    id: "BleakGloves",
    result: {
      itemId: "BleakGloves",
      stack: 1
    },
    ingredients: [
      {
        itemId: "AbherrantFabric",
        stack: 24
      },
      {
        itemId: "BlackHide",
        stack: 36
      }
    ]
  },
  {
    id: "EldritchSeal",
    result: {
      itemId: "EldritchSeal",
      stack: 1
    },
    ingredients: [
      {
        itemId: "EldritchShred",
        stack: 7
      }
    ]
  },
  {
    id: "EldritchMitre",
    result: {
      itemId: "EldritchMitre",
      stack: 1
    },
    ingredients: [
      {
        itemId: "MitreHat",
        stack: 1
      },
      {
        itemId: "EldritchSeal",
        stack: 1
      },
      {
        itemId: "AbherrantFabric",
        stack: 8
      }
    ]
  },
  {
    id: "StellarFlare",
    result: {
      itemId: "StellarFlare",
      stack: 1
    },
    ingredients: [
      {
        itemId: "TitanicMight",
        stack: 1
      },
      {
        itemId: "StarFragment",
        stack: 5
      }
    ]
  },
  {
    id: "StellarStaff",
    result: {
      itemId: "StellarStaff",
      stack: 1
    },
    ingredients: [
      {
        itemId: "SunStaff",
        stack: 1
      },
      {
        itemId: "StarFragment",
        stack: 5
      }
    ]
  },
  {
    id: "InvisibleServant",
    result: {
      itemId: "InvisibleServant",
      stack: 1
    },
    ingredients: [
      {
        itemId: "ShadowGem",
        stack: 200
      },
      {
        itemId: "StarFragment",
        stack: 8
      }
    ]
  },
  {
    id: "DivineLarvae",
    result: {
      itemId: "DivineLarvae",
      stack: 1
    },
    ingredients: [
      {
        itemId: "DivineEmbryo",
        stack: 1
      },
      {
        itemId: "AstralGoo",
        stack: 5
      }
    ]
  },
  {
    id: "DreamwroughtSilk",
    result: {
      itemId: "DreamwroughtSilk",
      stack: 1
    },
    ingredients: [
      {
        itemId: "DreamwroughtMane",
        stack: 3
      }
    ]
  },
  {
    id: "OrichalcumIngot",
    result: {
      itemId: "OrichalcumIngot",
      stack: 1
    },
    ingredients: [
      {
        itemId: "OrichalcumScraps",
        stack: 4
      }
    ]
  },
  {
    id: "OrichalcumSword",
    result: {
      itemId: "OrichalcumSword",
      stack: 1
    },
    ingredients: [
      {
        itemId: "OrichalcumIngot",
        stack: 32
      }
    ]
  },
  {
    id: "VoidCrusher",
    result: {
      itemId: "VoidCrusher",
      stack: 1
    },
    ingredients: [
      {
        itemId: "ColossalSword",
        stack: 1
      },
      {
        itemId: "HeartOfDarkness",
        stack: 3
      }
    ]
  },
  {
    id: "AegisMechanica",
    result: {
      itemId: "AegisMechanica",
      stack: 1
    },
    ingredients: [
      {
        itemId: "Aegis",
        stack: 1
      },
      {
        itemId: "MysteriousCog",
        stack: 3
      }
    ]
  },
  {
    id: "DreamwroughtBow",
    result: {
      itemId: "DreamwroughtBow",
      stack: 1
    },
    ingredients: [
      {
        itemId: "DreamwroughtSteel",
        stack: 8
      },
      {
        itemId: "DreamwroughtSilk",
        stack: 1
      }
    ]
  },
  {
    id: "Oblivion",
    result: {
      itemId: "Oblivion",
      stack: 1
    },
    ingredients: [
      {
        itemId: "StellarFlare",
        stack: 1
      },
      {
        itemId: "HeartOfDarkness",
        stack: 5
      }
    ]
  },
  {
    id: "Mottiphobia",
    result: {
      itemId: "Mottiphobia",
      stack: 1
    },
    ingredients: [
      {
        itemId: "DreamwroughtSteel",
        stack: 3
      },
      {
        itemId: "DreamwroughtLarva",
        stack: 45
      }
    ]
  },
  {
    id: "InfiniteDespair",
    result: {
      itemId: "InfiniteDespair",
      stack: 1
    },
    ingredients: [
      {
        itemId: "MutualDespair",
        stack: 1
      },
      {
        itemId: "FlakeOfInfinity",
        stack: 14
      }
    ]
  },
  {
    id: "OrichalcumDagger",
    result: {
      itemId: "OrichalcumDagger",
      stack: 1
    },
    ingredients: [
      {
        itemId: "OrichalcumIngot",
        stack: 28
      }
    ]
  },
  {
    id: "SylvanMandate",
    result: {
      itemId: "SylvanMandate",
      stack: 1
    },
    ingredients: [
      {
        itemId: "DryadsCurse",
        stack: 1
      },
      {
        itemId: "GiftOfLight",
        stack: 6
      }
    ]
  },
  {
    id: "DreamwroughtStaff",
    result: {
      itemId: "DreamwroughtStaff",
      stack: 1
    },
    ingredients: [
      {
        itemId: "DreamwroughtSteel",
        stack: 7
      }
    ]
  },
  {
    id: "DeathRayScepter",
    result: {
      itemId: "DeathRayScepter",
      stack: 1
    },
    ingredients: [
      {
        itemId: "FocusedScepter",
        stack: 1
      },
      {
        itemId: "AbioticCore",
        stack: 1
      }
    ]
  },
  {
    id: "SylvanBlessing",
    result: {
      itemId: "SylvanBlessing",
      stack: 1
    },
    ingredients: [
      {
        itemId: "DryadsBlessing",
        stack: 1
      },
      {
        itemId: "GiftOfLight",
        stack: 10
      }
    ]
  },
  {
    id: "CursedScepter",
    result: {
      itemId: "CursedScepter",
      stack: 1
    },
    ingredients: [
      {
        itemId: "WickedScepter",
        stack: 1
      },
      {
        itemId: "HeartOfDarkness",
        stack: 3
      }
    ]
  },
  {
    id: "DreamwroughtArmor",
    result: {
      itemId: "DreamwroughtArmor",
      stack: 1
    },
    ingredients: [
      {
        itemId: "DreamwroughtSteel",
        stack: 8
      },
      {
        itemId: "DreamwroughtHide",
        stack: 6
      }
    ]
  },
  {
    id: "OrichalcumArmor",
    result: {
      itemId: "OrichalcumArmor",
      stack: 1
    },
    ingredients: [
      {
        itemId: "OrichalcumIngot",
        stack: 35
      },
      {
        itemId: "MutantHide",
        stack: 14
      }
    ]
  },
  {
    id: "SwarmkeeperArmor",
    result: {
      itemId: "SwarmkeeperArmor",
      stack: 1
    },
    ingredients: [
      {
        itemId: "DreamwroughtArmor",
        stack: 1
      },
      {
        itemId: "DreamwroughtLarva",
        stack: 20
      }
    ]
  },
  {
    id: "AbsoluteZero",
    result: {
      itemId: "AbsoluteZero",
      stack: 1
    },
    ingredients: [
      {
        itemId: "IceCage",
        stack: 1
      },
      {
        itemId: "FlakeOfInfinity",
        stack: 8
      }
    ]
  },
  {
    id: "NilArmor",
    result: {
      itemId: "NilArmor",
      stack: 1
    },
    ingredients: [
      {
        itemId: "VoidArmor",
        stack: 1
      },
      {
        itemId: "WhiteSlime",
        stack: 10
      }
    ]
  },
  {
    id: "DreamwroughtJacket",
    result: {
      itemId: "DreamwroughtJacket",
      stack: 1
    },
    ingredients: [
      {
        itemId: "DreamwroughtHide",
        stack: 7
      },
      {
        itemId: "DreamwroughtSilk",
        stack: 5
      }
    ]
  },
  {
    id: "MutantJacket",
    result: {
      itemId: "MutantJacket",
      stack: 1
    },
    ingredients: [
      {
        itemId: "MutantHide",
        stack: 24
      },
      {
        itemId: "KaunianFabric",
        stack: 8
      }
    ]
  },
  {
    id: "ScarletShroud",
    result: {
      itemId: "ScarletShroud",
      stack: 1
    },
    ingredients: [
      {
        itemId: "ScarletVeil",
        stack: 1
      },
      {
        itemId: "MysteriousCog",
        stack: 5
      }
    ]
  },
  {
    id: "DreamwroughtRobe",
    result: {
      itemId: "DreamwroughtRobe",
      stack: 1
    },
    ingredients: [
      {
        itemId: "DreamwroughtSilk",
        stack: 20
      }
    ]
  },
  {
    id: "KaunianRobe",
    result: {
      itemId: "KaunianRobe",
      stack: 1
    },
    ingredients: [
      {
        itemId: "KaunianFabric",
        stack: 24
      }
    ]
  },
  {
    id: "TunicaInfernalis",
    result: {
      itemId: "TunicaInfernalis",
      stack: 1
    },
    ingredients: [
      {
        itemId: "CloakOfRedemption",
        stack: 1
      },
      {
        itemId: "FireproofOil",
        stack: 6
      }
    ]
  },
  {
    id: "DreamwroughtGloves",
    result: {
      itemId: "DreamwroughtGloves",
      stack: 1
    },
    ingredients: [
      {
        itemId: "DreamwroughtSilk",
        stack: 18
      },
      {
        itemId: "DreamwroughtHide",
        stack: 7
      }
    ]
  },
  {
    id: "DreamwroughtBoots",
    result: {
      itemId: "DreamwroughtBoots",
      stack: 1
    },
    ingredients: [
      {
        itemId: "DreamwroughtSilk",
        stack: 12
      },
      {
        itemId: "DreamwroughtHide",
        stack: 10
      }
    ]
  },
  {
    id: "OrichalcumHelm",
    result: {
      itemId: "OrichalcumHelm",
      stack: 1
    },
    ingredients: [
      {
        itemId: "OrichalcumIngot",
        stack: 28
      },
      {
        itemId: "MutantHide",
        stack: 6
      }
    ]
  },
  {
    id: "OrichalcumShield",
    result: {
      itemId: "OrichalcumShield",
      stack: 1
    },
    ingredients: [
      {
        itemId: "OrichalcumIngot",
        stack: 32
      }
    ]
  },
  {
    id: "Starvation",
    result: {
      itemId: "Starvation",
      stack: 1
    },
    ingredients: [
      {
        itemId: "EternalHunger",
        stack: 1
      },
      {
        itemId: "AncestralBlood",
        stack: 6
      }
    ]
  },
  {
    id: "AmuletOfResurrection",
    result: {
      itemId: "AmuletOfResurrection",
      stack: 1
    },
    ingredients: [
      {
        itemId: "PhoenixFeather",
        stack: 6
      }
    ]
  },
  {
    id: "NilPendant",
    result: {
      itemId: "NilPendant",
      stack: 1
    },
    ingredients: [
      {
        itemId: "VoidPendant",
        stack: 1
      },
      {
        itemId: "WhiteSlime",
        stack: 3
      }
    ]
  },
  {
    id: "EnlightedServant",
    result: {
      itemId: "EnlightedServant",
      stack: 1
    },
    ingredients: [
      {
        itemId: "InvisibleServant",
        stack: 1
      },
      {
        itemId: "GiftOfLight",
        stack: 1
      },
      {
        itemId: "HeartOfDarkness",
        stack: 1
      }
    ]
  },
  {
    id: "Sha",
    result: {
      itemId: "Sha",
      stack: 1
    },
    ingredients: [
      {
        itemId: "DivineLarvae",
        stack: 1
      },
      {
        itemId: "MysteriousCog",
        stack: 10
      }
    ]
  },
  {
    id: "VoltaicShock",
    result: {
      itemId: "VoltaicShock",
      stack: 1
    },
    ingredients: [
      {
        itemId: "ShortCircuit",
        stack: 1
      },
      {
        itemId: "AbioticCore",
        stack: 1
      }
    ]
  },
  {
    id: "ScarletVeil",
    result: {
      itemId: "ScarletVeil",
      stack: 1
    },
    ingredients: [
      {
        itemId: "ScarletStrand",
        stack: 4
      }
    ]
  }
]

export const recipeById = new Map(RECIPES.map((recipe) => [recipe.id, recipe]))

export function inventoryCount(state: GameState, itemId: string) {
  return state.inventory.find((item) => item.itemId === itemId)?.stack ?? 0
}

export function maxCraftable(state: GameState, recipe: RecipeDefinition) {
  return Math.min(...recipe.ingredients.map((ingredient) => Math.floor(inventoryCount(state, ingredient.itemId) / ingredient.stack)))
}
