// src/api/adminPlanApi.js

import apiClient from "./apiClient";

// Create a user
export const createPlanApi = (data) => {
    return apiClient.post("/plans/", data);
};

// Get all Plans
export const getAllPlanApi = () => {
    return apiClient.get("/plans/");
}

// Delete a Plan
export const deletePlanApi = (planId) => {
  return apiClient.delete(`/plans/${planId}/`);
};

// Update a Plan
export const updatePlanApi = (planId, data) => {
  return apiClient.put(`/plans/${planId}/`, data);
};

// Assign a Plan
export const assignUserPlanApi = (data) => {
    return apiClient.post("/plans/user-plan/assign/", data);
};