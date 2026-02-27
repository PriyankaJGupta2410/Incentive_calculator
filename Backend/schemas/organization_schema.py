from pydantic import BaseModel, EmailStr

class RegisterOrganizationSchema(BaseModel):

    # Organization Details
    name: str
    email: EmailStr
    phone: str
    industry: str
    company_size: str
    city: str
    state: str
    country: str

    # Admin Details
    admin_name: str
    admin_email: EmailStr
    admin_password: str
