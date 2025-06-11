import { useReducer, useEffect } from "react";
import * as V from "valibot";
import { ItemSchema } from "~/schemas";

const idsToFilter = [3599, 3600, 3330, 3901, 3902, 3903, 1040, 2421];

type ItemType = V.InferOutput<typeof ItemSchema>;

type State = {
  items: ItemType[];
};

type Action = {
  type: "GET_ITEMS";
  payload: ItemType[];
};

function itemsReducer(state: State, action: Action) {
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

const getStarterItems = (state: ItemType[]): ItemType[] => {
  const maxGold = 500;
  const excludedTags = ["Consumable", "Trinket", "Boots"];
  const existingItems = new Map<string, ItemType>();

  const nextItems = state
    .filter((item) => item.gold.total <= maxGold)
    .filter(
      (item) =>
        !item.tags || !item.tags.some((tag) => excludedTags.includes(tag)),
    )
    .filter((item) => item.gold.total !== 0)
    .filter((item) => !item.from || item.from.length === 0)
    .filter((item) => item.gold.purchasable === true)
    .filter(
      (item) =>
        item.into?.includes("3041") ||
        item.into?.includes("3003") ||
        item.into?.includes("3004") ||
        item.into?.includes("3119") ||
        item.into === undefined,
    );

  for (const item of nextItems) {
    existingItems.set(item.name, item);
  }

  return Array.from(existingItems.values());
};

const getBootsItems = (state: ItemType[]) => {
  return state.filter((item) => item.tags?.includes("Boots"));
};
const getConsumableItems = (state: ItemType[]) => {
  return state.filter(
    (item) =>
      item.tags?.includes("Consumable") ||
      (item.gold.total === 0 && item.tags?.includes("Vision")),
  );
};
const getBasicItems = (state: ItemType[]) => {
  return state
    .filter((item) => item.gold.total <= 1300 && item.gold.total >= 200)
    .filter(
      (item) =>
        !item.tags?.includes("Consumable") &&
        !item.tags?.includes("Boots") &&
        !item.tags?.includes("Jungle") &&
        !item.tags?.includes("Vision"),
    )
    .filter((item) => item.from?.length === 0 || !item.from)
    .filter((item) => item.into && item.into?.length >= 2);
};

const getEpicItems = (state: ItemType[]) => {
  return state
    .filter((item) => item.gold.total >= 600 && item.gold.total <= 1600)
    .filter((item) => !item.tags?.includes("Vision"))
    .filter((item) => item.from && item.from.length >= 1)
    .filter((item) => !item.tags?.includes("Boots"));
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
        V.array(ItemSchema),
        //* find a way to fix this without the comment
        //@ts-ignore
        Object.entries(allLolItems.data)
          .map(([id, item]) => {
            if (!idsToFilter.includes(Number(id))) {
              //@ts-ignore
              return { id: id, ...item };
            }
          })
          .filter((items) => {
            if (items !== undefined) {
              return items;
            }
          })
          .filter((item) => item.maps?.[11] === true)
          .filter((item) => item.gold.purchasable === true),
      );

      dispatch({ type: "GET_ITEMS", payload: dataLolitems });
    }

    run();
  }, []);
  //* remember to export the logic of this functions to a reducer
  const bootsItems = getBootsItems(state.items);
  const consumableItems = getConsumableItems(state.items);
  const starterItems = getStarterItems(state.items);
  const basicItems = getBasicItems(state.items);
  const epicItems = getEpicItems(state.items);
  console.log("epicItems:", epicItems);
  return (
    <div>
      <header>Welcome Invoker!</header>
      <h1>Boots:</h1>
      <div className="items-grid">
        {bootsItems.length > 0 ? (
          bootsItems.map((item: ItemType) => {
            return <Item item={item} key={item.id} />;
          })
        ) : (
          <p>Loading items...</p>
        )}
      </div>

      <h1>Consumables:</h1>
      <div className="items-grid">
        {consumableItems.length > 0 ? (
          consumableItems.map((item: ItemType) => {
            return <Item item={item} key={item.id} />;
          })
        ) : (
          <p>Loading items...</p>
        )}
      </div>

      <h1>Starter Items:</h1>
      <div className="items-grid">
        {starterItems.length > 0 ? (
          starterItems.map((item: ItemType) => {
            return <Item item={item} key={item.id} />;
          })
        ) : (
          <p>Loading items...</p>
        )}
      </div>

      <h1>Basic Items:</h1>
      <div className="items-grid">
        {basicItems.length > 0 ? (
          basicItems.map((item: ItemType) => {
            return <Item item={item} key={item.id} />;
          })
        ) : (
          <p>Loading items...</p>
        )}
      </div>

      <h1>Epic Items:</h1>
      <div className="items-grid">
        {epicItems.length > 0 ? (
          epicItems.map((item: ItemType) => {
            return <Item item={item} key={item.id} />;
          })
        ) : (
          <p>Loading items...</p>
        )}
      </div>
    </div>
  );
}

const Item = ({ item }: { item: ItemType }) => {
  return (
    <div className="item-card">
      <img
        src={`https://ddragon.leagueoflegends.com/cdn/14.19.1/img/item/${item.image.full}`}
        alt={item.name}
        className="item-image"
      />
      <h3 className="item-name">{item.name}</h3>
      <p className="item-gold">{item.gold.total} Gold</p>
    </div>
  );
};
