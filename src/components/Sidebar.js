import moment from "moment";
import Markdown from "react-markdown";
import { BiSolidEdit, BiMessageSquareDetail } from "react-icons/bi";
import { IoIosLogOut } from "react-icons/io";
import { FiChevronLeft, FiDatabase, FiMenu } from "react-icons/fi";

export default function Sidebar({
  collapsed,
  setCollapsed,
  onLogout,
  metadata,
  sessionHandler,
  checkpointId,
  user,
  fileInputRef,
  handleFileButtonClick,
}) {
  const stripMarkdown = (markdown) =>
    markdown
      .replace(/(\*\*|__)(.*?)\1/g, "$2")
      .replace(/(\*|_)(.*?)\1/g, "$2")
      .replace(/`([^`]*)`/g, "$1")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/#+\s/g, "")
      .replace(/!\[.*?\]\(.*?\)/g, "")
      .trim();

  const truncateText = (markdown, num) => {
    const plain = stripMarkdown(markdown);
    return plain.length > num ? plain.slice(0, num) + "..." : plain;
  };

  return (
    <aside
      className={`${
        collapsed ? "w-15" : "w-64"
      } bg-[#f0f4f9] flex flex-col transition-all duration-300`}
    >
      {/* Header with collapse button */}
      <div className="p-3 flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold">
              S
            </div>
            <div className="text-sm">
              <p className="font-semibold text-zinc-800">Smart Sense</p>
              <p className="text-zinc-500 text-xs">
                AI Agent ({user?.message?.split(" ")[2].split("!")[0]})
              </p>
            </div>
          </div>
        )}

        {/* Collapse/Expand button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-md hover:bg-gray-200 text-zinc-800"
        >
          {collapsed ? <FiMenu size={18} /> : <FiChevronLeft size={18} />}
        </button>
      </div>

      {/* Chat Sessions */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1 text-sm text-zinc-300">
        <button
          className="w-full text-left text-zinc-800 py-2 px-3 rounded-full hover:bg-gray-200 hover:text-gray-800 transition cursor-pointer flex items-center gap-2"
          onClick={() => sessionHandler("")}
        >
          <BiSolidEdit size={20} />
          {!collapsed && "New Chat"}
        </button>
        <button
          className="w-full text-left text-zinc-800 py-2 px-3 rounded-full hover:bg-gray-200 hover:text-gray-800 transition cursor-pointer flex items-center gap-2"
          onClick={handleFileButtonClick}
        >
          <FiDatabase size={20} />
          {!collapsed && "Data Sources"}
        </button>

        {metadata?.map((item, i) => (
          <button
            key={i}
            className={`w-full text-left py-2 px-3 rounded-full transition cursor-pointer flex items-center gap-2 ${
              item.thread_id === checkpointId
                ? "bg-[#d3e3fd] text-blue-400"
                : "hover:bg-gray-200 hover:text-gray-800 text-zinc-800"
            }`}
            onClick={() => sessionHandler(item.thread_id)}
            title={moment(item.created_at).format("MMMM Do YYYY, h:mm:ss a")}
          >
            {collapsed ? (
              <BiMessageSquareDetail size={18} />
            ) : (
              <div className="truncate">
                <Markdown>{truncateText(item.title, 25)}</Markdown>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Footer */}
      <div className="p-4 text-xs">
        <button
          className="text-zinc-800 hover:bg-gray-200 py-2 px-3 rounded-full text-sm w-full text-left cursor-pointer flex items-center gap-2"
          onClick={onLogout}
        >
          <IoIosLogOut size={20} />
          {!collapsed && "Logout"}
        </button>
      </div>
    </aside>
  );
}
