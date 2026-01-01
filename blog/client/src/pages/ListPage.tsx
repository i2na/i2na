import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getMarkdownFiles, filterPostsByVisibility } from "@/utils/markdown";
import { isAuthenticated, getUserInfo, startGoogleLogin, clearAuth } from "@/utils/auth";
import styles from "./ListPage.module.scss";

export function ListPage() {
    const navigate = useNavigate();
    const [authenticated, setAuthenticated] = useState(isAuthenticated());
    const [user, setUser] = useState(getUserInfo());

    useEffect(() => {
        const checkAuth = () => {
            setAuthenticated(isAuthenticated());
            setUser(getUserInfo());
        };

        checkAuth();
        window.addEventListener("focus", checkAuth);

        return () => {
            window.removeEventListener("focus", checkAuth);
        };
    }, []);

    const allFiles = getMarkdownFiles();
    const visibleFiles = filterPostsByVisibility(allFiles, user?.email || null);

    const handleFileClick = (filename: string) => {
        navigate(`/${filename}`);
    };

    const handleLogin = () => {
        startGoogleLogin("/");
    };

    const handleLogout = () => {
        clearAuth();
        setAuthenticated(false);
        setUser(null);
        window.location.reload();
    };

    return (
        <div className={styles.listPage}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Blog</h1>

                    {authenticated && user ? (
                        <div className={styles.userInfo}>
                            <span className={styles.userEmail}>{user.email}</span>
                            <button className={styles.logoutButton} onClick={handleLogout}>
                                Logout
                            </button>
                        </div>
                    ) : (
                        <button className={styles.loginButton} onClick={handleLogin}>
                            Login
                        </button>
                    )}
                </div>

                <div className={styles.list}>
                    {visibleFiles.length === 0 ? (
                        <div className={styles.empty}>게시물이 없습니다</div>
                    ) : (
                        visibleFiles.map((file) => (
                            <div
                                key={file.filename}
                                className={styles.item}
                                onClick={() => handleFileClick(file.filename)}
                            >
                                <div className={styles.itemTitle}>
                                    {file.title}
                                    {file.metadata.visibility === "private" && (
                                        <span className={styles.sharedBadge}>Shared</span>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
