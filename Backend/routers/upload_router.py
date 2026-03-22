from fastapi import APIRouter, File, Request, UploadFile, HTTPException,Header
from services.upload_service import process_sales_file,process_incentive_file,get_uploaded_files_service,get_uploaded_file_details_service,fetch_sales_list_service,download_file_service,fetch_incentive_list_service,process_ad_hoc_file
from core.decorators import authentication
from fastapi.responses import FileResponse
import os

upload_router = APIRouter(prefix="/upload", tags=["upload"])

##################################### UPLOAD API #########################################

@upload_router.post("/upload_sales")
@authentication
async def upload_sales_data(
    request: Request,
    file: UploadFile = File(...),
    x_access_token: str = Header(None)
):
    message = ""
    code = 500
    status = "fail"
    res_data = {}
    try:
        current_user_id = request.state.current_user_id

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

@upload_router.post("/upload_incentive")
@authentication
async def upload_incentive(
    request: Request,
    file: UploadFile = File(...),
    x_access_token: str = Header(None)
):
    message = ""
    code = 500
    status = "fail"
    res_data = {}
    try:
        current_user_id = request.state.current_user_id

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

@upload_router.post("/upload_ad_hoc_rule")
@authentication
async def upload_ad_hoc_rule(
    request: Request,
    file: UploadFile = File(...),
    x_access_token: str = Header(None)
):
    try:
        current_user_id = request.state.current_user_id

        response = await process_ad_hoc_file(file, current_user_id)

        # ✅ If service already returns formatted response → return directly
        return response

    except Exception as e:
        return {
            "message": str(e),
            "status": "fail",
            "code": 500,
            "res_data": {}
        }
    
@upload_router.get("/GETuploadedFiles")
@authentication
async def GETuploadedFiles(
    request:Request,
    x_access_token:str = Header(None)
):
    message = ""
    code = 500
    status = "fail"
    res_data = {}
    try:
        current_user_id = request.state.current_user_id

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

@upload_router.get("/GETuploadedFileDetails")
@authentication
async def GETuploadedFileDetails(
    request: Request,
    upload_id: str,
    x_access_token: str = Header(None)
):
    message = ""
    code = 500
    status = "fail"
    res_data = {}
    try:
        current_user_id = request.state.current_user_id

        result = await get_uploaded_file_details_service(
            upload_id, current_user_id
        )
        return result

    except Exception as ex:
        message = f"Error GETuploadedFileDetails: {str(ex)}"
    return {
        "message": message,
        "code": code,
        "status": status,
        "res_data": res_data
    }

@upload_router.get("/downloadFile")
@authentication
async def download_file(
    request: Request,
    upload_id: str,
    x_access_token: str = Header(None)
):
    message = ""
    code = 500
    status = "fail"
    res_data = {}
    try:
        current_user_id = request.state.current_user_id

        file_service_response = await download_file_service(upload_id, current_user_id)
        if file_service_response["status"] == "success":
            file_path = file_service_response["res_data"]["file_path"]
            file_name = file_service_response["res_data"]["file_name"]
            if os.path.exists(file_path):
                return FileResponse(
                    path=file_path,
                    media_type='application/octet-stream',
                    filename=file_name
                )
    except Exception as ex:
        message = f"Error downloading file: {str(ex)}"
    return {
        "message": message,
        "code": code,
        "status": status,
        "res_data": res_data
    }
    
@upload_router.get("/GETsalesList")
@authentication
async def GETsalesList(
    request: Request,
    x_access_token: str = Header(None)
):
    message = ""
    code = 500
    status = "fail"
    res_data = {}
    try:
        current_user_id = request.state.current_user_id

        result = await fetch_sales_list_service(current_user_id)
        message = "Sales records retrieved successfully"
        code = 200
        status = "success"
        res_data = {
            "sales": result
        }

    except Exception as ex:
        message = f"Error GETsalesList: {str(ex)}"
    return {
        "message": message,
        "code": code,
        "status": status,
        "res_data": res_data
    }

@upload_router.get("/GETincentiveList")
@authentication
async def GETincentiveList(
    request: Request,
    x_access_token: str = Header(None)
):
    message = ""
    code = 500
    status = "fail"
    res_data = {}
    try:
        current_user_id = request.state.current_user_id

        result = await fetch_incentive_list_service(current_user_id)
        message = "Incentive records retrieved successfully"
        code = 200
        status = "success"
        res_data = {
            "incentives": result
        }

    except Exception as ex:
        message = f"Error GETincentiveList: {str(ex)}"
    return {
        "message": message,
        "code": code,
        "status": status,
        "res_data": res_data
    }
