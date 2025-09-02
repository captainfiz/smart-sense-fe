import moment from "moment";
import Markdown from "react-markdown";
import { BiSolidEdit } from "react-icons/bi";
import { IoIosLogOut } from "react-icons/io";

export default function Sidebar({
  onLogout,
  metadata,
  sessionHandler,
  checkpointId,
}) {
  // Markdown को plain text में बदलने का helper
  const stripMarkdown = (markdown) => {
    return markdown
      .replace(/(\*\*|__)(.*?)\1/g, "$2") // bold हटाओ
      .replace(/(\*|_)(.*?)\1/g, "$2") // italics हटाओ
      .replace(/`([^`]*)`/g, "$1") // inline code हटाओ
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // links हटाओ
      .replace(/#+\s/g, "") // headings हटाओ
      .replace(/!\[.*?\]\(.*?\)/g, "") // images हटाओ
      .trim();
  };

  // truncate करने का helper
  const truncateText = (markdown, num) => {
    const plain = stripMarkdown(markdown);
    return plain.length > num ? plain.slice(0, num) + "..." : plain;
  };

  return (
    <aside className="w-64 bg-zinc-950 border-r border-zinc-800 flex flex-col">
      <div className="p-3 border-b border-zinc-800 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold">
          S
        </div>
        <div className="text-sm">
          <p className="font-semibold text-white">Smart Sense </p>
          <p className="text-zinc-500 text-xs">AI Agent</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-1 text-sm text-zinc-300">
        <button
          className="w-full text-left p-2 rounded hover:bg-zinc-800 hover:text-white transition cursor-pointer flex flex-row items-center gap-2"
          onClick={() => sessionHandler("")}
        >
          <BiSolidEdit size={20} /> New Chat
        </button>
        {metadata?.map((item, i) => (
          <button
            key={i}
            className={`w-full text-left p-2 rounded transition cursor-pointer ${
              item.thread_id === checkpointId
                ? "bg-zinc-800 text-white" // active styles
                : "hover:bg-zinc-800 hover:text-white"
            }`}
            onClick={() => sessionHandler(item.thread_id)}
            title={moment(item.created_at).format("MMMM Do YYYY, h:mm:ss a")}
          >
            <div title={item.title}>
              <Markdown>{truncateText(item.title, 25)}</Markdown>
            </div>
          </button>
        ))}
      </div>
      <div className="p-4 border-t border-zinc-800 text-xs text-zinc-600 space-y-3">
        <button
          className="text-zinc-400 hover:text-red-400 text-sm w-full text-left cursor-pointer flex flex-row items-center gap-2"
          onClick={onLogout}
        >
          Logout <IoIosLogOut size={20} />
        </button>
      </div>
    </aside>
  );
}
