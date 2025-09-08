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
import ProjectSwitcher from "./ProjectSwitcher";
import useProjects from "@/hooks/useProjects";
import LightningLoader from "./LightningLoader";

export default function ChatScreen() {
  useAuthRedirect();
  const [messages, setMessages] = useState([]);
  const [messageData, setMessageData] = useState([]);
  const [input, setInput] = useState("");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
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
  const [showProjectSwitcher, setShowProjectSwitcher] = useState(false);
  const [projectId, setProjectId] = useState("");
  const router = useRouter();
  const { checkpoint: paramCheckpoint } = useParams();
  const [checkpointId, setCheckpointId] = useState("");
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    if (!paramCheckpoint || paramCheckpoint.length === 0) {
      router.push("/projects");
      return;
    }

    if (paramCheckpoint?.length === 2) {
      const [newProjectId, newCheckpointId] = paramCheckpoint;
      setProjectId(newProjectId);
      setCheckpointId(newCheckpointId);
    } else if (paramCheckpoint?.length === 1) {
      const [newProjectId] = paramCheckpoint;
      setProjectId(newProjectId);
      setCheckpointId("");
    } else {
      router.push("/projects");
    }
  }, [paramCheckpoint]);

  console.log("paramCheckpoint", paramCheckpoint);

  const {
    projects,
    currentProject,
    isLoading: projectsLoading,
    switchProject,
  } = useProjects();

  const handleFileButtonClick = () => {
    setShowFilePopup((prev) => !prev);
  };

  const handleProjectSwitchClick = () => {
    setShowProjectSwitcher(true);
  };

  const handleProjectChange = (project) => {
    switchProject(project);

    // Get project ID and update state
    const newProjectId = project._id;
    if (newProjectId) {
      setProjectId(newProjectId);
    }

    setMessages([]);
    setMessageData([]);
    setCheckpointId("");

    // Update URL to reflect new project
    if (newProjectId) {
      window.history.replaceState(null, "", `/chat/${newProjectId}`);
    }
  };

  useEffect(() => {
    axiosInstance
      .get("/protected/info")
      .then((res) => setUser(res.data))
      .catch((err) => console.error(err));
    // axiosInstance
    //   .get("/protected/uploads")
    //   .then((res) => {console.log(res.data);
    //    setUploadedFiles(res.data.files)})
    //   .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    if (projectId) {
      axiosInstance
        .get(`/protected/threads/${projectId}`)
        .then((res) => setMetadata(res.data.result))
        .catch((err) => console.error(err));
      axiosInstance
        .get(`/protected/project/${projectId}`)
        .then((res) =>
          setMetadata(Array.isArray(res.data.result) ? res.data.result : [])
        )
        .catch((err) => console.error(err));
    }
  }, [projectId]);

  useEffect(() => {
    if (checkpointId) {
      historyHandler(checkpointId);
      setCheckpointId(checkpointId);
    }
  }, [checkpointId]);

  const chatEndRef = useRef(null);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading || isTyping) return;

    const userMessageText = input.trim();
    const currentCheckpointId =
      fullResponseRef.current.checkpoint_id || checkpointId;

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        text: userMessageText,
        type: "content",
        thread_id: currentCheckpointId,
      },
    ]);
    setMessageData((prev) => [
      ...prev,
      {
        role: "user",
        text: userMessageText,
        type: "content",
        thread_id: currentCheckpointId,
      },
    ]);
    setInput("");
    setIsLoading(true);
    setIsTyping(false);
    setCurrentStreamingResponse({ type: "", value: "" });

    // Reset fullResponseRef but preserve the checkpoint ID
    fullResponseRef.current = {
      value: "",
      type: "",
      checkpoint_id: currentCheckpointId,
    };

    const requestPayload = {
      input: userMessageText,
      checkpoint_id: currentCheckpointId,
      project_id: projectId,
    };

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/protected/chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "text/event-stream",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
          body: JSON.stringify(requestPayload),
        }
      );

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
          if (!line) continue;

          // Handle different line formats - some may have "data:" prefix, some may not
          let jsonData = line;
          if (line.startsWith("data:")) {
            jsonData = line.slice(5).trim();
          }

          if (!jsonData) continue;

          try {
            const parsedData = JSON.parse(jsonData);
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
              const newCheckpointId = parsedData.checkpoint_id;

              if (newCheckpointId !== checkpointId) {
                setCheckpointId(newCheckpointId);
                fullResponseRef.current.checkpoint_id = newCheckpointId;

                if (projectId && newCheckpointId) {
                  const newUrl = `/chat/${projectId}/${newCheckpointId}`;
                  window.history.replaceState(null, "", newUrl);
                }
              } else {
                fullResponseRef.current.checkpoint_id = newCheckpointId;
              }

              // Update metadata
              if (parsedData.metavalue && parsedData.metavalue.title) {
                setMetadata((prev) => [
                  parsedData.metavalue,
                  ...(Array.isArray(prev) ? prev : []),
                ]);
              }
            } else if (parsedData.type === "end") {
              break;
            }
          } catch (e) {
            if (
              jsonData.includes('"type":"checkpoint"') ||
              jsonData.includes("checkpoint_id")
            ) {
              try {
                const checkpointMatch = jsonData.match(
                  /"checkpoint_id":\s*"([^"]+)"/
                );
                if (checkpointMatch && checkpointMatch[1]) {
                  const extractedCheckpointId = checkpointMatch[1];
                  setCheckpointId(extractedCheckpointId);

                  if (projectId && extractedCheckpointId) {
                    const newUrl = `/chat/${projectId}/${extractedCheckpointId}`;
                    window.history.replaceState(null, "", newUrl);
                  }
                }
              } catch (manualParseError) {
                // Silent fallback
              }
            } else {
              setCurrentStreamingResponse((prev) => {
                const newValue = prev.value + jsonData;
                fullResponseRef.current.value = newValue;
                return { ...prev, value: newValue };
              });
            }
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
      setHistoryLoading(true);
      const result = messageData.filter((val) => val.thread_id == checkpointId);
      if (result.length > 0) {
        setMessages(result);
      } else {
        const response = await axiosInstance.get(
          `/protected/chat-history/${checkpointId}`
        );
        const sortedResult = sortAndReverse(response.data.result);
        setMessages(sortedResult);
        setMessageData((prev) => [
          ...(Array.isArray(prev) ? prev : []),
          ...sortedResult,
        ]);
      }
    } catch (err) {
      console.error("Error fetching chat history:", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const sessionHandler = async (checkpointId) => {
    if (!checkpointId) {
      setMessages([]);
      if (projectId) {
        const newUrl = `/chat/${projectId}`;
        window.history.replaceState(null, "", newUrl);
      }
    } else {
      historyHandler(checkpointId);
      if (projectId && checkpointId) {
        const newUrl = `/chat/${projectId}/${checkpointId}`;
        window.history.replaceState(null, "", newUrl);
      }
    }
    setInput("");
    setCheckpointId(checkpointId);
    setCurrentStreamingResponse({
      type: "",
      value: "",
      checkpoint_id: checkpointId || "",
    });
    fullResponseRef.current = {
      value: "",
      type: "",
      checkpoint_id: checkpointId || "",
    };
  };

  const sortAndReverse = (data) => {
    if (!Array.isArray(data)) {
      console.warn("sortAndReverse received non-array data:", data);
      return [];
    }
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

      {/* <FilePopup
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
      /> */}

      <ProjectSwitcher
        show={showProjectSwitcher}
        onClose={() => setShowProjectSwitcher(false)}
        projects={projects}
        currentProject={currentProject}
        onProjectChange={handleProjectChange}
        isLoading={projectsLoading}
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
        onProjectSwitchClick={handleProjectSwitchClick}
      />

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex flex-col items-start">
            {/* <div className="flex items-center gap-3">
              <h1 className="text-lg font-semibold text-gray-700">
                Smart Sense
              </h1>
              <div className="flex gap-2">
                {projectId && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                    Project: {projectId}
                  </span>
                )}
                {checkpointId && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                    Session: {checkpointId.slice(0, 8)}...
                  </span>
                )}
              </div>
            </div> */}
            {/* <p className="text-sm font-semibold text-gray-700">
              (Powered by Stormbreaker)
            </p> */}
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
        <div className="w-[85%] mx-auto flex flex-col flex-1 gap-5 ">
          {historyLoading ? (
            <div className="flex items-center justify-center py-8 h-[66vh] max-h-[66vh]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-3 text-gray-600">Loading...</span>
            </div>
          ) : (
            <ChatMessages
              messages={messages}
              chatEndRef={chatEndRef}
              isTyping={isTyping}
              currentStreamingResponse={currentStreamingResponse}
            />
          )}

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
