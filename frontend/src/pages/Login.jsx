import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/theme.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  function handleLogin(e) {
    e.preventDefault();
    navigate("/dashboard");
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg)",
      }}
    >
      <form onSubmit={handleLogin} className="card" style={{ width: 360, display: "flex", flexDirection: "column", gap: 14 }}>
        <h2 style={{ margin: 0, fontWeight: 800, color: "var(--primary)" }}>IntelliResearch</h2>
        <p style={{ margin: 0, color: "var(--text-muted)", fontSize: 14 }}>Log in to continue</p>
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={fieldStyle}
        />
        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={fieldStyle}
        />
        <button className="btn btn-primary" type="submit">Log In</button>
      </form>
    </div>
  );
}

const fieldStyle = {
  padding: "12px 14px",
  borderRadius: 10,
  border: "1px solid var(--border)",
  fontSize: 14,
  outline: "none",
};

export default Login;