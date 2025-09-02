import { FiXCircle } from "react-icons/fi";
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
    <div
      ref={popupRef}
      className="absolute bottom-16 right-20 bg-zinc-900 border border-zinc-700 rounded-lg shadow-lg p-4 z-50 min-w-[280px]"
    >
      <div className="mb-2 font-semibold text-zinc-200">Uploaded Files:</div>
      <div className="mb-3 max-h-32 overflow-y-auto">
        {uploadedFiles && uploadedFiles.length > 0 ? (
          <ul className="text-zinc-300 text-xs space-y-1">
            {uploadedFiles.map((file, idx) => (
              <li
                key={file._id || idx}
                className="flex justify-between items-center"
              >
                <span>{file.filename}</span>
                <FiXCircle
                  size={24}
                  className="text-red-400 cursor-pointer"
                  onClick={async () => {
                    await onDelete(file._id);
                    await refreshFiles();
                  }}
                />
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-zinc-400 text-xs">No files uploaded.</div>
        )}
      </div>
      <button
        onClick={onUploadClick}
        className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs mb-2"
      >
        Upload File
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".doc,.docx,.txt,.pdf,.csv,.xls,.xlsx"
        onChange={(e) => setSelectedFile(e.target.files[0])}
        className="hidden"
      />
      {selectedFile && selectedFile.name && (
        <div className="mt-2">
          <div className="text-zinc-400 text-xs mb-2">
            Selected: <span className="text-zinc-200">{selectedFile.name}</span>
          </div>
          <button
            onClick={async () => {
              await onUpload();
              setSelectedFile(null);
              await refreshFiles();
            }}
            className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-xs mr-2"
          >
            Upload
          </button>
        </div>
      )}
      {/* <button
        onClick={onClose}
        className="px-2 py-1 text-zinc-400 hover:text-white text-xs mt-2"
      >
        Close
      </button> */}
    </div>
  );
}
