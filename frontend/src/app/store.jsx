import { configureStore, combineReducers } from "@reduxjs/toolkit";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // defaults to localStorage for web

import productReducer from "../features/admin/products/productSlice";
import authReducer from "../features/auth/authSlice";
import orderReducer from "../features/admin/order/orderSlice";
import adminReducer from "../features/admin/adminSlices/AdminDashboardSlice";
import adminAnalyticsReducer from "../features/admin/analyticsSlice/AnalyticsSlice";
import inventoryReducer from "../features/admin/Inventory/InventorySlice/inventorySlice";
import customerReducer from "../features/admin/Customer/CustomerSlice/customerSlice";
import shippingReducer from "../features/admin/Shipping/shippingSlice/shippingSlice";
import storefrontReducer from "../features/admin/storeFront/storeFrontSlice";
import settingsReducer from "../features/admin/settings/settingsSlice"
import cartReducer from "../features/cart/cartSlice";

import axios from "axios";


// Add a request interceptor
axios.interceptors.request.use((config) => {
  const sessionId = sessionStorage.getItem("pellisco_session_id");

  if (sessionId) {
    // Attach the Tab ID to the headers of every request
    config.headers['X-Session-ID'] = sessionId;
    config.headers['X-Current-Path'] = window.location.pathname;
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});


// 1. Combine all your reducers
const rootReducer = combineReducers({
  product: productReducer,
  auth: authReducer,
  orders: orderReducer,
  admin: adminReducer,
  adminAnalytics: adminAnalyticsReducer,
  inventory: inventoryReducer,
  customer: customerReducer,
  shipping: shippingReducer,
  storefront: storefrontReducer,
  settings: settingsReducer,
  cart: cartReducer,
});

// 2. Set up the persistence configuration
const persistConfig = {
  key: 'root',
  version: 1,
  storage,
  // Optional: whitelist only specific reducers you want to persist
  // whitelist: ['storefront', 'auth']
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

// 3. Configure the store with the persisted reducer
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);
