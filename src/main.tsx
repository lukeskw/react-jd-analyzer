import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./app.tsx";
import "./index.css";
import { ThemeProvider } from "@/hooks/use-theme";

const rootElement = document.querySelector<HTMLDivElement>("#root");

if (!rootElement) {
  throw new Error("Root element #root not found");
}

createRoot(rootElement).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
);
