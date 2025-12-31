import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export function AuthCallbackPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const authDataStr = searchParams.get("data");
        const redirectPath = searchParams.get("redirect") || "/";

        if (authDataStr) {
            try {
                const authData = JSON.parse(decodeURIComponent(authDataStr));

                localStorage.setItem("archive_auth_token", authData.token);
                localStorage.setItem("archive_user_email", authData.email);
                localStorage.setItem("archive_user_name", authData.name);
                localStorage.setItem("archive_expires", authData.expires.toString());

                localStorage.removeItem("auth_return_path");
                localStorage.removeItem("auth_in_progress");

                navigate(redirectPath, { replace: true });
            } catch (error) {
                console.error("Auth callback error:", error);
                navigate("/", { replace: true });
            }
        } else {
            navigate("/", { replace: true });
        }
    }, [searchParams, navigate]);

    return (
        <div
            style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100vh",
                fontSize: "16px",
                color: "#666",
            }}
        >
            로그인 중...
        </div>
    );
}
