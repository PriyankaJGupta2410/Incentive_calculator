import pandas as pd
import re
from datetime import date
from dateutil import parser as date_parser


def extract_with_pandas(text):

    df = pd.DataFrame(text.split("\n"), columns=["raw"])
    df["raw"] = df["raw"].str.strip()
    df = df[df["raw"] != ""]

    # ---------- Tagging ----------
    def classify(line):
        line_lower = line.lower()
        if "*scheme" in line_lower:
            return "scheme"
        elif "applicable to" in line_lower:
            return "role"
        elif "valid" in line_lower:
            return "date"
        elif line.startswith("-"):
            return "condition"
        elif "notes" in line_lower:
            return "notes_header"
        elif line.startswith("-") and "notes" in prev_line.lower():
            return "notes"
        return "other"

    prev_line = ""
    df["tag"] = df["raw"].apply(lambda x: classify(x))

    # ---------- Helpers ----------
    def normalize_role(text):
        text = text.lower()
        if "asm" in text:
            return "ASM"
        elif "rm" in text:
            return "RM"
        elif "employee" in text or "all" in text:
            return "ALL"
        return "ALL"

    def extract_role_from_line(line):
        match = re.search(r"All\s+(ASMs?|RMs?|employees?)", line, re.IGNORECASE)
        if match:
            return normalize_role(match.group(1))
        return None

    def parse_dates(text):
        try:
            parts = text.split("-")
            if len(parts) == 2:
                return (
                    date_parser.parse(parts[0]).date(),
                    date_parser.parse(parts[1]).date()
                )
            d = date_parser.parse(text).date()
            return d, d
        except:
            return date(2025, 9, 1), date(2025, 9, 30)

    def extract_bonus(line):
        money = re.search(r"₹([\d,]+)", line)
        multi = re.search(r"(\d+\.?\d*x)", line, re.IGNORECASE)

        if money:
            return int(money.group(1).replace(",", ""))
        elif multi:
            return multi.group(1)
        elif "double" in line.lower():
            return "2x"
        elif "triple" in line.lower():
            return "3x"
        return None

    def clean_condition(line):
        return re.sub(r"[-*]", "", line).strip()

    # ---------- Build Data ----------
    rows = []
    invalid_rows = []
    notes_list = []

    current = None
    scheme_id = 0
    in_notes_section = False

    for _, r in df.iterrows():
        try:
            line = r["raw"]
            tag = r["tag"]

            # ==============================
            # 🚀 NOTES SECTION
            # ==============================
            if "notes" in line.lower():
                in_notes_section = True
                continue

            if in_notes_section:
                if line.startswith("-"):
                    notes_list.append(line.replace("-", "").strip())
                continue

            # ==============================
            # 🚀 SCHEME START
            # ==============================
            if tag == "scheme":
                scheme_id += 1
                current = {
                    "scheme_id": scheme_id,
                    "scheme_name": re.sub(r"\*SCHEME\s\d+:", "", line).strip().title(),
                    "role": "ALL",
                    "valid_from": date(2025, 9, 1),
                    "valid_to": date(2025, 9, 30)
                }

            elif current:

                if tag == "role":
                    current["role"] = normalize_role(line.split(":")[1])

                elif tag == "date":
                    vf, vt = parse_dates(line.split(":")[1])
                    current["valid_from"] = vf
                    current["valid_to"] = vt

                elif tag == "condition":

                    condition_text = clean_condition(line)

                    # ❌ SKIP EMPTY CONDITION
                    if not condition_text:
                        continue

                    role_from_line = extract_role_from_line(line)
                    final_role = role_from_line if role_from_line else current["role"]

                    # ==============================
                    # 🚀 MATCH NOTES TO SCHEME
                    # ==============================
                    matched_notes = []
                    for note in notes_list:
                        if any(word in note.lower() for word in current["scheme_name"].lower().split()):
                            matched_notes.append(note)

                    rows.append({
                        "scheme_id": current["scheme_id"],
                        "scheme_name": current["scheme_name"].replace("*", ""),
                        "conditions": condition_text,
                        "role": final_role,
                        "bonus_amount": extract_bonus(line),
                        "validity_from": current["valid_from"],
                        "validity_to": current["valid_to"],
                        "notes": ", ".join(matched_notes) if matched_notes else None
                    })

        except Exception as e:
            invalid_rows.append({"line": line, "error": str(e)})

    return pd.DataFrame(rows), invalid_rows

