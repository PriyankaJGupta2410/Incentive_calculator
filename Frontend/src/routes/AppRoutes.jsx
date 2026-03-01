import { Routes,Route } from "react-router-dom"
import LandingPage from "../pages/Landing/Landing"
import RegisterPage from "../pages/Register/Register"

function AppRoutes(){
    return(
        <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/register" element={<RegisterPage />} />
        </Routes>
    )
}

export default AppRoutes;