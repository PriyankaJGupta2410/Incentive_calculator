import axios from "axios";
import BASE_URL from "../config/apiConfig";

export const fetchUploadedFiles = async () => {
    try{
        const res = await axios.get(
            `${BASE_URL}/upload/GETuploadedFiles`,
            {
                headers: {
                    "x-access-token": localStorage.getItem("token")
                }
            }
        )
        return res.data;
    } catch (error) {
        console.error("Error fetching uploaded files:", error);
        throw error;
    }
}