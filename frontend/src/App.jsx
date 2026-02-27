import { Routes, Route, BrowserRouter } from "react-router-dom";
import Landing from "./pages/Landing/landing";
import Register from "./pages/register/register";

function App() {
  return (
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/register" element={<Register />} />
      </Routes>
  );
}

export default App;
