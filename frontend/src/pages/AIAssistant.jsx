import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../api/client";

const SUGGESTED_QUESTIONS = [
  "What should I read first?",
  "What prerequisites do I need?",
  "Explain the main concept simply.",
  "Summarize this research topic.",
];

function AIAssistant() {
  const { id } = useParams();
  const [research, setResearch] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.getResearch(id).then(setResearch).catch((err) => setError(err.message));
  }, [id]);

  function send(text) {
    const question = text ?? input;
    if (!question.trim() || sending) return;

    setMessages((prev) => [...prev, { role: "user", text: question }]);
    setInput("");
    setSending(true);

    api
      .sendChatMessage(id, question)
      .then((data) => {
        setMessages((prev) => [...prev, { role: "assistant", text: data.answer }]);
        setSending(false);
      })
      .catch((err) => {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", text: `Error: ${err.message}` },
        ]);
        setSending(false);
      });
  }

  return (
    <div style={{ padding: 40, maxWidth: 700, margin: "0 auto" }}>
      <Link to={`/research/${id}`} style={{ color: "#888" }}>
        ← Back to Workspace
      </Link>

      <h1>AI Research Assistant</h1>
      {research && <p style={{ color: "#888" }}>{research.topic}</p>}
      {error && <p style={{ color: "salmon" }}>Error: {error}</p>}

      {messages.length === 0 && (
        <div style={{ marginTop: 20 }}>
          <p style={{ color: "#aaa" }}>Try asking:</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {SUGGESTED_QUESTIONS.map((q) => (
              <button key={q} onClick={() => send(q)} style={{ fontSize: 13 }}>
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 12 }}>
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              alignSelf: m.role === "user" ? "flex-end" : "flex-start",
              background: m.role === "user" ? "#2a3f5f" : "#1e1e1e",
              border: "1px solid #444",
              borderRadius: 8,
              padding: "10px 14px",
              maxWidth: "80%",
              color: "#fff",
            }}
          >
            {m.text}
          </div>
        ))}
        {sending && <p style={{ color: "#888" }}>Thinking...</p>}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        style={{ display: "flex", gap: 8, marginTop: 24 }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your papers, prerequisites, or learning path..."
          style={{
            flex: 1,
            padding: 10,
            background: "#1e1e1e",
            border: "1px solid #444",
            color: "#fff",
            borderRadius: 6,
          }}
        />
        <button type="submit" disabled={sending}>
          Send
        </button>
      </form>
    </div>
  );
}

export default AIAssistant;