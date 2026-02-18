import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
const [invoices, setInvoices] = useState([]);
const [role, setRole] = useState('VENDOR'); // Our "switch" state
const [formdata, setFormData] = useState({
  vendor_id: 1, // For simplicity, we use a fixed vendor_id. In real app, this would come from auth.
  amount: '',
  description: '',
  currency: '',
  due_date: ''
});
const handleAction = async (e) => {
  e.preventDefault(); //This prevents form submission.
  console.log("Submitting:" , formdata);
  const payload = {
  vendor_id: formdata.vendor_id,
  amount: formdata.amount,
  description: formdata.description,
  currency: formdata.currency,
  due_date: formdata.due_date
  }
  try {
    const response = await fetch('http://localhost:5000/api/invoices', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    if (response.ok) {
      const data = await response.json();
      alert("Invoice submitted successfully!");
      setFormData({ ...formdata, amount: '', description: '', currency: '', due_date: '' }); // Clear form after submission
if (typeof fetchInvoices === 'function') {
        await fetchInvoices();
      }
    } else {
      // If the server returns 400 or 500, it hits this ELSE, not the CATCH
      const errorData = await response.json().catch(() => ({}));
      alert(`Server rejected submission: ${errorData.details || 'Unknown error'}`);
    }

  } catch (error) {
    // This ONLY runs if the network is down or the server is offline
    console.error('Submission crash:', error);
    alert('Failed to submit invoice due to a network error.');
  }
};

useEffect(() => { //Fetches invoices from backend
  fetch('http://localhost:5000/api/invoices')
  .then(res => res.json())
  .then(data => setInvoices(data))
  .catch(err => console.error('Error fetching invoices:', err));
}, []) //Means [] Run only once.

  return (
    <div className={role === 'ADMIN' ? 'admin-theme' : 'vendor-theme'}>
      <nav>
        <span>Current Role: <strong>{role} </strong></span>
        <button onClick={() => setRole(role === 'VENDOR' ? 'ADMIN' : 'VENDOR')}>
          Switch to {role === 'VENDOR' ? 'Admin' : 'Vendor'}
        </button>
      </nav>

      <main>
        {role === 'VENDOR' ? (
          <div>
            <h2>Vendor Dashboard</h2>
            <div style={{ padding: '20px', border: '1px solid #ccc' }}>
            <h3>Create Invoice Form</h3>
            <div>
            <p>Amount:
            <input
              type="number"
              step="0.01" // Allows decimal input
              placeholder="0.00" //Placeholder number
              value={formdata.amount}
              onChange={(e) => setFormData({ ...formdata, amount: e.target.value })} // Link textbox TO variable
            />
            </p>
            </div>
            <div>
            <p>Description: 
            <input
              type="text"
              placeholder="Invoice Description"
              value={formdata.description}
              onChange={(e) => setFormData({ ...formdata, description: e.target.value })}
            />
            </p>
            </div>
             <div>
            <p>Currency: 
            <input
              type="text"
              placeholder="Invoice Currency"
              value={formdata.currency}
              onChange={(e) => setFormData({ ...formdata, currency: e.target.value })}
            />
            </p>
            </div>
            <div>
            <p>Due Date: 
            <input
              type="date"
              placeholder="Invoice Due Date"
              value={formdata.due_date}
              onChange={(e) => setFormData({ ...formdata, due_date: e.target.value })}
            />
            </p>
            </div>
            <button onClick={handleAction}>Submit</button>

            </div>
          </div>
        ) : (
          <div>
            <h2>Admin Dashboard</h2>
            {/* Approval List here */} 
            <div style={{ padding: '20px', border: '1px solid #ccc' }}>
            <h3>Approval List</h3>
            {invoices.map(invoice => (
              <div key={invoice.id} style={{ marginBottom: '10px' }}>
                <p><strong>Invoice ID:</strong> {invoice.id}</p>
                <p><strong>Vendor ID:</strong> {invoice.vendor_id}</p>
                <p><strong>Amount:</strong> {invoice.amount} {invoice.currency}</p>
                <p><strong>Description:</strong> {invoice.description}</p>
                <p><strong>Status:</strong> {invoice.status}</p>
                {/* To add approve/reject later */}
              </div>
            ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
export default App
