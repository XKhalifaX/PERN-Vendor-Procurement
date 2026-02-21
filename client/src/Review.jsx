import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

export default function ReviewPage() {
  const navigate = useNavigate();
  const { id } = useParams(); // Get the invoice ID from the URL
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


useEffect(() => {
  const fetchInvoice = async () => {
    try {
      console.log("Review param id:", id);
      const url = `http://localhost:5000/api/invoices/${id}`;
      console.log("Fetching:", url);

      const res = await fetch(url);
      console.log("Status:", res.status);

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setInvoice(data);
    } catch (err) {
      console.error("Fetch failed:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  fetchInvoice();
}, [id])

const handleAction = async (status) => {
  try {
    const res = await fetch(`http://localhost:5000/api/invoices/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }) // "approved" or "rejected"
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    alert(`Invoice ${status} successfully!`);
    navigate("/", { state: { role: "ADMIN" } });
  } catch (err) {
    console.error("Action failed:", err);
    alert(`Failed to update invoice: ${err.message}`);
  }
};


  return (
    <div className="bg-slate-100 min-h-screen w-full flex flex-col items-center">
      <main className="w-full max-w-5xl p-6">
        <div className="mb-6 flex justify-end">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-6 py-4">
            <button
              className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
              onClick={() => navigate("/", { state: { role: "ADMIN" } })}
            >
              Back to Dashboard
            </button>
          </div>
        </div>

        <header className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 tracking-tight">Review Invoice</h2>
          <p className="text-gray-500">Invoice ID: {id}</p>
        </header>

        <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-700">Review Actions</h3>
          </div>

          <div className="p-6">
            {loading && <p className="text-gray-500">Loading invoice...</p>}
            {error && <p className="text-red-600">{error}</p>}
            {!loading && !error && invoice && (
              <div className="space-y-4">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Amount:</span> {invoice.amount} {invoice.currency}
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Description:</span> {invoice.description}
                </p>
                <div className="flex gap-3">
                  <button className="inline-flex items-center rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 transition-colors"
                  onClick={() => handleAction("approved")}>
                    Approve
                  </button>
                  <button className="inline-flex items-center rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
                  onClick={() => handleAction("rejected")}>
                    Deny
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}