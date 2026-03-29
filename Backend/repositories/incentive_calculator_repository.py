from core.database import get_connection
import uuid
from datetime import datetime
import pandas as pd
import json
import numpy as np

def fetch_sales(start_date, end_date, upload_id, org_id):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        query = """
        SELECT employee_id, role, vehicle_type, vehicle_model, SUM(quantity) AS total_quantity
        FROM sales
        WHERE sale_date BETWEEN %s AND %s
        AND upload_id = %s AND org_id = %s
        GROUP BY employee_id, role, vehicle_type, vehicle_model
        """
        cursor.execute(query, (start_date, end_date, upload_id, org_id))
        result = cursor.fetchall()

        df = pd.DataFrame(result)
        if not df.empty:
            result = df.to_dict(orient="records")

        return result

    except Exception as ex:
        conn.rollback()
        raise ex

    finally:
        cursor.close()
        conn.close()


def fetch_structured_rules(start_date, end_date, upload_id, org_id):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        query = """
        SELECT * FROM incentives
        WHERE valid_from <= %s AND valid_to >= %s
        AND upload_id = %s AND org_id = %s
        """
        cursor.execute(query, (end_date, start_date, upload_id, org_id))
        result = cursor.fetchall()

        df = pd.DataFrame(result)
        if not df.empty:
            result = df.to_dict(orient="records")

        return result

    except Exception as ex:
        conn.rollback()
        raise ex

    finally:
        cursor.close()
        conn.close()


def fetch_adhoc_rules(start_date, end_date, upload_id, org_id):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        query = """
        SELECT * FROM ad_hoc_rules
        WHERE validity_from <= %s AND validity_to >= %s
        AND upload_id = %s AND org_id = %s
        """
        cursor.execute(query, (end_date, start_date, upload_id, org_id))
        result = cursor.fetchall()

        df = pd.DataFrame(result)
        if not df.empty:
            result = df.to_dict(orient="records")

        return result

    except Exception as ex:
        conn.rollback()
        raise ex

    finally:
        cursor.close()
        conn.close()


def insert_calculation(data):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        query = """
        INSERT INTO incentive_calculations (
            _id,
            calculation_batch_id,
            employee_id,
            org_id,
            sales_upload_id,
            structured_upload_id,
            adhoc_upload_id,
            total_incentive,
            structured_incentive,
            ad_hoc_incentive,
            calculation_period,
            details,
            created_date
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """

        cursor.execute(query, data)

        conn.commit()

    except Exception as ex:
        conn.rollback()
        raise ex

    finally:
        cursor.close()
        conn.close()

def GETallcalculation(org_id: str):
    conn = get_connection()
    cursor = conn.cursor()

    try:
        query = """
            SELECT *
            FROM incentive_calculations
            WHERE org_id = %s
            ORDER BY created_date DESC
        """
        cursor.execute(query, (org_id,))
        rows = cursor.fetchall()

        if not rows:
            return []

        columns = [col[0] for col in cursor.description]
        df = pd.DataFrame(rows, columns=columns)

        # ---------- FIX NaN ----------
        df = df.where(pd.notnull(df), None)

        # ---------- SAFE JSON PARSE ----------
        def safe_json_parse(x):
            try:
                if isinstance(x, str) and x.strip():
                    return json.loads(x)
                return {}
            except:
                return {}

        if 'details' in df.columns:
            df['details'] = df['details'].apply(safe_json_parse)

        # ---------- GROUP BY BATCH ----------
        result = []

        # 🔥 Sort batches (latest first)
        grouped = list(df.groupby("calculation_batch_id"))

        for idx, (batch_id, group) in enumerate(grouped, start=1):

            # ✅ Generate batch name
            batch_name = f"BATCH_{str(idx).zfill(3)}"

            batch_data = {
                "batch_name": batch_name,   # 👈 NEW FIELD
                "calculation_batch_id": batch_id,
                "calculation_period": group.iloc[0]["calculation_period"],
                "created_date": group.iloc[0]["created_date"],
                "employees": group.to_dict(orient="records")
            }

            result.append(batch_data)

        return result

    except Exception as ex:
        raise ex

    finally:
        cursor.close()
        conn.close()