import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./Pages/Layout";
import Home from "./Pages/Home";
import Calculator from "./Pages/Calculator";
import Module2 from "./Pages/Module2";
import AdminLayout from "./Pages/AdminLayout";
import AdminRoutes from "./components/admin/AdminRoutes";
import Login from "./components/main/Login";
import ProtectedRoute from "./components/shared/ProtectedRoute";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Main Layout */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route
            path="/calculator"
            element={
              <ProtectedRoute>
                <Calculator page="BOMCalc" />
              </ProtectedRoute>
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
            path="/module2"
            element={
              <ProtectedRoute>
                <Module2 page="index" />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<Login />} />
        </Route>

        {/* Admin Layout */}
        <Route path="/admin/*" element={<AdminRoutes />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
