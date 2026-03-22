import axios from "axios";
import BASE_URL from "../config/apiConfig";

export const uploadAdhoc = async(payload) =>{
    try{
        const res = await axios.post(
            `${BASE_URL}/upload/upload_ad_hoc_rule`,
            payload,{
                headers:{
                    "Content-Type" : "multipart/form-data",
                    "x-access-token": localStorage.getItem("token")
                }
            }
        );
        return res.data;
    }catch (error){
        console.error(
            "Upload Ad-hoc rule Api Error:",
            error.response?.data || error.message
        );

        throw new Error(
      error.response?.data?.message || "Something went wrong"
    );
    }
};