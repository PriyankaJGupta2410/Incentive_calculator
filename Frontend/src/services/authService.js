import axios from "axios";
import BASE_URL from "../config/apiConfig";

export const loginUser = async(payload) => {
    try {
        const res = await axios.post(
            `${BASE_URL}/users/login`,
            payload,
            {
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );
        return res.data;
    } catch (error) {
        throw error;
    }
}