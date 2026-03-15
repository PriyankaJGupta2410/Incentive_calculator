from fastapi import APIRouter, File, Request, UploadFile, HTTPException,Header
from services.incentive_service import process_incentive_file
from schemas.incentive_schema import incentiveUploadResponse
from core.decorators import authentication


incentive_router = APIRouter(prefix="/incentives", tags=["Incentives"])

####################### API ##########################
@incentive_router.post("/upload_incentive",response_model=incentiveUploadResponse)
@authentication
async def upload_incentive(
    request: Request,
    file: UploadFile = File(...),
    x_access_token: str = Header(None),
    current_user_id: str = None
):
    message = ""
    code = 500
    status = "fail"
    res_data = {}
    try:
        if not (file.filename.endswith(".csv") or file.filename.endswith(".xlsx")):
            message = "Invalid file type. Only CSV or Excel allowed."
            code = 400
            status = "fail"
            res_data = {}
            return {
                "message": message,
                "code": code,
                "status": status,
                "res_data": res_data
            }
        result = await process_incentive_file(file,current_user_id)
        return result
    except Exception as e:
        message = f"Err processing incentive file:{str(e)}"
    return {
        "message": message,
        "code": code,
        "status": status,
        "res_data": res_data
    }