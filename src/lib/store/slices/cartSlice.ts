import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type CartItem = {
  /** Cart line id: productId, or productId__productUnitPricingId when same product can have multiple lines (different unit pricing) */
  id: string;
  /** Real product id for API (required when id is composite) */
  productId?: string;
  cartItemId?: string; // server cart item id (needed for removeFromCart)
  name: string;
  price: number; // unit price
  qty: number;
  imageSrc: string;
  vendor?: string | null;
  /** Selected pharmacy product unit pricing id (sent with create order) */
  productUnitPricingId?: string | null;
  /** Unit pricing quantity/strength for display when item has unit pricing (from server) */
  productUnitPricingQuantity?: number;
  productUnitPricingStrength?: string | null;
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
    productUnitPricing?: {
      id?: string;
      quantity?: number;
      strength?: string | null;
      price?: number;
    } | null;
    product?: {
      id?: string;
      title?: string;
      primaryImage?: string | null;
      images?: Array<string | null> | null;
      vendor?: string | null;
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
      state.items = serverItems.flatMap((ci): CartItem[] => {
        const product = ci.product;
        const productId = product?.id;
        if (!productId) return [];
        const unitPricingId = ci.productUnitPricing?.id;
        const cartLineId =
          unitPricingId != null && unitPricingId !== ""
            ? `${productId}__${unitPricingId}`
            : productId;
        const imageSrc =
          (product?.primaryImage && product.primaryImage.trim().length > 0
            ? product.primaryImage
            : product?.images?.find(
                (img) => typeof img === "string" && img.trim().length > 0,
              )) || "";
        const price =
          typeof ci.markedUpPrice === "number"
            ? ci.markedUpPrice
            : typeof ci.markedUpPrice === "object" &&
                ci.markedUpPrice != null &&
                "parsedValue" in ci.markedUpPrice
              ? Number((ci.markedUpPrice as { parsedValue?: number }).parsedValue ?? 0)
              : Number(ci.markedUpPrice ?? 0);
        return [
          {
            id: cartLineId,
            productId,
            cartItemId: ci.id,
            name: product?.title || "Product",
            price,
            qty: Number(ci.quantity ?? 1),
            imageSrc,
            vendor: product?.vendor ?? undefined,
            productUnitPricingId: unitPricingId ?? undefined,
            productUnitPricingQuantity: ci.productUnitPricing?.quantity,
            productUnitPricingStrength: ci.productUnitPricing?.strength ?? undefined,
          },
        ];
      });
    },
    addItem: (state, action: PayloadAction<CartItem>) => {
      const incoming = action.payload;
      const existing = state.items.find((x) => x.id === incoming.id);
      if (existing) {
        existing.qty += incoming.qty;
        existing.price = incoming.price;
        if (incoming.productUnitPricingId != null)
          existing.productUnitPricingId = incoming.productUnitPricingId;
        if (incoming.productId != null) existing.productId = incoming.productId;
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

