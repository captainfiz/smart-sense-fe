"use client";
import { LuSendHorizontal } from "react-icons/lu";
import { FaCircleStop } from "react-icons/fa6";
import { FaMicrophone, FaMicrophoneSlash } from "react-icons/fa";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { useEffect } from "react";

export default function ChatInput({
  input,
  setInput,
  onSend,
  isTyping,
  isLoading,
}) {
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  // Sync transcript to input
  useEffect(() => {
    if (transcript) {
      setInput(transcript);
    }
  }, [transcript, setInput]);

  const handleMicClick = () => {
    if (listening) {
      SpeechRecognition.stopListening();
    } else {
      resetTranscript();
      SpeechRecognition.startListening({ continuous: true, language: "en-US" });
    }
  };

  if (!browserSupportsSpeechRecognition) {
    console.warn("Speech recognition is not supported in this browser.");
  }

  return (
    <div className="p-4 border rounded-3xl border-gray-400 flex items-center gap-3 ">
      {/* Input field */}
      <input
        type="text"
        placeholder="Talk to Smart Sense"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        disabled={isLoading || isTyping}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            onSend(e);
          }
        }}
        className="flex-1 p-3 rounded-full placeholder-zinc-500 focus:outline-none text-zinc-800"
      />

      {/* Mic button */}
      <button
        onClick={handleMicClick}
        className={`rounded-full p-3 transition cursor-pointer ${
          listening ? "bg-red-500 text-white" : "bg-[#f0f4f9] hover:bg-[#dadde1] text-zinc-800"
        }`}
        disabled={isLoading || isTyping}
      >
        {listening ? <FaMicrophoneSlash size={20} /> : <FaMicrophone size={20} />}
      </button>

      {/* Send / Stop button */}
      <button
        onClick={onSend}
        className="bg-[#f0f4f9] hover:bg-[#dadde1] text-zinc-800 rounded-full p-3 transition cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
        disabled={isLoading || isTyping}
      >
        {isLoading || isTyping ? (
          <FaCircleStop size={24} />
        ) : (
          <LuSendHorizontal size={24} />
        )}
      </button>
    </div>
  );
}
