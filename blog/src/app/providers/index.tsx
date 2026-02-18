"use client";

import { Toaster } from "react-hot-toast";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <>
            {children}
            <Toaster
                position="top-center"
                toastOptions={{
                    duration: 2200,
                    style: {
                        background: "#f3fbf8",
                        border: "1px solid #b9e5d7",
                        color: "#0f3d36",
                        fontSize: "14px",
                        fontWeight: 600,
                        boxShadow: "0 14px 30px rgba(4, 37, 33, 0.14)",
                        borderRadius: "14px",
                    },
                }}
            />
        </>
    );
}
