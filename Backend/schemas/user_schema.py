from pydantic import BaseModel
from typing import Dict, Any


class LoginRequest(BaseModel):
    email: str
    password: str


class LoginResponse(BaseModel):
    message: str
    code: int
    status: str
    res_data: Dict[str, Any]
