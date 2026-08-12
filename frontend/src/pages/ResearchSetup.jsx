import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";

const KNOWN_CONCEPTS = [
  "Programming Basics",
  "Arrays",
  "Recursion",
  "Dynamic Programming",
  "Graph Algorithms",
];

const GOALS = [
  "Understand the topic",
  "Read research papers",
  "Prepare for research",
  "Explore advanced work",
];

function ResearchSetup() {
  const navigate = useNavigate();

  const [topic, setTopic] = useState("");
  const [files, setFiles] = useState([]);
  const [knownConcepts, setKnownConcepts] = useState([]);
  const [goal, setGoal] = useState(GOALS[0]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  function toggleConcept(concept) {
    setKnownConcepts((prev) =>
      prev.includes(concept)
        ? prev.filter((c) => c !== concept)
        : [...prev, concept]
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (!topic.trim()) {
      setError("Please enter a topic.");
      return;
    }
    if (files.length < 2) {
      setError("Please upload at least 2 PDFs.");
      return;
    }

    setSubmitting(true);
    try {
      const research = await api.createResearch({ topic, status: "pending" });

      for (const file of files) {
        const formData = new FormData();
        formData.append("research", research.id);
        formData.append("file", file);
        await fetch("http://127.0.0.1:8000/api/papers/", {
          method: "POST",
          body: formData,
        });
      }

      navigate(`/research/${research.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page research-setup">
      <h1>What do you want to learn?</h1>

      <form onSubmit={handleSubmit}>
        <label>
          Research topic
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Dynamic Programming"
          />
        </label>

        <label>
          Upload papers (at least 2 PDFs)
          <input
            type="file"
            accept="application/pdf"
            multiple
            onChange={(e) => setFiles(Array.from(e.target.files))}
          />
        </label>
        {files.length > 0 && (
          <ul>
            {files.map((f, i) => (
              <li key={i}>{f.name}</li>
            ))}
          </ul>
        )}

        <fieldset>
          <legend>What do you already know? (optional)</legend>
          {KNOWN_CONCEPTS.map((concept) => (
            <label key={concept}>
              <input
                type="checkbox"
                checked={knownConcepts.includes(concept)}
                onChange={() => toggleConcept(concept)}
              />
              {concept}
            </label>
          ))}
        </fieldset>

        <fieldset>
          <legend>What is your goal?</legend>
          {GOALS.map((g) => (
            <label key={g}>
              <input
                type="radio"
                name="goal"
                value={g}
                checked={goal === g}
                onChange={() => setGoal(g)}
              />
              {g}
            </label>
          ))}
        </fieldset>

        {error && <p className="error-text">{error}</p>}

        <button type="submit" disabled={submitting} className="btn-primary">
          {submitting ? "Analyzing..." : "Analyze Papers \u2192"}
        </button>
      </form>
    </div>
  );
}

export default ResearchSetup;