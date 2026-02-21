import { useState, useEffect } from 'react'
import './App.css'
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import ReviewPage from './Review.jsx';

function App() {
const [invoices, setInvoices] = useState([]);
const [audits, setAudits] = useState([]);
const [role, setRole] = useState('VENDOR'); // Our "switch" state
const navigate = useNavigate(); //this is used to route to other pages.
const location = useLocation();
const [formdata, setFormData] = useState({
  vendor_id: 1, // For simplicity, we use a fixed vendor_id. In real app, this would come from auth.
  amount: '',
  description: '',
  currency: '',
  due_date: ''
});


const fetchInvoices = async () => {
  try {
    const res = await fetch('http://localhost:5000/api/invoices');
    const data = await res.json();
    setInvoices(data);
  } catch (err) {
    console.error('Error fetching invoices:', err);
  }
};

const fetchAudits = async () => {
  try {
    const res = await fetch('http://localhost:5000/api/audit_logs');
    const data = await res.json();
    setAudits(data);
  } catch (err) {
    console.error('Error fetching audits:', err);
  }
};

const getStatusBadgeClasses = (status) => {
  const normalized = String(status || '').toLowerCase();

  if (normalized === 'approved') {
    return 'border border-green-200 bg-green-50 text-green-700';
  }

  if (normalized === 'rejected') {
    return 'border border-red-200 bg-red-50 text-red-700';
  }

  return 'border border-gray-200 bg-white text-gray-700';
};

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
      await fetchInvoices();
    } else {
      // If the server returns 400 or 500, it hits this ELSE, not the CATCH
      const errorData = await response.json().catch(() => ({}));
      alert(`Server rejected submission: ${errorData.detail || errorData.message || 'Unknown error'}`);
    }

  } catch (error) {
    // This ONLY runs if the network is down or the server is offline
    console.error('Submission crash:', error);
    alert('Failed to submit invoice due to a network error.');
  }
};



useEffect(() => { //Fetches invoices from backend
  fetchInvoices();
}, []) //Means [] Run only once.

useEffect(() => { //Fetching audits from backend
  fetchAudits();
}, []);

useEffect(() => {
  if (location.state?.role === 'ADMIN') {
    setRole('ADMIN');
    fetchInvoices();
    fetchAudits();
    navigate('/', { replace: true, state: null });
  }
}, [location.state, navigate]);



  return (
    <Routes>
      <Route
        path="/"
        element={
    <div className="bg-slate-100 min-h-screen w-full flex flex-col items-center">
      <main className="w-full max-w-5xl p-6">
        <div className="mb-6 flex justify-end">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-6 py-4 flex items-center gap-4">
            <span className="text-gray-700">Current Role: <strong>{role}</strong></span>
            <button
              className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
              onClick={() => { setRole(role === 'VENDOR' ? 'ADMIN' : 'VENDOR');}}
            >
              Switch to {role === 'VENDOR' ? 'Admin' : 'Vendor'}
            </button>
          </div>
        </div>

        {role === 'VENDOR' ? (
          <div className="w-full">
            <header className="mb-8">
              <h2 className="text-3xl font-bold text-gray-800 tracking-tight">Vendor Dashboard</h2>
              <p className="text-gray-500">Create and submit invoices for approval.</p>
            </header>

            <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-700">Create Invoice Form</h3>
              </div>

              <form onSubmit={handleAction} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
                  Amount
                  <input
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formdata.amount}
                    onChange={(e) => setFormData({ ...formdata, amount: e.target.value })}
                  />
                </label>

                <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
                  Currency
                  <input
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    type="text"
                    placeholder="Invoice Currency"
                    value={formdata.currency}
                    onChange={(e) => setFormData({ ...formdata, currency: e.target.value })}
                  />
                </label>

                <label className="md:col-span-2 flex flex-col gap-2 text-sm font-medium text-gray-700">
                  Description
                  <input
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    type="text"
                    placeholder="Invoice Description"
                    value={formdata.description}
                    onChange={(e) => setFormData({ ...formdata, description: e.target.value })}
                  />
                </label>

                <label className="md:col-span-2 flex flex-col gap-2 text-sm font-medium text-gray-700">
                  Due Date
                  <input
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    type="date"
                    value={formdata.due_date}
                    onChange={(e) => setFormData({ ...formdata, due_date: e.target.value })}
                  />
                </label>

                <div className="md:col-span-2 pt-2">
                  <button
                    type="submit"
                    className="inline-flex items-center rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
                  >
                    Submit
                  </button>
                </div>
              </form>
            </section>
          </div>
        ) : (
        <div className="w-full">
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
                      <div className="text-right">
                        <span className={`inline-flex rounded-md px-2 py-1 text-xs font-semibold capitalize ${getStatusBadgeClasses(invoice.status)}`}>
                          {invoice.status}
                        </span>
                      </div>
                    </div>
                    
                    <p className="mt-2 text-sm text-gray-500 border-t pt-2 border-gray-200/60">
                      {invoice.description}
                    </p>
                    <div className="mt-2 flex justify-end">
                      <button
                      className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
                      onClick={() => navigate(`/review/${invoice.id}`)}>
                      Review
                      </button>
                    </div>
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
                        <p className="text-gray-500 text-xs uppercase font-mono">Invoice #{audit.invoice_id}</p>
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
    }
      />
      <Route path="/review/:id" element={<ReviewPage />} />
    </Routes>
  );
}
export default App
