from fastapi import APIRouter, File, Request, UploadFile, HTTPException,Header
from services.upload_service import process_sales_file,process_incentive_file
from schemas.sales_schema import SalesUploadResponse
from schemas.incentive_schema import incentiveUploadResponse
from core.decorators import authentication

upload_router = APIRouter(prefix="/upload", tags=["upload"])

##################################### UPLOAD API #########################################

@upload_router.post("/upload_sales", response_model=SalesUploadResponse)
@authentication
async def upload_sales_data(
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

        result = await process_sales_file(file,current_user_id)
        return result
    except Exception as e:
        message = f"Error processing file: {str(e)}"
    return {
        "message": message,
        "code": code,
        "status": status,
        "res_data": res_data
    }

@upload_router.post("/upload_incentive",response_model=incentiveUploadResponse)
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