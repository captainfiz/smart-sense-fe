import React, { useState, useEffect, useRef } from "react";
import Plotly from "./Plotly";

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentStreamingResponse, setCurrentStreamingResponse] = useState({
    type: "",
    value: "",
  });
  const [checkpointId, setCheckpointId] = useState("");
  const messagesEndRef = useRef(null);
  const fullResponseRef = useRef({ value: "", type: "" }); // ✅ Fixed

  // Auto-scroll when new messages or streaming completes
  useEffect(() => {
    const el = messagesEndRef.current;
    if (!el) return;

    const scrollable = el.parentNode;
    const isNearBottom =
      scrollable.scrollHeight - scrollable.scrollTop - scrollable.clientHeight <
      100;

    if (
      isNearBottom ||
      (messages.length > 0 && !currentStreamingResponse.value)
    ) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, currentStreamingResponse.value]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading || currentStreamingResponse.value) return;

    const userMessage = { role: "user", text: input.trim(), type: "content" };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setCurrentStreamingResponse({ type: "", value: "" });
    fullResponseRef.current = { value: "", type: "" };

    try {
      const res = await fetch("http://localhost:8000/protected/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify({
          input: userMessage.text,
          checkpoint_id: checkpointId,
        }),
      });

      if (!res.body)
        throw new Error("Response body is null. SSE stream not available.");

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

            if (["content", "graph"].includes(parsedData.type)) {
              setCurrentStreamingResponse((prev) => {
                const newValue = prev.value + parsedData.content;
                fullResponseRef.current = {
                  value: newValue,
                  type: parsedData.type,
                };
                return { type: parsedData.type, value: newValue };
              });
            } else if (parsedData.type === "checkpoint") {
              setCheckpointId(parsedData.checkpoint_id);
            } else if (parsedData.type === "end") {
              break;
            }
          } catch (e) {
            // Handle parse error: fallback to raw streaming text
            setCurrentStreamingResponse((prev) => {
              const newValue = prev.value + line;
              fullResponseRef.current.value = newValue;
              return { ...prev, value: newValue };
            });
          }
        }
      }

      // Push final response
      if (fullResponseRef.current.value.trim()) {
        setMessages((prev) => [
          ...prev,
          {
            role: "model",
            text: fullResponseRef.current.value.trim(),
            type: fullResponseRef.current.type,
          },
        ]);
      }

      setCurrentStreamingResponse({ type: "", value: "" });
      setIsLoading(false);
    } catch (error) {
      console.error("Streaming error:", error);
      setMessages((prev) => [
        ...prev,
        { role: "model", text: `Error: ${error.message}`, type: "text" },
      ]);
      setCurrentStreamingResponse({ type: "", value: "" });
      setIsLoading(false);
    }
  };
  console.log("currentStreamingResponse :>> ", currentStreamingResponse);
  console.log("message :>> ", messages);

  return (
    <div className="flex flex-col h-screen bg-gray-100 font-inter antialiased">
      {/* Header */}
      <div className="bg-blue-600 p-4 shadow-md text-white text-center rounded-b-lg">
        <h1 className="text-2xl font-bold">AI Chatbot</h1>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 &&
          !isLoading &&
          !currentStreamingResponse.value && (
            <div className="text-center text-gray-500 mt-10">
              Start a conversation! Type your message below.
            </div>
          )}

        {messages.map((msg, index) => {
          if (msg.type === "content") {
            return (
              <div
                key={index}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-lg shadow-md ${
                    msg.role === "user"
                      ? "bg-blue-500 text-white rounded-br-none"
                      : "bg-white text-gray-800 rounded-bl-none"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            );
          } else {
            return (
              <div key={index}>
                <Plotly
                  index={index}
                  length={messages.length}
                  currentSet={currentStreamingResponse}
                  value={msg}
                />
              </div>
            );
          }
        })}

        {isLoading && !currentStreamingResponse.value && (
          <div className="flex justify-start">
            <div className="max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-lg shadow-md bg-white text-gray-800 rounded-bl-none">
              <p className="animate-pulse">Thinking...</p>
            </div>
          </div>
        )}

        {currentStreamingResponse.type === "content" && (
          <div className="flex justify-start">
            <div className="max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-lg shadow-md bg-white text-gray-800 rounded-bl-none">
              <p className="whitespace-pre-wrap">
                {currentStreamingResponse.value}
                <span className="animate-blink">|</span>
              </p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSendMessage}
        className="p-4 bg-white shadow-lg rounded-t-lg flex items-center"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 p-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
          disabled={isLoading || currentStreamingResponse.value}
        />
        <button
          type="submit"
          className="ml-3 px-6 py-3 bg-blue-600 text-white font-semibold rounded-full shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 ease-in-out"
          disabled={
            isLoading || currentStreamingResponse.value || !input.trim()
          }
        >
          Send
        </button>
      </form>

      <style>
        {`
          @keyframes blink {
            50% { opacity: 0; }
          }
          .animate-blink {
            animation: blink 1s step-end infinite;
          }
        `}
      </style>
    </div>
  );
}

export default App;
