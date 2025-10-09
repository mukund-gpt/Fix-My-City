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
} from "redux-persist";
import storage from "redux-persist/lib/storage"; // defaults to localStorage for web
import { api } from "./api/api";
import authSlice from "./reducers/auth";
import miscSlice from "./reducers/misc";

// Combine all reducers
const rootReducer = combineReducers({
  [authSlice.name]: authSlice.reducer,
  [miscSlice.name]: miscSlice.reducer,
  [api.reducerPath]: api.reducer,
});

// Configure persistence
const persistConfig = {
  key: "root",
  storage,
  whitelist: [authSlice.name, miscSlice.name], // persist only these slices
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

// Create the store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(api.middleware),
});

// Create persistor
export const persistor = persistStore(store);
