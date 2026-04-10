import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { fetchSingleUserPlanApi } from "../../api/authApi";
import LimitReachedDialog from "./LimitReachedDialog";

const Navbar = () => {
  const navigate = useNavigate();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showLimitDialog, setShowLimitDialog] = useState(false);
  const location = useLocation();

  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const plan = useAuthStore((state) => state.plan);

  const canAccessT1 = plan?.tool === "t1" || plan?.tool === "hybrid";
  const canAccessT2 = plan?.tool === "t2" || plan?.tool === "hybrid";

  const handleLoginClick = () => {
    if (!user) {
      navigate("/login");
    }
  };

  const handleLogout = () => {
    toast.success("You are logged out!");
    logout();
    navigate("/"); // redirect to home after logout
  };

  useEffect(() => {
    const handleMessage = async (event) => {
      if (event.data?.type === "USAGE_UPDATED") {
        console.log(" Usage update received");

        const user = useAuthStore.getState().user;
        if (!user) return;

        try {
          const res = await fetchSingleUserPlanApi(user.id);
          useAuthStore.getState().setPlan(res.data.data);
        } catch (err) {
          console.error("❌ Failed to refresh plan", err);
        }
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  useEffect(() => {
    setShowLogoutDialog(false);
  }, [location.pathname]);

  const isT1LimitReached = () => {
    if (!plan || plan.is_unlimited) return false;

    const t1 = plan.projects_usage?.t1;
    if (!t1) return false;

    return t1.used >= t1.limit;
  };

  const isT2LimitReached = () => {
    if (!plan || plan.is_unlimited) return false;

    const t2 = plan.projects_usage?.t2;
    if (!t2) return false;

    return t2.used >= t2.limit;
  };

  return (
    <nav className="w-full h-16 bg-white shadow-md fixed top-0 left-0 z-50 flex items-center justify-between px-6">
      {/* Logo */}
      <div className="flex items-center">
        <Link
          to="/"
          className="text-xl font-bold text-green-800 hover:text-green-600"
        >
          Solar Struckra
        </Link>
      </div>

      {/* Navigation Links */}
      <ul className="hidden md:flex items-center space-x-6">
        {/* BOM and 2D Drawing Button */}
        {canAccessT1 && (
          <li className="flex items-center">
            <button
              onClick={() => {
                if (isT1LimitReached()) {
                  setShowLimitDialog(true);
                  return;
                }

                navigate("/t1");
              }}
              className="text-gray-700 hover:text-green-700 transition-colors duration-200 cursor-pointer"
            >
              BOM and 2D Drawing
            </button>

            <span className="ml-1 px-2 py-0.5 text-[10px] font-bold text-white rounded-full bg-gradient-to-r from-purple-900 to-purple-600">
              PRO
            </span>
          </li>
        )}

        {/* Layout Design Button */}
        {canAccessT2 && (
          <li>
            <button
              onClick={() => {
                if (isT2LimitReached()) {
                  setShowLimitDialog(true);
                  return;
                }

                navigate("/t2");
              }}
              className="text-gray-700 hover:text-green-700 transition-colors duration-200 cursor-pointer"
            >
              Layout Design
            </button>
            <span className="ml-1 px-2 py-0.5 text-[10px] font-bold text-white rounded-full bg-gradient-to-r from-purple-900 to-purple-600">
              PRO
            </span>
          </li>
        )}

        {/* Pricing Button */}
        <li>
          <Link
            to="/pricing"
            className="text-gray-700 hover:text-green-700 transition-colors duration-200"
          >
            Pricing
          </Link>
        </li>

        {/* Project Usage */}
        {user && plan?.active && plan?.usage_display && (
          <li>
            <div className="px-3 py-1 rounded-full bg-green-100 text-gray-700 text-sm font-medium">
              Project Usage: {plan.usage_display}
            </div>
          </li>
        )}

        {/* Login / User Display */}
        <li className="relative">
          {!user ? (
            <button
              onClick={handleLoginClick}
              className="px-6 py-2 bg-green-700 text-white rounded hover:bg-green-600 transition"
            >
              Login
            </button>
          ) : (
            <div className="relative">
              {/* Avatar Button */}
              <div
                onClick={() => setShowLogoutDialog(!showLogoutDialog)}
                className="w-8 h-8 bg-green-700 text-white rounded-full flex items-center justify-center font-bold cursor-pointer"
              >
                {user.name.charAt(0).toUpperCase()}
              </div>

              {/* Dropdown */}
              {/* Dropdown */}
              {showLogoutDialog && (
                <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl py-4 z-50">
                  {/* Close Button */}
                  <button
                    onClick={() => setShowLogoutDialog(false)}
                    className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition"
                  >
                    ✕
                  </button>

                  {/* Email (Top Center) */}
                  <div className="text-center text-sm text-gray-500 mb-3 px-4 truncate">
                    {user.email}
                  </div>

                  {/* Big Avatar */}
                  <div className="flex justify-center mb-3">
                    <div className="w-16 h-16 rounded-full bg-green-700 text-white flex items-center justify-center text-2xl font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  </div>

                  {/* Greeting */}
                  <div className="text-center text-gray-800 font-medium mb-4">
                    Hi, {user.name}
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-gray-100 mx-6 mb-3" />

                  {/* Logout Button */}
                  <div className="px-4">
                    <button
                      onClick={handleLogout}
                      className="w-full py-2 text-sm font-medium text-red-500 bg-red-50 hover:bg-red-100 rounded-lg transition"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </li>
      </ul>

      {/* Mobile Menu Placeholder */}
      <div className="md:hidden">
        <button
          aria-label="Open Menu"
          className="text-gray-700 focus:outline-none"
        >
          &#9776;
        </button>
      </div>

      {/* Limit Reached  Dialog box  */}
      <LimitReachedDialog
        open={showLimitDialog}
        onClose={() => setShowLimitDialog(false)}
        onUpgrade={() => {
          setShowLimitDialog(false);
          navigate("/pricing");
        }}
        onContact={() => {
          window.location.href = "mailto:support@yourapp.com";
        }}
      />
    </nav>
  );
};

export default Navbar;
