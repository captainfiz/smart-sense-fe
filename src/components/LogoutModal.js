import { IoIosLogOut, IoMdClose } from "react-icons/io";

export default function LogoutModal({ show, onCancel, onLogout }) {
  if (!show) return null;
  return (
    <div
      className="absolute inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-xl p-4 w-full max-w-sm space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-zinc-800">
            Confirm Logout
          </h2>
          <button onClick={onCancel}>
            <IoMdClose
              size={30}
              className="cursor-pointer text-zinc-400 hover:text-zinc-600"
            />
          </button>
        </div>
        <p className="text-sm text-zinc-600">
          Are you sure you want to logout from Smart Sense?
        </p>
        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm rounded-lg border border-zinc-600 text-zinc-400 hover:bg-zinc-800 hover:text-white cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onLogout}
            className="px-4 py-2 text-sm rounded-lg bg-red-500 hover:bg-red-600 text-white flex items-center gap-2 flex-row cursor-pointer"
          >
            Logout <IoIosLogOut size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
