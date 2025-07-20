import { Bot, User } from "lucide-react";
import Image from "next/image";

export default function ChatMessages({ messages, chatEndRef }) {
  return (
    <div className="flex-1 relative overflow-y-auto p-6">
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
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`w-fit max-w-[80%] px-4 py-3 rounded-2xl shadow break-words leading-relaxed ${
              msg.role === "user"
                ? "bg-blue-700 ml-auto text-right"
                : "bg-zinc-800 text-left"
            }`}
          >
            <div className="flex items-start gap-2">
              {msg.role === "gpt" && (
                <Bot className="w-4 h-4 mt-1 text-green-400" />
              )}
              {msg.role === "user" && (
                <User className="w-4 h-4 mt-1 text-blue-300" />
              )}
              <p className="text-sm">{msg.text}</p>
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>
    </div>
  );
}