// store.js
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // defaults to localStorage for web
import { api } from './api/api';
import authSlice from './reducers/auth';
import miscSlice from './reducers/misc';

// Combine all your reducers
const rootReducer = combineReducers({
  [authSlice.name]: authSlice.reducer,
  [miscSlice.name]: miscSlice.reducer,
  [api.reducerPath]: api.reducer,
});

// Persist config
const persistConfig = {
  key: 'root',
  storage,
  whitelist: [authSlice.name, miscSlice.name], // persist only auth & misc (not API cache)
};

// Create a persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // needed for redux-persist
    }).concat(api.middleware),
});

// Create persistor
export const persistor = persistStore(store);
