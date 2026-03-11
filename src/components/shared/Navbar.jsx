import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
    const navigate = useNavigate();
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
            to="/calculator"
            className="text-gray-700 hover:text-green-700 transition-colors duration-200"
          >
            module 1
          </Link>
        </li>
        <li>
          <Link
            to="/module2"
            className="text-gray-700 hover:text-green-700 transition-colors duration-200"
          >
            module 2
          </Link>
        </li>

        <li>
          <button
            onClick={() => navigate("/login")}
            className="px-6 py-2 bg-green-700 text-white rounded hover:bg-green-600 transition"
          >
            Login
          </button>
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
