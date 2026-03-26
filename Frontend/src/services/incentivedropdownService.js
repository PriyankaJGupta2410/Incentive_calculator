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

    // Extract required data
    const incentiveFiles = res?.data?.res_data?.incentives?.res_data?.incentive_files || [];

    return incentiveFiles;

  } catch (error) {
    console.error("Error fetching incentive dropdown:", error);
    throw error; // keep this for Promise.all handling
  }
};
