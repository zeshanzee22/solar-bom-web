// src/api/adminAuthApi.js

import apiClient from "./apiClient";

// Create a user
export const createUserApi = (data) => {
    return apiClient.post("/api/signup/", data);
};

// Get all users
export const getAllUsersApi = () => {
    return apiClient.get("/api/get-users/");
}

// Delete a user
export const deleteUserApi = (userId) => {
    return apiClient.delete(`/api/delete-user/${userId}/`);
};

// Update user's role
export const updateUserRoleApi = (userId, role) => {
  return apiClient.post(`/api/update-role/${userId}/`, { role });
};

// Update full user
export const updateUserApi = (userId, data) => {
  return apiClient.post(`/api/update-user/${userId}/`, data);
};