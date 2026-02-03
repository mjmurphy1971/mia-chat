"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

function linkify(text: string): React.ReactNode[] {
  const urlRegex = /(https?:\/\/[^\s]+ )/g;
  const parts = text.split(urlRegex);
  
  return parts.map((part, index) => {
    if (part.match(urlRegex)) {
      return (
        <a 
          key={index} 
          href={part} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 underline hover:text-blue-800"
        >
          {part}
        </a>
      );
    }
    return <span key={index}>{part}</span>;
  });
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await res.json();
      const reply = data.reply || data.error || "Sorry, I could not process that.";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, something went wrong. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-screen font-sans">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center gap-3 bg-white">
        <img 
          src="/mia-avatar.png" 
          alt="Mia" 
          className="w-10 h-10 rounded-full object-cover" 
        />
        <div>
          <div className="font-semibold text-base">Mia</div>
          <div className="text-xs text-gray-500">Mary Murphy AI Assistant</div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-3 bg-gray-50">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-10">
            <p>Hi! I am Mia, Mary Murphy&apos;s AI assistant.</p>
            <p>Ask me about Mary&apos;s experience, skills, or services!</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div 
            key={i} 
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div 
              className={`max-w-[80%] px-4 py-3 text-sm leading-relaxed ${
                msg.role === "user" 
                  ? "bg-blue-600 text-white rounded-t-2xl rounded-bl-2xl rounded-br-sm" 
                  : "bg-gray-200 text-gray-800 rounded-t-2xl rounded-br-2xl rounded-bl-sm"
              }`}
            >
              {msg.role === "assistant" ? linkify(msg.content) : msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="px-4 py-3 rounded-2xl bg-gray-200 text-gray-600">
              Mia is typing...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form 
        onSubmit={sendMessage} 
        className="p-4 border-t border-gray-200 flex gap-3 bg-gray-50"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          disabled={loading}
          className="flex-1 px-4 py-3 rounded-full border border-gray-300 text-sm focus:outline-none focus:border-blue-500"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className={`px-6 py-3 rounded-full font-semibold text-white ${
            loading || !input.trim() 
              ? "bg-gray-400 cursor-not-allowed" 
              : "bg-blue-600 hover:bg-blue-700 cursor-pointer"
          }`}
        >
          Send
        </button>
      </form>
    </div>
  );
}
