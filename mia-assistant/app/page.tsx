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
    <main style={{ padding: 40, fontFamily: "system-ui" }}>
      <h1>Mia — Executive Assistant</h1>

      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={4}
        style={{ width: "100%", marginTop: 12 }}
        placeholder="Ask Mia something…"
      />

      <button
        onClick={sendMessage}
        disabled={loading}
        style={{ marginTop: 12, padding: "8px 16px" }}
      >
        {loading ? "Thinking…" : "Send"}
      </button>

      {response && (
        <div style={{ marginTop: 24 }}>
          <strong>Mia:</strong>
          <p
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
