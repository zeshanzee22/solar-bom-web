//src/api/apiClient.js

import axios from "axios";
import { useAuthStore } from "../store/authStore";

const apiClient = axios.create({
  baseURL: "http://127.0.0.1:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach token
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle expired token
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const store = useAuthStore.getState();
    if (error.response?.status === 401 && !store.isLoggingOut) {
      console.warn("🔒 Token expired or invalid");
      store.logout();
      // If using React Router → better than reload
      window.location.replace("/login");
    }

    return Promise.reject(error);
  },
);

export default apiClient;
