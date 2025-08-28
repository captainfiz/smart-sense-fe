import moment from "moment";
import Markdown from "react-markdown";
export default function Sidebar({
  onLogout,
  metadata,
  sessionHandler,
}) {
  console.log('metadata', metadata)
  return (
    <aside className="w-64 bg-zinc-950 border-r border-zinc-800 flex flex-col">
      <div className="p-3 border-b border-zinc-800 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-green-500 text-black flex items-center justify-center font-bold">
          S
        </div>
        <div className="text-sm">
          <p className="font-semibold text-white">Smart Sense </p>
          <p className="text-zinc-500 text-xs">AI Agent</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-1 text-sm text-zinc-300">
        <button
          className="w-full text-left p-2 rounded hover:bg-zinc-800 hover:text-white transition cursor-pointer"
          onClick={() => sessionHandler("")}
        >
          💬 New Chat
        </button>
        {metadata?.map((item, i) => (
          <button
            key={i}
            className="w-full text-left p-2 rounded hover:bg-zinc-800 hover:text-white transition cursor-pointer"
            onClick={() => sessionHandler(item.thread_id)}
            title={moment(item.created_at).format("MMMM Do YYYY, h:mm:ss a")}
          >
            <Markdown>{item.title}</Markdown>
          </button>
        ))}
      </div>
      <div className="p-4 border-t border-zinc-800 text-xs text-zinc-600 space-y-3">
        <button
          className="text-zinc-400 hover:text-red-400 text-sm w-full text-left cursor-pointer"
          onClick={onLogout}
        >
          🔓 Logout
        </button>
      </div>
    </aside>
  );
}
