import BASE_URL from "../config/apiConfig";

/* ─────────────────────────────────────────
   fetchDashboardData
   Calls GET /dashboard/metrics
   Returns the res_data object on success,
   throws an Error on failure.
───────────────────────────────────────── */
export const fetchDashboardData = async () => {
  const res = await fetch(`${BASE_URL}/dashboard/metrics`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "x-access-token": localStorage.getItem("token") || "",
    },
  });

  const json = await res.json();

  // Throw so the caller's catch block handles it
  if (!res.ok) {
    throw new Error(json.message || `Server error: ${res.status}`);
  }

  if (json.code !== 200 || json.status !== "success") {
    throw new Error(json.message || "Unexpected response from server");
  }

  // Return only the data the dashboard needs
  return json.res_data;
};