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

    @staticmethod
    def GETUserbyEmail(email: str):
        conn = get_connection()

        try:
            cursor = conn.cursor()

            # ✅ JOIN organization_master
            query = """
                SELECT 
                    u.*,
                    o.name as organization_name
                FROM user_master u
                LEFT JOIN organization_master o
                    ON u.org_id = o._id
                WHERE u.email = %s
                LIMIT 1
            """

            cursor.execute(query, (email,))
            result = cursor.fetchall()

            if not result:
                return None

            # ✅ Extract column names properly
            columns = [col[0] for col in cursor.description]

            # ✅ Create DataFrame with columns
            df = pd.DataFrame(result, columns=columns)

            # ✅ Replace NaN → None (important for JSON)
            df = df.where(pd.notnull(df), None)

            # ✅ Return single user
            return df.iloc[0].to_dict()

        except Exception as ex:
            raise Exception(f"Error in GETUserbyEmail: {str(ex)}")

        finally:
            conn.close()
