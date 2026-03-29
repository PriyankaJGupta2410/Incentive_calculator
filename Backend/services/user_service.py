from repositories.user_repository import UserRepository
from core.security import verify_password,create_access_token
from fastapi import HTTPException,status

class UserService:

    @staticmethod
    def login_user(email: str, password: str):
        message = ""
        code = 500
        status = "fail"
        res_data = {}
        try:

            user = UserRepository.GETUserbyEmail(email)

            if not user:
                code = 404
                message = "User not found"

            if not verify_password(password, user["password"]):
                code = 401
                message = "Invalid credentials"

            if not user or not verify_password(password, user["password"]):
                return {
                    "message": message,
                    "code": code,
                    "status": status,
                    "res_data": res_data
                }

            token = create_access_token({
                "user_id": user["_id"],
                "org_id": user["org_id"],
                "role": user["role"]
            })

            message = "Login successful"
            code =  200
            status = "success"
            res_data = {
                "token": token,
                "user_id": user["_id"],
                "org_id": user["org_id"],
                "role": user["role"],
                "name": user["name"],
                "email": user["email"],
                "organization_name":user["organization_name"]
            }

        except Exception as ex:
            message = f"Error in login: {str(ex)}"
        return {
            "message": message,
            "code": code,
            "status": status,
            "res_data": res_data
        }