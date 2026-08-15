import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import "../styles/theme.css";

const STATUS_COLORS = {
  pending: "#FFC542",
  analyzing: "#4A90E2",
  ready: "#2ED9C3",
  failed: "#FF6B6B",
};

function Home() {
  const [research, setResearch] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .listResearch()
      .then((data) => {
        setResearch(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div style={{ padding: 60 }}>Loading dashboard...</div>;
  if (error) return <div style={{ padding: 60 }}>Error: {error}</div>;

  const totalSessions = research.length;
  const totalPapers = research.reduce((sum, r) => sum + (r.papers?.length || 0), 0);
  const readyCount = research.filter((r) => r.status === "ready").length;
  const statusCounts = research.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div style={{ paddingBottom: 60 }}>
      <DashboardHeader />

      <div className="container" style={{ marginTop: 28 }}>
        {/* Top stat cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
          <StatCard label="Research Sessions" value={totalSessions} color="var(--primary)" bg="var(--primary-light)" icon="📚" />
          <StatCard label="Total Papers" value={totalPapers} color="#1AA893" bg="#E3FBF8" icon="📄" />
          <StatCard label="Ready Sessions" value={readyCount} color="#C98A00" bg="#FFF6E0" icon="✅" />
        </div>

        {/* Charts row */}
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 20, marginTop: 20 }}>
          <div className="card">
            <h3 style={{ marginTop: 0 }}>Papers per Session</h3>
            <BarChart
              data={research.map((r) => ({
                label: r.topic,
                value: r.papers?.length || 0,
              }))}
            />
          </div>

          <div className="card">
            <h3 style={{ marginTop: 0 }}>Status Breakdown</h3>
            <DonutChart counts={statusCounts} total={totalSessions} />
          </div>
        </div>

        {/* Research session list */}
        <div style={{ marginTop: 32, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ margin: 0 }}>Your Research Sessions</h2>
          <button className="btn btn-primary" onClick={() => navigate("/research/new")}>
            + New Research
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20, marginTop: 20 }}>
          {research.length === 0 ? (
            <p style={{ color: "var(--text-muted)" }}>No research sessions yet — start your first one.</p>
          ) : (
            research.map((r) => <ResearchCard key={r.id} research={r} onOpen={() => navigate(`/research/${r.id}`)} />)
          )}
        </div>
      </div>
    </div>
  );
}

function DashboardHeader() {
  return (
    <div className="container" style={{ paddingTop: 24 }}>
      <div className="pill-nav">
        <span style={{ fontWeight: 800, fontSize: 20, color: "var(--primary)" }}>
          IntelliResearch Dashboard
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 16, color: "var(--text-muted)", fontSize: 20 }}>
          <span>🔍</span>
          <span>⚙️</span>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: "var(--primary)",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
              fontWeight: 700,
            }}
          >
            U
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color, bg, icon }) {
  return (
    <div className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div>
        <div className="stat-label">{label}</div>
        <div className="stat-value" style={{ color }}>{value}</div>
      </div>
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: 14,
          background: bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 22,
        }}
      >
        {icon}
      </div>
    </div>
  );
}

function BarChart({ data }) {
  if (data.length === 0) {
    return <p style={{ color: "var(--text-muted)", fontSize: 14 }}>No data yet.</p>;
  }
  const max = Math.max(...data.map((d) => d.value), 1);
  const barColors = ["#6C5DD3", "#2ED9C3", "#FFC542", "#FF6B6B", "#4A90E2"];

  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 18, height: 180, padding: "10px 4px" }}>
      {data.map((d, i) => (
        <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4 }}>{d.value}</div>
          <div
            style={{
              width: "60%",
              minWidth: 24,
              height: `${(d.value / max) * 130 || 4}px`,
              background: barColors[i % barColors.length],
              borderRadius: "8px 8px 0 0",
              transition: "height 0.3s ease",
            }}
          />
          <div
            style={{
              fontSize: 11,
              color: "var(--text-muted)",
              marginTop: 8,
              textAlign: "center",
              maxWidth: 70,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
            title={d.label}
          >
            {d.label}
          </div>
        </div>
      ))}
    </div>
  );
}

function DonutChart({ counts, total }) {
  if (total === 0) {
    return <p style={{ color: "var(--text-muted)", fontSize: 14 }}>No data yet.</p>;
  }

  const statuses = ["ready", "analyzing", "pending", "failed"];
  let cumulative = 0;
  const radius = 60;
  const circumference = 2 * Math.PI * radius;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
      <svg width="150" height="150" viewBox="0 0 150 150">
        <circle cx="75" cy="75" r={radius} fill="none" stroke="#F0EEFB" strokeWidth="18" />
        {statuses.map((status) => {
          const count = counts[status] || 0;
          if (count === 0) return null;
          const fraction = count / total;
          const dash = fraction * circumference;
          const offset = cumulative * circumference;
          cumulative += fraction;
          return (
            <circle
              key={status}
              cx="75"
              cy="75"
              r={radius}
              fill="none"
              stroke={STATUS_COLORS[status]}
              strokeWidth="18"
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeDashoffset={-offset}
              transform="rotate(-90 75 75)"
              strokeLinecap="round"
            />
          );
        })}
        <text x="75" y="80" textAnchor="middle" fontSize="24" fontWeight="800" fill="var(--text-dark)">
          {total}
        </text>
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {statuses.map((status) =>
          counts[status] ? (
            <div key={status} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: STATUS_COLORS[status] }} />
              <span style={{ textTransform: "capitalize" }}>{status}</span>
              <span style={{ color: "var(--text-muted)" }}>({counts[status]})</span>
            </div>
          ) : null
        )}
      </div>
    </div>
  );
}

function ResearchCard({ research, onOpen }) {
  const badgeClass =
    research.status === "ready"
      ? "badge-teal"
      : research.status === "failed"
      ? "badge-coral"
      : research.status === "analyzing"
      ? "badge-purple"
      : "badge-yellow";

  return (
    <div className="card" onClick={onOpen} style={{ cursor: "pointer" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <h3 style={{ margin: 0, fontSize: 17 }}>{research.topic}</h3>
        <span className={`badge ${badgeClass}`}>{research.status}</span>
      </div>
      <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 10 }}>
        {research.papers?.length || 0} paper(s)
      </p>
      <p style={{ color: "var(--primary)", fontSize: 13, marginTop: 14, fontWeight: 600 }}>Open →</p>
    </div>
  );
}

export default Home;