// src/redux/store.ts
import { configureStore } from '@reduxjs/toolkit';
import { authApi } from './features/auth/authApi';
import { catalogApi } from './features/catalog/catalogApi';
import authReducer from "./features/auth/authSlice";
import cartReducer from "./features/cart/cartSlice";

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer, 
    [catalogApi.reducerPath]: catalogApi.reducer,
   
    auth: authReducer,
    cart: cartReducer,
  
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware
      , catalogApi.middleware
      
    ).concat(),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
