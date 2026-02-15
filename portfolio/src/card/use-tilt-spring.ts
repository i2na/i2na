import { useEffect, useRef } from "react";

import { SPRING_DAMPING, SPRING_STIFFNESS } from "./card.constants";
import type { TTilt } from "./card.types";

type TUseTiltSpringOptions = {
    targetTiltRef: React.MutableRefObject<TTilt>;
};

export function useTiltSpring(options: TUseTiltSpringOptions): React.MutableRefObject<TTilt> {
    const { targetTiltRef } = options;
    const currentTiltRef = useRef<TTilt>({ x: 0, y: 0 });
    const velocityRef = useRef<TTilt>({ x: 0, y: 0 });

    useEffect(() => {
        let frameId = 0;

        const updateTilt = (): void => {
            const targetTilt = targetTiltRef.current;

            velocityRef.current.x =
                velocityRef.current.x * SPRING_DAMPING +
                (targetTilt.x - currentTiltRef.current.x) * SPRING_STIFFNESS;
            velocityRef.current.y =
                velocityRef.current.y * SPRING_DAMPING +
                (targetTilt.y - currentTiltRef.current.y) * SPRING_STIFFNESS;

            currentTiltRef.current.x += velocityRef.current.x;
            currentTiltRef.current.y += velocityRef.current.y;

            frameId = window.requestAnimationFrame(updateTilt);
        };

        frameId = window.requestAnimationFrame(updateTilt);

        return () => {
            window.cancelAnimationFrame(frameId);
        };
    }, [targetTiltRef]);

    return currentTiltRef;
}
