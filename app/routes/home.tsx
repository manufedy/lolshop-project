import { useReducer, useEffect } from "react";
import * as V from "valibot";

const StatSchema = V.union([
  V.object({}),
  V.record(V.pipe(V.string(), V.minLength(4)), V.number()),
]);

const MapsSchema = V.object({
  11: V.boolean(),
  12: V.boolean(),
  21: V.boolean(),
  22: V.boolean(),
  30: V.boolean(),
  33: V.boolean(),
});

const IntoSchema = V.array(V.pipe(V.string(), V.minLength(5)));

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

const ItemSchema = V.object({
  colloq: V.string(),
  description: V.string(),
  gold: GoldSchema,
  image: ImageSchema,
  into: IntoSchema,
  maps: MapsSchema,
  name: V.pipe(V.string(), V.minLength(3)),
  plantext: V.pipe(V.string(), V.minLength(4)),
  stat: StatSchema,
  tags: V.array(V.pipe(V.string(), V.minLength(4))),
});

type Item = V.InferOutput<typeof ItemSchema>;

//@ts-ignore
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
      const dataLolitems = V.parse(ItemSchema, allLolItems.data);
      dispatch({ type: "GET_ITEMS", payload: dataLolitems });
    }
    run();
  }, []);

  console.log("state", state);

  return (
    <div className="items-grid">
      {state.items.data ? (
        Object.entries(state.items.data).map(([id, item]) => {
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
