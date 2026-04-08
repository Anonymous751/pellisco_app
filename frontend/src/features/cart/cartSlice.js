import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  cartItems: [],
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const item = action.payload;

      const existItem = state.cartItems.find(
        (x) => x._id === item._id
      );

      if (existItem) {
        existItem.quantity += item.quantity;
      } else {
        state.cartItems.push(item);
      }
    },
    removeFromCart: (state, action) => {
      state.cartItems = state.cartItems.filter(
        (x) => x._id !== action.payload
      );
    },
    incrementQuantity: (state, action) => {
  const item = state.cartItems.find(
    (i) => i._id === action.payload
  );
  if (item) item.quantity += 1;
},

decrementQuantity: (state, action) => {
  const item = state.cartItems.find(
    (i) => i._id === action.payload
  );
  if (item && item.quantity > 1) {
    item.quantity -= 1;
  }
},
    clearCart: (state) => {
      state.cartItems = [];
    },
  },
});

export const { addToCart, removeFromCart, clearCart,  incrementQuantity,
  decrementQuantity } = cartSlice.actions;
export default cartSlice.reducer;
