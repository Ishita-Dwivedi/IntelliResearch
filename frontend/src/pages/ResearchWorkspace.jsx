import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import ReactFlow, { Background, Controls, MarkerType } from "reactflow";
import "reactflow/dist/style.css";
import { api } from "../api/client";

function ResearchWorkspace() {
  const { id } = useParams();

  const [research, setResearch] = useState(null);
  const [prerequisites, setPrerequisites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("path");
  const pollRef = useRef(null);

  const fetchAll = useCallback(() => {
    Promise.all([api.getResearch(id), api.listPrerequisites(id)])
      .then(([researchData, prereqData]) => {
        setResearch(researchData);
        setPrerequisites(prereqData);
        setLoading(false);
        if (researchData.status === "ready" || researchData.status === "failed") {
          clearInterval(pollRef.current);
        }
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
        clearInterval(pollRef.current);
      });
  }, [id]);

  useEffect(() => {
    fetchAll();
    pollRef.current = setInterval(fetchAll, 3000);
    return () => clearInterval(pollRef.current);
  }, [fetchAll]);

  if (loading) return <p>Loading research session...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!research) return <p>Not found.</p>;

  const isAnalyzing = research.status === "pending" || research.status === "analyzing";

  return (
    <div className="page research-workspace">
      <header>
        <h1>{research.topic}</h1>
        <p>
          {research.papers.length} paper(s) &bull; status: {research.status}
        </p>
      </header>

      {isAnalyzing && (
        <div style={{ padding: 20, border: "1px solid #444", borderRadius: 8, marginTop: 20 }}>
          <p>
            {research.status === "pending"
              ? "Queued for analysis..."
              : "Analyzing your research... this can take a minute."}
          </p>
        </div>
      )}

      {research.status === "failed" && (
        <p style={{ color: "salmon" }}>Analysis failed. Please try again.</p>
      )}

      {research.status === "ready" && (
        <>
          <div style={{ display: "flex", gap: 8, marginTop: 20, marginBottom: 10 }}>
            <button onClick={() => setActiveTab("path")} disabled={activeTab === "path"}>
              Learning Path
            </button>
            <button onClick={() => setActiveTab("papers")} disabled={activeTab === "papers"}>
              Papers
            </button>
          </div>

          {activeTab === "path" && (
            <LearningPathGraph papers={research.papers} prerequisites={prerequisites} />
          )}

          {activeTab === "papers" && (
            <ul>
              {research.papers.map((paper) => (
                <li key={paper.id}>{paper.title || paper.file.split("/").pop()}</li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}

function LearningPathGraph({ papers, prerequisites }) {
  if (papers.length === 0) {
    return <p>No papers to show.</p>;
  }

  // Simple horizontal layout: one row, spaced by index.
  const nodes = papers.map((paper, i) => ({
    id: String(paper.id),
    position: { x: i * 220, y: 100 },
    data: { label: paper.title || paper.file.split("/").pop() },
    style: {
      background: "#1e1e1e",
      color: "#fff",
      border: "1px solid #555",
      borderRadius: 8,
      padding: 10,
      width: 180,
    },
  }));

  const edges = prerequisites.map((p) => ({
    id: `e${p.id}`,
    source: String(p.prerequisite_paper),
    target: String(p.paper),
    markerEnd: { type: MarkerType.ArrowClosed },
    style: { stroke: "#888" },
  }));

  return (
    <div style={{ height: 400, border: "1px solid #333", borderRadius: 8 }}>
      <ReactFlow nodes={nodes} edges={edges} fitView>
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}

export default ResearchWorkspace;