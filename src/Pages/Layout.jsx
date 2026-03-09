// src/components/Layout.jsx
import { Outlet, Link } from "react-router-dom";

export default function Layout() {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* Navbar */}
      <header
        style={{
          height: "60px",
          background: "#e64c4c",
          color: "white",
          display: "flex",
          alignItems: "center",
          padding: "0 20px",
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          justifyContent: "space-between",
        }}
      >
        
        <Link to="/" style={{ color: "white", marginRight: 15 }}>
        <h1 style={{ margin: 0 }}>My App Navbar</h1>
        </Link>
        <nav>
          <Link to="/" style={{ color: "white", marginRight: 15 }}>Home</Link>
          <Link to="/calculator" style={{  color: "white", marginRight: 15 }}>Module 1</Link>
          <Link to="/module2" style={{ color: "white" }}>Module 2</Link>
        </nav>
      </header>

      {/* Main content */}
      <main style={{ flex: 1, marginTop: "60px" }}>
        <Outlet />
      </main>

      {/* Footer */}
      <footer
        style={{
          height: "50px",
          background: "#2c6747",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        My App Footer
      </footer>
    </div>
  );
}