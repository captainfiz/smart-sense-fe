import React, { useState, useEffect, useRef } from "react";

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentStreamingResponse, setCurrentStreamingResponse] = useState("");
  const [checkpointId, setCheckpointId] = useState(""); // New state for checkpoint ID
  const messagesEndRef = useRef(null);
  const fullResponseRef = useRef(""); // Ref to accumulate full streamed response
  // Auto-scroll on new messages or when streaming completes
  useEffect(() => {
    const el = messagesEndRef.current;
    if (!el) return;

    const scrollable = el.parentNode;

    // Only scroll to bottom if the user is already near the bottom
    // or if a new *completed* message has been added (not during active streaming)
    const isNearBottom =
      scrollable.scrollHeight - scrollable.scrollTop - scrollable.clientHeight <
      100;

    // Scroll if a new message is added OR if the streaming response has just finished (currentStreamingResponse is empty but a new message was added)
    if (isNearBottom || (messages.length > 0 && !currentStreamingResponse)) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, currentStreamingResponse]); // Keep currentStreamingResponse here to trigger scroll when it *starts* but don't force scroll continuously based on it.

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!input.trim() || isLoading || currentStreamingResponse) {
      return;
    }

    const userMessage = { role: "user", text: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setCurrentStreamingResponse("");
    fullResponseRef.current = ""; // Reset full response accumulator

    try {
      const res = await fetch("http://localhost:8000/protected/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        // --- IMPORTANT: Send checkpointId for conversation history ---
        body: JSON.stringify({ input: userMessage.text, checkpoint_id: checkpointId }),
      });

      if (!res.body) {
        throw new Error("Response body is null. SSE stream not available.");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let partial = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        partial += decoder.decode(value, { stream: true });

        const lines = partial.split(/\r?\n/);
        partial = lines.pop(); // Keep the last, possibly incomplete line, for the next chunk

        for (let i = 0; i < lines.length; i++) {
          let line = lines[i].trim();

          if (!line) continue;
          if (!line.startsWith("data:")) continue;

          while (line.startsWith("data:")) {
            line = line.slice(5).trim();
          }

          if (!line) continue;

          try {
            const parsedData = JSON.parse(line);
            if (parsedData.type === "content") {
              setCurrentStreamingResponse((prev) => {
                const newResponse = prev + parsedData.content;
                fullResponseRef.current = newResponse;
                return newResponse;
              });
            } else if (parsedData.type === "checkpoint") {
              // --- IMPORTANT: Store the new checkpoint ID ---
              setCheckpointId(parsedData.checkpoint_id);
            }
            else if (parsedData.type === "end") {
              reader.cancel();
              break;
            }
          } catch (e) {
            // If the line is not valid JSON, treat it as plain text content
            setCurrentStreamingResponse((prev) => {
              const newResponse = prev + line;
              fullResponseRef.current = newResponse;
              return newResponse;
            });
          }
        }
      }

      // Add full streamed response to messages
      if (fullResponseRef.current.trim()) {
        setMessages((prev) => [
          ...prev,
          { role: "model", text: fullResponseRef.current.trim() },
        ]);
      }
      setCurrentStreamingResponse("");
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching SSE response:", error);
      setMessages((prev) => [
        ...prev,
        { role: "model", text: `Error: ${error.message}` },
      ]);
      setCurrentStreamingResponse("");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 font-inter antialiased">
      {/* Header */}
      <div className="bg-blue-600 p-4 shadow-md text-white text-center rounded-b-lg">
        <h1 className="text-2xl font-bold">AI Chatbot</h1>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !isLoading && !currentStreamingResponse && (
          <div className="text-center text-gray-500 mt-10">
            Start a conversation! Type your message below.
          </div>
        )}
        {messages.map((msg, index) => (
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
        ))}

        {isLoading && !currentStreamingResponse && (
          <div className="flex justify-start">
            <div className="max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-lg shadow-md bg-white text-gray-800 rounded-bl-none">
              <p className="animate-pulse">Waiting for response...</p>
            </div>
          </div>
        )}

        {currentStreamingResponse && (
          <div className="flex justify-start">
            <div className="max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-lg shadow-md bg-white text-gray-800 rounded-bl-none">
              <p className="whitespace-pre-wrap">
                {currentStreamingResponse}
                <span className="animate-blink">|</span>
              </p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
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
          disabled={isLoading || currentStreamingResponse}
        />
        <button
          type="submit"
          className="ml-3 px-6 py-3 bg-blue-600 text-white font-semibold rounded-full shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 ease-in-out"
          disabled={isLoading || currentStreamingResponse || !input.trim()}
        >
          Send
        </button>
      </form>

      {/* Blink cursor style */}
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