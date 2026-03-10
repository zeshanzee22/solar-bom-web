// src/components/admin/AdminRoutes


import { Routes, Route } from "react-router-dom";
import AdminLayout from "../../Pages/AdminLayout";
import UserPage from "./UserPage";

const AdminRoutes = () => {
  return (
    <Routes>
      {/* /admin */}
      <Route index element={<AdminLayout />} />
      {/* /admin/users */}
      <Route path="users" element={<UserPage />} />
    </Routes>
  );
};

export default AdminRoutes;
