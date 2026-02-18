const express = require('express'); //dependency
const cors = require('cors'); //dependency 
const pool = require('./db'); // this connects to the database
const app = express(); 
require('dotenv').config();
app.use(cors());
app.use(express.json());

app.put('/api/invoices/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status, user_name } = req.body;

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
            [id, 'STATUS_UPDATE', oldStatus, status, user_name]
        );

        res.json({ message: `Invoice ${id} updated to ${status}` });
        
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Database error');
    }
});

app.post('/api/invoices', async (req, res) => {
    const { vendor_id, amount, currency,description, due_date } = req.body;
    try {
        const newInvoice = await pool.query(
            'INSERT INTO invoices (vendor_id, amount, currency, description, due_date) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [vendor_id, amount, currency, description, due_date]

        );
await pool.query(
            'INSERT INTO audit_logs (invoice_id, action, new_value, changed_by) VALUES ($1, $2, $3, $4)',
            [newInvoice.rows[0].id, 'INVOICE_CREATED', 'PENDING', 'SYSTEM_VENDOR']
        );

        res.status(201).json(newInvoice.rows[0]); // 201 means "Created Successfuly"
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Database error'); 

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
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});

