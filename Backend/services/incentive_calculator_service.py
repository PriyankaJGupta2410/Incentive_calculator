import pandas as pd
import uuid
import json
import re
import calendar
from datetime import datetime
from fastapi import HTTPException
from core.database import get_connection
from repositories.model_repository import get_user_details
from repositories.incentive_calculator_repository import insert_calculation,fetch_adhoc_rules,fetch_structured_rules,fetch_sales

################################## INCENTIVE CALCULATION SERVICE ################
async def calculate_incentives(request,current_user_id):
    code = 500
    status = "fail"
    res_data = {}
    message = ""

    conn = get_connection()
    cursor = conn.cursor()

    try:
        # ---------- Validate ----------
        if not request.period:
            code = 400
            message = "Period is required"
            return {"code": code, "status": status, "message": message, "res_data": res_data}

        try:
            dt = datetime.strptime(request.period, "%Y-%m")
        except:
            code = 400
            message = "Invalid period format"
            return {"code": code, "status": status, "message": message, "res_data": res_data}

        start_date = dt.date().replace(day=1)
        end_date = dt.date().replace(
            day=calendar.monthrange(dt.year, dt.month)[1]
        )

        user_details = get_user_details(current_user_id)
        # ✅ REQUIRED (as per repo)
        org_id = user_details.get("org_id")

        # ---------- Fetch Data ----------
        sales_data = fetch_sales(
            start_date, end_date, request.sales_upload_id, org_id
        )

        if not sales_data:
            code = 404
            message = "No sales found"
            return {"code": code, "status": status, "message": message, "res_data": res_data}

        rules_data = fetch_structured_rules(
            start_date, end_date, request.structured_upload_id, org_id
        )

        adhoc_data = fetch_adhoc_rules(
            start_date, end_date, request.adhoc_upload_id, org_id
        )

        df_sales = pd.DataFrame(sales_data)
        df_rules = pd.DataFrame(rules_data)
        df_adhoc = pd.DataFrame(adhoc_data)

        # ---------- Normalize ----------
        df_sales['role'] = df_sales['role'].str.lower()
        df_sales['vehicle_type'] = df_sales['vehicle_type'].str.lower()
        df_sales['total_quantity'] = df_sales['total_quantity'].astype(int)

        if not df_rules.empty:
            df_rules.columns = [c.lower() for c in df_rules.columns]
            df_rules['role'] = df_rules['role'].str.lower()
            df_rules['vehicle_type'] = df_rules['vehicle_type'].str.lower()
            # ✅ FIX: Convert Decimal → float
            df_rules['incentive_amount_inr'] = df_rules['incentive_amount_inr'].astype(float)
            df_rules['bonus_per_unit_inr'] = df_rules['bonus_per_unit_inr'].astype(float)
            df_rules['min_units'] = df_rules['min_units'].astype(int)
            df_rules['max_units'] = df_rules['max_units'].astype(int)
        # ---------- STRUCTURED LOGIC ----------
        if not df_rules.empty:

            df_merge = df_sales.merge(
                df_rules,
                on=['role', 'vehicle_type'],
                how='left'
            )

            df_valid = df_merge[
                (df_merge['total_quantity'] >= df_merge['min_units']) &
                (df_merge['total_quantity'] <= df_merge['max_units'])
            ]

            df_valid = df_valid.sort_values(
                ['employee_id', 'vehicle_type', 'min_units']
            )

            df_valid = df_valid.groupby(
                ['employee_id', 'vehicle_type']
            ).first().reset_index()

            df_valid['bonus_units'] = (
                df_valid['total_quantity'] - df_valid['min_units']
            ).clip(lower=0)

            df_valid['structured_amount'] = (
                df_valid['incentive_amount_inr'] +
                df_valid['bonus_units'] * df_valid['bonus_per_unit_inr']
            )

            df_structured = df_valid.groupby(
                'employee_id'
            )['structured_amount'].sum().reset_index()

        else:
            df_structured = pd.DataFrame(columns=['employee_id', 'structured_amount'])

        # ---------- ADHOC ----------
        adhoc_results = []

        if not df_adhoc.empty:
            df_adhoc.columns = [c.lower() for c in df_adhoc.columns]

            for emp_id, group in df_sales.groupby("employee_id"):
                emp_role = group['role'].iloc[0]
                total = 0

                for _, scheme in df_adhoc.iterrows():
                    roles = [r.strip().lower() for r in str(scheme['role']).split(',')]

                    if emp_role not in roles and 'all' not in roles:
                        continue

                    if scheme.get('bonus_amount'):
                        values = re.findall(
                            r"\d+",
                            str(scheme['bonus_amount']).replace(",", "")
                        )
                        total += sum([float(v) for v in values])

                adhoc_results.append({
                    "employee_id": emp_id,
                    "adhoc_amount": total
                })

        df_adhoc_final = pd.DataFrame(adhoc_results)

        # ---------- FINAL ----------
        if not df_adhoc_final.empty:
            df_final = df_structured.merge(
                df_adhoc_final,
                on='employee_id',
                how='outer'
            ).fillna(0)
        else:
            df_structured['adhoc_amount'] = 0
            df_final = df_structured

        df_final['total_incentive'] = (
            df_final['structured_amount'] + df_final['adhoc_amount']
        )

        results = []

        # ---------- SAVE ----------
        for _, row in df_final.iterrows():

            calc_id = str(uuid.uuid4())

            insert_calculation(
                (
                    calc_id,
                    row['employee_id'],
                    org_id,
                    request.sales_upload_id,
                    request.structured_upload_id,
                    request.adhoc_upload_id,
                    float(row['total_incentive']),
                    float(row['structured_amount']),
                    float(row['adhoc_amount']),
                    request.period,
                    json.dumps({}),
                    datetime.now()
                )
            )

            results.append({
                "employee_id": row['employee_id'],
                "total_incentive": float(row['total_incentive']),
                "structured_incentive": float(row['structured_amount']),
                "ad_hoc_incentive": float(row['adhoc_amount'])
            })

        conn.commit()

        status = "success"
        code = 200
        message = "Incentives calculated successfully"
        res_data = results

        return {"code": code, "status": status, "message": message, "res_data": res_data}

    except Exception as e:
        conn.rollback()
        message = f"Calculation Error :{str(e)}"

    finally:
        cursor.close()
        conn.close()

    return {"code": code, "status": status, "message": message, "res_data": res_data}
