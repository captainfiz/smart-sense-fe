"use client";
import { useState, useRef, useEffect } from "react";
import axiosInstance from "@/utils/axiosInstance";
import useAuthRedirect from "@/hooks/useAuthRedirect";
import LogoutModal from "./LogoutModal";
import { useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import ChatInput from "./ChatInput";
import ChatMessages from "./ChatMessages";
import { useParams } from "next/navigation";
import Image from "next/image";
import FilePopup from "./FilePopup";

export default function ChatScreen() {
  useAuthRedirect();
  const [messages, setMessages] = useState([]);
  const [messageData, setMessageData] = useState([]);
  const [input, setInput] = useState("");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { checkpoint } = useParams();
  const [checkpointId, setCheckpointId] = useState(checkpoint);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [currentStreamingResponse, setCurrentStreamingResponse] = useState({
    type: "",
    value: "",
  });
  const [metadata, setMetadata] = useState([]);
  const [user, setUser] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const fullResponseRef = useRef({ value: "", type: "" });
  const [showFilePopup, setShowFilePopup] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState(null);
  const [selectedFile, setSelectedFile] = useState([]);
  const fileInputRef = useRef(null);

  const handleFileButtonClick = () => {
    setShowFilePopup((prev) => !prev);
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

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

  useEffect(() => {
    axiosInstance
      .get("/protected/info")
      .then((res) => setUser(res.data))
      .catch((err) => console.error(err));
    axiosInstance
      .get("/protected/uploads")
      .then((res) => {console.log(res.data);
       setUploadedFiles(res.data.files)})
      .catch((err) => console.error(err));
    axiosInstance
      .get("/protected/threads")
      .then((res) => setMetadata(res.data.result))
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    if (checkpointId) {
      // URL bar में change लेकिन बिना page reload या navigation
      window.history.replaceState(null, "", `/chat/${checkpointId}`);
      historyHandler(checkpointId);
    } else {
      // checkpointId खाली हो तो base /stream पर वापस जाएं
      window.history.replaceState(null, "", `/chat`);
    }
  }, [checkpointId]);

  const chatEndRef = useRef(null);
  const router = useRouter();

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading || isTyping) return;

    const userMessageText = input.trim();
    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        text: userMessageText,
        type: "content",
        thread_id: checkpointId,
      },
    ]);
    setMessageData((prev) => [
      ...prev,
      {
        role: "user",
        text: userMessageText,
        type: "content",
        thread_id: checkpointId,
      },
    ]);
    setInput("");
    setIsLoading(true);
    setIsTyping(false);
    setCurrentStreamingResponse({ type: "", value: "" });
    fullResponseRef.current = { value: "", type: "", checkpointId: "" };
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/protected/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify({
          input: userMessageText,
          checkpoint_id: checkpointId,
        }),
      });

      if (!res.body)
        throw new Error("Response body is null. SSE stream not available.");

      setIsLoading(false);
      setIsTyping(true);

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let partial = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        partial += decoder.decode(value, { stream: true });
        const lines = partial.split(/\r?\n/);
        partial = lines.pop();

        for (let line of lines) {
          line = line.trim();
          if (!line.startsWith("data:")) continue;

          while (line.startsWith("data:")) line = line.slice(5).trim();
          if (!line) continue;

          try {
            const parsedData = JSON.parse(line);
            if (parsedData.type === "content") {
              setCurrentStreamingResponse((prev) => {
                const newValue = prev.value + (parsedData.content || "");
                fullResponseRef.current = {
                  value: newValue,
                  type: parsedData.type,
                  checkpoint_id: parsedData.checkpoint_id,
                };
                return { type: parsedData.type, value: newValue };
              });
            } else if (parsedData.type === "checkpoint") {
              setCheckpointId(parsedData.checkpoint_id);
              parsedData.metavalue.title &&
                setMetadata([parsedData.metavalue, ...metadata]);
            } else if (parsedData.type === "end") {
              break;
            }
          } catch (e) {
            setCurrentStreamingResponse((prev) => {
              const newValue = prev.value + line;
              fullResponseRef.current.value = newValue;
              return { ...prev, value: newValue };
            });
          }
        }
      }

      if (fullResponseRef.current.value.trim()) {
        setMessages((prev) => [
          ...prev,
          {
            role: "model",
            text: fullResponseRef.current.value.trim(),
            type: fullResponseRef.current.type,
            thread_id: fullResponseRef.current.checkpoint_id,
          },
        ]);
        setMessageData((prev) => [
          ...prev,
          {
            role: "model",
            text: fullResponseRef.current.value.trim(),
            type: fullResponseRef.current.type,
            thread_id: fullResponseRef.current.checkpoint_id,
          },
        ]);
      }

      setCurrentStreamingResponse({ type: "", value: "" });
      setIsTyping(false);
      setIsLoading(false);
    } catch (error) {
      setCurrentStreamingResponse({ type: "", value: "" });
      setIsLoading(false);
      setIsTyping(false);
    }
  };
  const handleLogout = () => {
    localStorage.removeItem("access_token");
    router.replace("/");
    setShowLogoutModal(false);
  };

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const historyHandler = async (checkpointId) => {
    try {
      const result = messageData.filter(
        (val) => val.thread_id === checkpointId
      );
      if (result.length > 0) {
        setMessages(result);
      } else {
        const response = await axiosInstance.get(
          `/protected/chat-history/${checkpointId}`
        );
        setMessages(sortAndReverse(response.data.result));
        setMessageData([
          ...messageData,
          ...sortAndReverse(response.data.result),
        ]);
      }
    } catch (err) {
      console.error("Error fetching chat history:", err);
    }
  };

  const sessionHandler = async (checkpointId) => {
    if (!checkpointId) {
      setMessages([]);
    }
    setInput("");
    setCurrentStreamingResponse({
      type: "",
      value: "",
      checkpoint_id: checkpointId || "",
    });
    setCheckpointId(checkpointId);
    fullResponseRef.current = {
      value: "",
      type: "",
      checkpoint_id: checkpointId || "",
    };
  };

  const sortAndReverse = (data) => {
    return [...data]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .reverse();
  };
  return (
    <div className="flex h-screen text-white bg-white relative">
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

      <Sidebar
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        onLogout={() => setShowLogoutModal(true)}
        metadata={metadata}
        sessionHandler={sessionHandler}
        checkpointId={checkpointId}
        user={user}
        fileInputRef={fileInputRef}
        handleFileButtonClick={handleFileButtonClick}
      />

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex flex-col items-start">
            <h1 className="text-lg font-semibold text-gray-700">Smart Sense</h1>
            <p className="text-sm font-semibold text-gray-700">
              (Powered by Stormbreaker)
            </p>
          </div>

          <span className="flex items-center gap-2 text-xs text-zinc-500">
            <Image
              alt="Adglobal360"
              src="/logo.svg"
              width={50}
              height={50}
              priority
              className="invert"
            />
          </span>
        </div>
        <div className="w-[85%] mx-auto flex flex-col flex-1 gap-5">
          <ChatMessages
            messages={messages}
            chatEndRef={chatEndRef}
            isTyping={isTyping}
            currentStreamingResponse={currentStreamingResponse}
          />

          <ChatInput
            input={input}
            setInput={setInput}
            onSend={handleSendMessage}
            isLoading={isLoading}
            isTyping={isTyping}
          />
        </div>
      </main>
    </div>
  );
}
