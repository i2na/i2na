import { Navbar } from "@/widgets/navbar/ui/navbar";
import { HeroSection } from "@/widgets/hero/ui/HeroSection";
import { AboutSection } from "@/widgets/about/ui/AboutSection";
import { BlogSection } from "@/widgets/blog/ui/BlogSection";
import { TechStackSection } from "@/widgets/techStack/ui/TechStackSection";
import { Footer } from "@/widgets/footer/ui/footer";
import { ChatWidget } from "@/features/chat/ui/ChatWidget";
import styles from "./LandingPage.module.scss";

const isDevelopment = import.meta.env.DEV;

export function LandingPage() {
    return (
        <div className={styles.landingPage}>
            <Navbar />
            <HeroSection />

            {isDevelopment && (
                <>
                    <AboutSection />
                    <BlogSection />
                    <TechStackSection />
                    <Footer />
                    <ChatWidget />
                </>
            )}
        </div>
    );
}
