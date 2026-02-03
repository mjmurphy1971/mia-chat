export default function Home() {
  return (
    <main style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", fontFamily: "system-ui" }}>
      <div style={{ textAlign: "center" }}>
        <h1>Mia Chat</h1>
        <p>Go to <a href="/chat">/chat</a> to start chatting with Mia</p>
      </div>
    </main>
  );
}
