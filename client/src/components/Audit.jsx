import { useNavigate } from "react-router-dom";

function Audit({ audits }) {
const navigate = useNavigate();

  const formatDateTime = (value) => {
    if (!value) return '—';
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? '—' : parsed.toLocaleString();
  };

  return (
            <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-700">Audit Log</h3>
                <button
                  className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
                  onClick={() => navigate('/')}
                >
                    Back
                </button>
              </div>
              
              <div className="p-6">
                <div className="space-y-3">
                  {audits.map((audit) => (
                    <div key={audit.id} className="flex items-center gap-4 p-3 text-sm border-l-4 border-indigo-500 bg-indigo-50/30">
                      <div className="flex-1">
                        <p className="text-gray-900 font-semibold">{audit.action}</p>
                        <p className="text-gray-500 text-xs uppercase font-mono">Invoice #{audit.invoice_id ?? '—'}</p>
                        <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-600">
                          <p><span className="font-semibold text-gray-700">Changed By:</span> {audit.changed_by || '—'}</p>
                          <p><span className="font-semibold text-gray-700">Changed At:</span> {formatDateTime(audit.changed_at)}</p>
                          <p><span className="font-semibold text-gray-700">Old Value:</span> {audit.old_value || '—'}</p>
                          <p><span className="font-semibold text-gray-700">New Value:</span> {audit.new_value || '—'}</p>
                        </div>
                      </div>
                      <span className="text-gray-400 text-xs">ID: {audit.id}</span> 
                    </div>
                  ))}
                </div>
              </div>
            </section>
    );
}
export default Audit;