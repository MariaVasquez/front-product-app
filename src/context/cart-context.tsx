import React, { createContext, useContext, useReducer, useEffect } from "react";
import { useLocalStorage } from "../hooks/use-local-storage";

type CartItem = {
  productId: number;
  quantity: number;
};

type CartState = {
  items: CartItem[];
};

export type Action =
  | { type: "ADD_ITEM"; payload: CartItem }
  | { type: "REMOVE_ITEM"; payload: number }
  | { type: "CLEAR_CART" }
  | { type: "UPDATE_ITEM_QUANTITY"; payload: CartItem  };

const CartContext = createContext<{
  state: CartState;
  dispatch: React.Dispatch<Action>;
}>({ state: { items: [] }, dispatch: () => {} });

const cartReducer = (state: CartState, action: Action): CartState => {
  switch (action.type) {
    case "ADD_ITEM": {
      const existing = state.items.find(
        (i) => i.productId === action.payload.productId
      );
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.productId === action.payload.productId
              ? { ...i, quantity: action.payload.quantity }
              : i
          ),
        };
      } else {
        return {
          items: [...state.items, action.payload],
        };
      }
    }

    case "REMOVE_ITEM":
      return {
        items: state.items.filter((i) => i.productId !== action.payload),
      };

    case "CLEAR_CART":
      return { items: [] };

    case "UPDATE_ITEM_QUANTITY":
      return {
        ...state,
        items: state.items.map((item) =>
          item.productId === action.payload.productId
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
      };

    default:
      return state;
  }
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [persistedCart, setPersistedCart] = useLocalStorage<CartState>("cart", {
    items: [],
  });

  const [state, dispatchBase] = useReducer(cartReducer, persistedCart);

  useEffect(() => {
    setPersistedCart(state);
  }, [setPersistedCart, state]);

  return (
    <CartContext.Provider value={{ state, dispatch: dispatchBase }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
