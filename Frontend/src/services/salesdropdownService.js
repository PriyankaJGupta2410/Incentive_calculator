import axios from "axios"
import BASE_URL from "../config/apiConfig"

export const salesDropdown =  async() => {
    try{
        const res = await axios.get(
            `${BASE_URL}/upload/GETsalesList`,
            {
                headers:{
                    "x-access-token":localStorage.getItem("token")
                }
            }
        )
        return res.data;
    }
    catch(error){
        console.error("Error fetching sales dropdown:",error)
    }
}