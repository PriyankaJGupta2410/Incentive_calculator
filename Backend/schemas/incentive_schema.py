from pydantic import BaseModel
from typing import Optional,Dict,Any

class incentiveUploadResponse(BaseModel):
    status: str
    message: str
    res_data: Optional[Dict[str, Any]] = {}