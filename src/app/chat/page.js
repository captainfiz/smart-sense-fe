"use client";
import { useState, useRef, useEffect } from "react";
import axiosInstance from "@/utils/axiosInstance";
import LogoutModal from "@/app/chat/components/LogoutModal";
import FilePopup from "./components/FilePopup";
import { useRouter } from "next/navigation";
import Sidebar from "./components/Sidebar";
import ChatInput from "./components/ChatInput";
import ChatMessages from "./components/ChatMessages";
import useAuthRedirect from "@/hooks/useAuthRedirect";

export default function ChatScreen() {
  useAuthRedirect();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [showFilePopup, setShowFilePopup] = useState(false);
  const [selectedFile, setSelectedFile] = useState([]);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    axiosInstance
      .get("/protected/info")
      .then((res) => setUser(res.data))
      .catch((err) => console.error(err));

    axiosInstance
      .get("/protected/uploads")
      .then((res) => setUploadedFiles(res.data.files))
      .catch((err) => console.error(err));
  }, []);

  const fileInputRef = useRef(null);
  const chatEndRef = useRef(null);
  const router = useRouter();

  const handleFileButtonClick = () => {
    setShowFilePopup((prev) => !prev);
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

const handleSend = () => {
  if (!input.trim()) return;

  const userMessage = { role: "user", text: input };
  const placeholderMessage = { role: "gpt", text: "..." };

  setMessages((prev) => [...prev, userMessage, placeholderMessage]);
  sendMessage(input);
  setInput("");
};


  const sendMessage = async (inputText) => {
    try {
      const res = await axiosInstance.post("/protected/chat", {
        input: inputText,
      });

      const result = res.data.result || [];

      // Filter AI responses (could also include user messages echoed back)
      const aiResponses = result.filter((r) => r.type === "ai");

      if (aiResponses.length > 0) {
        const aiMessage = {
          role: "gpt",
          text: aiResponses.map((msg) => msg.content).join("\n\n"),
        };
        setMessages((prev) => {
          const withoutLast = prev.slice(0, -1); // remove last placeholder
          return [...withoutLast, aiMessage];
        });
      }
    } catch (error) {
      console.log("Error sending message:", error);
    }
  };

  const handleLogout = () => {
    console.log("Logged out!");
    localStorage.removeItem("access_token");
    router.replace("/");
    setShowLogoutModal(false);
  };

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const deleteFile = async (id) => {
    try {
      const res = await axiosInstance.delete(`/protected/upload/${id}`);
      console.log("file deleted successfully");
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return console.log("Please select a file first.");

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const res = await axiosInstance.post("/protected/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("File uploaded successfully");
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  return (
    <div className="flex h-screen bg-zinc-900 text-white relative">
      {/* Logout Modal */}

      <LogoutModal
        show={showLogoutModal}
        onCancel={() => setShowLogoutModal(false)}
        onLogout={handleLogout}
      />

      <FilePopup
        show={showFilePopup}
        uploadedFiles={uploadedFiles}
        selectedFile={selectedFile}
        setSelectedFile={setSelectedFile}
        onClose={() => setShowFilePopup(false)}
        onUpload={handleUpload}
        onDelete={deleteFile}
        fileInputRef={fileInputRef}
        refreshFiles={async () => {
          const res = await axiosInstance.get("/protected/uploads");
          setUploadedFiles(res.data.files);
        }}
        onUploadClick={handleUploadClick}
      />

      <Sidebar onLogout={() => setShowLogoutModal(true)} />

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-zinc-800 bg-zinc-950 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-green-400">
            Smart Sense AI Agent
          </h1>
          <span className="text-xs text-zinc-500">
            ADGLOBAL360 | STROMBREAKER
          </span>
        </div>

        <ChatMessages messages={messages} chatEndRef={chatEndRef} />

        <ChatInput
          input={input}
          setInput={setInput}
          onSend={handleSend}
          onFileButtonClick={handleFileButtonClick}
        />
      </main>
    </div>
  );
}
