from pydantic import BaseModel

class IncentiveCalculationRequest(BaseModel):
    period: str
    sales_upload_id: str
    structured_upload_id: str
    adhoc_upload_id: str
