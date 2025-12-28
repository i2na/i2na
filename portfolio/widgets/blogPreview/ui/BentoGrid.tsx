import { useEffect, useState } from "react";
import { getAllPostMetadata } from "@/entities/blog/api";
import { BlogList } from "@/features/blogList/ui/BlogList";
import { convertToDisplayPost } from "@/features/blogList/model/types";
import type { IPostMeta } from "@/entities/blog/model/types";
import type { IBentoGridProps } from "../model/types";
import styles from "./BentoGrid.module.scss";

export function BentoGrid({ onPostClick, onViewArchive }: IBentoGridProps) {
    const [posts, setPosts] = useState<IPostMeta[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadPosts = async () => {
            try {
                const allPosts = await getAllPostMetadata();
                setPosts(allPosts.slice(0, 4));
            } catch (error) {
                console.error("Failed to load posts:", error);
            } finally {
                setLoading(false);
            }
        };

        loadPosts();
    }, []);

    const displayPosts = posts.map(convertToDisplayPost);

    if (loading) {
        return (
            <div className={styles.bentoGrid}>
                <div className={styles.loading}>Loading...</div>
            </div>
        );
    }

    return (
        <div className={styles.bentoGrid}>
            <BlogList
                posts={displayPosts}
                onPostClick={(post) => onPostClick(post.slug)}
                onViewArchive={onViewArchive}
                theme="dark"
            />
        </div>
    );
}
