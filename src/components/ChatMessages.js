import Image from "next/image";
import ChartRender from "./Plotly";

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
export default function ChatMessages({
  messages,
  chatEndRef,
  isTyping,
  currentStreamingResponse,
}) {
  return (
    <div className="flex-1 relative overflow-y-auto p-6">
      <div className="fixed inset-0 flex items-center justify-center opacity-10 pointer-events-none z-0">
        <Image
          src="/loader.png"
          alt="Background Logo"
          width={300}
          height={300}
          className="select-none"
        />
      </div>
      <div className="relative z-10 space-y-4">
        {messages.map((msg, index) => {
          console.log("msg", msg);
          if (msg.role == "model") {
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
        <div ref={chatEndRef} />
      </div>
    </div>
  );
}
