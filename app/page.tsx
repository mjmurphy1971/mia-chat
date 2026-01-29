"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const MIA_AVATAR = "/mia-avatar.png";

// ✅ Direct-download Google Drive link (works for prospects)
const RESUME_URL =
  "https://drive.google.com/uc?export=download&id=1uV-u6awbcyXpXtwyygLuH1YgD2ntH0HT";

// ✅ Calendly booking link
const SCHEDULE_URL = "https://calendly.com/mary-thedreamwork/30min";

type ChatMsg = {
  role: "user" | "assistant";
  content: string;
};

const INITIAL_MESSAGES: ChatMsg[] = [
  {
    role: "assistant",
    content:
      "Hi, I’m Mia — Mary Murphy’s executive assistant. You can ask me anything about her experience, qualifications, and services. I can also help you download her resume or schedule time to meet with her. Just ask — I’m here to help.",
  },
];

export default function Home() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMsg[]>(INITIAL_MESSAGES);
  const [loading, setLoading] = useState(false);

  const listEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to newest message
  useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const canSend = useMemo(
    () => input.trim().length > 0 && !loading,
    [input, loading]
  );

  async function sendMessage() {
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput("");
    setLoading(true);

    const nextMessages: ChatMsg[] = [
      ...messages,
      { role: "user", content: userText },
    ];
    setMessages(nextMessages);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await res.json();

      const miaText =
        ((data?.reply ?? "") as string).toString().trim() ||
        "Sorry — I’m not able to assist with that request.";

      setMessages((prev) => [...prev, { role: "assistant", content: miaText }]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I hit an error talking to the server. If you’re testing locally, check the terminal. If this is deployed, check Vercel Logs — then try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    // Enter = send, Shift+Enter = newline
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0b0b0b",
        color: "#fff",
        padding: 24,
        fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div style={{ width: "100%", maxWidth: 860 }}>
        {/* Header */}
        <header
          style={{
            marginBottom: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <img
              src={MIA_AVATAR}
              alt="Mia avatar"
              width={44}
              height={44}
              style={{
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.14)",
                objectFit: "cover",
              }}
            />
            <div>
              <h1
                style={{
                  margin: 0,
                  fontSize: 22,
                  fontWeight: 700,
                  letterSpacing: 0.2,
                }}
              >
                Mia
              </h1>
              <p style={{ margin: "4px 0 0", opacity: 0.78, fontSize: 13 }}>
                Mary Murphy&apos;s executive assistant
              </p>
            </div>
          </div>

          <div style={{ opacity: 0.65, fontSize: 12 }}>
            {loading ? "Live • Thinking" : "Live • Ready"}
          </div>
        </header>

        {/* Chat window */}
        <section
          style={{
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 16,
            background: "rgba(255,255,255,0.04)",
            padding: 16,
            height: "62vh",
            overflowY: "auto",
          }}
        >
          {messages.map((m, idx) => {
            const isUser = m.role === "user";

            return (
              <div
                key={idx}
                style={{
                  display: "flex",
                  justifyContent: isUser ? "flex-end" : "flex-start",
                  gap: 10,
                  marginBottom: 12,
                  alignItems: "flex-end",
                }}
              >
                {/* Mia avatar on the left for assistant messages */}
                {!isUser && (
                  <img
                    src={MIA_AVATAR}
                    alt="Mia"
                    width={28}
                    height={28}
                    style={{
                      borderRadius: 10,
                      border: "1px solid rgba(255,255,255,0.14)",
                      objectFit: "cover",
                      flexShrink: 0,
                      marginBottom: 2,
                    }}
                  />
                )}

                {/* Bubble */}
                <div
                  style={{
                    maxWidth: "82%",
                    padding: "12px 14px",
                    borderRadius: 14,
                    lineHeight: 1.35,
                    whiteSpace: "pre-wrap",
                    background: isUser
                      ? "rgba(59,130,246,0.25)"
                      : "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.10)",
                  }}
                >
                  <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 6 }}>
                    {isUser ? "You" : "Mia"}
                  </div>
                  <div style={{ fontSize: 15 }}>{m.content}</div>
                </div>

                {/* Small "Y" badge on the right for user messages */}
                {isUser && (
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 10,
                      border: "1px solid rgba(255,255,255,0.14)",
                      background: "rgba(255,255,255,0.06)",
                      display: "grid",
                      placeItems: "center",
                      fontSize: 12,
                      opacity: 0.85,
                      flexShrink: 0,
                      marginBottom: 2,
                    }}
                    title="You"
                  >
                    Y
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div
              style={{
                display: "flex",
                justifyContent: "flex-start",
                gap: 10,
                marginBottom: 12,
                alignItems: "flex-end",
              }}
            >
              <img
                src={MIA_AVATAR}
                alt="Mia"
                width={28}
                height={28}
                style={{
                  borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.14)",
                  objectFit: "cover",
                  flexShrink: 0,
                  marginBottom: 2,
                }}
              />
              <div
                style={{
                  maxWidth: "82%",
                  padding: "12px 14px",
                  borderRadius: 14,
                  lineHeight: 1.35,
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.10)",
                }}
              >
                <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 6 }}>
                  Mia
                </div>
                <div style={{ fontSize: 15, opacity: 0.9 }}>Thinking…</div>
              </div>
            </div>
          )}

          <div ref={listEndRef} />
        </section>

        {/* Composer */}
        <section style={{ marginTop: 14 }}>
          <textarea
            rows={3}
            style={{
              width: "100%",
              padding: 12,
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(255,255,255,0.04)",
              color: "#fff",
              outline: "none",
              resize: "vertical",
            }}
            placeholder="Ask Mia something… (Enter to send, Shift+Enter for a new line)"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
          />

          <div style={{ display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
            <button
              onClick={sendMessage}
              disabled={!canSend}
              style={{
                padding: "10px 14px",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.14)",
                background: canSend
                  ? "rgba(59,130,246,0.35)"
                  : "rgba(255,255,255,0.06)",
                color: "#fff",
                cursor: canSend ? "pointer" : "not-allowed",
                fontWeight: 600,
              }}
            >
              Send
            </button>

            <button
              onClick={() => {
                setMessages(INITIAL_MESSAGES);
                setInput("");
              }}
              style={{
                padding: "10px 14px",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.14)",
                background: "rgba(255,255,255,0.06)",
                color: "#fff",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Clear
            </button>

            {/* ✅ Always-working quick actions */}
            <a
              href={RESUME_URL}
              target="_blank"
              rel="noreferrer"
              style={{ textDecoration: "none" }}
            >
              <button
                type="button"
                style={{
                  padding: "10px 14px",
                  borderRadius: 12,
                  border: "1px solid rgba(255,255,255,0.14)",
                  background: "rgba(255,255,255,0.06)",
                  color: "#fff",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
                title="Download Mary’s resume (PDF)"
              >
                Download Resume (PDF)
              </button>
            </a>

            <a
              href={SCHEDULE_URL}
              target="_blank"
              rel="noreferrer"
              style={{ textDecoration: "none" }}
            >
              <button
                type="button"
                style={{
                  padding: "10px 14px",
                  borderRadius: 12,
                  border: "1px solid rgba(255,255,255,0.14)",
                  background: "rgba(255,255,255,0.06)",
                  color: "#fff",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
                title="Book a 15-minute intro meeting"
              >
                Schedule a meeting
              </button>
            </a>
          </div>
        </section>

        <footer style={{ marginTop: 14, opacity: 0.65, fontSize: 12 }}>
          Try: “What roles has Mary held?”, “What services does she offer?”, “Show me
          her resume”, or “How do I schedule time?”
        </footer>
      </div>
    </main>
  );
}
