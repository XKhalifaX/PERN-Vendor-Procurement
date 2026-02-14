import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
const [invoices, setInvoices] = useState([]);
const [role, setRole] = useState('VENDOR'); // Our "switch" state
const [formdata, setFormData] = useState({
  vendor_id: '001',
  amount: '',
  description: '',
  currency: '',
  due_date: ''
});

useEffect(() => { //Fetches invoices from backend
  fetch('http://localhost:5000/api/invoices')
  .then(res => res.json())
  .then(data => setInvoices(data))
  .catch(err => console.error('Error fetching invoices:', err));
}, []) //Means [] Run only once.

  const handleAction = async () => {
    console.log("Button clicked! Current input:", formdata);

    alert(`Vendor submitted: ${JSON.stringify(formdata)}`);

  };

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
            <input
              type="text"
              placeholder="Invoice cost."
              value={formdata.amount}
              onChange={(e) => setFormData({ ...formdata, amount: e.target.value })} // Link textbox TO variable
            />
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
            <button onClick={handleAction}>Submit</button>

            </div>
          </div>
        ) : (
          <div>
            <h2>Admin Dashboard</h2>
            {/* We will put the Approval List here */} 
            <div style={{ padding: '20px', border: '1px solid #ccc' }}>
            <h3>Approval List</h3>
            {invoices.map(invoice => (
              <div key={invoice.id} style={{ marginBottom: '10px' }}>
                <p><strong>Invoice ID:</strong> {invoice.id}</p>
                <p><strong>Vendor ID:</strong> {invoice.vendor_id}</p>
                <p><strong>Amount:</strong> {invoice.amount} {invoice.currency}</p>
                <p><strong>Description:</strong> {invoice.description}</p>
                <p><strong>Status:</strong> {invoice.status}</p>
                {/* Here we can add Approve/Reject buttons */}
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
