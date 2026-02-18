"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { useAuthStore } from "@/features/auth";
import type { ICommentItem } from "@/shared/lib/types";
import { useComments } from "../lib/use-comments";
import styles from "../styles/CommentsSection.module.scss";

interface CommentNodeProps {
    item: ICommentItem;
    onReply: (parentId: string, content: string) => Promise<void>;
    onUpdate: (commentId: string, content: string) => Promise<void>;
    onDelete: (commentId: string) => Promise<void>;
    canReply: boolean;
    viewerEmail?: string | null;
    submitting: boolean;
}

function isCommentOwner(viewerEmail: string | null | undefined, authorEmail: string): boolean {
    if (!viewerEmail) {
        return false;
    }

    return viewerEmail.trim().toLowerCase() === authorEmail.trim().toLowerCase();
}

function CommentNode({
    item,
    onReply,
    onUpdate,
    onDelete,
    canReply,
    viewerEmail,
    submitting,
}: CommentNodeProps) {
    const [replyOpen, setReplyOpen] = useState(false);
    const [replyContent, setReplyContent] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(item.content);

    const canManage = isCommentOwner(viewerEmail, item.authorEmail);
    const isEdited = Boolean(item.updatedAt);

    const handleReply = async () => {
        if (!replyContent.trim()) {
            return;
        }

        await onReply(item.id, replyContent);
        setReplyContent("");
        setReplyOpen(false);
    };

    const handleSaveEdit = async () => {
        if (!editContent.trim()) {
            return;
        }

        await onUpdate(item.id, editContent);
        setIsEditing(false);
    };

    const handleDelete = async () => {
        const confirmed = window.confirm("Delete this comment?");
        if (!confirmed) {
            return;
        }

        await onDelete(item.id);
    };

    return (
        <li className={styles.commentItem}>
            <div className={styles.commentBody}>
                <div className={styles.commentMeta}>
                    <span>{item.authorName}</span>
                    <span className={styles.dot}>•</span>
                    <span>{new Date(item.createdAt).toLocaleString()}</span>
                    {isEdited && (
                        <>
                            <span className={styles.dot}>•</span>
                            <span>edited</span>
                        </>
                    )}
                </div>

                {isEditing ? (
                    <div className={styles.editEditor}>
                        <textarea
                            value={editContent}
                            onChange={(event) => setEditContent(event.target.value)}
                            placeholder="Edit comment"
                        />
                        <div className={styles.actionButtons}>
                            <button onClick={handleSaveEdit} disabled={submitting}>
                                Save
                            </button>
                            <button
                                className={styles.secondaryButton}
                                onClick={() => {
                                    setEditContent(item.content);
                                    setIsEditing(false);
                                }}
                                disabled={submitting}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                ) : (
                    <p className={styles.commentContent}>{item.content}</p>
                )}

                <div className={styles.commentActions}>
                    {canReply && (
                        <button
                            className={styles.replyToggle}
                            onClick={() => setReplyOpen((prev) => !prev)}
                            disabled={submitting}
                        >
                            Reply
                        </button>
                    )}
                    {canManage && !isEditing && (
                        <>
                            <button
                                className={styles.replyToggle}
                                onClick={() => {
                                    setEditContent(item.content);
                                    setIsEditing(true);
                                }}
                                disabled={submitting}
                            >
                                Edit
                            </button>
                            <button
                                className={styles.replyToggle}
                                onClick={handleDelete}
                                disabled={submitting}
                            >
                                Delete
                            </button>
                        </>
                    )}
                </div>

                {replyOpen && (
                    <div className={styles.replyEditor}>
                        <textarea
                            value={replyContent}
                            onChange={(event) => setReplyContent(event.target.value)}
                            placeholder="Write a reply"
                        />
                        <button onClick={handleReply} disabled={submitting}>
                            Post reply
                        </button>
                    </div>
                )}
            </div>

            {item.replies.length > 0 && (
                <ul className={styles.replyList}>
                    {item.replies.map((reply) => (
                        <CommentNode
                            key={reply.id}
                            item={reply}
                            onReply={onReply}
                            onUpdate={onUpdate}
                            onDelete={onDelete}
                            canReply={canReply}
                            viewerEmail={viewerEmail}
                            submitting={submitting}
                        />
                    ))}
                </ul>
            )}
        </li>
    );
}

interface CommentsSectionProps {
    postSlug: string;
}

export function CommentsSection({ postSlug }: CommentsSectionProps) {
    const { user } = useAuthStore();
    const [newComment, setNewComment] = useState("");
    const { comments, submitting, addComment, updateComment, deleteComment } = useComments({
        postSlug,
        userEmail: user?.email,
        userName: user?.name,
    });

    const handleCreateComment = async () => {
        if (!newComment.trim()) {
            return;
        }

        try {
            await addComment(newComment);
            setNewComment("");
            toast.success("Comment added");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to add comment");
        }
    };

    const handleReply = async (parentId: string, content: string) => {
        try {
            await addComment(content, parentId);
            toast.success("Reply added");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to add reply");
        }
    };

    const handleUpdateComment = async (commentId: string, content: string) => {
        try {
            await updateComment(commentId, content);
            toast.success("Comment updated");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to update comment");
        }
    };

    const handleDeleteComment = async (commentId: string) => {
        try {
            await deleteComment(commentId);
            toast.success("Comment deleted");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to delete comment");
        }
    };

    return (
        <section className={styles.section}>
            <h3 className={styles.title}>Comments</h3>

            {user ? (
                <div className={styles.newComment}>
                    <textarea
                        value={newComment}
                        onChange={(event) => setNewComment(event.target.value)}
                        placeholder="Write a comment"
                    />
                    <button onClick={handleCreateComment} disabled={submitting}>
                        {submitting ? "Posting..." : "Post comment"}
                    </button>
                </div>
            ) : (
                <p className={styles.loginHint}>Login to write comments and replies.</p>
            )}

            <ul className={styles.commentList}>
                {comments.length === 0 ? (
                    <li className={styles.empty}>No comments yet</li>
                ) : (
                    comments.map((item) => (
                        <CommentNode
                            key={item.id}
                            item={item}
                            onReply={handleReply}
                            onUpdate={handleUpdateComment}
                            onDelete={handleDeleteComment}
                            canReply={Boolean(user)}
                            viewerEmail={user?.email}
                            submitting={submitting}
                        />
                    ))
                )}
            </ul>
        </section>
    );
}
