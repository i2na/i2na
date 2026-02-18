import type { Metadata } from "next";
import { Providers } from "@/app/providers";
import "@/app/styles/global.scss";

export const metadata: Metadata = {
    title: "Yena Blog",
    description: "Markdown-based blog by Yena",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="ko">
            <body>
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
