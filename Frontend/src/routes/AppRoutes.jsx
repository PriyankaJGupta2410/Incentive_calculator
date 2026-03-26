import { Routes,Route } from "react-router-dom"
import LandingPage from "../pages/Landing/Landing"
import RegisterPage from "../pages/Register/Register"
import LoginPage from "../pages/Login/Login"
import Dashboard from "../pages/Dashboard/Dashboard"
import Upload_data from "../pages/Upload_data/Upload_data"
import UploadedFilesPage from "../pages/uploadedFiles/Uploadedfilespage"
import IncentiveCalculator from "../pages/Incentivecalculator/Incentivecalculator"

function AppRoutes(){
    return(
        <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path= "/dashboard" element={<Dashboard />} />
            <Route path="/upload" element={<Upload_data />} />
            <Route path="/uploaded-files" element={<UploadedFilesPage />} />
            <Route path="/calculator" element={<IncentiveCalculator/>}/>
        </Routes>
    )
}

export default AppRoutes;