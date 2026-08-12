
import { useState, useEffect } from "react";

function App() {
  const [researchList, setResearchList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/research/")
      .then((response) => {
        if (!response.ok) throw new Error("Request failed: " + response.status);
        return response.json();
      })
      .then((data) => {
        setResearchList(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h1>IntelliResearch</h1>
      <h2>Your research sessions</h2>
      {researchList.length === 0 ? (
        <p>No research sessions yet.</p>
      ) : (
        <ul>
          {researchList.map((r) => (
            <li key={r.id}>
              {r.topic} — status: {r.status} — {r.papers.length} paper(s)
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;