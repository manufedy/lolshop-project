import { ItemSchema, type ItemType } from "~/schemas";

export type State = {
  items: ItemType[];
  selectedItem: ItemType | null;
};

export type Action =
  | { type: "GET_ITEMS"; payload: ItemType[] }
  | { type: "SET_ITEMS"; payload: ItemType };

export const initialState: State = {
  items: [],
  selectedItem: null,
};

export function itemsReducer(state: State, action: Action): State {
  switch (action.type) {
    case "GET_ITEMS": {
      return { ...state, items: action.payload };
    }
    case "SET_ITEMS": {
      return { ...state, selectedItem: action.payload };
    }
    default:
      return state;
  }
}
