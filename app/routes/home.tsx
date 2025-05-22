import { useReducer, useEffect } from "react";
import * as V from "valibot";

const tagsSchemas = V.union([
  V.object({}),
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

const StatSchema = V.union([
  V.object({}),
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

const MapsSchema = V.object({
  11: V.boolean(),
  12: V.boolean(),
  21: V.boolean(),
  22: V.boolean(),
  30: V.boolean(),
  33: V.boolean(),
});

const IntoSchema = V.array(V.string());

const ImageSchema = V.object({
  full: V.pipe(V.string(), V.minLength(8)),
  group: V.pipe(V.string(), V.minLength(3)),
  h: V.number(),
  sprite: V.pipe(V.string(), V.minLength(7)),
  w: V.number(),
  x: V.number(),
  y: V.number(),
});

const GoldSchema = V.object({
  base: V.number(),
  purchasable: V.boolean(),
  sell: V.number(),
  total: V.number(),
});

const ItemSchema = V.array(
  V.object({
    id: V.string(),
    colloq: V.optional(V.string()),
    description: V.optional(V.string()),
    gold: V.optional(GoldSchema),
    image: V.optional(ImageSchema),
    into: V.optional(IntoSchema),
    maps: V.optional(MapsSchema),
    name: V.pipe(V.string(), V.minLength(3)),
    plaintext: V.optional(V.string()),
    stat: V.optional(StatSchema),
    tags: V.optional(tagsSchemas),
  }),
);

function itemsReducer(state, action) {
  switch (action.type) {
    case "GET_ITEMS": {
      return { items: action.payload };
    }
    default:
      return state;
  }
}

const initialState = {
  items: [],
};

export default function () {
  const [state, dispatch] = useReducer(itemsReducer, initialState);

  useEffect(() => {
    async function run() {
      const allLolItems = await fetch(
        "https://ddragon.leagueoflegends.com/cdn/14.19.1/data/en_US/item.json",
      ).then((response) => {
        return response.json();
      });
      // const allPosibleStats = new Set();
      // Object.entries(allLolItems.data).map(([id, item]) => {
      //   Object.keys(item.stats).map((key) => {
      //     allPosibleStats.add(key);
      //   });
      // });
      // console.log("allPosibleStats:", allPosibleStats);
      // const allPosibleTags = new Set();
      // Object.entries(allLolItems.data).map(([id, item]) => {
      //   Object.values(item.tags).map((values) => {
      //     allPosibleTags.add(values);
      //   });
      // });
      // console.log("allPosibleTags:", allPosibleTags);

      //@ts-ignore
      const dataLolitems = V.parse(
        ItemSchema,
        //@ts-ignore
        Object.entries(allLolItems.data).map(([id, item]) => {
          const lolItems = { id: id, ...item };
          console.log("lolItems", lolItems);
          return lolItems;
        }),
      );
      dispatch({ type: "GET_ITEMS", payload: dataLolitems });
    }
    run();
  }, []);

  return (
    <div className="items-grid">
      {state.items ? (
        Object.entries(state.items).map(([id, item]) => {
          return (
            <div key={id} className="item-card">
              <img
                src={`https://ddragon.leagueoflegends.com/cdn/14.19.1/img/item/${item.image.full}`}
                alt={item.name}
                className="item-image"
              />
              <h3 className="item-name">{item.name}</h3>
              <p className="item-gold">{item.gold.total} Gold</p>
            </div>
          );
        })
      ) : (
        <p>Loading items...</p>
      )}
    </div>
  );
}
