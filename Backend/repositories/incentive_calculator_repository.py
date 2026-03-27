from core.database import get_connection
import uuid
from datetime import datetime
import pandas as pd


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
