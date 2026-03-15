import pandas as pd
from fastapi import UploadFile
from repositories.sales_repository import insert_sales_records
from repositories.model_repository import insert_upload_file,get_user_details
from utils.file_handler import save_temp_file
from models.sales_model import Sales
from models.upload_model import upload


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
        invalid_rows=invalid_rows
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