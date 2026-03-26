import axios from "axios";
import BASE_URL from "../config/apiConfig";

export const salesDropdown = async () => {
    try {
        const res = await axios.get(
            `${BASE_URL}/upload/GETsalesList`,
            {
                headers: {
                    "x-access-token": localStorage.getItem("token")
                }
            }
        );

        // Extract only required data
        const salesFiles = res?.data?.res_data?.sales?.res_data?.sales_files || [];

        return salesFiles;

    } catch (error) {
        console.error("Error fetching sales dropdown:", error);
        return [];
    }
};
