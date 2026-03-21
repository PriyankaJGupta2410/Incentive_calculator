import axios from "axios";
import BASE_URL from "../config/apiConfig";

export const downloadFile = async (upload_id) => {
    try{
        const res = await axios.get(
            `${BASE_URL}/upload/downloadFile?upload_id=${upload_id}`,
            {
                headers: {
                    "x-access-token": localStorage.getItem("token")
                },
                responseType: "blob"
            }
        )
        return res.data;
    }
    catch(error){
        console.error("Error downloading file:", error);
        throw error;
    }
}