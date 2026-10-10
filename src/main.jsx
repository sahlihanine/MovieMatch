import React from "react";
import { createRoot } from "react-dom/client";
import { defineCustomElements } from "@ionic/pwa-elements/loader";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";

defineCustomElements(window); // permet à la caméra de fonctionner dans le navigateur

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);