import { X } from "lucide-react";

export default function LogoutModal({ show, onCancel, onLogout }) {
  if (!show) return null;
  return (
    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-zinc-950 border border-zinc-700 rounded-xl p-6 w-full max-w-sm space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-white">Confirm Logout</h2>
          <button onClick={onCancel}>
            <X className="text-zinc-400 hover:text-white w-5 h-5" />
          </button>
        </div>
        <p className="text-sm text-zinc-400">
          Are you sure you want to logout from Smart Sense?
        </p>
        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm rounded-lg border border-zinc-600 text-zinc-300 hover:bg-zinc-800"
          >
            Cancel
          </button>
          <button
            onClick={onLogout}
            className="px-4 py-2 text-sm rounded-lg bg-red-500 hover:bg-red-600 text-white"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}