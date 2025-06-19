import { ItemSchema, type ItemType } from "~/schemas";

export type State = {
  items: ItemType[];
  selectedItem: ItemType | null;
  inventory: ItemType[];
  gold: number;
  history: [];
};

export type Action =
  | { type: "GET_ITEMS"; payload: ItemType[] }
  | { type: "SET_ITEMS"; payload: ItemType }
  | { type: "BUY_ITEMS"; payload: ItemType }
  | { type: "SELL_ITEMS"; payload: ItemType };

export const initialState: State = {
  items: [],
  selectedItem: null,
  inventory: [],
  gold: 20000,
};

export function itemsReducer(state: State, action: Action): State {
  switch (action.type) {
    case "GET_ITEMS": {
      return { ...state, items: action.payload };
    }
    case "SET_ITEMS": {
      return { ...state, selectedItem: action.payload };
    }
    case "BUY_ITEMS": {
      const item = action.payload;
      const cost = item.gold.total;
      let discount = 0;

      const ownedComponentIds =
        item.from?.filter((id) =>
          state.inventory.some((ownedItem) => ownedItem.id === id),
        ) ?? [];

      const ownedItems = state.items.filter((i) =>
        ownedComponentIds.includes(i.id),
      );
      discount = ownedItems.reduce((sum, i) => sum + i.gold.total, 0);

      const effectiveCost = Math.max(cost - discount, 0);

      if (state.gold >= effectiveCost) {
        const newInventory = state.inventory.filter(
          (invItem) => !ownedComponentIds.includes(invItem.id),
        );

        return {
          ...state,
          gold: state.gold - effectiveCost,
          inventory: [...newInventory, item],
        };
      }

      return state;
    }
    case "SELL_ITEMS": {
      const itemToDelete = state.inventory.find(
        (item) => item.id === action.payload.id,
      );
      if (!itemToDelete) {
        return state;
      }
      const nextInventory = state.inventory.filter(
        (item) => item.id !== itemToDelete?.id,
      );
      return {
        ...state,
        gold: state.gold + itemToDelete?.gold.total,
        inventory: nextInventory,
      };
    }
    default:
      return state;
  }
}
