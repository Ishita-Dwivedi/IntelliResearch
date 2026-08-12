import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api/client";

function ResearchWorkspace() {
  // useParams reads the ":id" part of the URL, e.g. /research/2 -> id = "2"
  const { id } = useParams();

  const [research, setResearch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .getResearch(id)
      .then((data) => {
        setResearch(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]); // re-run this fetch if the URL's id ever changes

  if (loading) return <p>Loading research session...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!research) return <p>Not found.</p>;

  return (
    <div className="page research-workspace">
      <header>
        <h1>{research.topic}</h1>
        <p>
          {research.papers.length} paper(s) &bull; status: {research.status}
        </p>
      </header>

      <section>
        <h2>Papers</h2>
        {research.papers.length === 0 ? (
          <p>No papers yet.</p>
        ) : (
          <ul>
            {research.papers.map((paper) => (
              <li key={paper.id}>
                {paper.title || paper.file.split("/").pop()}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default ResearchWorkspace;