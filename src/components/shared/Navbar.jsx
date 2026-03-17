import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

const Navbar = () => {
  const navigate = useNavigate();

  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const handleLoginClick = () => {
    if (!user) {
      navigate("/login");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/"); // redirect to home after logout
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
        <li>
          <Link
            to="/t1"
            className="text-gray-700 hover:text-green-700 transition-colors duration-200"
          >
            T1 Bom and 2D
          </Link>
        </li>
        <li>
          <Link
            to="/t2"
            className="text-gray-700 hover:text-green-700 transition-colors duration-200"
          >
             T2 Solar Design
          </Link>
        </li>

         <li>
          <Link
            to="/pricing"
            className="text-gray-700 hover:text-green-700 transition-colors duration-200"
          >
             Pricing
          </Link>
        </li>


        {/* Login / User Display */}
        <li>
          {!user ? (
            <button
              onClick={handleLoginClick}
              className="px-6 py-2 bg-green-700 text-white rounded hover:bg-green-600 transition"
            >
              Login
            </button>
          ) : (
            <div className="flex items-center space-x-2">
              <div
                className="w-8 h-8 bg-green-700 text-white rounded-full flex items-center
                justify-center font-bold"
              >
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-gray-700">{user.name}</span>
              <button
                onClick={handleLogout}
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-400 transition"
              >
                Logout
              </button>
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
    </nav>
  );
};

export default Navbar;
