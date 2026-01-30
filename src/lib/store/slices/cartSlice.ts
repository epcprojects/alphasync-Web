import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type CartItem = {
  id: string; // product id (GraphQL id)
  cartItemId?: string; // server cart item id (needed for removeFromCart)
  name: string;
  price: number; // unit price
  qty: number;
  imageSrc: string;
};

export type ServerCart = {
  id?: string;
  itemsCount?: number;
  totalBasePrice?: number;
  totalMarkedUpPrice?: number;
  cartItems?: Array<{
    id?: string;
    quantity?: number;
    markedUpPrice?: number;
    product?: {
      id?: string;
      title?: string;
      primaryImage?: string | null;
      images?: Array<string | null> | null;
    } | null;
  }> | null;
} | null;

interface CartState {
  items: CartItem[];
  loaded: boolean;
  cartId?: string;
  itemsCount?: number;
  totalBasePrice?: number;
  totalMarkedUpPrice?: number;
}

const initialState: CartState = {
  items: [],
  loaded: false,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    setCartFromServer: (state, action: PayloadAction<ServerCart>) => {
      const cart = action.payload;
      state.loaded = true;
      state.cartId = cart?.id;
      state.itemsCount = cart?.itemsCount ?? 0;
      state.totalBasePrice = cart?.totalBasePrice ?? 0;
      state.totalMarkedUpPrice = cart?.totalMarkedUpPrice ?? 0;

      const serverItems = cart?.cartItems ?? [];
      state.items = serverItems
        .map((ci) => {
          const product = ci.product;
          const id = product?.id;
          if (!id) return null;
          const imageSrc =
            (product?.primaryImage && product.primaryImage.trim().length > 0
              ? product.primaryImage
              : product?.images?.find((img) => typeof img === "string" && img.trim().length > 0)) ||
            "";
          return {
            id,
            cartItemId: ci.id,
            name: product?.title || "Product",
            price: Number(ci.markedUpPrice ?? 0),
            qty: Number(ci.quantity ?? 1),
            imageSrc,
          } satisfies CartItem;
        })
        .filter((x): x is CartItem => !!x);
    },
    addItem: (state, action: PayloadAction<CartItem>) => {
      const incoming = action.payload;
      const existing = state.items.find((x) => x.id === incoming.id);
      if (existing) {
        existing.qty += incoming.qty;
      } else {
        state.items.push(incoming);
      }
      state.loaded = true;
      state.itemsCount = (state.itemsCount ?? 0) + incoming.qty;
    },
    removeItem: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      const existing = state.items.find((x) => x.id === id);
      state.items = state.items.filter((x) => x.id !== id);
      if (existing) {
        state.itemsCount = Math.max(0, (state.itemsCount ?? 0) - existing.qty);
      }
    },
    clearCart: (state) => {
      state.items = [];
      state.loaded = true;
      state.cartId = undefined;
      state.itemsCount = 0;
      state.totalBasePrice = 0;
      state.totalMarkedUpPrice = 0;
    },
  },
});

export const { setCartFromServer, addItem, removeItem, clearCart } = cartSlice.actions;
export default cartSlice.reducer;

