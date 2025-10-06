import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { server } from "../../constants/config.js";

export const getUserDetails = createAsyncThunk("user/getUserDetails", async () => {
    try {
        const config = {
            withCredentials: true,
                headers: {
                    "Content-Type":"application/json",
                }
        }
        const { data } = await axios.get(`${server}/api/auth/user`, config);
        return data.user;
    } catch (error) {
        throw error.response.data.message || "Failed to fetch user details";
    }
});

export const updateUserDetails = createAsyncThunk("user/updateUserDetails", async (userData) => {   
    try {
        const config = {
            withCredentials: true,

            headers: {
                "Content-Type": "application/json",
            },
        };

        const { data } = await axios.put(`${server}/api/auth/user`, userData, config);
        return data.user;
    }
    catch (error) {
        throw error.response.data.message || "Failed to update user details";
    }
});

export const deleteUserAccount = createAsyncThunk("user/deleteUserAccount", async () => {
    try {
        const config = {
            withCredentials: true,
            headers: {
                "Content-Type": "application/json",
            },
        };
        const { data } = await axios.delete(`${server}/api/auth/user`, config);
        return data.message;
    } catch (error) {
        throw error.response.data.message || "Failed to delete user account";
    }   
});
export const userLogout = createAsyncThunk("user/logout", async () => {
    try {
        const config = {
            withCredentials: true,
            headers: {
                "Content-Type": "application/json",
            },
        };
        const { data } = await axios.post(`${server}/api/auth/logout`, {}, config);
        return data.message;
    }
    catch (error) {
        throw error.response.data.message || "Failed to logout user";
    }
});
export const userLogin = createAsyncThunk("user/login", async (credentials) => {
    try {
        const config = {
            withCredentials: true,
            headers: {
                "Content-Type": "application/json",
            },
        };
        const { data } = await axios.post(`${server}/api/auth/login`, credentials, config);
        return data.user;
    }
    catch (error) {
        throw error.response.data.message || "Failed to login user";
    }
});
export const userRegister = createAsyncThunk("user/register", async (userData) => {
    try {
        const config = {
            withCredentials: true,
            headers: {
                "Content-Type": "application/json",
            },
        };
        const { data } = await axios.post(`${server}/api/auth/register`, userData, config);
        return data.user;
    }

    catch (error) {
        throw error.response.data.message || "Failed to register user";
    }
});
export const userForgotPassword = createAsyncThunk("user/forgotPassword", async (email) => {
    try {
        const config = {
            withCredentials: true,
            headers: {
                "Content-Type": "application/json",
            },
        };
        const { data } = await axios.post(`${server}/api/auth/forgot-password`, { email }, config);
        return data.message;
    }
    catch (error) {
        throw error.response.data.message || "Failed to send password reset email";
    }
});
export const userResetPassword = createAsyncThunk("user/resetPassword", async ({ token, newPassword }) => {
    try {
        const config = {
            withCredentials: true,
            headers: {
                "Content-Type": "application/json",
            },
        };
        const { data } = await axios.post(`${server}/api/auth/reset-password`, { token, newPassword }, config);
        return data.message;
    }
    catch (error) {
        throw error.response.data.message || "Failed to reset password";
    }
});
export const userUpdateProfilePicture = createAsyncThunk("user/updateProfilePicture", async (formData) => {
    try {
        const config = {
            withCredentials: true,
            headers: {
                "Content-Type": "multipart/form-data",
            },
        };
        const { data } = await axios.post(`${server}/api/auth/upload-profile-picture`, formData, config);
        return data.user;
    }
    catch (error) {
        throw error.response.data.message || "Failed to update profile picture";
    }
});
export const userDeleteProfilePicture = createAsyncThunk("user/deleteProfilePicture", async () => {
    try {
        const config = {
            withCredentials: true,
            headers: {
                "Content-Type": "application/json",
            },
        };
        const { data } = await axios.delete(`${server}/api/auth/delete-profile-picture`, config);
        return data.user;
    }


    catch (error) {
        throw error.response.data.message || "Failed to delete profile picture";
    }
});
