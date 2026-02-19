import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
const [invoices, setInvoices] = useState([]);
const [audits, setAudits] = useState([]);
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

useEffect(() => { //Fetching audits from backend
  fetch('http://localhost:5000/api/audit_logs')
    .then(res => res.json()) //Parse JSON response
    .then(data => setAudits(data)) //Set audits state with fetched data
    .catch(err => console.error('Error fetching audits:', err));
}, []);

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
        <div className="p-6 bg-gray-50 min-h-screen">
          {/* Header Section */}
          <header className="mb-8">
            <h2 className="text-3xl font-bold text-gray-800 tracking-tight">Admin Dashboard</h2>
            <p className="text-gray-500">Manage pending approvals and monitor system logs.</p>
          </header>

          {/* Main Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Approval List Card */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-700">Approval List</h3>
              </div>
              
              <div className="p-6 space-y-4">
                {invoices.map((invoice) => (
                  <div key={invoice.id} className="p-4 rounded-lg border border-gray-100 bg-gray-50/50 hover:border-blue-300 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                        ID: {invoice.id}
                      </span>
                      <span className="text-sm font-bold text-gray-900">
                        {invoice.amount} {invoice.currency}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <p className="text-gray-600 font-medium">Vendor: <span className="text-gray-900">{invoice.vendor_id}</span></p>
                      <p className="text-gray-600 font-medium text-right italic">{invoice.status}</p>
                    </div>
                    
                    <p className="mt-2 text-sm text-gray-500 border-t pt-2 border-gray-200/60">
                      {invoice.description}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Audit Log Card */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-700">Audit Log</h3>
              </div>
              
              <div className="p-6">
                <div className="space-y-3">
                  {audits.map((audit) => (
                    <div key={audit.id} className="flex items-center gap-4 p-3 text-sm border-l-4 border-indigo-500 bg-indigo-50/30">
                      <div className="flex-1">
                        <p className="text-gray-900 font-semibold">{audit.action}</p>
                        <p className="text-gray-500 text-xs text-uppercase font-mono">Invoice #{audit.invoice_id}</p>
                      </div>
                      <span className="text-gray-400 text-xs">ID: {audit.id}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

          </div>
        </div>
        )}
      </main>
    </div>
  );
}
export default App
