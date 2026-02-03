"use client";

import { useState } from "react";

export default function Home() {
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendMessage() {
    if (!message) return;

    setLoading(true);
    setResponse("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      const data = await res.json();
      setResponse(data.reply || JSON.stringify(data));
    } catch {
      setResponse("Error contacting Mia.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        padding: 40,
        fontFamily: "system-ui",
        maxWidth: 720,
        margin: "0 auto",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <img
          src="/mia-avatar.png"
          alt="Mia AI Assistant"
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            objectFit: "cover",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          }}
        />

        <div>
          <h1 style={{ margin: 0 }}>Mia</h1>
          <div style={{ color: "#555", fontSize: 14 }}>
            Executive AI Assistant
          </div>
        </div>
      </div>

      {/* Input */}
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={4}
        style={{
          width: "100%",
          marginTop: 12,
          padding: 12,
          fontSize: 16,
        }}
        placeholder="Ask Mia something…"
      />

      <button
        onClick={sendMessage}
        disabled={loading}
        style={{
          marginTop: 12,
          padding: "10px 20px",
          fontSize: 16,
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Thinking…" : "Send"}
      </button>

      {/* Response */}
      {response && (
        <div
          style={{
            marginTop: 32,
            padding: 20,
            borderRadius: 12,
            background: "#f6f7f8",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 8,
            }}
          >
            <img
              src="/mia-avatar.png"
              alt="Mia"
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                objectFit: "cover",
              }}
            />
            <strong>Mia</strong>
          </div>

          <p
            style={{ margin: 0 }}
            dangerouslySetInnerHTML={{
              __html: response.replace(
                /(https?:\/\/[^\s]+)/g,
                '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
              ),
            }}
          />
        </div>
      )}
    </main>
  );
}
