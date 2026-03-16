import axios from "axios";
import BASE_URL from "../config/apiConfig";

export const uploadSales = async (payload) => {
  try {

    const res = await axios.post(
      `${BASE_URL}/upload/upload_sales`,
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
      "Upload Sales Api Error:",
      error.response?.data || error.message
    );

    throw new Error(
      error.response?.data?.message || "Something went wrong"
    );
  }
};
