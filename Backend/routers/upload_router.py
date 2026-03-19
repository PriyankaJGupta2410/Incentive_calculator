from fastapi import APIRouter, File, Request, UploadFile, HTTPException,Header
from services.upload_service import process_sales_file,process_incentive_file,get_uploaded_files_service,get_uploaded_file_details_service
from schemas.Response.common_response import APIResponse
from repositories.upload_respository import get_uploaded_file_details
from repositories.model_repository import get_user_details
from core.decorators import authentication
from fastapi.responses import FileResponse
import os

upload_router = APIRouter(prefix="/upload", tags=["upload"])

##################################### UPLOAD API #########################################

@upload_router.post("/upload_sales", response_model=APIResponse)
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

@upload_router.post("/upload_incentive",response_model=APIResponse)
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

@upload_router.get("/GETuploadedFiles",response_model=APIResponse)
@authentication
async def GETuploadedFiles(
    request:Request,
    x_access_token:str = Header(None),
    current_user_id:str=None
):
    message = ""
    code = 500
    status = "fail"
    res_data = {}
    try:
        result = await get_uploaded_files_service(current_user_id)
        message = "Uploaded files retrieved successfully"
        code = 200
        status = "success"
        res_data = {
            "files": result
        }

    except Exception as ex:
        message = f"Error GETuploadedFiles:{str(ex)}"
    return {
        "message": message,
        "code": code,
        "status": status,
        "res_data": res_data
    }
@upload_router.get("/GETuploadedFileDetails", response_model=APIResponse)
@authentication
async def GETuploadedFileDetails(
    request: Request,
    upload_id: str,
    limit: int = 100,
    offset: int = 0,
    x_access_token: str = Header(None),
    current_user_id: str = None
):
    try:
        result = await get_uploaded_file_details_service(
            upload_id, current_user_id, limit, offset
        )
        return result

    except Exception as ex:
        return {
            "message": f"Error GETuploadedFileDetails: {str(ex)}",
            "code": 500,
            "status": "fail",
            "res_data": {}
        }

@upload_router.get("/downloadFile")
@authentication
async def download_file(
    request: Request,
    upload_id: str,
    x_access_token: str = Header(None),
    current_user_id: str = None
):
    try:
        user_details = get_user_details(current_user_id)

        if not user_details:
            return {
                "message": "User not found",
                "code": 404,
                "status": "fail",
                "res_data": {}
            }

        org_id = user_details.get("org_id")

        file_details = get_uploaded_file_details(upload_id, org_id)

        if not file_details:
            return {
                "message": "File not found",
                "code": 404,
                "status": "fail",
                "res_data": {}
            }

        file_path = file_details["file_details"]["file_path"]
        file_name = file_details["file_details"]["file_name"]

        if not os.path.exists(file_path):
            return {
                "message": "File not found on server",
                "code": 404,
                "status": "fail",
                "res_data": {}
            }

        return FileResponse(
            path=file_path,
            filename=file_name,
            media_type='application/octet-stream'
        )

    except Exception as ex:
        return {
            "message": f"Error downloading file: {str(ex)}",
            "code": 500,
            "status": "fail",
            "res_data": {}
        }

