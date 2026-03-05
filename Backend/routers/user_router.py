from fastapi import APIRouter,Depends
from schemas.user_schema import LoginRequest,LoginResponse
from services.user_service import UserService
from core.security import verify_token

userRouter = APIRouter(prefix="/users",tags=["Users"])

@userRouter.post("/login",response_model=LoginResponse)
def login(request:LoginRequest):
    message = ""
    code = 500
    status = "fail"
    res_data = {}

    try:
        result = UserService.login_user(request.email,request.password)

        message = result.get("message")
        code = result.get("code")
        status = result.get("status")
        res_data = result.get("res_data")

    except Exception as ex:
        message = f"Error in login: {str(ex)}"

    return {
        "message": message,
        "code": code,
        "status": status,
        "res_data": res_data
    }