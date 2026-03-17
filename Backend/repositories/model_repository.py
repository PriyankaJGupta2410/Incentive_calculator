from core.database import get_connection
import uuid
from datetime import datetime
import json
import pandas as pd

################################ MODEL REPOSITORY #########################################

def insert_upload_file(upload_obj,org_id):

    conn = get_connection()
    db = conn.cursor()

    upload_id = str(uuid.uuid4())

    try:

        sql = """
            INSERT INTO uploaded_files (
                _id, file_name, file_path,
                total_records, invalid_rows_count,
                invalid_rows,org_id, created_date
            )
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s)
        """

        values = (
            upload_id,
            upload_obj.file_name,
            upload_obj.file_path,
            upload_obj.total_records,
            upload_obj.invalid_rows_count,
            json.dumps(upload_obj.invalid_rows),
            org_id,
            datetime.now()
        )

        db.execute(sql, values)

        conn.commit()

    except Exception as ex:
        conn.rollback()
        raise ex

    finally:
        conn.close()

    return upload_id

def get_user_details(current_user_id: str):
    conn = get_connection()
    db = conn.cursor()
    try:
        sql = "SELECT * FROM user_master WHERE _id = %s"
        db.execute(sql, (current_user_id,))
        user = db.fetchall()
        df = pd.DataFrame(user)
        if not df.empty:
            user = df.to_dict(orient="records")[0]
            return {
                "id": user.get("_id"),
                "name": user.get("name"),
                "email": user.get("email"),
                "org_id": user.get("org_id")
            }
        return None
    except Exception as ex:
        raise ex
    finally:
        conn.close()
