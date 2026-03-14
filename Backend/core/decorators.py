from functools import wraps
import jwt
import os


def authentication(func):
    @wraps(func)
    async def wrapper(*args, **kwargs):
        try:

            token = kwargs.get("x_access_token")

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

            kwargs["current_user_id"] = str(decoded_token["user_id"])

            return await func(*args, **kwargs)

        except Exception as ex:
            return {
                "message": str(ex),
                "code": 401,
                "status": "fail",
                "res_data": {}
            }

    return wrapper
