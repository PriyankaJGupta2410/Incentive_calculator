from core.database import get_connection
import uuid
import pandas as pd
from datetime import datetime

class UserRepository:

    @staticmethod
    def CreateUser(user):
        conn = get_connection()
        try:
            db = conn.cursor()
            user_id = str(uuid.uuid4())

            df = pd.DataFrame([{
                "_id":user_id,
                "org_id":user.org_id,
                "name":user.name,
                "email":user.email,
                "password":user.password,
                "role":user.role,
                "created_date":datetime.now()
            }])

            sql = """
                INSERT INTO user_master(
                    _id, org_id, name, email,
                    password, role,created_date
                )
                VALUES(%s,%s,%s,%s,%s,%s,%s)
            """

            values = df.values.tolist()
            db.executemany(sql,values)

            conn.commit()
            return user_id

        finally:
            conn.close()
