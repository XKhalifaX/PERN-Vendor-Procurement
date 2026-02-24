import { useNavigate } from "react-router-dom";

function AdminDash({ invoices, vendors }) {
    const navigate = useNavigate();
    const getStatusBadgeClasses = (status) => {
        const normalized = String(status || '').toLowerCase();
        if (normalized === 'approved') return 'border border-green-200 bg-green-50 text-green-700';
        if (normalized === 'rejected') return 'border border-red-200 bg-red-50 text-red-700';
        return 'border border-gray-200 bg-white text-gray-700';
    };
  const formatAmount = (amount) => {
    const numeric = Number(amount);
    return Number.isNaN(numeric) ? amount : numeric.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };
  const formatDate = (value) => {
    if (!value) return '—';
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? '—' : parsed.toLocaleDateString();
  };

  return (
        <div className="w-full">
          {/* Header Section */}
          <header className="mb-8">
            <h2 className="text-3xl font-bold text-gray-800 tracking-tight">Admin Dashboard</h2>
            <p className="text-gray-500">Manage pending approvals and monitor system logs.</p>
          </header>

          {/* Main Grid Layout */}
          <div className="grid grid-cols-1 gap-8">
            
            {/* Approval List Card */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-700">Approval List</h3>
                <button
                  className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
                  onClick={() => navigate('/audit')}
                >
                  Switch to Audit Log
                  </button>
              </div>
              
              <div className="p-6 space-y-4">
                {invoices.map((invoice) => (
                  <div key={invoice.id} className="p-4 rounded-lg border border-gray-100 bg-gray-50/50 hover:border-blue-300 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                        ID: {invoice.id}
                      </span>
                      <span className="text-sm font-bold text-gray-900">
                        {formatAmount(invoice.amount)} {invoice.currency || 'AED'}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                      <p className="text-gray-600 font-medium">Vendor: <span className="text-gray-900">{vendors?.[invoice.vendor_id] || `#${invoice.vendor_id}`}</span></p>
                      <div className="text-right">
                        <span className={`inline-flex rounded-md px-2 py-1 text-xs font-semibold capitalize ${getStatusBadgeClasses(invoice.status)}`}>
                          {invoice.status}
                        </span>
                      </div>
                      <p className="text-gray-500 text-xs">Due: <span className="text-gray-700 font-medium">{formatDate(invoice.due_date)}</span></p>
                      <p className="text-gray-500 text-xs text-left sm:text-right">Created: <span className="text-gray-700 font-medium">{formatDate(invoice.created_at)}</span></p>
                    </div>
                    
                    <p className="mt-2 text-sm text-gray-500 border-t pt-2 border-gray-200/60">
                      {invoice.description || 'No description provided.'}
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

          </div>
        </div>
    );
}
export default AdminDash;