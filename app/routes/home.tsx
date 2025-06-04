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
  const excludedTags = ["Consumable", "Trinket", "Vision", "Boots", "Jungle"];

  return state
    .filter((item) => item.gold.total <= maxGold)
    .filter(
      (item) =>
        !item.tags || !item.tags.some((tag) => excludedTags.includes(tag)),
    )
    .filter((item) => item.gold.total !== 0)
    .filter((item) => !item.from || item.from.length === 0)
    .filter((item) => );
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
          }),
      );

      dispatch({ type: "GET_ITEMS", payload: dataLolitems });
    }

    run();
  }, []);

  const starterItems = getStarterItems(state.items);
  console.log("starterItems:", starterItems);
  return (
    <div>
      <header>Welcome Invoker!</header>
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
