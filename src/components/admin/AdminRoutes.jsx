import { Routes, Route } from "react-router-dom";
import AdminLayout from "../../Pages/AdminLayout";
import UserPage from "./UserPage";
import PlanPage from "./PlanPage";
import InvoicePage from "./InvoicePage";

const AdminRoutes = () => {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route path="users" element={<UserPage />} />
        <Route path="plans" element={<PlanPage />} />
        <Route path="invoices" element={<InvoicePage />} />
        
        {/* Default page (Dashboard) */}
        <Route index element={<div>Welcome to Admin Home</div>} />
      </Route>
    </Routes>
  );
};

export default AdminRoutes;