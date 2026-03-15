import axios from "axios";
import BASE_URL from "../config/apiConfig";

export const uploadIncentiveRules = async (payload) => {
  try {

    const res = await axios.post(
      `${BASE_URL}/incentives/upload_incentive`,
      payload,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          "x-access-token": localStorage.getItem("token")
        }
      }
    );

    return res.data;

  } catch (error) {

    console.error(
      "Upload Incentive API Error:",
      error.response?.data || error.message
    );

    throw new Error(
      error.response?.data?.message || "Something went wrong"
    );

  }
};
