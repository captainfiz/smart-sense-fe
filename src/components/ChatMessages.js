import Image from "next/image";
import ChartRender from "./Plotly";
import { ClockLoader } from "react-spinners";
import Markdown from "react-markdown";
import { FaRobot, FaUser } from "react-icons/fa"; // 👈 icons

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
    <div
      style={{
        WebkitMaskImage:
          "linear-gradient(to bottom, rgba(0,0,0,1) 85%, rgba(0,0,0,0) 100%)",
        WebkitMaskRepeat: "no-repeat",
        WebkitMaskSize: "100% 100%",
        maskImage:
          "linear-gradient(to bottom, rgba(0,0,0,1) 85%, rgba(0,0,0,0) 100%)",
        maskRepeat: "no-repeat",
        maskSize: "100% 100%",
      }}
      className="flex-1 relative overflow-y-auto p-4 h-[66vh] max-h-[66vh] overflow-auto scroll-smooth scrollbar-hide"
    >
      {/* background watermark */}
      {/* <div className="fixed inset-0 flex items-center justify-center opacity-10 pointer-events-none z-0">
        <Image
        src="/logo.svg"
        alt="Background Logo"
          width={300}
          height={300}
          className="select-none"
        />
      </div> */}

      <div className="relative z-10 space-y-4 pb-6">
        {messages.length > 0 ? (
          messages.map((msg, index) => {
            if (msg.role === "model") {
              const { text, charts } = parseChartResponse(msg.text);

              return (
                <div
                  key={`model-${index}`}
                  className="flex items-start justify-start gap-2"
                >
                  {/* Bot Icon */}
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <FaRobot className="text-gray-600" />
                  </div>

                  {/* Bot Message */}
                  <div className="max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-3xl shadow-sm bg-white text-gray-800 rounded-tl-none space-y-4">
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
                      <div className="prose prose-sm whitespace-pre-wrap max-w-xs md:max-w-md lg:max-w-lg truncate break-words">
                        <Markdown>{text}</Markdown>
                      </div>
                    )}
                  </div>
                </div>
              );
            } else {
              return (
                <div
                  key={`user-${index}`}
                  className="flex items-start justify-end gap-2"
                >
                  {/* User Message */}
                  <div className="max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-3xl shadow-sm bg-[#d7d9dd] text-zinc-800 rounded-tr-none">
                    <div className="prose prose-sm whitespace-pre-wrap">
                      <Markdown>{msg.text}</Markdown>
                    </div>
                  </div>

                  {/* User Icon */}
                  <div className="w-8 h-8 rounded-full bg-blue-400 flex items-center justify-center">
                    <FaUser className="text-white" />
                  </div>
                </div>
              );
            }
          })
        ) : (
          <div className="text-center text-4xl font-semibold text-zinc-400 mt-36">
            Start the conversation by typing a message below.
          </div>
        )}

        {/* Typing indicator */}
        {isTyping && !currentStreamingResponse?.value && (
          <div className="flex items-start justify-start gap-2">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
              <FaRobot className="text-gray-600" />
            </div>
            <div className="max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-3xl shadow-md bg-white text-gray-800 rounded-tl-none">
              <p className="animate-pulse">Thinking...</p>
            </div>
          </div>
        )}

        {/* Streaming response */}
        {currentStreamingResponse?.value && (
          <div className="flex items-start justify-start gap-2">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
              <FaRobot className="text-gray-600" />
            </div>
            <div className="max-w-xs md:max-w-md lg:max-w-lg px-4 py-5 rounded-3xl shadow-md bg-white text-gray-800 rounded-tl-none flex items-center space-x-3 min-h-[80px] animate-fadeIn">
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
        {/* <div
          className="pointer-events-none absolute bottom-0 left-0 w-full h-20 
                  bg-gradient-to-t from-white to-transparent"
        /> */}
      </div>
    </div>
  );
}
