
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API = axios.create({
    baseURL: "http://10.0.2.2:3000/api", // backend URL
});

// Token ekleme 
API.interceptors.request.use(async (config) => {
    const token = await AsyncStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default API;
