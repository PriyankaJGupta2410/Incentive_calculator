import axios from "axios";
import BASE_URL from "../config/apiConfig";

export const fetchPreviewFile = async (upload_id) => {
    try{
        const res = await axios.get(
            `${BASE_URL}/upload/GETuploadedFileDetails?upload_id=${upload_id}`,
            {
                headers: {
                    "x-access-token": localStorage.getItem("token")
                }
            }
        )
        return res.data;
    }
    catch(error){
        console.error("Error fetching preview file:", error);
        throw error;
    }
}