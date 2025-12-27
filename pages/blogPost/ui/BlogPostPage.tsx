import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPostBySlug } from "@/entities/blog/api";
import { BlogPostContent } from "@/features/blogPost/ui/BlogPostContent";
import type { BlogPost } from "@/entities/blog/model/types";
import styles from "./BlogPostPage.module.scss";

export const BlogPostPage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const [post, setPost] = useState<BlogPost | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadPost = async () => {
            if (!slug) {
                setLoading(false);
                return;
            }

            try {
                const postData = await getPostBySlug(slug);
                if (!postData) {
                    navigate("/blog");
                    return;
                }
                setPost(postData);
            } catch (error) {
                console.error("Failed to load post:", error);
                navigate("/blog");
            } finally {
                setLoading(false);
            }
        };

        loadPost();
    }, [slug, navigate]);

    const handleBack = () => {
        navigate(-1);
    };

    if (loading) {
        return (
            <div className={styles.loading}>
                <div>Loading...</div>
            </div>
        );
    }

    if (!post) {
        return null;
    }

    return <BlogPostContent post={post} onBack={handleBack} />;
};
