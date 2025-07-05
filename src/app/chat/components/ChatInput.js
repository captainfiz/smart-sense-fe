import { Paperclip, SendHorizonal } from "lucide-react";

export default function ChatInput({
  input,
  setInput,
  onSend,
  onFileButtonClick,
}) {
  return (
    <div className="p-4 border-t border-zinc-800 bg-zinc-950 flex items-center gap-3">
      <input
        type="text"
        placeholder="Talk to Smart Sense by Team Strombreaker..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSend();
          }
        }}
        className="flex-1 p-3 rounded-full border bg-zinc-800 border-zinc-700 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-green-400 text-white"
      />
      <button onClick={onFileButtonClick}>
        <Paperclip className="text-zinc-400 hover:text-white w-5 h-5" />
      </button>
      <button
        onClick={onSend}
        className="bg-yellow-400 hover:bg-green-500 text-black rounded-full p-2 transition"
      >
        <SendHorizonal className="w-4 h-4" />
      </button>
    </div>
  );
}