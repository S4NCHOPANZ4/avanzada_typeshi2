import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

// Si no usas TypeScript, puedes eliminar estas líneas o comentarlas
// export type RootState = ReturnType<typeof store.getState>;
// export type AppDispatch = typeof store.dispatch;

// O mantenerlas como exportaciones comunes
export const getStateType = () => typeof store.getState;
export const getDispatchType = () => typeof store.dispatch;