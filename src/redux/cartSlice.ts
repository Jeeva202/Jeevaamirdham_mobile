import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CartItem } from '../navigation/types';

interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

const initialState: CartState = {
  items: [],
  isOpen: false,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const { bookId, quantity } = action.payload;
      const existingItem = state.items.find(item => item.bookId === bookId);
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.items.push({ bookId, quantity });
      }
    },
    openCart: state => {
      state.isOpen = true;
    },
    closeCart: state => {
      state.isOpen = false;
    },
  },
});

export const { addToCart, openCart, closeCart } = cartSlice.actions;
export default cartSlice.reducer;