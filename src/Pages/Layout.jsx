import { Outlet } from "react-router-dom";
import Navbar from "../components/shared/Navbar";
import Footer from "../components/shared/Footer";

export default function Layout() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <header>
        <Navbar />
      </header>

      {/* Main content */}
      <main className="pt-16 flex-1">
        <Outlet />
      </main>

     {/* Footer */}
      <footer>
        <Footer/>
      </footer>
    </div>
  );
}