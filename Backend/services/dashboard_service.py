import pandas as pd
import uuid
import json
import re
import calendar
from datetime import datetime
from fastapi import HTTPException
from core.database import get_connection
from repositories.model_repository import get_user_details
from repositories.dashboard_repository import GETdashboard_metrics

##################### DASHBOARD SERVICE #####################
async def GETdashboard_metrics_service(current_user_id: str):
    message = ""
    code = 500
    status = "fail"
    res_data = {}
    try:
        user_details = get_user_details(current_user_id)

        if not user_details:
            message = "User not found"
            code = 404
            status = "fail"
            return {
                "message": message,
                "code": code,
                "status": status,
                "res_data": res_data
            }

        org_id = user_details.get("org_id")
        if not org_id:
            message = "Organization Not found"
            code = 404
            return {
                "message": message,
                "code": code,
                "status": status,
                "res_data": res_data
            }
        result = GETdashboard_metrics(org_id)

        messsage = "Dashboard metrics retrieved successfully"
        code = 200
        status = "success"
        res_data = result

    except Exception as ex:
        message = f"Error in GETdashboard_metrics_service: {str(ex)}"   
        code = 500
    return {
        "message": message,
        "code": code,
        "status": status,
        "res_data": res_data
    } 