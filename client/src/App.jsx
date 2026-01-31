import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
const [role, setRole] = useState('VENDOR'); // Our "switch" state
const [formdata, setFormData] = useState({
  vendor_id: '',
  amount: '',
  description: '',
  currency: '',
  due_date: ''
});
  const handleAction = async () => {
    console.log("Button clicked! Current input:", formdata);

    alert(`Vendor submitted: ${JSON.stringify(formdata)}`);

  };

  return (
    <div className={role === 'ADMIN' ? 'admin-theme' : 'vendor-theme'}>
      <nav>
        <span>Current Role: <strong>{role}</strong></span>
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
              placeholder="Type something."
              value={formdata.vendor_id}
              onChange={(e) => setFormData({ ...formdata, vendor_id: e.target.value })} // Link textbox TO variable
            />
            <button onClick={handleAction}>Submit</button>

            </div>
          </div>
        ) : (
          <div>
            <h2>Admin Dashboard</h2>
            {/* We will put the Approval List here */}
          </div>
        )}
      </main>
    </div>
  );
}
export default App
