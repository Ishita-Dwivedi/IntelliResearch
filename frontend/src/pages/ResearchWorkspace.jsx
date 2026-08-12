import { useState, useEffect, useRef, useCallback } from "react";
import { useParams , Link } from "react-router-dom";
import ReactFlow, { Background, Controls, MarkerType } from "reactflow";
import "reactflow/dist/style.css";
import { api } from "../api/client";

function ResearchWorkspace() {
  const { id } = useParams();

  const [research, setResearch] = useState(null);
  const [prerequisites, setPrerequisites] = useState([]);
  const [citations, setCitations] = useState([]);
  const [concepts, setConcepts] = useState([]);
  const [paperConcepts, setPaperConcepts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("path");
  const [selectedPaper, setSelectedPaper] = useState(null);
  const pollRef = useRef(null);

  const fetchAll = useCallback(() => {
    Promise.all([
      api.getResearch(id),
      api.listPrerequisites(id),
      api.listCitations(id),
      api.listConcepts(id),
      api.listPaperConcepts(id),
    ])
      .then(([researchData, prereqData, citationData, conceptData, paperConceptData]) => {
        setResearch(researchData);
        setPrerequisites(prereqData);
        setCitations(citationData);
        setConcepts(conceptData);
        setPaperConcepts(paperConceptData);
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
    <div className="page research-workspace" style={{ display: "flex" }}>
      <div style={{ flex: 1, padding: 40 }}>
        <header>
            <h1>{research.topic}</h1>
            <p>
                {research.papers.length} paper(s) &bull; status: {research.status}
            </p>
            <Link to={`/research/${id}/papers`} style={{ color: "#7a9dff" }}>
                Open Paper Explorer →
            </Link>
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
              <button onClick={() => setActiveTab("knowledge")} disabled={activeTab === "knowledge"}>
                Knowledge Graph
              </button>
              <button onClick={() => setActiveTab("citations")} disabled={activeTab === "citations"}>
                Citation Graph
              </button>
              <button onClick={() => setActiveTab("papers")} disabled={activeTab === "papers"}>
                Papers
              </button>
            </div>

            {activeTab === "path" && (
              <LearningPathGraph
                papers={research.papers}
                prerequisites={prerequisites}
                onNodeClick={(paperId) => setSelectedPaper(paperId)}
              />
            )}

            {activeTab === "knowledge" && (
              <KnowledgeGraph
                papers={research.papers}
                concepts={concepts}
                paperConcepts={paperConcepts}
                onPaperClick={(paperId) => setSelectedPaper(paperId)}
              />
            )}

            {activeTab === "citations" && (
              <CitationGraph
                papers={research.papers}
                citations={citations}
                onNodeClick={(paperId) => setSelectedPaper(paperId)}
              />
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

      {selectedPaper && (
        <PaperDrawer
          paperId={selectedPaper}
          papers={research.papers}
          prerequisites={prerequisites}
          citations={citations}
          onClose={() => setSelectedPaper(null)}
        />
      )}
    </div>
  );
}

function LearningPathGraph({ papers, prerequisites, onNodeClick }) {
  if (papers.length === 0) return <p>No papers to show.</p>;

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
      cursor: "pointer",
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
      <ReactFlow nodes={nodes} edges={edges} fitView onNodeClick={(event, node) => onNodeClick(node.id)}>
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}

function CitationGraph({ papers, citations, onNodeClick }) {
  if (papers.length === 0) return <p>No papers to show.</p>;

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
      cursor: "pointer",
    },
  }));

  const edges = citations.map((c) => ({
    id: `c${c.id}`,
    source: String(c.citing_paper),
    target: String(c.cited_paper),
    markerEnd: { type: MarkerType.ArrowClosed },
    style: { stroke: "#5a8dee" },
    label: "cites",
  }));

  return (
    <div style={{ height: 400, border: "1px solid #333", borderRadius: 8 }}>
      <ReactFlow nodes={nodes} edges={edges} fitView onNodeClick={(event, node) => onNodeClick(node.id)}>
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}

function KnowledgeGraph({ papers, concepts, paperConcepts, onPaperClick }) {
  if (concepts.length === 0) {
    return <p>No concepts recorded yet.</p>;
  }

  // Papers on top row, concepts on bottom row.
  const paperNodes = papers.map((paper, i) => ({
    id: `paper-${paper.id}`,
    position: { x: i * 220, y: 50 },
    data: { label: paper.title || paper.file.split("/").pop() },
    style: {
      background: "#1e1e1e",
      color: "#fff",
      border: "1px solid #555",
      borderRadius: 8,
      padding: 10,
      width: 180,
      cursor: "pointer",
    },
  }));

  const conceptNodes = concepts.map((concept, i) => ({
    id: `concept-${concept.id}`,
    position: { x: i * 220, y: 300 },
    data: { label: concept.name },
    style: {
      background: "#2a1e3d",
      color: "#fff",
      border: "1px solid #7a5fc9",
      borderRadius: "50%",
      padding: 10,
      width: 140,
      height: 140,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
    },
  }));

  // introduces: paper -> concept. requires: concept -> paper.
  const edges = paperConcepts.map((pc) => {
    const isIntroduces = pc.role === "introduces";
    return {
      id: `pc${pc.id}`,
      source: isIntroduces ? `paper-${pc.paper}` : `concept-${pc.concept}`,
      target: isIntroduces ? `concept-${pc.concept}` : `paper-${pc.paper}`,
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { stroke: isIntroduces ? "#4caf50" : "#e0a030" },
      label: isIntroduces ? "introduces" : "requires",
    };
  });

  return (
    <div style={{ height: 450, border: "1px solid #333", borderRadius: 8 }}>
      <ReactFlow
        nodes={[...paperNodes, ...conceptNodes]}
        edges={edges}
        fitView
        onNodeClick={(event, node) => {
          if (node.id.startsWith("paper-")) {
            onPaperClick(node.id.replace("paper-", ""));
          }
        }}
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}

function PaperDrawer({ paperId, papers, prerequisites, citations, onClose }) {
  const paper = papers.find((p) => String(p.id) === String(paperId));
  if (!paper) return null;

  const requires = prerequisites.filter((p) => String(p.paper) === String(paperId));
  const citesOut = citations.filter((c) => String(c.citing_paper) === String(paperId));
  const citedByIn = citations.filter((c) => String(c.cited_paper) === String(paperId));

  const findTitle = (pid) => {
    const p = papers.find((pp) => String(pp.id) === String(pid));
    return p ? (p.title || p.file.split("/").pop()) : `Paper #${pid}`;
  };

  return (
    <div style={{ width: 320, borderLeft: "1px solid #333", padding: 20, background: "#141414", color: "#fff" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ margin: 0 }}>{paper.title || paper.file.split("/").pop()}</h3>
        <button onClick={onClose}>×</button>
      </div>

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

      <h4>Why this paper is here</h4>
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
    </div>
  );
}

export default ResearchWorkspace;