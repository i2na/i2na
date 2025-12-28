import { useNavigate } from "react-router-dom";
import { BLOG } from "@/config/constants";
import { Navbar } from "@/widgets/navbar/ui/navbar";
import { HeroSection } from "@/widgets/hero/ui/HeroSection";
import { AboutSection } from "@/widgets/about/ui/AboutSection";
import { TechStackSection } from "@/widgets/techStack/ui/TechStackSection";
import { Footer } from "@/widgets/footer/ui/footer";
import { BentoGrid } from "@/widgets/blogPreview/ui/BentoGrid";
import { ChatWidget } from "@/features/chat/ui/ChatWidget";
import styles from "./LandingPage.module.scss";

export function LandingPage() {
    const navigate = useNavigate();

    const handleArchiveClick = () => {
        navigate("/blog");
    };

    const handlePostClick = (slug: string) => {
        navigate(`/blog/${slug}`);
    };

    return (
        <div className={styles.landingPage}>
            <Navbar />

            <HeroSection />

            <AboutSection />

            <section id="blog" className={styles.blogSection}>
                <div className={styles.sectionHeader}>
                    <div className={styles.label}>{BLOG.label}</div>
                    <h2 className={styles.content}>{BLOG.content}</h2>
                </div>
                <BentoGrid onPostClick={handlePostClick} onViewArchive={handleArchiveClick} />
            </section>

            <TechStackSection />

            <Footer />

            <ChatWidget />
        </div>
    );
}
