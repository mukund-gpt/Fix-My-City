import { configureStore } from '@reduxjs/toolkit'
import api from './api/api'
import authSlice from './reducers/auth'
import miscSlice from './reducers/misc'

export const store = configureStore({
    reducer: {
        [authSlice.name]: authSlice.reducer,
        [miscSlice.name]: miscSlice.reducer,
        [api.reducerPath]: api.reducer,
        
    },
    middleware: (mid) => [
        ...mid(),api.middleware
    ]

})

