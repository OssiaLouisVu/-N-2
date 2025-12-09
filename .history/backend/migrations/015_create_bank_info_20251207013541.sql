-- Migration 015: Create bank_info table for payment information

CREATE TABLE IF NOT EXISTS bank_info (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bank_name VARCHAR(100) NOT NULL,
    account_number VARCHAR(50) NOT NULL,
    account_holder VARCHAR(100) NOT NULL,
    qr_code LONGTEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default bank info for MB
INSERT INTO bank_info (bank_name, account_number, account_holder, is_active) 
VALUES ('MB Bank', '038204019305', 'English Center', TRUE);

SELECT 'Migration 015 completed!' AS status;
