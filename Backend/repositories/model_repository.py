from core.database import get_connection
import uuid
from datetime import datetime
import json

def insert_upload_file(file_name: str, file_path: str, total_records: int, invalid_rows_count: int, invalid_rows: list):

    conn = get_connection()
    db = conn.cursor()

    upload_id = str(uuid.uuid4())

    try:
        sql = """
            INSERT INTO uploaded_files (
                _id, file_name, file_path, total_records,
                invalid_rows_count, invalid_rows, created_date
            )
            VALUES (%s,%s,%s,%s,%s,%s,%s)
        """

        values = (
            upload_id,
            file_name,
            file_path,
            total_records,
            invalid_rows_count,
            json.dumps(invalid_rows),
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
