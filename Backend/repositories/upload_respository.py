from core.database import get_connection
import uuid
from datetime import datetime
import pandas as pd

########################### UPLOAD REPOSITORY ##################

# Sales Records
def insert_sales_records(records: list, upload_id: str, org_id: str):

    conn = get_connection()
    db = conn.cursor()
    inserted_count = 0

    try:

        for record in records:

            df = pd.DataFrame([{
                "_id": str(uuid.uuid4()),
                "upload_id": upload_id,
                "employee_id":record.employee_id,
                "branch": record.branch,
                "role": record.role,
                "vehicle_model": record.vehicle_model,
                "quantity": int(record.quantity),
                "sale_date": record.sale_date,
                "vehicle_type": record.vehicle_type,
                "created_date": datetime.now(),
                "org_id": org_id
            }])

            sql = """
                INSERT INTO sales (_id,upload_id,employee_id, branch, role, 
                vehicle_model, quantity, sale_date, vehicle_type,created_date,org_id)
                VALUES (%s, %s, %s, %s, %s,%s, %s, %s, %s, %s,%s)
            """

            values = df.values.tolist()

            db.executemany(sql, values)

            inserted_count += 1

        conn.commit()

    except Exception as ex:
        conn.rollback()
        raise ex

    finally:
        conn.close()

    return inserted_count

# Incentive Records
def insert_incentive_records(records:list,upload_id:str,org_id:str):
    conn = get_connection()
    db = conn.cursor()
    inserted_count = 0

    try:
        for record in records:

            df = pd.DataFrame([{
                "_id": str(uuid.uuid4()),
                "upload_id": upload_id,
                "rule_id": record.rule_id,
                "role": record.role,
                "vehicle_type": record.vehicle_type,
                "min_units": int(record.min_units),
                "max_units": int(record.max_units),
                "incentive_amount_inr": float(record.incentive_amount_inr),
                "bonus_per_unit_inr": float(record.bonus_per_unit_inr),
                "valid_from": record.valid_from,
                "valid_to": record.valid_to,
                "rule_type": record.rule_type,
                "created_date": datetime.now(),
                "org_id": org_id
            }])

            sql = """
                INSERT INTO incentives (
                    _id, upload_id, rule_id, role, vehicle_type,
                    min_units, max_units, incentive_amount_inr,
                    bonus_per_unit_inr, valid_from, valid_to,
                    rule_type, created_date, org_id
                )
                VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
            """

            values = df.values.tolist()

            db.executemany(sql, values)

            inserted_count += 1

        conn.commit()
    except Exception as ex:
        conn.rollback()
        raise ex
    finally:
        conn.close()
    return inserted_count
    
def get_uploaded_files(org_id: str):
    conn = get_connection()
    cursor = conn.cursor()

    try:
        sql = """
            SELECT * 
            FROM uploaded_files
            WHERE org_id = %s
        """

        cursor.execute(sql, (org_id,))
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

def get_uploaded_file_details(upload_id:str,org_id:str):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        sql = """
            SELECT * 
            FROM uploaded_files
            WHERE _id = %s AND org_id = %s
        """
        cursor.execute(sql, (upload_id, org_id))
        result = cursor.fetchone()
        df = pd.DataFrame([result])
        if not df.empty:
            result = df.to_dict(orient="records")[0]
        return result

    except Exception as ex:
        conn.rollback()
        raise ex
    finally:
        cursor.close()
        conn.close()