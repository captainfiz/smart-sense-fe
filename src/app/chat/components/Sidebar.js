import LogoSection from "@/components/LogoSection";

export default function Sidebar({ onLogout }) {
  return (
    <aside className="w-64 bg-zinc-950 border-r border-zinc-800 flex flex-col">
      <div className="p-4 border-b border-zinc-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-green-500 text-black flex items-center justify-center font-bold">
          S
        </div>
        <div className="text-sm">
          <p className="font-semibold text-white">Smart Sense</p>
          <p className="text-zinc-500 text-xs">Team Strombreaker</p>
        </div>
      </div>
      <div className="p-4 border-b border-zinc-800">
        <LogoSection />
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-2 text-sm text-zinc-300">
        <nav className="mt-2 space-y-2 text-sm text-zinc-400">
          <button className="w-full text-left p-2 rounded hover:bg-zinc-800 hover:text-white transition">
            💬 New Chat
          </button>
        </nav>
        {[
          "Productivity Tips",
          "HR Dashboard",
          "LangGraph Summary",
          "Market Trends",
        ].map((title, i) => (
          <button
            key={i}
            className="w-full text-left p-2 rounded hover:bg-zinc-800 hover:text-white transition"
          >
            🗂️ {title}
          </button>
        ))}
      </div>
      <div className="p-4 border-t border-zinc-800 text-xs text-zinc-600 space-y-3">
        <button
          className="text-zinc-400 hover:text-red-400 text-sm w-full text-left"
          onClick={onLogout}
        >
          🔓 Logout
        </button>
        <div>© 2025 ADGLOBAL360 · STROMBREAKER</div>
      </div>
    </aside>
  );
}