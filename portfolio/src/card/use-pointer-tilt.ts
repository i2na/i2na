import { useEffect, useRef } from "react";

import { MAX_DEVICE_TILT_DEG, MAX_POINTER_TILT_DEG } from "./card.constants";
import type { TTilt } from "./card.types";

type TUsePointerTiltOptions = {
    isEnabled: boolean;
    isTouchMode: boolean;
    targetRef: React.MutableRefObject<HTMLElement | null>;
};

function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}

function calculateTiltFromPointer(
    event: PointerEvent,
    targetElement: HTMLElement,
    tiltLimit: number
): TTilt {
    const targetRect = targetElement.getBoundingClientRect();
    const centerX = targetRect.left + targetRect.width / 2;
    const centerY = targetRect.top + targetRect.height / 2;
    const normalizedX = clamp((event.clientX - centerX) / (targetRect.width / 2), -1, 1);
    const normalizedY = clamp((event.clientY - centerY) / (targetRect.height / 2), -1, 1);

    return {
        x: clamp(-normalizedY * tiltLimit, -tiltLimit, tiltLimit),
        y: clamp(normalizedX * tiltLimit, -tiltLimit, tiltLimit),
    };
}

export function usePointerTilt(options: TUsePointerTiltOptions): React.MutableRefObject<TTilt> {
    const { isEnabled, isTouchMode, targetRef } = options;
    const tiltRef = useRef<TTilt>({ x: 0, y: 0 });

    useEffect(() => {
        if (!isEnabled || !targetRef.current) {
            tiltRef.current.x = 0;
            tiltRef.current.y = 0;
            return undefined;
        }

        const targetElement = targetRef.current;
        const tiltLimit = isTouchMode ? MAX_DEVICE_TILT_DEG : MAX_POINTER_TILT_DEG;

        if (!isTouchMode) {
            const handlePointerMove = (event: PointerEvent): void => {
                const tilt = calculateTiltFromPointer(event, targetElement, tiltLimit);
                tiltRef.current.x = tilt.x;
                tiltRef.current.y = tilt.y;
            };

            const resetTilt = (): void => {
                tiltRef.current.x = 0;
                tiltRef.current.y = 0;
            };

            targetElement.addEventListener("pointermove", handlePointerMove, { passive: true });
            targetElement.addEventListener("pointerleave", resetTilt);

            return () => {
                targetElement.removeEventListener("pointermove", handlePointerMove);
                targetElement.removeEventListener("pointerleave", resetTilt);
            };
        }

        let activePointerId: number | null = null;

        const handlePointerDown = (event: PointerEvent): void => {
            if (event.pointerType !== "touch") {
                return;
            }

            event.preventDefault();
            activePointerId = event.pointerId;
            targetElement.setPointerCapture(event.pointerId);
            const tilt = calculateTiltFromPointer(event, targetElement, tiltLimit);
            tiltRef.current.x = tilt.x;
            tiltRef.current.y = tilt.y;
        };

        const handlePointerMove = (event: PointerEvent): void => {
            if (activePointerId !== event.pointerId) {
                return;
            }

            event.preventDefault();
            const tilt = calculateTiltFromPointer(event, targetElement, tiltLimit);
            tiltRef.current.x = tilt.x;
            tiltRef.current.y = tilt.y;
        };

        const resetTilt = (): void => {
            activePointerId = null;
            tiltRef.current.x = 0;
            tiltRef.current.y = 0;
        };

        const handlePointerUp = (event: PointerEvent): void => {
            if (activePointerId !== event.pointerId) {
                return;
            }

            targetElement.releasePointerCapture(event.pointerId);
            resetTilt();
        };

        targetElement.addEventListener("pointerdown", handlePointerDown);
        targetElement.addEventListener("pointermove", handlePointerMove);
        targetElement.addEventListener("pointerup", handlePointerUp);
        targetElement.addEventListener("pointercancel", handlePointerUp);

        return () => {
            targetElement.removeEventListener("pointerdown", handlePointerDown);
            targetElement.removeEventListener("pointermove", handlePointerMove);
            targetElement.removeEventListener("pointerup", handlePointerUp);
            targetElement.removeEventListener("pointercancel", handlePointerUp);
        };
    }, [isEnabled, isTouchMode, targetRef]);

    return tiltRef;
}
