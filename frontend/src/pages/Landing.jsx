import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "../styles/theme.css";

function Landing() {
  const navigate = useNavigate();

  return (
    <div>
      <Navbar />

      <div className="container" style={{ marginTop: 60, textAlign: "center" }}>
        <span className="badge badge-purple">AI-Powered Research Companion</span>
        <h1 style={{ fontSize: 52, fontWeight: 800, margin: "20px 0 10px", lineHeight: 1.15 }}>
          Research Smarter.<br />Learn in Order.
        </h1>
        <p style={{ fontSize: 18, color: "var(--text-muted)", maxWidth: 560, margin: "0 auto 32px" }}>
          Upload research papers and let AI discover their prerequisites,
          citations, and build your personalized learning path.
        </p>
        <button className="btn btn-primary" style={{ fontSize: 16 }} onClick={() => navigate("/login")}>
          Start Researching →
        </button>
      </div>

      <div className="container" style={{ marginTop: 80, marginBottom: 60 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
          <FeatureCard badge="badge-purple" title="Prerequisite Detection" desc="AI maps what to learn before what." />
          <FeatureCard badge="badge-teal" title="Citation Graphs" desc="See how papers connect and cite each other." />
          <FeatureCard badge="badge-coral" title="Evidence-backed" desc="Every claim traces back to a page." />
          <FeatureCard badge="badge-yellow" title="AI Assistant" desc="Ask questions, grounded in your papers." />
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ badge, title, desc }) {
  return (
    <div className="card">
      <span className={`badge ${badge}`}>{title}</span>
      <p style={{ marginTop: 14, color: "var(--text-muted)", fontSize: 14 }}>{desc}</p>
    </div>
  );
}

export default Landing;