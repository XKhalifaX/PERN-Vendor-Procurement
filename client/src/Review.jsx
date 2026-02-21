import { useNavigate } from "react-router-dom";

export default function ReviewPage() {
  const navigate = useNavigate();

  return (
    <div className="bg-slate-100 min-h-screen w-full flex flex-col items-center">
      <main className="w-full max-w-5xl p-6">
        <div className="mb-6 flex justify-end">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-6 py-4 flex items-center gap-4">
            <span className="text-gray-700">Return to main dashboard</span>
            <button
              className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
              onClick={() => navigate("/")}
            >
              Back to Dashboard
            </button>
          </div>
        </div>

        <div className="w-full">
          <header className="mb-8">
            <h2 className="text-3xl font-bold text-gray-800 tracking-tight">Review Invoice</h2>
            <p className="text-gray-500">Use the actions below to approve or deny this invoice.</p>
          </header>

          <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-700">Review Actions</h3>
            </div>

            <div className="p-6 flex items-center gap-4">
              <button
                type="button"
                className="inline-flex items-center rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors"
              >
                Approve
              </button>
              <button
                type="button"
                className="inline-flex items-center rounded-lg bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-rose-700 transition-colors"
              >
                Deny
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}