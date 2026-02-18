"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { IoArrowBack } from "react-icons/io5";
import { useAuthStore } from "@/features/auth";
import { SITE_CONFIG } from "@/shared/config";
import { Button, LoadingSpinner } from "@/shared/ui";
import { usePostEditor } from "../lib/use-post-editor";
import type { TEditorMode } from "../lib/use-post-editor";
import styles from "../styles/PostEditorPage.module.scss";

interface PostEditorPageProps {
    mode: TEditorMode;
    slug?: string;
}

export function PostEditorPage({ mode, slug }: PostEditorPageProps) {
    const router = useRouter();
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const { user } = useAuthStore();

    const {
        form,
        isLoading,
        isSaving,
        isUploading,
        errorMessage,
        canSubmit,
        handleChange,
        handleSave,
        handleDelete,
        handleUploadMedia,
    } = usePostEditor({
        mode,
        slug,
        userEmail: user?.email,
        userName: user?.name,
    });

    const pageTitle = mode === "create" ? "Create Post" : "Edit Post";

    const handleSubmit = async () => {
        try {
            await handleSave();
            toast.success("Post saved");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to save post");
        }
    };

    const handleDeleteClick = async () => {
        if (!window.confirm("Delete this post?")) {
            return;
        }

        try {
            await handleDelete();
            toast.success("Post deleted");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to delete post");
        }
    };

    const handleDrop = async (event: React.DragEvent<HTMLTextAreaElement>) => {
        event.preventDefault();

        const file = event.dataTransfer.files?.[0];
        if (!file) {
            return;
        }

        const textarea = textareaRef.current;
        const cursorStart = textarea?.selectionStart || 0;
        const cursorEnd = textarea?.selectionEnd || 0;

        try {
            const result = await handleUploadMedia(file, cursorStart, cursorEnd);
            toast.success("Media uploaded");

            requestAnimationFrame(() => {
                if (!textarea) {
                    return;
                }

                const nextCursor = cursorStart + result.insertedText.length;
                textarea.focus();
                textarea.setSelectionRange(nextCursor, nextCursor);
            });
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to upload media");
        }
    };

    if (isLoading) {
        return (
            <div className={styles.loadingPage}>
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <Button
                        variant="text"
                        startIcon={<IoArrowBack />}
                        onClick={() => router.back()}
                    >
                        Back
                    </Button>
                    <span className={styles.identity}>@{SITE_CONFIG.TITLE}</span>
                </div>

                <h1 className={styles.title}>{pageTitle}</h1>

                <div className={styles.fieldGroup}>
                    <label className={styles.label}>Author</label>
                    <input
                        className={styles.input}
                        value={user?.name || user?.email || ""}
                        disabled
                    />
                </div>

                <div className={styles.fieldGroup}>
                    <label className={styles.label}>Title</label>
                    <input
                        className={styles.input}
                        value={form.title}
                        onChange={(event) => handleChange("title", event.target.value)}
                        placeholder="Post title"
                    />
                </div>

                <div className={styles.fieldGroup}>
                    <label className={styles.label}>Description</label>
                    <input
                        className={styles.input}
                        value={form.description}
                        onChange={(event) => handleChange("description", event.target.value)}
                        placeholder="Post summary"
                    />
                </div>

                <div className={styles.gridRow}>
                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>URL (slug)</label>
                        <input
                            className={styles.input}
                            value={form.slug}
                            onChange={(event) => handleChange("slug", event.target.value)}
                            placeholder="your-post-url"
                        />
                    </div>

                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>Visibility</label>
                        <select
                            className={styles.select}
                            value={form.visibility}
                            onChange={(event) =>
                                handleChange(
                                    "visibility",
                                    event.target.value === "private" ? "private" : "public"
                                )
                            }
                        >
                            <option value="public">Public</option>
                            <option value="private">Private</option>
                        </select>
                    </div>
                </div>

                <div className={styles.fieldGroup}>
                    <label className={styles.label}>Shared Emails (for private)</label>
                    <textarea
                        className={styles.input}
                        rows={4}
                        value={form.sharedWith}
                        onChange={(event) => handleChange("sharedWith", event.target.value)}
                        placeholder={"email1@example.com\nemail2@example.com"}
                        disabled={form.visibility === "public"}
                    />
                </div>

                <div className={styles.fieldGroup}>
                    <label className={styles.label}>
                        Content (Drag & drop image/video into editor)
                    </label>
                    <textarea
                        ref={textareaRef}
                        className={styles.editor}
                        value={form.content}
                        onChange={(event) => handleChange("content", event.target.value)}
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={handleDrop}
                        placeholder="Write markdown content here..."
                    />
                </div>

                {errorMessage && <p className={styles.error}>{errorMessage}</p>}

                <div className={styles.footer}>
                    <Button
                        variant="text"
                        onClick={handleSubmit}
                        disabled={!canSubmit || isSaving || isUploading}
                    >
                        {isSaving ? "Saving..." : isUploading ? "Uploading..." : "Save"}
                    </Button>

                    {mode === "edit" && (
                        <button
                            className={styles.deleteButton}
                            onClick={handleDeleteClick}
                            disabled={isSaving}
                        >
                            Delete
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
