import pandas as pd
import uuid
import json
import re
import calendar
from datetime import datetime
from fastapi import HTTPException
from core.database import get_connection
from repositories.model_repository import get_user_details
from repositories.incentive_calculator_repository import insert_calculation,fetch_adhoc_rules,fetch_structured_rules,fetch_sales,GETallcalculation

################################## INCENTIVE CALCULATION SERVICE ################
async def calculate_incentives(request, current_user_id):
    code = 500
    status = "fail"
    res_data = {}
    message = ""

    conn = get_connection()
    cursor = conn.cursor()

    try:
        # ---------- Validate ----------
        if not request.period:
            return {"code": 400, "status": status, "message": "Period is required", "res_data": res_data}

        try:
            dt = datetime.strptime(request.period, "%Y-%m")
        except:
            return {"code": 400, "status": status, "message": "Invalid period format", "res_data": res_data}

        start_date = dt.date().replace(day=1)
        end_date = dt.date().replace(
            day=calendar.monthrange(dt.year, dt.month)[1]
        )

        # ---------- User ----------
        user_details = get_user_details(current_user_id)
        org_id = user_details.get("org_id")

        # ---------- Fetch Data ----------
        sales_data = fetch_sales(start_date, end_date, request.sales_upload_id, org_id)
        if not sales_data:
            return {"code": 404, "status": status, "message": "No sales found", "res_data": res_data}

        rules_data = fetch_structured_rules(start_date, end_date, request.structured_upload_id, org_id)
        adhoc_data = fetch_adhoc_rules(start_date, end_date, request.adhoc_upload_id, org_id)

        df_sales = pd.DataFrame(sales_data)
        df_rules = pd.DataFrame(rules_data)
        df_adhoc = pd.DataFrame(adhoc_data)

        # ---------- Normalize ----------
        df_sales['role'] = df_sales['role'].str.lower()
        df_sales['vehicle_type'] = df_sales['vehicle_type'].str.lower()
        df_sales['total_quantity'] = df_sales['total_quantity'].astype(int)

        df_sales = df_sales.groupby(
            ['employee_id', 'role', 'vehicle_type'],
            as_index=False
        )['total_quantity'].sum()

        if not df_rules.empty:
            df_rules.columns = [c.lower() for c in df_rules.columns]
            df_rules['role'] = df_rules['role'].str.lower()
            df_rules['vehicle_type'] = df_rules['vehicle_type'].str.lower()
            df_rules['incentive_amount_inr'] = df_rules['incentive_amount_inr'].astype(float)
            df_rules['bonus_per_unit_inr'] = df_rules['bonus_per_unit_inr'].astype(float)
            df_rules['min_units'] = df_rules['min_units'].astype(int)

        # ============================================================
        # ✅ STRUCTURED CALCULATION
        # ============================================================
        structured_details_map = {}

        if not df_rules.empty:

            df_merge = df_sales.merge(
                df_rules,
                on=['role', 'vehicle_type'],
                how='left'
            )

            df_valid = df_merge[
                df_merge['total_quantity'] >= df_merge['min_units']
            ]

            df_valid = df_valid.sort_values(
                ['employee_id', 'vehicle_type', 'min_units'],
                ascending=[True, True, False]
            )

            df_valid = df_valid.groupby(
                ['employee_id', 'vehicle_type']
            ).first().reset_index()

            df_valid['bonus_units'] = (
                df_valid['total_quantity'] - df_valid['min_units']
            ).clip(lower=0)

            df_valid['bonus_amount'] = (
                df_valid['bonus_units'] * df_valid['bonus_per_unit_inr']
            )

            df_valid['structured_amount'] = (
                df_valid['incentive_amount_inr'] + df_valid['bonus_amount']
            )

            for _, row in df_valid.iterrows():
                emp_id = row['employee_id']

                structured_details_map.setdefault(emp_id, []).append({
                    "vehicle_type": row.get("vehicle_type"),
                    "quantity": int(row.get("total_quantity")),
                    "rule_applied": row.get("rule_id"),
                    "base_amount": float(row.get("incentive_amount_inr")),
                    "bonus_units": int(row.get("bonus_units")),
                    "bonus_per_unit": float(row.get("bonus_per_unit_inr")),
                    "bonus_amount": float(row.get("bonus_amount")),
                    "total": float(row.get("structured_amount"))
                })

            df_structured = df_valid.groupby(
                'employee_id'
            )['structured_amount'].sum().reset_index()

        else:
            df_structured = pd.DataFrame(columns=['employee_id', 'structured_amount'])

        # ============================================================
        # ✅ ADHOC CALCULATION (UPDATED FIX)
        # ============================================================
        adhoc_details_map = {}
        adhoc_results = []

        if not df_adhoc.empty:
            df_adhoc.columns = [c.lower() for c in df_adhoc.columns]

            # Pre-calc ranking
            ranking_df = df_sales.groupby("employee_id")['total_quantity'].sum().reset_index()
            ranking_df = ranking_df.sort_values(by='total_quantity', ascending=False).reset_index(drop=True)
            ranking_df['rank'] = ranking_df.index + 1

            branch_total = df_sales['total_quantity'].sum()

            for emp_id, group in df_sales.groupby("employee_id"):

                emp_role = group['role'].iloc[0]
                total = 0
                details = []

                emp_structured = df_structured[
                    df_structured['employee_id'] == emp_id
                ]['structured_amount']

                emp_structured = float(emp_structured.values[0]) if len(emp_structured) else 0

                vehicle_types_sold = group[group['total_quantity'] > 0]['vehicle_type'].nunique()

                emp_rank = ranking_df[
                    ranking_df['employee_id'] == emp_id
                ]['rank'].values[0]

                for scheme_id, scheme_group in df_adhoc.groupby("scheme_id"):

                    best_amount = 0
                    best_detail = None

                    for _, scheme in scheme_group.iterrows():

                        eligible_roles = [r.strip().lower() for r in str(scheme['role']).split(',')]

                        if emp_role not in eligible_roles and 'all' not in eligible_roles:
                            continue

                        condition = str(scheme.get("conditions")).lower()
                        bonus_raw = str(scheme.get("bonus_amount")).lower()

                        apply_flag = False
                        amount = 0

                        # ---------- CONDITION LOGIC ----------

                        if "all 4 vehicle types" in condition:
                            if vehicle_types_sold >= 4:
                                apply_flag = True

                        elif "double incentive" in condition or "x" in bonus_raw:
                            multiplier = float(re.findall(r"\d+\.?\d*", bonus_raw)[0])
                            amount = emp_structured * (multiplier - 1)
                            apply_flag = True

                        elif "branch achieves" in condition:
                            match = re.search(r"\d+%", condition)
                            if match:
                                percent = float(match.group().replace('%', ''))
                                if branch_total >= percent:
                                    apply_flag = True

                        elif "top performer" in condition and emp_rank == 1:
                            apply_flag = True

                        elif "2nd rank" in condition and emp_rank == 2:
                            apply_flag = True

                        elif "zero days missed" in condition:
                            apply_flag = True  # TODO: attendance logic

                        # ---------- AMOUNT ----------
                        if apply_flag and amount == 0:
                            match = re.search(r"\d+", bonus_raw.replace(",", ""))
                            if match:
                                amount = float(match.group())

                        if apply_flag and amount > best_amount:
                            best_amount = amount
                            best_detail = {
                                "scheme_id": scheme_id,
                                "scheme_name": scheme.get("scheme_name"),
                                "condition": scheme.get("conditions"),
                                "amount": round(amount, 2)
                            }

                    if best_amount > 0:
                        total += best_amount
                        details.append(best_detail)

                adhoc_results.append({
                    "employee_id": emp_id,
                    "adhoc_amount": round(total, 2)
                })

                adhoc_details_map[emp_id] = details

        df_adhoc_final = pd.DataFrame(adhoc_results)

        # ============================================================
        # ✅ FINAL
        # ============================================================
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

        df_final['structured_amount'] = df_final['structured_amount'].round(2)
        df_final['adhoc_amount'] = df_final['adhoc_amount'].round(2)
        df_final['total_incentive'] = df_final['total_incentive'].round(2)

        # ============================================================
        # ✅ SAVE
        # ============================================================
        results = []
        calculation_batch_id = str(uuid.uuid4())

        for _, row in df_final.iterrows():

            calc_id = str(uuid.uuid4())
            emp_id = row['employee_id']

            details_json = json.dumps({
                "structured": structured_details_map.get(emp_id, []),
                "ad_hoc": adhoc_details_map.get(emp_id, [])
            })

            insert_calculation((
                calc_id,
                calculation_batch_id,
                emp_id,
                org_id,
                request.sales_upload_id,
                request.structured_upload_id,
                request.adhoc_upload_id,
                float(row['total_incentive']),
                float(row['structured_amount']),
                float(row['adhoc_amount']),
                request.period,
                details_json,
                datetime.now()
            ))

            results.append({
                "employee_id": emp_id,
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

async def GETall_calculations(current_user_id: str):
    message = ""
    code = 500
    status = "fail"
    res_data = {}

    try:
        # ---------- Get User ----------
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
        if not org_id:
            message = "Organization Not found"
            code = 404
            return {
                "message": message,
                "code": code,
                "status": status,
                "res_data": res_data
            }
        # ---------- Fetch Calculations ----------
        calculation_data = GETallcalculation(org_id)

        # ---------- Success Response ----------
        message = "Calculations fetched successfully"
        code = 200
        status = "success"
        res_data = {
            "calculations": calculation_data
        }

    except Exception as ex:
        message = f"Error fetching calculations: {str(ex)}"
        code = 500
        status = "fail"

    return {
        "message": message,
        "code": code,
        "status": status,
        "res_data": res_data
    }

