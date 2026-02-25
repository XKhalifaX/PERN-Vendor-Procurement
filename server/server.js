const express = require('express'); //dependency
const cors = require('cors'); //dependency 
const crypto = require('crypto');
const pool = require('./db'); // this connects to the database
const app = express(); 
require('dotenv').config();
app.use(cors());
app.use(express.json());

const INVOICE_CREATE_ENDPOINT = '/api/invoices';

const createInvoiceRequestHash = (payload) => {
    const normalizedPayload = {
        vendor_id: payload?.vendor_id ?? null,
        amount: payload?.amount ?? null,
        currency: payload?.currency ?? null,
        description: payload?.description ?? null,
        due_date: payload?.due_date ?? null
    };

    return crypto
        .createHash('sha256')
        .update(JSON.stringify(normalizedPayload))
        .digest('hex');
};

const getExistingIdempotencyRecord = async (client, idempotencyKey, endpoint) => {
    const result = await client.query(
        `SELECT request_hash, response_status, response_body
         FROM idempotency_keys
         WHERE idempotency_key = $1 AND endpoint = $2`,
        [idempotencyKey, endpoint]
    );

    return result.rows[0] || null;
};

const reserveIdempotencyKey = async (client, idempotencyKey, endpoint, requestHash) => {
    const result = await client.query(
        `INSERT INTO idempotency_keys (idempotency_key, endpoint, request_hash)
         VALUES ($1, $2, $3)
         ON CONFLICT (idempotency_key, endpoint) DO NOTHING
         RETURNING id`,
        [idempotencyKey, endpoint, requestHash]
    );

    return result.rows.length > 0;
};

const finalizeIdempotencyRecord = async (client, idempotencyKey, endpoint, statusCode, responseBody) => {
    await client.query(
        `UPDATE idempotency_keys
         SET response_status = $3,
             response_body = $4
         WHERE idempotency_key = $1 AND endpoint = $2`,
        [idempotencyKey, endpoint, statusCode, responseBody]
    );
};

const ensureIdempotencyTable = async () => {
    await pool.query(
        `CREATE TABLE IF NOT EXISTS idempotency_keys (
            id BIGSERIAL PRIMARY KEY,
            idempotency_key VARCHAR(255) NOT NULL,
            endpoint VARCHAR(120) NOT NULL,
            request_hash VARCHAR(128) NOT NULL,
            response_status INTEGER,
            response_body JSONB,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            expires_at TIMESTAMP,
            CONSTRAINT uq_idempotency_key_endpoint UNIQUE (idempotency_key, endpoint)
        )`
    );

    await pool.query(
        `CREATE INDEX IF NOT EXISTS idx_idempotency_expires_at
         ON idempotency_keys (expires_at)`
    );
};

app.put('/api/invoices/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status, user_name } = req.body;
    const changedBy = user_name || 'SYSTEM_ADMIN';

    try {
        
        const currentData = await pool.query('SELECT status FROM invoices WHERE id = $1', [id]); //assigns currentData from a pool query connection connected to db
        
        if (currentData.rows.length === 0) return res.status(404).send('Invoice not found');
        
        const oldStatus = currentData.rows[0].status;

        await pool.query(
            'UPDATE invoices SET status = $1 WHERE id = $2',
            [status, id]
        );

        await pool.query(
            'INSERT INTO audit_logs (invoice_id, action, old_value, new_value, changed_by) VALUES ($1, $2, $3, $4, $5)',
            [id, 'STATUS_UPDATE', oldStatus, status, changedBy]
        );

        res.json({ message: `Invoice ${id} updated to ${status}` });
        
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Database error');
    }
});

app.post('/api/invoices', async (req, res) => {
    const { vendor_id, amount, currency,description, due_date } = req.body;
    const idempotencyKey = req.get('Idempotency-Key');
    const requestHash = createInvoiceRequestHash(req.body);
    const dbClient = await pool.connect();

    if (!idempotencyKey) {
        return res.status(400).json({ message: 'Missing Idempotency-Key header' });
    }

    try {
        await dbClient.query('BEGIN');

        const isReserved = await reserveIdempotencyKey(
            dbClient,
            idempotencyKey,
            INVOICE_CREATE_ENDPOINT,
            requestHash
        );

        if (!isReserved) {
            const existingRecord = await getExistingIdempotencyRecord(
                dbClient,
                idempotencyKey,
                INVOICE_CREATE_ENDPOINT
            );

            if (!existingRecord) {
                await dbClient.query('ROLLBACK');
                return res.status(409).json({ message: 'Unable to resolve idempotency key state. Retry request.' });
            }

            if (existingRecord.request_hash !== requestHash) {
                await dbClient.query('ROLLBACK');
                return res.status(409).json({ message: 'Idempotency key reused with a different request payload' });
            }

            if (existingRecord.response_body) {
                await dbClient.query('ROLLBACK');
                return res.status(existingRecord.response_status || 200).json(existingRecord.response_body);
            }

            await dbClient.query('ROLLBACK');
            return res.status(409).json({ message: 'Request with this idempotency key is already in progress. Retry shortly.' });
        }

        const newInvoice = await dbClient.query(
            'INSERT INTO invoices (vendor_id, amount, currency, description, due_date) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [vendor_id, amount, currency, description, due_date]

        );

        await dbClient.query(
            'INSERT INTO audit_logs (invoice_id, action, new_value, changed_by) VALUES ($1, $2, $3, $4)',
            [newInvoice.rows[0].id, 'INVOICE_CREATED', 'PENDING', 'SYSTEM_VENDOR']
        );

        await finalizeIdempotencyRecord(
            dbClient,
            idempotencyKey,
            INVOICE_CREATE_ENDPOINT,
            201,
            newInvoice.rows[0]
        );

        await dbClient.query('COMMIT');

        res.status(201).json(newInvoice.rows[0]); // 201 means "Created Successfuly"
    } catch (err) {
        await dbClient.query('ROLLBACK');
        console.error(err.message);
        res.status(500).send('Database error'); 
    } finally {
        dbClient.release();
    }

});
app.get('/api/invoices', async (req, res) => {
    try {
        const allInvoices = await pool.query(
            'SELECT * FROM invoices ORDER BY created_at DESC'
        );
        res.json(allInvoices.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Database error');
    }
});

app.get('/api/audit_logs', async (req, res) => {
    try {
        const allLogs = await pool.query(
            'SELECT * FROM audit_logs ORDER BY changed_at DESC'
        );
        res.json(allLogs.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Database error');
    }

});

app.get('/api/vendors', async (req, res) => {
    try {
        const allVendors = await pool.query(
            'SELECT id, name, email, created_at FROM vendors ORDER BY id ASC'
        );
        res.json(allVendors.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Database error');
    }
});

app.get('/api/invoices/:id', async (req, res) => {
    const rawId = req.params.id;
    const id = Number(rawId);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ message: `Invalid invoice id: ${rawId}` });
    }

    try {
        const invoice = await pool.query('SELECT * FROM invoices WHERE id = $1', [id]);
        if (invoice.rows.length === 0) {
            return res.status(404).json({ message: 'Invoice not found' });
        }
        res.json(invoice.rows[0]);
    } catch (err) {
        console.error('GET /api/invoices/:id error ->', err);
        res.status(500).json({ message: 'Database error', detail: err.message });
    }
});

const PORT = process.env.PORT || 5000;

ensureIdempotencyTable()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('Failed to initialize idempotency table:', err.message);
        process.exit(1);
    });

