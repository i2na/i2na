import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BLOG } from "@/config/constants";
import { getAllPostMetadata } from "@/entities/blog/api";
import { BlogList } from "@/features/blogList/ui/BlogList";
import { convertToDisplayPost, type BlogPostDisplay } from "@/features/blogList/model/types";
import { BackButton } from "@/shared/ui/backButton";
import { Footer } from "@/widgets/footer/ui/footer";
import type { BlogPostMetadata } from "@/entities/blog/model/types";
import styles from "./BlogArchivePage.module.scss";

export const BlogArchivePage: React.FC = () => {
    const navigate = useNavigate();
    const [posts, setPosts] = useState<BlogPostMetadata[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadPosts = async () => {
            try {
                const allPosts = await getAllPostMetadata();
                setPosts(allPosts);
            } catch (error) {
                console.error("Failed to load posts:", error);
            } finally {
                setLoading(false);
            }
        };

        loadPosts();
    }, []);

    const handlePostClick = (post: BlogPostDisplay) => {
        navigate(`/blog/${post.slug}`);
    };

    const handleBack = () => {
        navigate("/");
    };

    const displayPosts = posts.map(convertToDisplayPost);

    if (loading) {
        return (
            <div className={styles.loading}>
                <div>Loading...</div>
            </div>
        );
    }

    return (
        <div className={styles.blogArchivePage}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <BackButton onClick={handleBack} />
                </div>

                <section className={styles.blogSection}>
                    <div className={styles.sectionHeader}>
                        <div className={styles.label}>{BLOG.label}</div>
                        <h2 className={styles.content}>{BLOG.content}</h2>
                    </div>
                    <BlogList posts={displayPosts} theme="light" onPostClick={handlePostClick} />
                </section>
            </div>
            <Footer theme="light" />
        </div>
    );
};
