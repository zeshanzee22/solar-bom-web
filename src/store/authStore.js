import { create } from "zustand";

export const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem("user")) || null,
  token: localStorage.getItem("token") || null,
  plan: JSON.parse(localStorage.getItem("plan")) || null,
  isLoggingOut: false,

  login: (user, token) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    set({ user, token, isLoggingOut: false }); // reset isLoggingOut
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("plan");
    set({ user: null, token: null, plan: null, isLoggingOut: true }); 
  },
  setPlan: (plan) => {
    localStorage.setItem("plan", JSON.stringify(plan));
    set({ plan });
  },

}));
