import { createSlice } from "@reduxjs/toolkit";
import { toast } from 'react-hot-toast';
import { adminlogin, adminLogout, getadminDetails } from "../thunks/admin";
const initialState = {
    user: null,
    isAdmin: false,
    loader:true,
}


const authSlice = createSlice({
    name: 'auth',
    initialState  ,
    reducers: {
        userExist: (state, action) => {
            state.user = action.payload;
            state.loader = false;
        },
        userNotExist: (state, action) => {
            state.user = null;
            state.loader = false;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(adminlogin.fulfilled, (state, action) => {
            state.isAdmin = true
            toast.success(action.payload)
        })
        .addCase(adminlogin.rejected, (state, action) => {
            state.isAdmin = false
            toast.error(action.error.message)
        })
        .addCase(getadminDetails.fulfilled, (state, action) => {
            if(action.payload)
                state.isAdmin = true
            else state.isAdmin=false
        })
        .addCase(getadminDetails.rejected, (state, action) => {
            state.isAdmin = false
        })
        .addCase(adminLogout.fulfilled, (state, action) => {
                state.isAdmin = false
            toast.success(action.payload)
        })
        .addCase(adminLogout.rejected, (state, action) => {
            state.isAdmin = true;
            toast.error(action.error.message)
        })
        
    }
})

export default authSlice
export const {userExist,userNotExist}=authSlice.actions