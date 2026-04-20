import { StrictMode } from "react";
// import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import "./index.css";
import { QZTrayProvider } from "./components/QZTrayContext";
// import App from "./App.jsx";

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";

registerSW({
  onOfflineReady() {
    console.log("App siap offline 🔥");
  },
  onNeedRefresh() {
    console.log("Ada update baru");
  },
});

// createRoot(document.getElementById("root")).render(
//   <StrictMode>
//     <App />
//   </StrictMode>,
// );

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter basename="/testing-app">
    <QZTrayProvider>
      <App />
    </QZTrayProvider>
  </BrowserRouter>,
);
