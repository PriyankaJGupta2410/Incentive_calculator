from core.database import get_connection
import uuid
from datetime import datetime
import pandas as pd
import json
import numpy as np

###################### DASHBOARD REPOSITORY #####################
def GETdashboard_metrics(org_id):
    conn = get_connection()
    cursor = conn.cursor()

    try:
        # ========= KPI =========
        kpi_query = """
            SELECT
                COUNT(DISTINCT calculation_batch_id) AS total_calculation_batches,
                COUNT(DISTINCT employee_id) AS total_employees_calculated,
                SUM(total_incentive) AS total_payout,
                AVG(total_incentive) AS average_incentive
            FROM incentive_calculations
            WHERE org_id = %s
        """

        cursor.execute(kpi_query, (org_id,))
        kpi_result = cursor.fetchone()

        # ========= RECENT BATCHES =========
        recent_batches_query = """
            SELECT 
                calculation_batch_id,
                calculation_period,
                employee_id,
                total_incentive,
                created_date
            FROM incentive_calculations
            WHERE org_id = %s
        """

        cursor.execute(recent_batches_query, (org_id,))
        batch_rows = cursor.fetchall()

        df_batches = pd.DataFrame(batch_rows)

        if not df_batches.empty:
            grouped_batches = (
                df_batches
                .groupby(["calculation_batch_id", "calculation_period"])
                .agg(
                    total_employees=("employee_id", "nunique"),
                    total_payout=("total_incentive", "sum"),
                    created_date=("created_date", "max")
                )
                .reset_index()
                .sort_values(by="created_date", ascending=False)
                .head(5)
            )

            recent_batches = grouped_batches.to_dict(orient="records")
        else:
            recent_batches = []

        # ========= LATEST BATCH =========
        latest_batch = recent_batches[0]["calculation_batch_id"] if recent_batches else None

        # ========= TOP EARNERS =========
        top_earners = []
        if latest_batch:
            df_latest = df_batches[df_batches["calculation_batch_id"] == latest_batch]

            if not df_latest.empty:
                top_earners_df = (
                    df_latest
                    .groupby("employee_id")
                    .agg(total_incentive=("total_incentive", "sum"))
                    .reset_index()
                    .sort_values(by="total_incentive", ascending=False)
                    .head(5)
                )

                top_earners = top_earners_df.to_dict(orient="records")

        # ========= KPI FORMAT =========
        metrics = {
            "total_calculation_batches": kpi_result["total_calculation_batches"] or 0,
            "total_employees_calculated": kpi_result["total_employees_calculated"] or 0,
            "total_payout": float(kpi_result["total_payout"] or 0),
            "average_incentive": float(kpi_result["average_incentive"] or 0)
        }

        return {
            "metrics": metrics,
            "recent_batches": recent_batches,
            "latest_batch": latest_batch,
            "top_earners": top_earners
        }

    except Exception as ex:
        conn.rollback()
        raise ex

    finally:
        cursor.close()
        conn.close()
