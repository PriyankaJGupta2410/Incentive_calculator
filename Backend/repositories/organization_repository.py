from core.database import get_connection
import pandas as pd
import uuid
from datetime import datetime

class OrganizationRepository:

    @staticmethod
    def CreateOrganization(org):
        conn = get_connection()
        try:
            db = conn.cursor()
            org_id = str(uuid.uuid4())

            df = pd.DataFrame([{
                "_id": org_id,
                "name": org.name,
                "email": org.email,
                "phone": org.phone,
                "industry": org.industry,
                "company_size": org.company_size,
                "city": org.city,
                "state": org.state,
                "country": org.country,
                "created_date": datetime.now()
            }])

            sql = """
                INSERT INTO organization_master(
                    _id, name, email, phone, industry,
                    company_size, city, state, country, created_date
                )
                VALUES(%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
            """

            values = df.values.tolist()
            db.executemany(sql, values)

            conn.commit()
            return org_id

        finally:
            conn.close()
