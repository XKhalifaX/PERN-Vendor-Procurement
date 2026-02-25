import { useState, useEffect, useCallback } from 'react'
import './App.css'
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import ReviewPage from './components/Review.jsx';
import Navbar from './components/Navbar.jsx';
import VendorDash from './components/VendorDash.jsx';
import AdminDash from './components/AdminDash.jsx';
import Audit from './components/Audit.jsx';
import { getInvoices, getAuditLogs, getVendors } from './components/api.js';

function App() {
const [role, setRole] = useState('VENDOR'); // Switcher
const navigate = useNavigate(); //this is used to route to other pages.
const location = useLocation();
const [invoices, setInvoices] = useState([]);
const [audits, setAudits] = useState([]);
const [vendors, setVendors] = useState({});

  const fetchVendors = useCallback(async () => {
  try {
    const data = await getVendors();
    const map = {};
    data.forEach(v => {
      if (v?.id != null && v?.name) {
        map[String(v.id)] = v.name;
      }
    });
    setVendors(map);
  } catch (err) {
    console.error('Error fetching vendors:', err);
    setVendors({});
  }
}, []);


useEffect(() => {
  fetchVendors();
}, [fetchVendors]);

const fetchInvoices = useCallback(async () => { //Simple getter to fetch invoices
  try {
    const data = await getInvoices();
    setInvoices(data);
  } catch (err) {
    console.error('Error fetching invoices:', err);
  }
}, []);

const fetchAudits = useCallback(async () => { //Simple getter to fetch audits
  try {
    const data = await getAuditLogs();
    setAudits(data);
  } catch (err) {
    console.error('Error fetching audits:', err);
  }
}, []);


useEffect(() => {
  if (location.pathname === '/audit' && role !== 'ADMIN') {
    navigate('/');
  }
}, [role, location.pathname, navigate]);

useEffect(() => { //Fetches invoices from backend
  fetchInvoices();
}, [fetchInvoices]) //Means [] Run only once.

useEffect(() => { //Fetching audits from backend
  fetchAudits();
}, [fetchAudits]);

useEffect(() => {
  if (location.state?.role === 'ADMIN') {
    setRole('ADMIN');
    fetchInvoices();
    fetchAudits();
    navigate('/', { replace: true, state: null });
  }
}, [location.state, navigate, fetchInvoices, fetchAudits]);



return (
  <Routes>
    <Route path="/" element={
      <div className="bg-slate-100 min-h-screen w-full flex flex-col items-center">
        <main className="w-full max-w-5xl p-6">
          
          {/* 1. The Switcher is now a clean tag */}
          <Navbar role={role} setRole={setRole} />

          {/* 2. The Content Logic */}
          {role === 'VENDOR' ? (
            <VendorDash fetchInvoices={fetchInvoices} />
          ) : (
            <AdminDash invoices={invoices} vendors={vendors} />
          )}
          
        </main>
      </div>
    } />
    <Route
      path="/audit"
      element={
        <div className="bg-slate-100 min-h-screen w-full flex flex-col items-center">
          <main className="w-full max-w-5xl p-6">
            <Navbar role={role} setRole={setRole} />
            <Audit audits={audits} />
          </main>
        </div>
      }
    />

    <Route path="/review/:id" element={<ReviewPage vendors={vendors} />} />
  </Routes>
);
}

export default App;