"use client";

import axiosInstance from "@/utils/axiosInstance";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState(null);

  useEffect(() => {
    axiosInstance
      .get("/protected/info")
      .then((res) => setData(res.data))
      .catch((err) => console.error(err));

    axiosInstance
      .get("/protected/uploads")
      .then((res) => setUploadedFiles(res.data.files))
      .catch((err) => console.error(err));
  }, []);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) return alert("Please select a file first.");

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const res = await axiosInstance.post("/protected/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      alert("File uploaded successfully");
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed");
    }
  };

  const deleteFile = async (id) => {
    try {
      const res = await axiosInstance.delete(`/protected/upload/${id}`);
      alert("file deleted successfully");
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed");
    }
  };

  return (
    <div style={{ padding: 40 }}>
      <h2>Dashboard</h2>
      {data ? <pre>{JSON.stringify(data, null, 2)}</pre> : "Loading..."}

      <div style={{ marginTop: 20 }}>
        <input
          type="file"
          accept=".doc,.docx,.txt,.pdf,.csv,.xls,.xlsx"
          onChange={handleFileChange}
        />
        <button onClick={handleUpload} style={{ marginLeft: 10 }}>
          Upload
        </button>
      </div>
      <br />
      <strong>Uploaded Files:</strong>
      {uploadedFiles?.map((file, index) => {
        return (
          <div key={index}>
            {file.filename} -{" "}
            <span
              className="cursor-pointer"
              onClick={() => deleteFile(file._id)}
            >
              Delete
            </span>
          </div>
        );
      })}
    </div>
  );
}
