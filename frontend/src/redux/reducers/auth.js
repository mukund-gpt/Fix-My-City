import { createSlice } from "@reduxjs/toolkit";
import { toast } from 'react-hot-toast';
import { adminlogin, adminLogout, getadminDetails } from "../thunks/admin";
import { deleteUserAccount, getUserDetails, updateUserDetails, userLogout } from "../thunks/user";
const initialState = {
    user: null,
    userRole: "citizen", // 'admin', 'staff', 'user'
    isAdmin: false,
    loader:true,
}


const authSlice = createSlice({
    name: 'auth',
    initialState  ,
    reducers: {
        userExist: (state, action) => {
            state.user = action.payload;
            state.userRole = action.payload?.role || "citizen";
            state.isAdmin = action.payload?.role === 'admin';
            state.loader = false;
        },
        userNotExist: (state, action) => {
            state.user = null;
            state.userRole = "citizen";
            state.isAdmin = false;
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
        .addCase(getUserDetails.fulfilled, (state, action) => {
            state.user = action.payload;
            state.loader = false;
        })
        .addCase(getUserDetails.rejected, (state, action) => {
            state.user = null;      
            state.loader = false;
            toast.error(action.error.message || "Failed to fetch user details");
        })
        .addCase(updateUserDetails.fulfilled, (state, action) => {
            state.user = action.payload;
            state.loader = false;
            toast.success("User details updated successfully");
        })
        .addCase(updateUserDetails.rejected, (state, action) => {
            state.loader = false;
            toast.error(action.error.message || "Failed to update user details");
        }
        )   
        .addCase(deleteUserAccount.fulfilled, (state, action) => {
            state.user = null;
            state.loader = false;
            toast.success(action.payload);
        })
        .addCase(deleteUserAccount.rejected, (state, action) => {
            state.loader = false;   
            toast.error(action.error.message || "Failed to delete user account");
        })
        .addCase(userLogout.fulfilled, (state, action) => {
            state.user = null;
            state.loader = false;
            toast.success(action.payload);
        })
        .addCase(userLogout.rejected, (state, action) => {
            state.loader = false;
            toast.error(action.error.message || "Failed to logout user");
        })
        
        
    }
})

export default authSlice
export const {userExist,userNotExist}=authSlice.actions