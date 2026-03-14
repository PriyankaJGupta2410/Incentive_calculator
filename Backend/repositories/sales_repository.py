from core.database import get_connection
import uuid
from datetime import datetime

def insert_sales_records(records: list, upload_id: str, org_id: str):

    conn = get_connection()
    db = conn.cursor()
    inserted_count = 0

    try:

        for record in records:

            sql = """
                INSERT INTO sales (_id,upload_id,employee_id, branch, role, 
                vehicle_model, quantity, sale_date, vehicle_type,created_date,org_id)
                VALUES (%s, %s, %s, %s, %s,%s, %s, %s, %s, %s,%s)
            """

            values = (
                str(uuid.uuid4()),
                upload_id,
                record.employee_id,
                record.branch,
                record.role,
                record.vehicle_model,
                int(record.quantity),
                record.sale_date,
                record.vehicle_type,
                datetime.now(),
                org_id
            )

            db.execute(sql, values)

            inserted_count += 1

        conn.commit()

    except Exception as ex:
        conn.rollback()
        raise ex

    finally:
        conn.close()

    return inserted_count