import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useEffect } from "react";
import { ListPage } from "./pages/ListPage";
import { ViewPage } from "./pages/ViewPage";
import { AuthCallbackPage } from "./pages/AuthCallbackPage";
import { SettingPage } from "./pages/SettingPage";
import { useAdminStore } from "./store/admin";
import { isAuthenticated } from "./utils/auth";

function AppContent() {
    const { loadEmailConfig } = useAdminStore();

    useEffect(() => {
        const setVh = () => {
            const vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty("--vh", `${vh}px`);
        };

        setVh();
        window.addEventListener("resize", setVh);
        window.addEventListener("orientationchange", setVh);

        return () => {
            window.removeEventListener("resize", setVh);
            window.removeEventListener("orientationchange", setVh);
        };
    }, []);

    useEffect(() => {
        if (isAuthenticated()) {
            loadEmailConfig();
        }
    }, [loadEmailConfig]);

    return (
        <>
            <Toaster
                position="top-center"
                toastOptions={{
                    duration: 2000,
                    style: {
                        background: "#333",
                        color: "#fff",
                        fontSize: "14px",
                    },
                }}
            />
            <Routes>
                <Route path="/" element={<ListPage />} />
                <Route path="/auth/callback" element={<AuthCallbackPage />} />
                <Route path="/:filename/setting" element={<SettingPage />} />
                <Route path="/:filename" element={<ViewPage />} />
            </Routes>
        </>
    );
}

export function App() {
    return (
        <BrowserRouter>
            <AppContent />
        </BrowserRouter>
    );
}
