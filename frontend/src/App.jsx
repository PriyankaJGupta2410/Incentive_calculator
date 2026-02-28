import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/Landing/landing";
import RegisterPage from "./pages/Register/Register";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
