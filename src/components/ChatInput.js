import { LuSendHorizontal } from "react-icons/lu";
import { FaCircleStop } from "react-icons/fa6";
export default function ChatInput({
  input,
  setInput,
  onSend,
  isTyping,
  isLoading,
}) {
  return (
    <div className="p-4 border rounded-3xl border-gray-400 flex items-center gap-3">
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
