import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./Pages/Layout";
import Home from "./Pages/Home";
import Calculator from "./Pages/Calculator";
import Module2 from "./Pages/Module2";

import AdminRoutes from "./components/admin/AdminRoutes";
import Login from "./components/main/Login";
import RedirectIfLoggedIn from "./components/shared/RedirectIfLoggedIn";
import PricingPage from "./Pages/PricingPage";

import AdminProtectedRoute from "./components/admin/AdminProtectedRoute";
import AccessRoute from "./components/shared/AccessRoute";
import { useAuthStore } from "./store/authStore";
import { fetchSingleUserPlanApi } from "./api/authApi";
import { useEffect } from "react";

const App = () => {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const setPlan = useAuthStore((state) => state.setPlan);

  useEffect(() => {
    const loadPlan = async () => {
      try {
        if (user && token) {
          const res = await fetchSingleUserPlanApi(user.id);
          setPlan(res.data.data);
        }
      } catch (err) {
        console.log("Failed to fetch plan", err);
      }
    };
    loadPlan();
  }, [user, token, setPlan]);
  return (
    <BrowserRouter>
      <Routes>
        {/* Main Layout */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route
            path="/t1"
            element={
              <AccessRoute module="t1">
                <Calculator page="BOMCalc" />
              </AccessRoute>
            }
          />
          <Route
            path="/t2"
            element={
              <AccessRoute module="t2">
                <Module2 page="index" />
              </AccessRoute>
            }
          />

          <Route
            path="/drawing"
            element={
              <AccessRoute module="t1">
                <Calculator page="Drawing" />
              </AccessRoute>
            }
          />

          <Route
            path="/login"
            element={
              <RedirectIfLoggedIn>
                <Login />
              </RedirectIfLoggedIn>
            }
          />
        </Route>

        {/* Admin Layout */}
        {/* ✅ PROTECTED ADMIN ROUTES */}
        <Route
          path="/admin/*"
          element={
            <AdminProtectedRoute>
              <AdminRoutes />
            </AdminProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
