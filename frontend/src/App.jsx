import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import ResearchSetup from "./pages/ResearchSetup";
import ResearchWorkspace from "./pages/ResearchWorkspace";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/research/new" element={<ResearchSetup />} />
        <Route path="/research/:id" element={<ResearchWorkspace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;