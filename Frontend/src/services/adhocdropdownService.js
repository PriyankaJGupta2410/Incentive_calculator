import axios from "axios";
import BASE_URL from "../config/apiConfig";

export const adhocDropdown = async () => {
    try{
        const res = await axios.get(
            `${BASE_URL}/upload/GETadhocList`,
            {
                headers : {
                    "x-access-token": localStorage.getItem("token"),
                },
            }
        );
        return res.data
    }catch(error){
        console.error("Error fetching adhoc dropdown:",error)
        throw error;
    }
};