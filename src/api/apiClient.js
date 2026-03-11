//src/api/apiClient.js
import axios from "axios";

// http://192.168.18.24:8000/api/signin/
const apiClient = axios.create({
  baseURL: "http://192.168.18.24:8000", // your backend
  headers: {
    "Content-Type": "application/json",
  },
});

export default apiClient;
