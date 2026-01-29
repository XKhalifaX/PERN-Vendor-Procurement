const express = require('express');
const cors = require('cors');
const pool = require('./db'); 
const app = express(); 
require('dotenv').config();
app.use(cors());
app.use(express.json());

app.put('/api/invoices/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status, user_name } = req.body;

    try {
        
        const currentData = await pool.query('SELECT status FROM invoices WHERE id = $1', [id]);
        
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


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});