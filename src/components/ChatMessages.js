import Image from "next/image";
import ChartRender from "./Plotly";
import { ClockLoader } from "react-spinners";
import Markdown from "react-markdown";

function parseChartResponse(input) {
  const charts = [];
  let text = "";

  const regex = /```json\s*({[\s\S]*?})\s*```/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(input)) !== null) {
    // Text before JSON
    const textChunk = input.slice(lastIndex, match.index).trim();
    if (textChunk) {
      text += (text ? "\n\n" : "") + textChunk;
    }

    try {
      let jsonStr = match[1].trim();

      // fix for invalid escape sequences like \'
      jsonStr = jsonStr.replace(/\\'/g, "'");

      const chartData = JSON.parse(jsonStr);
      charts.push(chartData);
    } catch (e) {
      text += (text ? "\n\n" : "") + match[0].trim();
    }

    lastIndex = regex.lastIndex;
  }

  // Remaining text after last JSON
  const remainingText = input.slice(lastIndex).trim();
  if (remainingText) {
    text += (text ? "\n\n" : "") + remainingText;
  }

  return { text, charts };
}

// --- ChatMessages Component ---
export default function ChatMessages({
  messages,
  chatEndRef,
  isTyping,
  currentStreamingResponse,
}) {
  return (
    <div className="flex-1 relative overflow-y-auto p-6">
      {/* background watermark */}
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
          if (msg.role === "model") {
            const { text, charts } = parseChartResponse(msg.text);

            return (
              <div key={`model-${index}`} className="flex justify-start">
                <div className="max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-lg shadow-md bg-white text-gray-800 rounded-bl-none space-y-4">
                  {/* Multiple Charts */}
                  {charts.map((chart, cIndex) => (
                    <ChartRender
                      key={`chart-${index}-${cIndex}`}
                      index={index}
                      value={chart}
                    />
                  ))}

                  {/* Text */}
                  {text && (
                    <div className="prose prose-sm whitespace-pre-wrap">
                      <Markdown>{text}</Markdown>
                    </div>
                  )}
                </div>
              </div>
            );
          } else {
            return (
              <div key={`user-${index}`} className="flex justify-end">
                <div className="max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-lg shadow-md bg-blue-500 text-white rounded-br-none">
                  <div className="prose prose-sm whitespace-pre-wrap">
                    <Markdown>{msg.text}</Markdown>
                  </div>
                </div>
              </div>
            );
          }
        })}

        {/* Typing indicator */}
        {isTyping && !currentStreamingResponse?.value && (
          <div className="flex justify-start">
            <div className="max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-lg shadow-md bg-white text-gray-800 rounded-bl-none">
              <p className="animate-pulse">Thinking...</p>
            </div>
          </div>
        )}

        {/* Streaming response */}
        {currentStreamingResponse?.value && (
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
