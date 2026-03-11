import { Routes, Route } from "react-router-dom";
import AdminLayout from "../../Pages/AdminLayout";
import UserPage from "./UserPage";

const AdminRoutes = () => {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route path="users" element={<UserPage />} />
        
        {/* Default page (Dashboard) */}
        <Route index element={<div>Welcome to Admin Home</div>} />
      </Route>
    </Routes>
  );
};

export default AdminRoutes;