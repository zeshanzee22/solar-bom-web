import { Navigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

const AccessRoute = ({ children, module }) => {
  const token = useAuthStore((state) => state.token);
  const plan = useAuthStore((state) => state.plan);
  console.log("plan IN AccessRoute", plan);

  // 1. Not logged in
  if (!token) {
    return <Navigate to="/login" />;
  }
  // Plan still loading (important fix)
  if (plan === null) {
    return <div>Loading...</div>; // or spinner
  }

  // No plan assigned yet
  if (!plan || !plan.active) {
    return <Navigate to="/pricing" />;
  }

  // Check module access
  const tool = plan.tool;    // possible values: "t1", "t2", "hybrid"
  const hasAccess = tool === module || tool === "hybrid";
  if (!hasAccess) {
    return <Navigate to="/pricing" />;
  }

  return children;
};

export default AccessRoute;
