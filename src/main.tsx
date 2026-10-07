import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import App from "./App.tsx";
import "./index.css";

if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => navigator.serviceWorker.register("/sw.js"));
}

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error('Elemento raiz "#root" não encontrado.');
}

// The document contains SEO-friendly pre-rendered markup. Mount React
// synchronously while that markup is hidden, then reveal only the real app.
flushSync(() => {
  createRoot(rootElement).render(<App />);
});
rootElement.removeAttribute("data-app-loading");
