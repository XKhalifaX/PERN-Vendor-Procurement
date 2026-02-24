import { useState } from 'react';
import { createInvoice } from './api.js';

function VendorDash({ fetchInvoices }) {
  const [formdata, setFormData] = useState({
    vendor_id: 1, 
    amount: '',
    description: '',
    currency: '',
    due_date: ''
});
const currencyOptions = ['AED','USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD']; // Example currency options
const vendorOptions = [
  { id: 1, name: 'Surefire Systems' },
  { id: 2, name: 'Alpha Romeo Incorporated' },
  { id: 3, name: 'Baladi Logistics' }
];

const handleAction = async (e) => {
  e.preventDefault(); //This prevents form submission.
  try {
    await createInvoice(formdata);
    alert("Invoice submitted successfully!");
    setFormData({ ...formdata, amount: '', description: '', currency: '', due_date: '' }); // Clear form after submission
    if (fetchInvoices) await fetchInvoices();

  } catch (error) {
    console.error('Submission crash:', error);
    alert(`Failed to submit invoice: ${error.message}`);
  }
};

    return (
          <div className="w-full">
            <header className="mb-8">
              <h2 className="text-3xl font-bold text-gray-800 tracking-tight">Vendor Dashboard</h2>
              <p className="text-gray-500">Create and submit invoices for approval.</p>
            </header>

            <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-700">Create Invoice Form</h3>
                <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
                  Vendor Select:
                  <select
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    value={formdata.vendor_id}
                    onChange={(e) => setFormData({ ...formdata, vendor_id: e.target.value })}
                  >
                    <option value="" disabled>Select Vendor</option>
                    {vendorOptions.map((vendor) => (
                      <option key={vendor.id} value={vendor.id}>
                        {vendor.name}
                      </option>
                    ))}
                  </select>
                </label>
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
                  <select
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    value={formdata.currency}
                    onChange={(e) => setFormData({ ...formdata, currency: e.target.value })}
                  >
                    <option value="" disabled>Select Currency</option>
                    {currencyOptions.map((currency) => (
                      <option key={currency} value={currency}>
                        {currency}
                      </option>
                    ))}
                  </select>
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
    );
}
export default VendorDash;