import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../api/client";

function PaperExplorer() {
  const { id } = useParams();

  const [research, setResearch] = useState(null);
  const [prerequisites, setPrerequisites] = useState([]);
  const [citations, setCitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedPaperId, setSelectedPaperId] = useState(null);

  const fetchAll = useCallback(() => {
    Promise.all([api.getResearch(id), api.listPrerequisites(id), api.listCitations(id)])
      .then(([researchData, prereqData, citationData]) => {
        setResearch(researchData);
        setPrerequisites(prereqData);
        setCitations(citationData);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  if (loading) return <p style={{ padding: 40 }}>Loading papers...</p>;
  if (error) return <p style={{ padding: 40 }}>Error: {error}</p>;
  if (!research) return <p style={{ padding: 40 }}>Not found.</p>;

  const papers = research.papers.filter((p) => {
    const label = (p.title || p.file.split("/").pop()).toLowerCase();
    return label.includes(search.toLowerCase());
  });

  const selectedPaper = research.papers.find((p) => String(p.id) === String(selectedPaperId));

  return (
    <div style={{ padding: 40 }}>
      <Link to={`/research/${id}`} style={{ color: "#888" }}>
        ← Back to Workspace
      </Link>
      <h1>Research Papers</h1>
      <p style={{ color: "#888" }}>{research.topic}</p>

      <input
        type="text"
        placeholder="Search papers..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          padding: 8,
          width: 300,
          marginTop: 10,
          marginBottom: 20,
          background: "#1e1e1e",
          border: "1px solid #444",
          color: "#fff",
          borderRadius: 6,
        }}
      />

      {selectedPaper ? (
        <PaperDetail
          paper={selectedPaper}
          papers={research.papers}
          prerequisites={prerequisites}
          citations={citations}
          onBack={() => setSelectedPaperId(null)}
        />
      ) : (
        <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
          {papers.length === 0 ? (
            <p>No papers match your search.</p>
          ) : (
            papers.map((paper) => (
              <PaperCard
                key={paper.id}
                paper={paper}
                onOpen={() => setSelectedPaperId(paper.id)}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

function PaperCard({ paper, onOpen }) {
  return (
    <div
      onClick={onOpen}
      style={{
        border: "1px solid #333",
        borderRadius: 8,
        padding: 16,
        background: "#161616",
        cursor: "pointer",
      }}
    >
      <h3 style={{ marginTop: 0 }}>{paper.title || paper.file.split("/").pop()}</h3>
      {paper.authors && (
        <p style={{ color: "#aaa", fontSize: 14 }}>
          {paper.authors}
          {paper.year ? ` • ${paper.year}` : ""}
        </p>
      )}
      {paper.abstract && (
        <p style={{ fontSize: 13, color: "#888" }}>
          {paper.abstract.length > 140 ? paper.abstract.slice(0, 140) + "…" : paper.abstract}
        </p>
      )}
      <p style={{ fontSize: 12, color: "#666", marginTop: 10 }}>Open →</p>
    </div>
  );
}

function PaperDetail({ paper, papers, prerequisites, citations, onBack }) {
  const requires = prerequisites.filter((p) => String(p.paper) === String(paper.id));
  const citesOut = citations.filter((c) => String(c.citing_paper) === String(paper.id));
  const citedByIn = citations.filter((c) => String(c.cited_paper) === String(paper.id));

  const findTitle = (pid) => {
    const p = papers.find((pp) => String(pp.id) === String(pid));
    return p ? (p.title || p.file.split("/").pop()) : `Paper #${pid}`;
  };

  return (
    <div style={{ border: "1px solid #333", borderRadius: 8, padding: 24, background: "#161616", maxWidth: 700 }}>
      <button onClick={onBack} style={{ marginBottom: 16 }}>
        ← Back to list
      </button>

      <h2 style={{ marginTop: 0 }}>{paper.title || paper.file.split("/").pop()}</h2>
      {paper.authors && (
        <p style={{ color: "#aaa" }}>
          {paper.authors}
          {paper.year ? ` • ${paper.year}` : ""}
        </p>
      )}

      {paper.abstract && (
        <>
          <h4>Abstract</h4>
          <p style={{ fontSize: 14 }}>{paper.abstract}</p>
        </>
      )}

      {paper.ai_summary && (
        <>
          <h4>AI Summary</h4>
          <p style={{ fontSize: 14 }}>{paper.ai_summary}</p>
        </>
      )}

      <h4>Why am I reading this now?</h4>
      {requires.length === 0 ? (
        <p style={{ fontSize: 14, color: "#888" }}>No prerequisites recorded.</p>
      ) : (
        requires.map((r) => (
          <div key={r.id} style={{ marginBottom: 12 }}>
            <p style={{ fontSize: 14 }}>
              Requires: <strong>{findTitle(r.prerequisite_paper)}</strong>
            </p>
            {r.reason && <p style={{ fontSize: 13, color: "#aaa" }}>{r.reason}</p>}
            {r.confidence != null && (
              <p style={{ fontSize: 12, color: "#666" }}>Confidence: {Math.round(r.confidence * 100)}%</p>
            )}
          </div>
        ))
      )}

      <h4>Citations</h4>
      {citesOut.length === 0 && citedByIn.length === 0 ? (
        <p style={{ fontSize: 14, color: "#888" }}>No citation links recorded.</p>
      ) : (
        <>
          {citesOut.map((c) => (
            <p key={c.id} style={{ fontSize: 14 }}>
              Cites: <strong>{findTitle(c.cited_paper)}</strong>
            </p>
          ))}
          {citedByIn.map((c) => (
            <p key={c.id} style={{ fontSize: 14 }}>
              Cited by: <strong>{findTitle(c.citing_paper)}</strong>
            </p>
          ))}
        </>
      )}

      <a href={paper.file} target="_blank" rel="noreferrer" style={{ display: "inline-block", marginTop: 20 }}>
        Open PDF
      </a>
    </div>
  );
}

export default PaperExplorer;