import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api", 
  timeout: 10000,
});

// Optional: response interceptor (clean error handling)
API.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API ERROR:", error?.response || error.message);
    return Promise.reject(error);
  }
);

export default API;