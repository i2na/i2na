import { type ReactNode } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LandingPage } from "@/pages/landing/ui/LandingPage";

interface IThemeManagerProps {
    children: ReactNode;
}

function ThemeManager({ children }: IThemeManagerProps) {
    return <>{children}</>;
}

export function AppRouter() {
    return (
        <BrowserRouter>
            <ThemeManager>
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                </Routes>
            </ThemeManager>
        </BrowserRouter>
    );
}
