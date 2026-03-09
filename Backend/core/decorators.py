from functools import wraps
import jwt
import os
from fastapi import Request

######################### TOKEN #############################
def authentication(func):
    @wraps(func)
    def wrapper(request: Request, *args, **kwargs):
        try:
            token = None
            if "x-access-token" in request.headers:
                token = request.headers["x-access-token"]
            if not token:
                return {"message":"Authentication token is missing"},401
            decoded_token = jwt.decode(token, os.getenv("SECRET_KEY"), algorithms=["HS256"])
            kwargs["current_user_id"] = str(decoded_token["user_id"])
            return func(request, *args, **kwargs)
        except Exception as ex:
            return {"message":str(ex)},401
    return wrapper
