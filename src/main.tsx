import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

// Diagnostics for AI Productivity Hacker
console.log("🚀 OpenMenu Booting...");
console.log("🌐 Supabase URL:", import.meta.env.VITE_SUPABASE_URL ? "Configured ✅" : "MISSING ❌");

createRoot(document.getElementById("root")!).render(
  <App />
);
