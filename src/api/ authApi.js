// src/api/authApi.js

import apiClient from "./apiClient";


export const loginApi = (data) => {
  return apiClient.post("/api/signin/", data);
};