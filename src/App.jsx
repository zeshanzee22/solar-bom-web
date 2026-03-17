import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./Pages/Layout";
import Home from "./Pages/Home";
import Calculator from "./Pages/Calculator";
import Module2 from "./Pages/Module2";
import AdminLayout from "./Pages/AdminLayout";
import AdminRoutes from "./components/admin/AdminRoutes";
import Login from "./components/main/Login";
import ProtectedRoute from "./components/shared/ProtectedRoute";
import RedirectIfLoggedIn from "./components/shared/RedirectIfLoggedIn";
import PricingPage from "./Pages/PricingPage";
import PremiumRoute from "./components/shared/PremiumRoute";

const App = () => {
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
              <PremiumRoute module="t1">
                <Calculator page="BOMCalc" />
              </PremiumRoute>
            }
          />

          <Route
            path="/drawing"
            element={
              <ProtectedRoute>
                <Calculator page="Drawing" />
              </ProtectedRoute>
            }
          />

          <Route
            path="/t2"
            element={
              <PremiumRoute module="t2">
                <Module2 page="index" />
              </PremiumRoute>
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
        <Route path="/admin/*" element={<AdminRoutes />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
