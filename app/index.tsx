import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { Buffer } from "buffer";
import { AppRouter } from "./providers/router";
import "@/shared/styles/index.scss";

if (typeof window !== "undefined" && !window.Buffer) {
    (window as any).Buffer = Buffer;
}

const rootElement = document.getElementById("root");
if (!rootElement) {
    throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
    <StrictMode>
        <AppRouter />
    </StrictMode>
);
