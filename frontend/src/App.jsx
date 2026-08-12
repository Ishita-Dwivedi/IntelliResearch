import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import ResearchSetup from "./pages/ResearchSetup";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/research/new" element={<ResearchSetup />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
