import pandas as pd
from fastapi import UploadFile
from repositories.incentive_repository import insert_incentive_records
from repositories.model_repository import insert_upload_file, get_user_details
from utils.file_handler import save_temp_file
from models.upload_model import upload
from models.incentive_model import Incentive


async def process_incentive_file(file: UploadFile, current_user_id: str):

    # Save uploaded file
    file_path = save_temp_file(file)

    # Get user details
    user_details = get_user_details(current_user_id)

    # Read CSV safely
    if file.filename.endswith(".csv"):
        df = pd.read_csv(file_path)
        print("df:",df)
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

    print("Detected columns:", df.columns.tolist())

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
        invalid_rows=invalid_rows.to_dict(orient="records")
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
