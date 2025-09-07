"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import ChartRender from "./Plotly";
import { ClockLoader } from "react-spinners";
import { useParams } from "next/navigation";

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [currentStreamingResponse, setCurrentStreamingResponse] = useState({
    type: "",
    value: "",
  });
  const { checkpoint } = useParams();
  const [checkpointId, setCheckpointId] = useState(checkpoint);
  const messagesEndRef = useRef(null);
  const fullResponseRef = useRef({ value: "", type: "" });

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentStreamingResponse.value, scrollToBottom]);

  useEffect(() => {
    if (checkpointId) {
      // URL bar में change लेकिन बिना page reload या navigation
      window.history.replaceState(null, "", `/stream/${checkpointId}`);
    } else {
      // checkpointId खाली हो तो base /stream पर वापस जाएं
      window.history.replaceState(null, "", `/stream`);
    }
  }, [checkpointId]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading || isTyping) return;

    const userMessageText = input.trim();
    setMessages((prev) => [
      ...prev,
      { role: "user", text: userMessageText, type: "content" },
    ]);
    setInput("");
    setIsLoading(true);
    setIsTyping(false);
    setCurrentStreamingResponse({ type: "", value: "" });
    fullResponseRef.current = { value: "", type: "" };

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
                };
                return { type: parsedData.type, value: newValue };
              });
            } else if (parsedData.type === "checkpoint") {
              setCheckpointId(parsedData.checkpoint_id);
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
          },
        ]);
      }

      setCurrentStreamingResponse({ type: "", value: "" });
      setIsTyping(false);
      setIsLoading(false);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          text: `Error: ${error.message}. Please try again.`,
          type: "content",
        },
      ]);
      setCurrentStreamingResponse({ type: "", value: "" });
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  function parseChartResponse(input) {
    const blocks = [];
    const regex = /```json\s*([\s\S]*?)\s*```/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(input)) !== null) {
      const textChunk = input.slice(lastIndex, match.index).trim();
      if (textChunk) {
        blocks.push({ type: "text", body: textChunk });
      }

      try {
        const chartData = JSON.parse(match[1]);
        blocks.push({ type: "graph", data: chartData });
      } catch (e) {
        blocks.push({ type: "text", body: match[0].trim() });
      }

      lastIndex = regex.lastIndex;
    }

    const remainingText = input.slice(lastIndex).trim();
    if (remainingText) {
      blocks.push({ type: "text", body: remainingText });
    }

    return blocks;
  }
  console.log("isLoading :>> ", isLoading);
  console.log("currentStreamingResponse :>> ", currentStreamingResponse);
  return (
    <div className="flex flex-col h-screen bg-gray-100 font-inter antialiased">
      <div className="bg-blue-600 p-4 shadow-md text-white text-center rounded-b-lg">
        <h1 className="text-2xl font-bold">Smart sense AGL (Chetak)</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.map((msg, index) => {
          if (msg.role === "model" && msg.type === "content") {
            return parseChartResponse(msg.text).map((block, i) => (
              <div key={`block-${index}-${i}`} className="flex justify-start">
                <div className="max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-lg shadow-md bg-white text-gray-800 rounded-bl-none">
                  {block.type === "graph" ? (
                    <ChartRender index={index} value={block.data} />
                  ) : (
                    <p>{block.body}</p>
                  )}
                </div>
              </div>
            ));
          } else {
            return (
              <div key={`user-${index}`} className="flex justify-end">
                <div className="max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-lg shadow-md bg-blue-500 text-white rounded-br-none">
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            );
          }
        })}

        {isTyping && !currentStreamingResponse.value && (
          <div className="flex justify-start">
            <div className="max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-lg shadow-md bg-white text-gray-800 rounded-bl-none">
              <p className="animate-pulse">Thinking...</p>
            </div>
          </div>
        )}

        {!currentStreamingResponse.type === "content" && (
          <div className="flex justify-start">
            <div className="max-w-xs md:max-w-md lg:max-w-lg px-4 py-5 rounded-lg shadow-md bg-white text-gray-800 rounded-bl-none flex items-center space-x-3 min-h-[80px] animate-fadeIn">
              {/```(?:json)?/.test(currentStreamingResponse.value) ? (
                <>
                  <ClockLoader size={42} color="#3b82f6" />
                  <span className="text-sm font-medium text-gray-700">
                    Generating chart...
                  </span>
                </>
              ) : (
                <p className="whitespace-pre-wrap text-sm font-medium">
                  {currentStreamingResponse.value}
                  <span className="animate-blink">|</span>
                </p>
              )}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

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
          disabled={isLoading || isTyping}
        />
        <button
          type="submit"
          className="ml-3 px-6 py-3 bg-blue-600 text-white font-semibold rounded-full shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 ease-in-out"
          disabled={isLoading || isTyping || !input.trim()}
        >
          Send
        </button>
      </form>

      <style jsx>{`
        @keyframes blink {
          50% {
            opacity: 0;
          }
        }
        .animate-blink {
          animation: blink 1s step-end infinite;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.97);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out forwards;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
      `}</style>
    </div>
  );
}

export default App;
