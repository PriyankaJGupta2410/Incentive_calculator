incentiveCalculator

CREATE TABLE organization_master (
    _id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    industry VARCHAR(100),
    company_size VARCHAR(50),
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_master (
    _id VARCHAR(36) PRIMARY KEY,
    org_id VARCHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(500) NOT NULL,
    role VARCHAR(50) DEFAULT 'ADMIN',
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_org
        FOREIGN KEY (org_id)
        REFERENCES organization_master(_id)
        ON DELETE CASCADE
);

CREATE TABLE sales (
    _id varchar(50) PRIMARY KEY NOT NULL,
    employee_id VARCHAR(50) NOT NULL,
    upload_id Varchar(50) NOT NULL,
    org_id varchar(50) Not null,
    branch VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL,
    vehicle_model VARCHAR(100) NOT NULL,
    quantity INT NOT NULL,
    sale_date DATE NOT NULL,
    vehicle_type VARCHAR(50) NOT NULL,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modified_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE uploaded_files (
    _id VARCHAR(36) PRIMARY KEY,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    total_records INT NOT NULL,
    invalid_rows_count INT DEFAULT 0,
    invalid_rows JSON,
    org_id varchar(50) Not null,
    created_date DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE incentives (
    _id Varchar(36) PRIMARY KEY,
    rule_id VARCHAR(50) NOT NULL,
    role VARCHAR(50) NOT NULL,
    vehicle_type VARCHAR(50) NOT NULL,
    min_units INT NOT NULL,
    max_units INT NOT NULL,
    incentive_amount_inr DECIMAL(10,2),
    bonus_per_unit_inr DECIMAL(10,2),
    valid_from DATE NOT NULL,
    valid_to DATE NOT NULL,
    rule_type VARCHAR(50) NOT NULL,
    upload_id Varchar(36) NOT NULL,
    org_id Varchar(36) NOT NULL,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (upload_id) REFERENCES uploaded_files(id)
);