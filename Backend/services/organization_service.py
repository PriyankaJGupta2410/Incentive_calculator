from models.organization_model import Organization
from models.user_model import User
from repositories.organization_repository import OrganizationRepository
from repositories.user_repository import UserRepository
from core.security import hash_password
from core.database import get_connection
import pandas as pd


class OrganizationService:

    @staticmethod
    def register(data):
        code = 500
        status ="fail"
        res_data = {}
        message = ""
        try:
            conn = get_connection()
            db = conn.cursor()

            df = pd.DataFrame([data.dict()])

            # 1️⃣ Create Organization Object
            org = Organization(
                name=df.at[0,"name"],
                email=df.at[0, "email"],
                phone=df.at[0, "phone"],
                industry=df.at[0, "industry"],
                company_size=df.at[0, "company_size"],
                city=df.at[0, "city"],
                state=df.at[0, "state"],
                country=df.at[0, "country"]
            )

            # 2️⃣ Save Organization
            org_id = OrganizationRepository.CreateOrganization(org)

            # 3️⃣ Hash Password
            hashed_password = hash_password(df.at[0, "admin_password"])

            # 4️⃣ Create Admin User
            user = User(
                org_id=org_id,
                name=df.at[0, "admin_name"],
                email=df.at[0, "admin_email"],
                password=hashed_password,
                role="ADMIN"
            )

            admin_id = UserRepository.CreateUser(user)
            conn.commit()

            message = "Organization registered successfully"
            code = 200
            status = "success"
            res_data = {
                "organization_id": org_id,
                "admin_id": admin_id
            }
        except Exception as ex:
            message = f"Error in register:{ex}"
        return{"code":code,"status":status,"message":message,"res_data":res_data}
