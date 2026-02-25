CREATE TYPE invoice_status AS ENUM ('pending', 'approved', 'paid', 'rejected');

CREATE TABLE vendors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

);
CREATE TABLE invoices (
    id SERIAL PRIMARY KEY,
    vendor_id INTEGER REFERENCES vendors(id),
    amount NUMERIC(19,4) NOT NULL,
    currency VARCHAR(3) DEFAULT 'AED',
    status invoice_status DEFAULT 'pending',
    description TEXT,
    due_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

);

CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    invoice_id INTEGER,
    action VARCHAR(50),
    old_value VARCHAR(50),
    new_value VARCHAR(50),
    changed_by VARCHAR(100),
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE idempotency_keys (
    id BIGSERIAL PRIMARY KEY,
    idempotency_key VARCHAR(255) NOT NULL,
    endpoint VARCHAR(120) NOT NULL,
    request_hash VARCHAR(128) NOT NULL,
    response_status INTEGER,
    response_body JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    CONSTRAINT uq_idempotency_key_endpoint UNIQUE (idempotency_key, endpoint)
);

CREATE INDEX idx_idempotency_expires_at ON idempotency_keys (expires_at);