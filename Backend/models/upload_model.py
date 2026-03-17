class upload:
    def __init__(self,file_name,file_path,total_records,invalid_rows_count,invalid_rows,file_type):
        self.file_name = file_name
        self.file_path = file_path
        self.total_records = total_records
        self.invalid_rows_count = invalid_rows_count
        self.invalid_rows = invalid_rows
        self.file_type = file_type