import axios from "axios";
import BASE_URL from "../config/apiConfig";

export const incentiveDropdown = async () => {
  try {
    const res = await axios.get(
      `${BASE_URL}/upload/GETincentiveList`,
      {
        headers: {
          "x-access-token": localStorage.getItem("token"),
        },
      }
    );
    return res.data;
  } catch (error) {
    console.error("Error fetching incentive dropdown:", error);
    throw error; // ← rethrow so Promise.all catches it
  }
};