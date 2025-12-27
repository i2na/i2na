import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { LandingPage } from "@/pages/landing/ui/LandingPage";
import { BlogArchivePage } from "@/pages/blogArchive/ui/BlogArchivePage";
import { BlogPostPage } from "@/pages/blogPost/ui/BlogPostPage";

const ThemeManager: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const location = useLocation();

    useEffect(() => {
        const isBlogPage = location.pathname.startsWith("/blog");
        
        if (isBlogPage) {
            document.body.classList.add("theme-light");
            document.body.classList.remove("theme-dark");
        } else {
            document.body.classList.add("theme-dark");
            document.body.classList.remove("theme-light");
        }

        return () => {
            // Cleanup은 필요 없지만 명시적으로 처리
        };
    }, [location.pathname]);

    return <>{children}</>;
};

export const AppRouter: React.FC = () => {
    return (
        <BrowserRouter>
            <ThemeManager>
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/blog" element={<BlogArchivePage />} />
                    <Route path="/blog/:slug" element={<BlogPostPage />} />
                </Routes>
            </ThemeManager>
        </BrowserRouter>
    );
};
