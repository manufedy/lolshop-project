import * as V from "valibot";
export const transaction = V.object({
  type: V.union([V.literal("buy"),V.literal("sell"))
})

export const idSchema = V.pipe(V.string(), V.minLength(4));

export const tagsSchemas = V.union([
  V.literal("Boots"),
  V.literal("ManaRegen"),
  V.literal("HealthRegen"),
  V.literal("Health"),
  V.literal("CriticalStrike"),
  V.literal("SpellDamage"),
  V.literal("Mana"),
  V.literal("Armor"),
  V.literal("SpellBlock"),
  V.literal("LifeSteal"),
  V.literal("SpellVamp"),
  V.literal("Jungle"),
  V.literal("Damage"),
  V.literal("Lane"),
  V.literal("AttackSpeed"),
  V.literal("OnHit"),
  V.literal("Trinket"),
  V.literal("Active"),
  V.literal("Consumable"),
  V.literal("CooldownReduction"),
  V.literal("ArmorPenetration"),
  V.literal("AbilityHaste"),
  V.literal("Stealth"),
  V.literal("Vision"),
  V.literal("NonbootsMovement"),
  V.literal("Tenacity"),
  V.literal("MagicPenetration"),
  V.literal("Aura"),
  V.literal("Slow"),
  V.literal("MagicResist"),
  V.literal("GoldPer"),
]);

export const StatSchema = V.union([
  V.literal("FlatMovementSpeedMod"),
  V.literal("FlatHPPoolMod"),
  V.literal("FlatCritChanceMod"),
  V.literal("FlatMagicDamageMod"),
  V.literal("FlatMPPoolMod"),
  V.literal("FlatArmorMod"),
  V.literal("FlatSpellBlockMod"),
  V.literal("FlatPhysicalDamageMod"),
  V.literal("PercentAttackSpeedMod"),
  V.literal("PercentLifeStealMod"),
  V.literal("FlatHPRegenMod"),
  V.literal("PercentMovementSpeedMod"),
]);

export const MapsSchema = V.object({
  11: V.boolean(),
  12: V.boolean(),
  21: V.boolean(),
  22: V.boolean(),
  30: V.boolean(),
  33: V.boolean(),
});

const ImageSchema = V.object({
  full: V.pipe(V.string(), V.minLength(8)),
  group: V.pipe(V.string(), V.minLength(3)),
  h: V.number(),
  sprite: V.pipe(V.string(), V.minLength(7)),
  w: V.number(),
  x: V.number(),
  y: V.number(),
});

export const GoldSchema = V.object({
  base: V.number(),
  purchasable: V.boolean(),
  sell: V.number(),
  total: V.number(),
});

export const ItemSchema = V.object({
  id: idSchema,
  colloq: V.optional(V.string()),
  depth: V.optional(V.number()),
  description: V.optional(V.string()),
  from: V.optional(V.array(idSchema)),
  gold: GoldSchema,
  image: ImageSchema,
  into: V.optional(V.array(V.pipe(idSchema))),
  maps: V.optional(MapsSchema),
  name: V.pipe(V.string(), V.minLength(3)),
  plaintext: V.optional(V.string()),
  stat: V.optional(StatSchema),
  tags: V.optional(V.array(tagsSchemas)),
});

export type ItemType = V.InferOutput<typeof ItemSchema>;
