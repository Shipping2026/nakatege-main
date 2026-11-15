const fs = require("fs");
const path = require("path");

const APP_DIR = fs.existsSync("src/app") ? "src/app" : "app";

const files = {
  "settings/SettingsShell.tsx": `"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
export const ORANGE = "#F97316";
export const CARD = "#141414";
export const MUTED = "#8A8A8E";
export function useStored(key, initial) {
  const [value, setValue] = useState(initial);
  useEffect(() => { try { const raw = localStorage.getItem(key); if (raw !== null) setValue(JSON.parse(raw)); } catch {} }, [key]);
  const save = (next) => { setValue(next); try { localStorage.setItem(key, JSON.stringify(next)); } catch {} };
  return [value, save];
}
export const inputStyle = { width: "100%", height: 46, borderRadius: 12, border: "1px solid #2A2A2A", background: CARD, color: "#fff", padding: "0 14px", fontSize: 16 };
export const buttonStyle = { width: "100%", height: 48, borderRadius: 14, border: "none", background: ORANGE, color: "#fff", fontSize: 16, fontWeight: 600, cursor: "pointer" };
export default function SettingsShell({ title, children }) {
  const router = useRouter();
  return (
    <main style={{ minHeight: "100dvh", background: "#000", color: "#fff", padding: "0 16px 40px", maxWidth: 480, margin: "0 auto" }}>
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 56 }}>
        <button onClick={() => router.back()} style={{ background: "none", border: "none", color: "#fff", fontSize: 28, cursor: "pointer" }}>‹</button>
        <h1 style={{ margin: 0, fontSize: 18 }}>{title}</h1>
        <span style={{ width: 36 }} />
      </header>
      <div style={{ marginTop: 12 }}>{children}</div>
    </main>
  );
}
`,
};

for (const [file, content] of Object.entries(files)) {
  const full = path.join(APP_DIR, file);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, "utf8");
  console.log("Créé :", full);
}
console.log("\\nTerminé. Lance npm run dev");