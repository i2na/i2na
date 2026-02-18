import type { Metadata } from "next";
import { Providers } from "@/app/providers";
import "@/app/styles/global.scss";

export const metadata: Metadata = {
    title: "i2na-blog",
    description: "Markdown-based blog and document publishing project",
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
