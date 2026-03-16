from fastapi import APIRouter
from schemas.Request.organization_schema import RegisterOrganizationSchema
from services.organization_service import OrganizationService

organizationrouter = APIRouter(prefix="/organization", tags=["Organization"])


@organizationrouter.post("/register")
def register_organization(payload: RegisterOrganizationSchema):

    message = ""
    code = 500
    status = False
    res_data = {}

    try:
        result = OrganizationService.register(payload)

        message = result.get("message")
        code = result.get("code")
        status = result.get("status")
        res_data = result.get("res_data")

    except Exception as ex:
        message = f"Error in register: {str(ex)}"

    return {
        "message": message,
        "code": code,
        "status": status,
        "res_data": res_data
    }
