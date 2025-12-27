import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { BrowserRouter } from "react-router-dom";
import "./global.css";
import "./i18n/config"; // Inicializar i18n

// Suprimir el mensaje de React DevTools
const originalLog = console.log;
console.log = (...args: any[]) => {
  const message = args.join(' ');
  if (message.includes('Download the React DevTools') || message.includes('react-devtools')) {
    return;
  }
  originalLog.apply(console, args);
};

const container = document.getElementById("root") as Element | DocumentFragment | null;
if (!container) {
  throw new Error("Root container #root not found in index.html");
}

const root = createRoot(container as Element);
root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
