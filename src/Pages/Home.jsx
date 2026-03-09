// src/pages/Home.jsx
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: 40 }}>
      <h1>Home Page</h1>
      <p>Welcome! Click the button to open the legacy calculator:</p>
      <button
        onClick={() => navigate("/calculator")}
        style={{ padding: "10px 20px", fontSize: "16px" }}
      >
        Open Calculator
      </button>
    </div>
  );
}