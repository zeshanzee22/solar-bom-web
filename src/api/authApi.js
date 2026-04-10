// src/api/authApi.js

import apiClient from "./apiClient";


export const loginApi = (data) => {
  return apiClient.post("/api/signin/", data);
};

 
export const fetchSingleUserPlanApi = (userId) => {
  return apiClient.get(`/plans/user-plan/get_user_plan/?user_id=${userId}`);
};
 