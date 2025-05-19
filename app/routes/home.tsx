import { useReducer, useEffect } from "react";
//@ts-ignore
function itemsReducer(state, action) {
  switch (action.type) {
    case "GET_ITEMS":
      return { items: action.payload };
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
      console.log("allLolItems", allLolItems);
      dispatch({ type: "GET_ITEMS", payload: allLolItems });
    }
    run();
  }, []);

  console.log("state", state);
  return <h1>{[state.items.data]}</h1>;
}
