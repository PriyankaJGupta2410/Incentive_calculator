import axios from "axios";
import BASE_URL from "../config/apiConfig";

export const incentiveCalculator = async (payload) => {
  try {
    const res = await axios.post(
      `${BASE_URL}/calculator/incentives_calculate`,
      payload,
      {
        headers: {
          "x-access-token": localStorage.getItem("token"),
        },
      }
    );

    const data = res?.data;

    // ✅ Handle success properly
    if (data?.status === "success") {
      return {
        status: "success",
        data: data.res_data || [],   // 👈 array of employees
        message: data.message,
        code: data.code
      };
    }

    // ❌ Handle backend failure response
    return {
      status: "error",
      data: [],
      message: data?.message || "Calculation failed",
      code: data?.code || 400,
    };

  } catch (error) {
    console.error("Error in incentive calculation:", error?.response || error);

    return {
      status: "error",
      data: [],
      message: error?.response?.data?.message || "Something went wrong",
      code: error?.response?.status || 500,
    };
  }
};
