import { FiX, FiTrash2, FiUpload } from "react-icons/fi";
import { useEffect, useRef } from "react";

export default function FilePopup({
  show,
  uploadedFiles,
  selectedFile,
  setSelectedFile,
  onClose,
  onUpload,
  onDelete,
  fileInputRef,
  refreshFiles,
  onUploadClick,
}) {
  const popupRef = useRef(null);

  useEffect(() => {
    if (!show) return;
    function handleClickOutside(event) {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div
        ref={popupRef}
        className="bg-white w-full max-w-3xl rounded-xl shadow-lg p-6 relative"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Manage Data Sources
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800"
          >
            <FiX size={22} />
          </button>
        </div>

        {/* Body - Two column layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left - Upload Section */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <div
              className="border-2 border-dashed border-blue-300 rounded-md p-6 text-center cursor-pointer hover:bg-blue-100 transition"
              onClick={onUploadClick}
            >
              <FiUpload className="mx-auto text-blue-500 mb-2" size={28} />
              <p className="text-sm text-gray-600">
                Drop files here or click to upload (CSV, PDF)
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".doc,.docx,.txt,.pdf,.csv,.xls,.xlsx"
              onChange={(e) => setSelectedFile(e.target.files[0])}
              className="hidden"
            />

            {selectedFile && selectedFile.name && (
              <div className="mt-3">
                <p className="text-xs text-gray-600 mb-1">
                  Selected:{" "}
                  <span className="font-medium">{selectedFile.name}</span>
                </p>
                <button
                  onClick={async () => {
                    await onUpload();
                    setSelectedFile(null);
                    await refreshFiles();
                  }}
                  className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-xs"
                >
                  Upload
                </button>
              </div>
            )}
          </div>

          {/* Right - Uploaded Files */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <h3 className="font-medium text-gray-700 mb-2">Current sources</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {uploadedFiles && uploadedFiles.length > 0 ? (
                uploadedFiles.map((file, idx) => (
                  <div
                    key={file._id || idx}
                    className="flex justify-between items-center bg-white p-2 rounded-md border border-gray-200 shadow-sm"
                  >
                    <span className="text-sm text-gray-800 truncate">
                      {file.file_name}
                    </span>
                    <button
                      onClick={async () => {
                        await onDelete(file._id);
                        await refreshFiles();
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-gray-500 text-sm">No files uploaded.</div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end items-center gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm"
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
