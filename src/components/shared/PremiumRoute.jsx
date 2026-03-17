import { Navigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";


/**
 * ModuleRoute checks if the user is logged in
 * and if they have available credits for the module.
 * - If not logged in → redirect to /login
 * - If credits exhausted → redirect to /pricing
 */

const PremiumRoute = ({ children, module }) => {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);

  // Not logged in → redirect to login
  // if (!token) {
  //   return <Navigate to="/login" />;
  // }

  // Check remaining credits for this module
  const remainingCredits = user?.credits?.[module];

  // No credits left → redirect to pricing
  if (remainingCredits === 0 || remainingCredits === undefined) {
    return <Navigate to="/pricing" />;
  }

  // User has credits → allow access
  return children;
};

export default PremiumRoute;


// user = {
//   name: "zee",
//   email: "zeshan@example.com",
//   credits: {
//     t1: 3,   // Base user has 3 units left
//     t2: 100, // Premium or Enterprise
//   },
//   token: "jwt_token_here"
// };