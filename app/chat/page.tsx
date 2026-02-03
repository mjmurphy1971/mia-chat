"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
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
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", fontFamily: "system-ui, sans-serif", backgroundColor: "#fff" }}>
      <div style={{ padding: "16px 20px", borderBottom: "1px solid #e5e5e5", display: "flex", alignItems: "center", gap: "12px", backgroundColor: "#fafafa" }}>
        <img src="/mia-avatar.png" alt="Mia" style={{ width: "40px", height: "40px", borderRadius: "50%" }} />
        <div>
          <div style={{ fontWeight: 600 }}>Mia</div>
          <div style={{ fontSize: "12px", color: "#666" }}>Mary Murphy AI Assistant</div>
        </div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
        {messages.length === 0 && (
          <div style={{ textAlign: "center", color: "#888", marginTop: "40px" }}>
            <p>Hi! I am Mia, Mary Murphy AI assistant.</p>
            <p style={{ fontSize: "13px", marginTop: "8px" }}>Ask me about Mary experience, skills, or services!</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
            <div style={{ maxWidth: "80%", padding: "12px 16px", borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px", backgroundColor: msg.role === "user" ? "#0066cc" : "#f0f0f0", color: msg.role === "user" ? "#fff" : "#333", fontSize: "14px", lineHeight: "1.5" }}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", justifyContent: "flex-start" }}>
            <div style={{ padding: "12px 16px", borderRadius: "18px 18px 18px 4px", backgroundColor: "#f0f0f0", color: "#666" }}>Mia is typing...</div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={sendMessage} style={{ padding: "16px 20px", borderTop: "1px solid #e5e5e5", display: "flex", gap: "12px", backgroundColor: "#fafafa" }}>
        <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type a message..." disabled={loading} style={{ flex: 1, padding: "12px 16px", borderRadius: "24px", border: "1px solid #ddd", fontSize: "14px" }} />
        <button type="submit" disabled={loading || !input.trim()} style={{ padding: "12px 24px", borderRadius: "24px", border: "none", backgroundColor: loading || !input.trim() ? "#ccc" : "#0066cc", color: "#fff", fontWeight: 600, cursor: loading || !input.trim() ? "not-allowed" : "pointer" }}>Send</button>
      </form>
    </div>
  );
}
