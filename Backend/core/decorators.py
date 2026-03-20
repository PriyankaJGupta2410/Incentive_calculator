from functools import wraps
import jwt
import os
from fastapi import Request

def authentication(func):
    @wraps(func)
    async def wrapper(*args, **kwargs):
        try:
            request: Request = kwargs.get("request")

            token = request.headers.get("x-access-token")

            if not token:
                return {
                    "message": "Authentication token is missing",
                    "code": 401,
                    "status": "fail",
                    "res_data": {}
                }

            decoded_token = jwt.decode(
                token,
                os.getenv("JWT_SECRET_KEY"),
                algorithms=["HS256"]
            )

            # ✅ Store in request.state
            request.state.current_user_id = str(decoded_token["user_id"])

            return await func(*args, **kwargs)

        except Exception as ex:
            return {
                "message": str(ex),
                "code": 401,
                "status": "fail",
                "res_data": {}
            }

    return wrapper
