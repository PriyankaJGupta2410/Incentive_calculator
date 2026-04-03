from fastapi import APIRouter, Header, Request
from services.dashboard_service import GETdashboard_metrics_service
from core.decorators import authentication

dashboard_router = APIRouter(prefix="/dashboard",tags=["dashboard"])
########################### DASHBOARD API #############

@dashboard_router.get("/metrics")
@authentication
async def GETdashboard_metrics(
    request: Request,
    x_access_token: str = Header(None)
):
    message = ""
    code = 500
    status = "fail"
    res_data = {}

    try:
        # ✅ Correct way to access state
        current_user_id = request.state.current_user_id

        # ✅ Correct service call
        response = await GETdashboard_metrics_service(
            current_user_id
        )

        return response

    except Exception as ex:
        message = f"Error: {str(ex)}"

    return {
        "message": message,
        "code": code,
        "status": status,
        "res_data": res_data
    }
