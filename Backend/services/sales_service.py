import pandas as pd
from fastapi import UploadFile
from repositories.sales_repository import insert_sales_records
from utils.file_handler import save_temp_file


async def process_sales_file(file: UploadFile):
    """
    Process uploaded CSV/Excel file and insert into DB
    """
    file_path = save_temp_file(file)

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
    
    df.drop_duplicates(inplace=True)
    if (df["quantity"] < 0).any():
        invalid_rows = df[df["quantity"] < 0].index.tolist()
        return {
            "message": f"Negative Quantity values in rows: {invalid_rows}",
            "code": 400,
            "status": "fail",
            "res_data": {}
        }

    # Convert Sale_Date to standard YYYY-MM-DD
    df["sale_date"] = pd.to_datetime(
    df["sale_date"], errors="coerce"
    ).dt.strftime("%Y-%m-%d")

    # Convert NaN to None for MySQL
    # Remove rows where date is invalid
    df = df[df["sale_date"].notna()]

    # Convert NaN → None for MySQL
    df = df.where(pd.notnull(df), None)
    
    # Insert into DB
    records = df.to_dict(orient="records")
    inserted_count = insert_sales_records(records)



    return {
        "message": f"{inserted_count} sales records uploaded successfully",
        "code": 200,
        "status": "success",
        "res_data": {"records_processed": inserted_count}
    }
