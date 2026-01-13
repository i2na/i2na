import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";
import { getMarkdownFileByFilename } from "@/utils/markdown";
import { getUserInfo } from "@/utils/auth";
import { useAdminStore } from "@/store/admin";
import { updatePostSharedWith, deletePost } from "@/utils/api";
import { IoArrowBack } from "react-icons/io5";
import { IoClose } from "react-icons/io5";
import { IoTrashOutline } from "react-icons/io5";
import { GoLock } from "react-icons/go";
import type { MarkdownFile } from "@/types";
import styles from "./SettingPage.module.scss";

function validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function parseEmails(input: string): string[] {
    return input
        .split(/[\n,]+/)
        .map((email) => email.trim())
        .filter((email) => email.length > 0);
}

interface IAddEmailsModalProps {
    archiveEmails: string[];
    existingEmails: string[];
    onClose: () => void;
    onAdd: (emails: string[]) => void;
}

function AddEmailsModal({ archiveEmails, existingEmails, onClose, onAdd }: IAddEmailsModalProps) {
    const [selectedArchiveEmails, setSelectedArchiveEmails] = useState<Set<string>>(new Set());
    const [inputEmails, setInputEmails] = useState("");
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [onClose]);

    const handleArchiveToggle = (email: string) => {
        const newSelected = new Set(selectedArchiveEmails);
        if (newSelected.has(email)) {
            newSelected.delete(email);
        } else {
            newSelected.add(email);
        }
        setSelectedArchiveEmails(newSelected);
    };

    const handleAdd = () => {
        const parsedEmails = parseEmails(inputEmails);
        const archiveSelected = Array.from(selectedArchiveEmails);
        const allEmails = [...archiveSelected, ...parsedEmails];

        const validEmails = allEmails.filter((email) => {
            if (!validateEmail(email)) {
                toast.error(`잘못된 이메일 형식: ${email}`);
                return false;
            }
            return true;
        });

        const uniqueEmails = Array.from(new Set(validEmails));
        const newEmails = uniqueEmails.filter((email) => !existingEmails.includes(email));

        if (newEmails.length === 0) {
            toast.error("추가할 이메일이 없습니다");
            return;
        }

        onAdd(newEmails);
        onClose();
    };

    const totalToAdd =
        selectedArchiveEmails.size +
        parseEmails(inputEmails).filter((email) => {
            return validateEmail(email) && !existingEmails.includes(email);
        }).length;

    return (
        <div className={styles.modalOverlay}>
            <div ref={modalRef} className={styles.addEmailsModal}>
                <div className={styles.modalHeader}>Add Emails</div>
                <div className={styles.modalContent}>
                    <div className={styles.modalSection}>
                        <div className={styles.modalSectionTitle}>Archive</div>
                        <div className={styles.modalList}>
                            {archiveEmails.length === 0 ? (
                                <div className={styles.emptyMessage}>No archived emails</div>
                            ) : (
                                archiveEmails.map((email) => (
                                    <label key={email} className={styles.modalItem}>
                                        <input
                                            type="checkbox"
                                            checked={selectedArchiveEmails.has(email)}
                                            onChange={() => handleArchiveToggle(email)}
                                        />
                                        <span>{email}</span>
                                    </label>
                                ))
                            )}
                        </div>
                    </div>

                    <div className={styles.modalSection}>
                        <div className={styles.modalSectionTitle}>Enter emails</div>
                        <textarea
                            className={styles.emailInput}
                            value={inputEmails}
                            onChange={(e) => setInputEmails(e.target.value)}
                            placeholder={"user1@example.com\nuser2@example.com"}
                            rows={4}
                        />
                    </div>
                </div>
                <div className={styles.modalActions}>
                    <button className={styles.modalCancelButton} onClick={onClose}>
                        Cancel
                    </button>
                    <button className={styles.modalAddButton} onClick={handleAdd}>
                        Add ({totalToAdd})
                    </button>
                </div>
            </div>
        </div>
    );
}

export function SettingPage() {
    const { filename } = useParams<{ filename: string }>();
    const navigate = useNavigate();
    const user = getUserInfo();
    const { isAdmin, archiveEmails } = useAdminStore();

    const [file, setFile] = useState<MarkdownFile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);

    useEffect(() => {
        if (!isAdmin) {
            toast.error("Admin access required");
            navigate("/");
            return;
        }

        if (!filename) {
            navigate("/");
            return;
        }

        const fetchPost = async () => {
            setLoading(true);
            const userEmail = user?.email || null;
            let baseFilename = filename || "";

            if (baseFilename.endsWith("/setting")) {
                baseFilename = baseFilename.replace("/setting", "");
            }

            const fullFilename = `${baseFilename}.md`;

            const post = await getMarkdownFileByFilename(fullFilename, userEmail);

            if (!post) {
                toast.error("Post not found");
                navigate("/");
                return;
            }

            setFile(post);
            setLoading(false);
        };

        fetchPost();
    }, [filename, user?.email, navigate, isAdmin]);

    const handleRemoveEmail = async (emailToRemove: string) => {
        if (!file || !user) return;

        const updatedSharedWith = file.metadata.sharedWith.filter(
            (email) => email !== emailToRemove
        );

        try {
            setSaving(true);
            await updatePostSharedWith(
                file.filename,
                updatedSharedWith,
                user.email,
                file.metadata.visibility
            );
            setFile({
                ...file,
                metadata: {
                    ...file.metadata,
                    sharedWith: updatedSharedWith,
                },
            });
            toast.success("이메일이 제거되었습니다");
        } catch (error) {
            toast.error("이메일 제거에 실패했습니다");
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    const handleAddEmails = async (newEmails: string[]) => {
        if (!file || !user) return;

        const updatedSharedWith = [...file.metadata.sharedWith, ...newEmails];

        try {
            setSaving(true);
            await updatePostSharedWith(
                file.filename,
                updatedSharedWith,
                user.email,
                file.metadata.visibility
            );
            setFile({
                ...file,
                metadata: {
                    ...file.metadata,
                    sharedWith: updatedSharedWith,
                },
            });
            toast.success(`${newEmails.length}개의 이메일이 추가되었습니다`);
        } catch (error) {
            toast.error("이메일 추가에 실패했습니다");
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    const handleVisibilityToggle = async () => {
        if (!file || !user) return;

        const newVisibility = file.metadata.visibility === "public" ? "private" : "public";

        try {
            setSaving(true);
            await updatePostSharedWith(
                file.filename,
                file.metadata.sharedWith,
                user.email,
                newVisibility
            );
            setFile({
                ...file,
                metadata: {
                    ...file.metadata,
                    visibility: newVisibility,
                },
            });
            toast.success(`${newVisibility}으로 변경되었습니다`);
        } catch (error) {
            toast.error("Visibility 변경에 실패했습니다");
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteClick = async () => {
        if (!file || !user) return;

        const confirmed = window.confirm("게시물을 삭제하시겠습니까?");

        if (confirmed) {
            try {
                setSaving(true);
                await deletePost(file.filename, user.email);
                toast.success("게시물이 삭제되었습니다");
                navigate("/");
            } catch (error) {
                toast.error("게시물 삭제에 실패했습니다");
                console.error(error);
            } finally {
                setSaving(false);
            }
        }
    };

    if (loading) {
        return (
            <div className={styles.settingPage}>
                <div className={styles.loading} />
            </div>
        );
    }

    if (!file) {
        return null;
    }

    const baseFilename = file.filename.replace(".md", "");

    return (
        <div className={styles.settingPage}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <button
                        className={styles.backButton}
                        onClick={() => navigate(`/${baseFilename}`)}
                    >
                        <IoArrowBack />
                        <span>Back to Post</span>
                    </button>
                </div>

                <div className={styles.content}>
                    <div className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionTitle}>
                                Shared Emails ({file.metadata.sharedWith.length})
                            </h2>
                            <button
                                className={styles.visibilityToggle}
                                onClick={handleVisibilityToggle}
                                disabled={saving}
                            >
                                {file.metadata.visibility === "private" && <GoLock size={12} />}
                                <span>
                                    {file.metadata.visibility === "public" ? "Public" : "Private"}
                                </span>
                            </button>
                        </div>
                        <div
                            className={`${styles.emailList} ${
                                file.metadata.visibility === "public" ? styles.disabled : ""
                            }`}
                        >
                            {file.metadata.sharedWith.length === 0 ? (
                                <div className={styles.emptyMessage}>No shared emails</div>
                            ) : (
                                file.metadata.sharedWith.map((email) => (
                                    <div key={email} className={styles.emailItem}>
                                        <span className={styles.emailAddress}>{email}</span>
                                        <button
                                            className={styles.removeButton}
                                            onClick={() => handleRemoveEmail(email)}
                                            disabled={
                                                saving || file.metadata.visibility === "public"
                                            }
                                        >
                                            <IoClose />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                        <button
                            className={styles.addButton}
                            onClick={() => setShowAddModal(true)}
                            disabled={saving || file.metadata.visibility === "public"}
                        >
                            + Add emails
                        </button>
                    </div>
                </div>

                <div className={styles.footer}>
                    <button
                        className={styles.deleteButton}
                        onClick={handleDeleteClick}
                        disabled={saving}
                    >
                        <IoTrashOutline />
                        Delete Post
                    </button>
                </div>
            </div>

            {showAddModal && (
                <AddEmailsModal
                    archiveEmails={archiveEmails}
                    existingEmails={file.metadata.sharedWith}
                    onClose={() => setShowAddModal(false)}
                    onAdd={handleAddEmails}
                />
            )}
        </div>
    );
}
