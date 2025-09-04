import { LuSendHorizontal } from "react-icons/lu";
import { FaCircleStop } from "react-icons/fa6";
export default function ChatInput({
  input,
  setInput,
  onSend,
  isTyping,
  isLoading
}) {
  return (
    <div className="p-4 border-t border-zinc-800 bg-zinc-950 flex items-center gap-3">
      <input
        type="text"
        placeholder="Talk to Smart Sense by Strombreaker..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        disabled={isLoading || isTyping}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            onSend(e);
          }
        }}
        className="flex-1 p-3 rounded-full border bg-zinc-800 border-zinc-700 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-green-400 text-white"
      />
      <button
        onClick={onSend}
        className="bg-orange-500 hover:bg-orange-400 text-black rounded-full p-3 transition cursor-pointer"
        disabled={isLoading || isTyping}
      >
        {isLoading || isTyping ? <FaCircleStop size={24} color="white" /> : <LuSendHorizontal color="white"  size={24} />}
      </button>
    </div>
  );
}