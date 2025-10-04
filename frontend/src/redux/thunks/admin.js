import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { server } from "../../constants/config.js";

const adminlogin = createAsyncThunk("admin/login", async (seceretkey) => {
    try {
        const config = {
                withCredentials: true,
                headers: {
                    "Content-Type":"application/json",
                }
            }
    
    
        const { data } = await axios.post(`${server}/api/admin/verify`, 
            { seceretkey }, config
        )
        return data.message
    } catch (error) {
        throw error.reponse.data.message
    }

})

const getadminDetails = createAsyncThunk("admin/getAdmin", async () => {
    try {
        const config = {
                withCredentials: true,
                headers: {
                    "Content-Type":"application/json",
                }
            }
        const { data } = await axios.post(`${server}/api/admin/`, 
            config
        )
        return data.admin
    } catch (error) {
        throw error.reponse.data.message
    }

})

const adminLogout = createAsyncThunk("admin/logout", async (seceretkey) => {
    try {
        const config = {
                withCredentials: true,
                headers: {
                    "Content-Type":"application/json",
                }
            }
        const { data } = await axios.post(`${server}/api/admin/`, 
            config
        )
        return data.message
    } catch (error) {
        throw error.reponse.data.message
    }

})

export { adminlogin, adminLogout, getadminDetails };

