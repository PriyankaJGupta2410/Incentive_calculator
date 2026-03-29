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

def insert_ad_hoc_data(validated_rows, upload_id: str, org_id: str):

    conn = get_connection()
    cursor = conn.cursor()

    try:
        # ==============================
        # 🚀 STEP 1: Convert to DataFrame
        # ==============================
        df = pd.DataFrame(validated_rows)

        # ==============================
        # 🚀 STEP 2: FORCE NaN → None
        # ==============================
        df = df.astype(object)  # 🔥 IMPORTANT
        df = df.where(pd.notnull(df), None)

        # 🔥 EXTRA SAFETY (MANDATORY)
        df = df.replace({float("nan"): None})

        # ==============================
        # 🚀 STEP 3: Fix Data Types
        # ==============================

        # ✅ bonus_amount → int
        df["bonus_amount"] = df["bonus_amount"].apply(
            lambda x: int(x) if x and str(x).isdigit() else x
        )

        # ==============================
        # 🚀 STEP 4: Add required columns
        # ==============================
        df["_id"] = [str(uuid.uuid4()) for _ in range(len(df))]
        df["upload_id"] = upload_id
        df["created_date"] = datetime.now()
        df["org_id"] = org_id


        # ==============================
        # 🚀 STEP 5: Select correct columns
        # ==============================
        df = df[[
            "_id",
            "scheme_id",
            "scheme_name",
            "conditions",
            "role",
            "bonus_amount",
            "validity_from",
            "validity_to",
            "notes",
            "upload_id",
            "created_date",
            "org_id"
        ]]


        # ==============================
        # 🚀 STEP 6: Convert safely to tuples
        # ==============================
        data = []

        for row in df.itertuples(index=False, name=None):
            clean_row = tuple(None if (isinstance(v, float) and pd.isna(v)) else v for v in row)
            data.append(clean_row)


        # ==============================
        # 🚀 STEP 7: Insert into DB
        # ==============================
        query = """
        INSERT INTO ad_hoc_rules (
            _id, scheme_id, scheme_name, conditions, role, bonus_amount,
            validity_from, validity_to, notes, upload_id, created_date, org_id
        ) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
        """

        cursor.executemany(query, data)
        conn.commit()

    except Exception as e:
        conn.rollback()
        raise e

    finally:
        cursor.close()
        conn.close()


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

def get_uploaded_file_details(upload_id: str, org_id: str, limit: int = 100, offset: int = 0):
    conn = get_connection()
    cursor = conn.cursor()

    try:
        # File details
        sql = """
            SELECT * 
            FROM uploaded_files
            WHERE _id = %s AND org_id = %s
        """
        cursor.execute(sql, (upload_id, org_id))
        file_result = cursor.fetchall()

        if not file_result:
            return None

        columns = [col[0] for col in cursor.description]
        df_file = pd.DataFrame(file_result, columns=columns)
        file_details = df_file.to_dict(orient="records")[0]

        file_type = file_details.get("file_type")

        # Fetch data
        if file_type == "sales":
            sql = """
                SELECT * 
                FROM sales
                WHERE upload_id = %s AND org_id = %s
                LIMIT %s OFFSET %s
            """
        elif file_type == "incentive":
            sql = """
                SELECT * 
                FROM incentives
                WHERE upload_id = %s AND org_id = %s
                LIMIT %s OFFSET %s
            """
        elif file_type == "ad_hoc_rule":
            sql = """
                SELECT * 
                FROM ad_hoc_rules
                WHERE upload_id = %s AND org_id = %s
                ORDER BY scheme_id
                LIMIT %s OFFSET %s
            """
        else:
            return {
                "file_details": file_details,
                "data": []
            }

        cursor.execute(sql, (upload_id, org_id, limit, offset))
        result = cursor.fetchall()

        if result:
            columns = [col[0] for col in cursor.description]
            df_data = pd.DataFrame(result, columns=columns)
            data = df_data.to_dict(orient="records")
        else:
            data = []

        return {
            "file_details": file_details,
            "data": data,
            "count": len(data),
            "limit": limit,
            "offset": offset
        }

    except Exception as ex:
        conn.rollback()
        raise ex

    finally:
        cursor.close()
        conn.close()

def get_sales_list(org_id:str):
    conn = get_connection()
    cursor = conn.cursor()

    try:
        sql = """
            SELECT * from uploaded_files
            WHERE file_type = 'sales' AND org_id = %s"""
        cursor.execute(sql,(org_id,))

        result = cursor.fetchall()
        df = pd.DataFrame(result)
        if not df.empty:
            result = df.to_dict(orient="records")
            return result
        return []
    except Exception as ex:
        conn.rollback()
        raise ex
    finally:
        cursor.close()
        conn.close()

def get_incentive_list(org_id:str):
    conn = get_connection()
    cursor = conn.cursor()

    try:
        sql = """
            SELECT * from uploaded_files
            WHERE file_type = 'incentive' AND org_id = %s"""
        cursor.execute(sql,(org_id,))

        result = cursor.fetchall()
        df = pd.DataFrame(result)
        if not df.empty:
            result = df.to_dict(orient="records")
            return result
        return []
    except Exception as ex:
        conn.rollback()
        raise ex
    finally:
        cursor.close()
        conn.close()

def get_adhoc_list(org_id:str):
    conn = get_connection()
    cursor = conn.cursor()

    try:
        sql = """
            SELECT * from uploaded_files 
            WHERE file_type = 'ad_hoc_rule' AND org_id = %s
        """
        cursor.execute(sql,(org_id))

        result = cursor.fetchall()
        df = pd.DataFrame(result)
        if not df.empty:
            result = df.to_dict(orient="records")
            return result
        return []
    except Exception as ex:
        conn.rollback()
        raise ex
    finally:
        cursor.close()
        conn.close()