import { useCardRuntime } from "../engine/use-card-runtime";
import styles from "./CardScene.module.scss";

export function CardScene() {
    const { sceneContainerRef, canvasRef } = useCardRuntime();

    return (
        <section
            className={styles.cardScene}
            ref={sceneContainerRef}
            aria-label="YENA identity card"
        >
            <canvas className={styles.canvas} ref={canvasRef} draggable={false} />
        </section>
    );
}
