import { Routes,Route } from "react-router-dom"
import LandingPage from "../pages/Landing/Landing"
import RegisterPage from "../pages/Register/Register"
import LoginPage from "../pages/Login/Login"
import Dashboard from "../pages/Dashboard/Dashboard"

function AppRoutes(){
    return(
        <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path= "/dashboard" element={<Dashboard />} />
        </Routes>
    )
}

export default AppRoutes;