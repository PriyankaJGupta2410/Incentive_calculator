from pydantic import BaseModel
from typing import Optional, Dict, Any


class APIResponse(BaseModel):
    status: str
    message: str
    code: int
    res_data: Optional[Dict[str, Any]] = None
