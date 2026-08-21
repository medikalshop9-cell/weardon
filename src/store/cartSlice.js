import { createSlice } from '@reduxjs/toolkit';

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    isOpen: false,
  },
  reducers: {
    addToCart(state, action) {
      const { product, size } = action.payload;
      const existingItem = state.items.find(
        item => item.id === product.id && item.size === size
      );
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.items.push({
          ...product,
          size,
          quantity: 1,
        });
      }
    },
    removeFromCart(state, action) {
      const { id, size } = action.payload;
      state.items = state.items.filter(
        item => !(item.id === id && item.size === size)
      );
    },
    updateQuantity(state, action) {
      const { id, size, quantity } = action.payload;
      const item = state.items.find(
        item => item.id === id && item.size === size
      );
      if (item) {
        item.quantity = Math.max(1, quantity);
      }
    },
    toggleCart(state) {
      state.isOpen = !state.isOpen;
    },
    clearCart(state) {
      state.items = [];
    },
  },
});

export const selectCartTotal = (state) =>
  state.cart.items.reduce((total, item) => total + item.price * item.quantity, 0);

export const selectCartCount = (state) =>
  state.cart.items.reduce((count, item) => count + item.quantity, 0);

export const { addToCart, removeFromCart, updateQuantity, toggleCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
