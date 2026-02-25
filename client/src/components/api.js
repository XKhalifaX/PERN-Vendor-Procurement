const API_BASE_URL = 'http://localhost:5000/api';

const parseJsonResponse = async (response) => {
	const data = await response.json().catch(() => ({}));
	if (!response.ok) {
		const message = data.detail || data.message || `HTTP ${response.status}`;
		throw new Error(message);
	}
	return data;
};

export const getInvoices = async () => {
	const response = await fetch(`${API_BASE_URL}/invoices`);
	return parseJsonResponse(response);
};

export const getInvoiceById = async (id) => {
	const response = await fetch(`${API_BASE_URL}/invoices/${id}`);
	return parseJsonResponse(response);
};

export const createInvoice = async (payload) => {
    const key = crypto.randomUUID();

    const response = await fetch(`${API_BASE_URL}/invoices`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Idempotency-Key': key
        },
        body: JSON.stringify(payload)
    });

    return parseJsonResponse(response);
};

export const updateInvoiceStatus = async (id, status) => {
	const response = await fetch(`${API_BASE_URL}/invoices/${id}/status`, {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ status })
	});

	return parseJsonResponse(response);
};

export const getAuditLogs = async () => {
	const response = await fetch(`${API_BASE_URL}/audit_logs`);
	return parseJsonResponse(response);
};

export const getVendors = async () => {
	const response = await fetch(`${API_BASE_URL}/vendors`);
	return parseJsonResponse(response);
};
