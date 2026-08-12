import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="page home-page">
      <section className="hero">
        <h1>Research Smarter. Learn in Order.</h1>
        <p>
          Upload research papers and let AI discover their prerequisites
          and build your learning path.
        </p>
        <Link to="/research/new" className="btn-primary">
          Start Researching
        </Link>
      </section>

      <section className="how-it-works">
        <h2>How it works</h2>
        <ol>
          <li>Papers</li>
          <li>AI Analysis</li>
          <li>Prerequisites</li>
          <li>Learning Path</li>
          <li>Understand Research</li>
        </ol>
      </section>

      <section className="features">
        <ul>
          <li>Prerequisite-aware learning paths</li>
          <li>Citation & concept relationships</li>
          <li>Evidence-backed explanations</li>
          <li>AI research assistant</li>
        </ul>
      </section>
    </div>
  );
}

export default Home;