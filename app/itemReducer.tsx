import { ItemSchema, type ItemType, type Transaction } from "~/schemas";

export type State = {
  items: ItemType[];
  selectedItem: ItemType | null;
  inventory: ItemType[];
  gold: number;
  history: Transaction[];
};

export type Action =
  | { type: "GET_ITEMS"; payload: ItemType[] }
  | { type: "SET_ITEMS"; payload: ItemType }
  | { type: "BUY_ITEMS"; payload: ItemType }
  | { type: "SELL_ITEMS"; payload: ItemType }
  | { type: "UNDO_ITEMS" };

export const initialState: State = {
  items: [],
  selectedItem: null,
  inventory: [],
  gold: 20000,
  history: [],
};

const goldCap = (value: number) => Math.max(0, Math.min(20000, value));

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
          gold: goldCap(state.gold - effectiveCost),
          inventory: [...newInventory, item],
          history: [...state.history, { type: "buy", item: item }],
        };
      }

      return state;
    }
    case "SELL_ITEMS": {
      const item = action.payload;

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
        gold: goldCap(state.gold + itemToDelete?.gold.total),
        inventory: nextInventory,
        history: [...state.history, { type: "sell", item: item }],
      };
    }
    case "UNDO_ITEMS": {
      if (state.history.length === 0) {
        return state;
      }
      const lastHistoryItem = state.history.length - 1;

      if (state.history[lastHistoryItem].type === "buy") {
        const itemToDelete = state.inventory.find(
          (item) => item.id === state.history[lastHistoryItem].item.id,
        );
        const nextInventory = state.inventory.filter(
          (item) => item.id !== itemToDelete?.id,
        );
        return {
          ...state,
          inventory: nextInventory,
          gold: goldCap(
            state.gold + state.history[lastHistoryItem].item.gold.total,
          ),
          history: state.history.slice(0, -1),
        };
      }
      if (state.history[lastHistoryItem].type === "sell") {
        return {
          ...state,
          inventory: [...state.inventory, state.history[lastHistoryItem].item],
          gold: state.gold - state.history[lastHistoryItem].item.gold.total,
          history: state.history.slice(0, -1),
        };
      }
      return state;
    }
    default:
      return state;
  }
}
