from pydantic import BaseModel
from typing import Dict, Any


class LoginRequest(BaseModel):
    email: str
    password: str
