import { useReducer, useEffect } from "react";
import * as V from "valibot";

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
      dispatch({ type: "GET_ITEMS", payload: allLolItems });
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
