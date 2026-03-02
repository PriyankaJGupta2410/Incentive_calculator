import axios from "axios";
import BASE_URL from "../config/apiConfig";

export const registerOrganization = async (payload) => {
  try {
    const res = await axios.post(
      `${BASE_URL}/organization/register`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return res.data;

  } catch (error) {
    console.error("Register Organization API Error:", error.response?.data || error.message);
    
    // Throw proper backend error message if available
    throw new Error(
      error.response?.data?.message || "Something went wrong"
    );
  }
};
