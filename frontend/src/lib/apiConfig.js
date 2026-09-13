// API Configuration with dynamic environment fallback
export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  (typeof window !== "undefined" && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1"
    ? "https://nagdristiai.onrender.com"
    : "http://127.0.0.1:8000")
).replace(/\/$/, "");
