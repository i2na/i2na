"use client";

import { useCallback, useEffect, useState } from "react";
import {
    createPostComment,
    deletePostComment,
    fetchPostComments,
    updatePostComment,
} from "@/shared/lib/api";
import type { ICommentItem } from "@/shared/lib/types";

interface IUseCommentsOptions {
    postSlug: string;
    userEmail?: string | null;
    userName?: string | null;
}

export function useComments(options: IUseCommentsOptions) {
    const [comments, setComments] = useState<ICommentItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const loadComments = useCallback(async () => {
        try {
            setLoading(true);
            const data = await fetchPostComments(options.postSlug, {
                userEmail: options.userEmail,
                userName: options.userName,
            });

            setComments(data.comments || []);
        } catch {
            setComments([]);
        } finally {
            setLoading(false);
        }
    }, [options.postSlug, options.userEmail, options.userName]);

    useEffect(() => {
        loadComments();
    }, [loadComments]);

    const addComment = useCallback(
        async (content: string, parentId?: string) => {
            if (!options.userEmail) {
                throw new Error("Login required");
            }

            setSubmitting(true);
            try {
                await createPostComment(
                    options.postSlug,
                    {
                        content,
                        ...(parentId ? { parentId } : {}),
                        authorName: options.userName || options.userEmail,
                    },
                    {
                        userEmail: options.userEmail,
                        userName: options.userName,
                    }
                );

                await loadComments();
            } finally {
                setSubmitting(false);
            }
        },
        [loadComments, options.postSlug, options.userEmail, options.userName]
    );

    const updateComment = useCallback(
        async (commentId: string, content: string) => {
            if (!options.userEmail) {
                throw new Error("Login required");
            }

            setSubmitting(true);
            try {
                await updatePostComment(
                    options.postSlug,
                    commentId,
                    { content },
                    {
                        userEmail: options.userEmail,
                        userName: options.userName,
                    }
                );

                await loadComments();
            } finally {
                setSubmitting(false);
            }
        },
        [loadComments, options.postSlug, options.userEmail, options.userName]
    );

    const deleteComment = useCallback(
        async (commentId: string) => {
            if (!options.userEmail) {
                throw new Error("Login required");
            }

            setSubmitting(true);
            try {
                await deletePostComment(options.postSlug, commentId, {
                    userEmail: options.userEmail,
                    userName: options.userName,
                });

                await loadComments();
            } finally {
                setSubmitting(false);
            }
        },
        [loadComments, options.postSlug, options.userEmail, options.userName]
    );

    return {
        comments,
        loading,
        submitting,
        addComment,
        updateComment,
        deleteComment,
        reload: loadComments,
    };
}
