"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createPost, deletePostBySlug, fetchPost, updatePost, uploadMedia } from "@/shared/lib/api";
import type { IPostUpsertPayload, TPostVisibility } from "@/shared/lib/types";

export type TEditorMode = "create" | "edit";

export interface IPostEditorForm {
    title: string;
    description: string;
    slug: string;
    content: string;
    visibility: TPostVisibility;
    sharedWith: string;
}

interface IUsePostEditorOptions {
    mode: TEditorMode;
    slug?: string;
    userEmail?: string | null;
    userName?: string | null;
}

const DEFAULT_FORM: IPostEditorForm = {
    title: "",
    description: "",
    slug: "",
    content: "",
    visibility: "public",
    sharedWith: "",
};

function normalizeEmails(value: string): string[] {
    return value
        .split(/[,\n]+/)
        .map((email) => email.trim().toLowerCase())
        .filter((email) => email.length > 0);
}

function toMediaMarkdown(url: string): string {
    const imageExtensions = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
    const isImage = imageExtensions.some((extension) => url.toLowerCase().endsWith(extension));

    if (isImage) {
        return `![media](${url})`;
    }

    return `<video controls src="${url}"></video>`;
}

export function usePostEditor(options: IUsePostEditorOptions) {
    const router = useRouter();
    const [form, setForm] = useState<IPostEditorForm>(DEFAULT_FORM);
    const [isLoading, setIsLoading] = useState(options.mode === "edit");
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        if (options.mode !== "edit" || !options.slug) {
            setIsLoading(false);
            return;
        }

        const targetSlug = options.slug;
        let isMounted = true;

        const loadPost = async () => {
            try {
                setIsLoading(true);
                const post = await fetchPost(targetSlug, {
                    userEmail: options.userEmail,
                    userName: options.userName,
                });

                if (!isMounted) {
                    return;
                }

                setForm({
                    title: post.title,
                    description: post.description,
                    slug: post.slug,
                    content: post.content,
                    visibility: post.metadata.visibility,
                    sharedWith: post.metadata.sharedWith.join("\n"),
                });
            } catch (error) {
                if (isMounted) {
                    setErrorMessage(error instanceof Error ? error.message : "Failed to load post");
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        loadPost();

        return () => {
            isMounted = false;
        };
    }, [options.mode, options.slug, options.userEmail, options.userName]);

    const canSubmit = useMemo(() => {
        return form.title.trim().length > 0 && form.description.trim().length > 0;
    }, [form.title, form.description]);

    const handleChange = useCallback(
        (field: keyof IPostEditorForm, value: string | TPostVisibility) => {
            setForm((prev) => ({
                ...prev,
                [field]: value,
            }));
        },
        []
    );

    const buildPayload = useCallback((): IPostUpsertPayload => {
        return {
            title: form.title.trim(),
            description: form.description.trim(),
            content: form.content,
            visibility: form.visibility,
            sharedWith: normalizeEmails(form.sharedWith),
            slug: form.slug.trim() || undefined,
            ...(options.mode === "edit" && form.slug.trim() ? { nextSlug: form.slug.trim() } : {}),
        };
    }, [form, options.mode]);

    const handleSave = useCallback(async (): Promise<string> => {
        if (!options.userEmail) {
            throw new Error("Unauthorized");
        }

        if (!canSubmit) {
            throw new Error("Title and description are required");
        }

        setIsSaving(true);
        setErrorMessage(null);

        try {
            const payload = buildPayload();

            if (options.mode === "create") {
                const created = await createPost(payload, {
                    userEmail: options.userEmail,
                    userName: options.userName,
                });
                router.push(`/${created.slug}`);
                return created.slug;
            }

            if (!options.slug) {
                throw new Error("Missing post slug");
            }

            const updated = await updatePost(options.slug, payload, {
                userEmail: options.userEmail,
                userName: options.userName,
            });
            router.push(`/${updated.slug}`);
            return updated.slug;
        } finally {
            setIsSaving(false);
        }
    }, [
        buildPayload,
        canSubmit,
        options.mode,
        options.slug,
        options.userEmail,
        options.userName,
        router,
    ]);

    const handleDelete = useCallback(async () => {
        if (options.mode !== "edit" || !options.slug || !options.userEmail) {
            return;
        }

        setIsSaving(true);
        setErrorMessage(null);

        try {
            await deletePostBySlug(options.slug, {
                userEmail: options.userEmail,
                userName: options.userName,
            });
            router.push("/");
        } finally {
            setIsSaving(false);
        }
    }, [options.mode, options.slug, options.userEmail, options.userName, router]);

    const handleUploadMedia = useCallback(
        async (
            file: File,
            cursorStart: number,
            cursorEnd: number
        ): Promise<{ nextContent: string; insertedText: string }> => {
            if (!options.userEmail) {
                throw new Error("Unauthorized");
            }

            setIsUploading(true);
            setErrorMessage(null);

            try {
                const uploaded = await uploadMedia(file, {
                    userEmail: options.userEmail,
                    userName: options.userName,
                });

                const insertedText = toMediaMarkdown(uploaded.url);
                const nextContent =
                    form.content.slice(0, cursorStart) +
                    insertedText +
                    form.content.slice(cursorEnd);

                setForm((prev) => ({
                    ...prev,
                    content: nextContent,
                }));

                return {
                    nextContent,
                    insertedText,
                };
            } finally {
                setIsUploading(false);
            }
        },
        [form.content, options.userEmail, options.userName]
    );

    return {
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
    };
}
