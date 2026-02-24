// Navbar.jsx
function Navbar({ role, setRole }) {
  return (
    <div className="mb-6 flex justify-end">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-6 py-4 flex items-center gap-4">
        <span className="text-gray-700">
          Current Role: <strong>{role}</strong>
        </span>
        <button
          className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
          onClick={() => setRole(role === 'VENDOR' ? 'ADMIN' : 'VENDOR')}
        >
          Switch to {role === 'VENDOR' ? 'Admin' : 'Vendor'}
        </button>
      </div>
    </div>
  );
}

export default Navbar;