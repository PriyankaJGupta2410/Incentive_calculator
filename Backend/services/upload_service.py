import pandas as pd
from fastapi import UploadFile
from repositories.upload_respository import insert_sales_records,insert_incentive_records,get_uploaded_files,get_uploaded_file_details
from repositories.model_repository import insert_upload_file,get_user_details
from utils.file_handler import save_temp_file
from models.sales_model import Sales
from models.incentive_model import Incentive
from models.upload_model import upload

############################## UPLOAD SERVICE #########################################

async def process_sales_file(file: UploadFile, current_user_id: str):
    """
    Process uploaded CSV/Excel file and insert into DB
    """

    file_path = save_temp_file(file)
    
    user_details = get_user_details(current_user_id)

    # Read file
    if file.filename.endswith(".csv"):
        df = pd.read_csv(file_path)

    # Strip spaces from columns
    df.columns = [c.strip().lower() for c in df.columns]

    # Required columns
    required_columns = [
        "employee_id", "branch", "role",
        "vehicle_model", "vehicle_type",
        "quantity", "sale_date"
    ]

    missing_cols = [col for col in required_columns if col not in df.columns]

    if missing_cols:
        return {
            "message": f"Missing required columns: {missing_cols}",
            "code": 400,
            "status": "fail",
            "res_data": {}
        }

    total_records = len(df)

    df.drop_duplicates(inplace=True)

    if (df["quantity"] < 0).any():
        invalid_rows = df[df["quantity"] < 0].index.tolist()

        return {
            "message": f"Negative Quantity values in rows: {invalid_rows}",
            "code": 400,
            "status": "fail",
            "res_data": {}
        }

    # Convert Date
    df["sale_date"] = pd.to_datetime(
        df["sale_date"], errors="coerce"
    ).dt.strftime("%Y-%m-%d")

    # Invalid rows
    invalid_rows = df[df["sale_date"].isna()].index.tolist()

    # Remove invalid rows
    df = df[df["sale_date"].notna()]

    # Convert NaN → None
    df = df.where(pd.notnull(df), None)

    upload_obj = upload(
        file_name = file.filename,
        file_path = file_path,
        total_records=total_records,
        invalid_rows_count=len(invalid_rows),
        invalid_rows=invalid_rows,
        file_type="sales"
    )

    # Insert uploaded file metadata
    upload_id = insert_upload_file(upload_obj, user_details.get("org_id"))

    # Convert dataframe rows → Sales Model
    sales_objects = []

    for _, row in df.iterrows():

        sale = Sales(
            employee_id=row["employee_id"],
            branch=row["branch"],
            role=row["role"],
            email=None,   # CSV does not contain email
            vehicle_model=row["vehicle_model"],
            quantity=row["quantity"],
            sale_date=row["sale_date"],
            vehicle_type=row["vehicle_type"]
        )

        sales_objects.append(sale)

    # Insert sales records
    inserted_count = insert_sales_records(sales_objects, upload_id, user_details.get("org_id"))

    return {
        "message": f"{inserted_count} sales records uploaded successfully",
        "code": 200,
        "status": "success",
        "res_data": {
            "upload_id": upload_id,
            "records_processed": inserted_count,
            "invalid_rows": invalid_rows
        }
    }

async def process_incentive_file(file: UploadFile, current_user_id: str):

    # Save uploaded file
    file_path = save_temp_file(file)

    # Get user details
    user_details = get_user_details(current_user_id)

    # Read CSV safely
    if file.filename.endswith(".csv"):
        df = pd.read_csv(file_path)
    else:
        return {
            "message": "Only CSV files are allowed",
            "code": 400,
            "status": "fail",
            "res_data": {}
        }

    # Clean column names
    df.columns = (
        df.columns
        .str.strip()
        .str.lower()
        .str.replace(" ", "_")
    )


    required_columns = [
        "rule_id",
        "role",
        "vehicle_type",
        "min_units",
        "max_units",
        "incentive_amount_inr",
        "bonus_per_unit_inr",
        "valid_from",
        "valid_to",
        "rule_type"
    ]

    # Check missing columns
    missing_cols = [col for col in required_columns if col not in df.columns]

    if missing_cols:
        return {
            "message": f"Missing required columns: {missing_cols}",
            "code": 400,
            "status": "fail",
            "res_data": {}
        }

    total_records = len(df)

    # Remove duplicates
    df = df.drop_duplicates()

    # Convert date columns
    df["valid_from"] = pd.to_datetime(df["valid_from"], errors="coerce")
    df["valid_to"] = pd.to_datetime(df["valid_to"], errors="coerce")

    # Find invalid rows
    invalid_rows = df[
        df["valid_from"].isna() |
        df["valid_to"].isna() |
        df["rule_id"].isna()
    ]

    # Convert numeric columns
    numeric_cols = [
        "min_units",
        "max_units",
        "incentive_amount_inr",
        "bonus_per_unit_inr"
    ]

    for col in numeric_cols:
        df[col] = pd.to_numeric(df[col], errors="coerce")

    df = df.dropna(subset=numeric_cols)

    # Format date again
    df["valid_from"] = df["valid_from"].dt.strftime("%Y-%m-%d")
    df["valid_to"] = df["valid_to"].dt.strftime("%Y-%m-%d")

    # Prepare upload metadata
    upload_obj = upload(
        file_name=file.filename,
        file_path=file_path,
        total_records=total_records,
        invalid_rows_count=len(invalid_rows),
        invalid_rows=invalid_rows.to_dict(orient="records"),
        file_type="incentive"
    )

    # Insert uploaded file record
    upload_id = insert_upload_file(upload_obj, user_details.get("org_id"))

    # Convert dataframe rows → Incentive Model
    incentive_objects = []

    for _, row in df.iterrows():

        incentive = Incentive(
            rule_id=row["rule_id"],
            role=row["role"],
            vehicle_type=row["vehicle_type"],
            min_units=row["min_units"],
            max_units=row["max_units"],
            incentive_amount_inr=row["incentive_amount_inr"],
            bonus_per_unit_inr=row["bonus_per_unit_inr"],
            valid_from=row["valid_from"],
            valid_to=row["valid_to"],
            rule_type=row["rule_type"]
        )

        incentive_objects.append(incentive)

    # Insert incentive records
    inserted_count = insert_incentive_records(
        incentive_objects,
        upload_id,
        user_details.get("org_id")
    )

    return {
        "message": "Incentive data uploaded successfully",
        "code": 200,
        "status": "success",
        "res_data": {
            "upload_id": upload_id,
            "records_processed": inserted_count,
            "invalid_rows_count": len(invalid_rows),
            "invalid_rows": invalid_rows.to_dict(orient="records")
        }
    }


async def get_uploaded_files_service(current_user_id: str):

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

        files = get_uploaded_files(org_id)

        message = "Files fetched successfully"
        code = 200
        status = "success"
        res_data = {"files": files}

    except Exception as ex:
        message = f"Error fetching uploaded files: {str(ex)}"

    return {
        "message": message,
        "code": code,
        "status": status,
        "res_data": res_data
    }

async def get_uploaded_file_details_service(
    upload_id: str,
    current_user_id: str,
    limit: int = 100,
    offset: int = 0
):
    message = ""
    code = 500
    status = "fail"
    res_data = {}

    try:
        user_details = get_user_details(current_user_id)

        if not user_details:
            message = "User not found"
            code = 404
            return {
                "message": message,
                "code": code,
                "status": status,
                "res_data": res_data
            }

        org_id = user_details.get("org_id")

        file_details = get_uploaded_file_details(upload_id, org_id, limit, offset)

        if not file_details:
            message = "File not found"
            code = 404
            return {
                "message": message,
                "code": code,
                "status": status,
                "res_data": res_data
            }

        message = "File details fetched successfully"
        code = 200
        status = "success"
        res_data = file_details

    except Exception as ex:
        message = f"Error fetching uploaded files: {str(ex)}"

    return {
        "message": message,
        "code": code,
        "status": status,
        "res_data": res_data
    }
