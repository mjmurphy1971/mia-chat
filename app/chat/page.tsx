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
          style={{ color: "#2563eb", textDecoration: "underline" }}
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
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, something went wrong. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  const styles = {
    container: {
      display: "flex",
      flexDirection: "column" as const,
      height: "100vh",
      fontFamily: "system-ui, -apple-system, sans-serif",
      backgroundColor: "#f9fafb"
    },
    header: {
      padding: "16px 20px",
      borderBottom: "1px solid #e5e7eb",
      display: "flex",
      alignItems: "center",
      gap: "12px",
      backgroundColor: "#ffffff"
    },
    avatar: {
      width: "40px",
      height: "40px",
      borderRadius: "50%",
      objectFit: "cover" as const
    },
    headerName: {
      fontWeight: 600,
      fontSize: "16px",
      color: "#111827"
    },
    headerSubtitle: {
      fontSize: "12px",
      color: "#6b7280"
    },
    messagesContainer: {
      flex: 1,
      overflowY: "auto" as const,
      padding: "20px",
      display: "flex",
      flexDirection: "column" as const,
      gap: "12px"
    },
    welcomeText: {
      textAlign: "center" as const,
      color: "#6b7280",
      marginTop: "40px"
    },
    userMessage: {
      maxWidth: "80%",
      padding: "12px 16px",
      borderRadius: "18px 18px 4px 18px",
      backgroundColor: "#2563eb",
      color: "#ffffff",
      fontSize: "14px",
      lineHeight: "1.5"
    },
    assistantMessage: {
      maxWidth: "80%",
      padding: "12px 16px",
      borderRadius: "18px 18px 18px 4px",
      backgroundColor: "#e5e7eb",
      color: "#1f2937",
      fontSize: "14px",
      lineHeight: "1.5"
    },
    form: {
      padding: "16px 20px",
      borderTop: "1px solid #e5e7eb",
      display: "flex",
      gap: "12px",
      backgroundColor: "#ffffff"
    },
    input: {
      flex: 1,
      padding: "12px 16px",
      borderRadius: "24px",
      border: "1px solid #d1d5db",
      fontSize: "14px",
      outline: "none"
    },
    button: {
      padding: "12px 24px",
      borderRadius: "24px",
      border: "none",
      backgroundColor: "#2563eb",
      color: "#ffffff",
      fontWeight: 600,
      cursor: "pointer"
    },
    buttonDisabled: {
      padding: "12px 24px",
      borderRadius: "24px",
      border: "none",
      backgroundColor: "#9ca3af",
      color: "#ffffff",
      fontWeight: 600,
      cursor: "not-allowed"
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <img src="/mia-avatar.png" alt="Mia" style={styles.avatar} />
        <div>
          <div style={styles.headerName}>Mia</div>
          <div style={styles.headerSubtitle}>Mary Murphy AI Assistant</div>
        </div>
      </div>

      <div style={styles.messagesContainer}>
        {messages.length === 0 && (
          <div style={styles.welcomeText}>
            <p>Hi! I am Mia, Mary Murphy&apos;s AI assistant.</p>
            <p>Ask me about Mary&apos;s experience, skills, or services!</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
            <div style={msg.role === "user" ? styles.userMessage : styles.assistantMessage}>
              {msg.role === "assistant" ? linkify(msg.content) : msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", justifyContent: "flex-start" }}>
            <div style={styles.assistantMessage}>Mia is typing...</div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} style={styles.form}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          disabled={loading}
          style={styles.input}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          style={loading || !input.trim() ? styles.buttonDisabled : styles.button}
        >
          Send
        </button>
      </form>
    </div>
  );
}
