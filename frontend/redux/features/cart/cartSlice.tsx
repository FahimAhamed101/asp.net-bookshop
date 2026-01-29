import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type CartItem = {
  id: number;
  title: string;
  price: number;
  image: string;
  quantity: number;
};

type CartState = {
  items: CartItem[];
};

const loadCart = (): CartState => {
  if (typeof window === 'undefined') {
    return { items: [] };
  }
  try {
    const raw = localStorage.getItem('cart');
    if (!raw) return { items: [] };
    const items = JSON.parse(raw) as CartItem[];
    return { items };
  } catch {
    return { items: [] };
  }
};

const saveCart = (state: CartState) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('cart', JSON.stringify(state.items));
};

const cartSlice = createSlice({
  name: 'cart',
  initialState: loadCart(),
  reducers: {
    addItem: (state, action: PayloadAction<Omit<CartItem, 'quantity'>>) => {
      const existing = state.items.find((item) => item.id === action.payload.id);
      if (existing) {
        existing.quantity += 1;
      } else {
        state.items.push({ ...action.payload, quantity: 1 });
      }
      saveCart(state);
    },
    removeItem: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
      saveCart(state);
    },
    updateQuantity: (state, action: PayloadAction<{ id: number; quantity: number }>) => {
      const item = state.items.find((entry) => entry.id === action.payload.id);
      if (item) {
        item.quantity = Math.max(1, action.payload.quantity);
        saveCart(state);
      }
    },
    clearCart: (state) => {
      state.items = [];
      saveCart(state);
    },
  },
});

export const { addItem, removeItem, updateQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
