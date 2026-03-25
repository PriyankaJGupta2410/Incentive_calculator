from fastapi import APIRouter, Header, Request
from schemas.Request.incentive_Calculation_schema import IncentiveCalculationRequest
from services.incentive_calculator_service import calculate_incentives
from core.decorators import authentication

calculator_router = APIRouter(prefix="/calculator",tags=["calculator"])

########################### INCENTIVE CALCULATOR API #############

@calculator_router.post("/incentives_calculate")
@authentication
async def incentives_calculate(
    request: Request,
    payload: IncentiveCalculationRequest,
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
        response = await calculate_incentives(
            payload,current_user_id
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
