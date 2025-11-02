
import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

function App() {
  const [pong, setPong] = useState("");
  const apiBase = (typeof __API_BASE__ === "string" && __API_BASE__) || "";

  useEffect(() => {
    (async () => {
      try {
        const base = apiBase || "http://localhost:8080";
        const res = await fetch(`${base}/ping`);
        const data = await res.json();
        setPong(JSON.stringify(data));
      } catch (e) {
        setPong("Error: " + e.message);
      }
    })();
  }, [apiBase]);

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", padding: 24 }}>
      <h1>NullEffect Frontend</h1>
      <p>Backend base: <code>{apiBase || "http://localhost:8080"}</code></p>
      <p>Ping response: <code>{pong}</code></p>
    </div>
  );
}
createRoot(document.getElementById("root")).render(<App />);
