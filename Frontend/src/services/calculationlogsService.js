import axios from "axios";
import BASE_URL from "../config/apiConfig";

export const calculationlogs = async () => {
    try {
        const res = await axios.get(
            `${BASE_URL}/calculator/GETallcalculations`,
            {
                headers: {
                    "x-access-token": localStorage.getItem("token"),
                },
            }
        );

        // Correct extraction based on API response
        const calculationLogs = res?.data?.res_data?.calculations || [];

        return calculationLogs;

    } catch (error) {
        console.error("Error fetching adhoc dropdown:", error);
        throw error;
    }
};
