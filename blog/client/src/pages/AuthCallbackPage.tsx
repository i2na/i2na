import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { STORAGE_KEYS } from "@/config/constants";

export function AuthCallbackPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const authDataStr = searchParams.get("data");
        const redirectPath = searchParams.get("redirect") || "/";

        if (authDataStr) {
            try {
                const authData = JSON.parse(decodeURIComponent(authDataStr));

                localStorage.setItem(STORAGE_KEYS.TOKEN, authData.token);
                localStorage.setItem(STORAGE_KEYS.EMAIL, authData.email);
                localStorage.setItem(STORAGE_KEYS.NAME, authData.name);
                localStorage.setItem(STORAGE_KEYS.EXPIRES, authData.expires.toString());

                localStorage.removeItem(STORAGE_KEYS.AUTH_RETURN_PATH);
                localStorage.removeItem(STORAGE_KEYS.AUTH_IN_PROGRESS);

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
