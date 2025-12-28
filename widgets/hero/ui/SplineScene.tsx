import { useState } from "react";
import styles from "./SplineScene.module.scss";
import cn from "classnames";

export function SplineScene() {
    const [isLoading, setIsLoading] = useState(true);

    return (
        <div className={styles.splineContainer}>
            {isLoading && (
                <div className={styles.loadingOverlay}>
                    <div className={styles.loadingText}>Initializing 3D Environment...</div>
                </div>
            )}

            <iframe
                src="https://my.spline.design/robotfollowcursorforlandingpagemc-JznlTrxysZWVnpptAFSN4EAP/"
                className={cn(styles.iframe, isLoading ? styles.loading : styles.loaded)}
                onLoad={() => setIsLoading(false)}
                title="Spline 3D Robot"
            />
        </div>
    );
}
