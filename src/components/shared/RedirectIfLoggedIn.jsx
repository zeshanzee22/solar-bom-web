import { Navigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

const RedirectIfLoggedIn = ({ children }) => {
  const user = useAuthStore((state) => state.user);

  if (user) {
    // Redirect based on role
    return user.role === "admin" ? (
      <Navigate to="/admin" />
    ) : (
      <Navigate to="/" />
    );
  }

  return children; // If not logged in, show the wrapped component
};

export default RedirectIfLoggedIn;
