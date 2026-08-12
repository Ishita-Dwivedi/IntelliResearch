import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import ResearchSetup from "./pages/ResearchSetup";
import ResearchWorkspace from "./pages/ResearchWorkspace";
import PaperExplorer from "./pages/PaperExplorer";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/research/new" element={<ResearchSetup />} />
        <Route path="/research/:id" element={<ResearchWorkspace />} />
        <Route path="/research/:id/papers" element={<PaperExplorer />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;