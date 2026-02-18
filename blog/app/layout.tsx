import type { Metadata } from "next";
import { Providers } from "@/app/providers";
import { APP_CONFIG } from "@/shared/config";
import { AppFooter } from "@/shared/ui";
import "@/app/styles/global.scss";

const siteTitle = APP_CONFIG.SITE_TITLE;

export const metadata: Metadata = {
    title: `${siteTitle} | Blog`,
    description: "Markdown-based blog by Yena",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="ko">
            <body>
                <Providers>
                    {children}
                    <AppFooter />
                </Providers>
            </body>
        </html>
    );
}
