import { Navigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
 

const AdminProtectedRoute = ({ children }) => {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);

  
  if (!token || !user) {
    return <Navigate to="/login" />;
  }

  if (user.role !== "admin") {
    return <Navigate to="/login" />;
  }

  return children;
};

export default AdminProtectedRoute;

 