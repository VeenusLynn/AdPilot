import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error);
    return Promise.reject(error);
  }
);

export const getUser = (Id) => api.get(`/general/user/${Id}`);
export const getCurrentUser = () => api.get("/api/auth/me");

export const registerUser = (userData) =>
  api.post("/api/auth/register", userData);

export const loginUser = (credentials) =>
  api.post("/api/auth/login", credentials);
export const logoutUser = () => api.post("/api/auth/logout");

export const getAds = () => api.get("/api/ads");
export const createAd = (adData) => api.post("/api/ads", adData);
export const updateAd = (id, adData) => api.put(`/api/ads/${id}`, adData);
export const deleteAd = (id) => api.delete(`/api/ads/${id}`);

export const uploadImage = (formData) =>
  api.post("/api/ads/uploads", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
