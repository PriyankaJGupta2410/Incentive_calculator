import pandas as pd
from fastapi import UploadFile
from repositories.upload_respository import insert_sales_records,insert_incentive_records,get_uploaded_files,get_uploaded_file_details,get_sales_list,get_incentive_list,insert_ad_hoc_data
from repositories.model_repository import insert_upload_file,get_user_details
from utils.file_handler import save_temp_file
from utils.parser import extract_with_pandas
from models.sales_model import Sales
from models.incentive_model import Incentive
from models.upload_model import upload
from typing import List
import os

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

async def process_ad_hoc_file(file: UploadFile, current_user_id: str):

    try:
        # ---------- Validate ----------
        if not file.filename.endswith(".txt"):
            return {
                "message": "Only TXT files allowed",
                "status": "fail",
                "code": 400,
                "res_data": {}
            }

        # ---------- Read file ----------
        content = await file.read()

        if not content:
            return {
                "message": "File is empty",
                "status": "fail",
                "code": 400,
                "res_data": {}
            }

        text = content.decode("utf-8")

        if not text.strip():
            return {
                "message": "TXT file is empty",
                "status": "fail",
                "code": 400,
                "res_data": {}
            }

        # ---------- Save file ----------
        file_path = save_temp_file(file)
        with open(file_path, "wb") as f:
            f.write(content)

        # ---------- User ----------
        user_details = get_user_details(current_user_id)
        org_id = user_details.get("org_id")

        # =========================================================
        # 🚀 PARSE USING PANDAS
        # =========================================================
        df, invalid_rows = extract_with_pandas(text)

        if df.empty:
            return {
                "message": "No valid schemes found",
                "status": "fail",
                "code": 400,
                "res_data": {}
            }

        # =========================================================
        # 🚀 FIX NaN → None (CRITICAL FOR MYSQL)
        # =========================================================
        df = df.astype(object).where(pd.notnull(df), None)

        validated_rows = df.to_dict(orient="records")

        # 🔥 FINAL SAFETY CLEAN (DICT LEVEL)
        cleaned_rows = []
        for row in validated_rows:
            clean_row = {}
            for k, v in row.items():
                if pd.isna(v):
                    clean_row[k] = None
                else:
                    clean_row[k] = v
            cleaned_rows.append(clean_row)

        validated_rows = cleaned_rows

        total_records = len(validated_rows)
        invalid_rows_count = len(invalid_rows)

        # =========================================================
        # 🚀 INSERT UPLOAD METADATA
        # =========================================================
        upload_obj = upload(
            file_name=file.filename,
            file_path=file_path,
            total_records=total_records,
            invalid_rows_count=invalid_rows_count,
            invalid_rows=invalid_rows,
            file_type="ad_hoc_rule"
        )

        upload_id = insert_upload_file(upload_obj, org_id)

        # =========================================================
        # 🚀 INSERT RULES
        # =========================================================
        insert_ad_hoc_data(
            validated_rows=validated_rows,
            upload_id=upload_id,
            org_id=org_id
        )

        # =========================================================
        # 🚀 RESPONSE
        # =========================================================
        return {
            "message": "File processed successfully",
            "status": "success",
            "code": 200,
            "res_data": {
                "upload_id": upload_id,
                "total_records": total_records,
                "invalid_rows": invalid_rows
            }
        }

    except Exception as e:
        return {
            "message": str(e),
            "status": "fail",
            "code": 500,
            "res_data": {}
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
    current_user_id: str
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

        file_details = get_uploaded_file_details(upload_id, org_id)

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

async def download_file_service(upload_id:str,current_user_id:str):
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
                "message":message,
                "code": code,
                "status": status,
                "res_data": res_data
            }
        org_id = user_details.get("org_id")
        file_details = get_uploaded_file_details(upload_id, org_id)
        if not file_details:
            message = "File not found"
            code = 404
            return {
                "message":message,
                "code": code,
                "status": status,
                "res_data": res_data
            }
        file_info = file_details.get("file_details", {})

        file_path = file_info.get("file_path")
        file_name = file_info.get("file_name")
        if not os.path.exists(file_path):
            message = "File not found on server"
            code = 404
            return {
                "message":message,
                "code": code,
                "status": status,
                "res_data": res_data
            }
        message = "File ready for download"
        code = 200
        status = "success"
        res_data = {
            "file_path": file_path,
            "file_name": file_name
        }
        print("res_data in service:", res_data)
    except Exception as ex:
        message = f"Error downloading file: {str(ex)}"
    return {
        "message": message,
        "code": code,
        "status": status,
        "res_data": res_data
    }

async def fetch_sales_list_service(current_user_id: str):
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

        result = get_sales_list(org_id)

        if not result:
            message = "No sales files found for the organization"
            code = 404
            status = "fail"
            return {
                "message": message,
                "code": code,
                "status": status,
                "res_data": res_data
            }
        message = "Sales files fetched successfully"
        code = 200
        status = "success"
        res_data = {"sales_files": result}


    except Exception as e:
        # You can add logging here
        message = f"Error fetching sales files: {str(e)}"
    return {
        "message": message,
        "code": code,
        "status": status,
        "res_data": res_data
    }

async def fetch_incentive_list_service(current_user_id: str):
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
        result = get_incentive_list(org_id)
        if not result:
            message = "No incentive files found for the organization"
            code = 404
            status = "fail"
            return {
                "message": message,
                "code": code,
                "status": status,
                "res_data": res_data
            }
        message = "Incentive files fetched successfully"
        code = 200
        status = "success"
        res_data = {"incentive_files": result}
        
    except Exception as ex:
        message = f"Error fetching incentive files: {str(ex)}"
    return {
        "message": message,
        "code": code,
        "status": status,
        "res_data": res_data
    }