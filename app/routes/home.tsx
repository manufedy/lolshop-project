import type React from "react";
import { useReducer, useEffect } from "react";
import * as V from "valibot";
import { ItemSchema, type ItemType } from "~/schemas";
import { itemsReducer, initialState, type Action } from "../itemReducer";

const idsToFilter = [3599, 3600, 3330, 3901, 3902, 3903, 1040, 2421];

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

const getBootsItems = (state: ItemType[]) =>
  state.filter((item) => item.tags?.includes("Boots"));

const getConsumableItems = (state: ItemType[]) =>
  state.filter(
    (item) =>
      item.tags?.includes("Consumable") ||
      (item.gold.total === 0 && item.tags?.includes("Vision")),
  );

const getBasicItems = (state: ItemType[]) =>
  state
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

const getEpicItems = (state: ItemType[]) =>
  state
    .filter((item) => item.gold.total >= 600 && item.gold.total <= 1600)
    .filter((item) => !item.tags?.includes("Vision"))
    .filter((item) => item.from && item.from.length >= 1)
    .filter((item) => !item.tags?.includes("Boots"));

const getLegendaryItems = (state: ItemType[]) =>
  state
    .filter((item) => !item.into || item.into.length === 0)
    .filter(
      (item) =>
        (item.from && item.from.length >= 1) ||
        (item.tags?.includes("Vision") &&
          item.stats?.FlatHPPoolMod !== undefined),
    )
    .filter((item) => item.gold.total >= 400)
    .filter(
      (item) =>
        !item.tags?.includes("Boots") && !item.tags?.includes("Consumable"),
    );

export default function HomePage() {
  const [state, dispatch] = useReducer(itemsReducer, initialState);

  useEffect(() => {
    async function run() {
      const allLolItems = await fetch(
        "https://ddragon.leagueoflegends.com/cdn/14.19.1/data/en_US/item.json",
      ).then((response) => response.json());

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
          .filter((item) => item !== undefined)
          .filter((item) => item.maps?.[11] === true)
          .filter((item) => item.gold.purchasable === true),
      );

      dispatch({ type: "GET_ITEMS", payload: dataLolitems });
    }

    run();
  }, []);

  const bootsItems = getBootsItems(state.items);
  const consumableItems = getConsumableItems(state.items);
  const starterItems = getStarterItems(state.items);
  const basicItems = getBasicItems(state.items);
  const epicItems = getEpicItems(state.items);
  const legendaryItems = getLegendaryItems(state.items);

  return (
    <div className="app-container">
      {state.selectedItem && (
        <SelectedItem item={state.selectedItem} allItems={state.items} />
      )}
      <div className="items-section">
        <header>Welcome Invoker!</header>

        <h1>Boots:</h1>
        <div className="items-grid">
          {bootsItems.map((item) => (
            <Item key={item.id} item={item} dispatch={dispatch} />
          ))}
        </div>

        <h1>Consumables:</h1>
        <div className="items-grid">
          {consumableItems.map((item) => (
            <Item key={item.id} item={item} dispatch={dispatch} />
          ))}
        </div>

        <h1>Starter Items:</h1>
        <div className="items-grid">
          {starterItems.map((item) => (
            <Item key={item.id} item={item} dispatch={dispatch} />
          ))}
        </div>

        <h1>Basic Items:</h1>
        <div className="items-grid">
          {basicItems.map((item) => (
            <Item key={item.id} item={item} dispatch={dispatch} />
          ))}
        </div>

        <h1>Epic Items:</h1>
        <div className="items-grid">
          {epicItems.map((item) => (
            <Item key={item.id} item={item} dispatch={dispatch} />
          ))}
        </div>

        <h1>Legendary Items:</h1>
        <div className="items-grid">
          {legendaryItems.map((item) => (
            <Item key={item.id} item={item} dispatch={dispatch} />
          ))}
        </div>
      </div>
    </div>
  );
}

const Item = ({
  item,
  dispatch,
}: {
  item: ItemType;
  dispatch: React.Dispatch<Action>;
}) => (
  <button
    className="item-card"
    type="button"
    onClick={() => dispatch({ type: "SET_ITEMS", payload: item })}
  >
    <img
      src={`https://ddragon.leagueoflegends.com/cdn/14.19.1/img/item/${item.image.full}`}
      alt={item.name}
      className="item-image"
    />
    <h3 className="item-name">{item.name}</h3>
    <p className="item-gold">{item.gold.total} Gold</p>
  </button>
);

const SelectedItem = ({
  item,
  allItems,
}: {
  item: ItemType;
  allItems: ItemType[];
}) => {
  const getItemsByIds = (ids?: string[]) => {
    if (!ids) return [];
    return allItems.filter((item) => ids.includes(item.id));
  };

  const fromItems = getItemsByIds(item.from);
  const intoItems = getItemsByIds(item.into);

  return (
    <div className="selected-item-details">
      <h2>Selected Item</h2>
      <div className="item-card">
        <img
          src={`https://ddragon.leagueoflegends.com/cdn/14.19.1/img/item/${item.image.full}`}
          alt={item.name}
          className="item-image"
        />
        <h3 className="item-name">{item.name}</h3>
        <p className="item-gold">{item.gold.total} Gold</p>
      </div>

      {fromItems.length > 0 && (
        <>
          <h4>Builds From:</h4>
          <div className="related-items">
            {fromItems.map((fItem) => (
              <div className="related-item" key={fItem.id}>
                <img
                  src={`https://ddragon.leagueoflegends.com/cdn/14.19.1/img/item/${fItem.image.full}`}
                  alt={fItem.name}
                  className="item-image"
                />
                <span>{fItem.name}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {intoItems.length > 0 && (
        <>
          <h4>Into:</h4>
          <div className="related-items">
            {intoItems.map((iItem) => (
              <div className="related-item" key={iItem.id}>
                <img
                  src={`https://ddragon.leagueoflegends.com/cdn/14.19.1/img/item/${iItem.image.full}`}
                  alt={iItem.name}
                  className="item-image"
                />
                <span>{iItem.name}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
