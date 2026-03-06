import { Routes,Route } from "react-router-dom"
import LandingPage from "../pages/Landing/Landing"
import RegisterPage from "../pages/Register/Register"
import LoginPage from "../pages/Login/Login"

function AppRoutes(){
    return(
        <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />
        </Routes>
    )
}

export default AppRoutes;