import { useState, useRef, useEffect, useCallback } from "react";
import Spline from "@splinetool/react-spline";
import type { Application, SPEObject } from "@splinetool/runtime";
import styles from "./SplineScene.module.scss";
import cn from "classnames";

const isDevelopment = import.meta.env.DEV;

export function SplineScene() {
    const [isLoading, setIsLoading] = useState(true);
    const splineRef = useRef<Application | null>(null);
    const robotRef = useRef<SPEObject | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // 터치 포인터 추적
    const touchPositionRef = useRef({ x: 0, y: 0 });
    const isTouchingRef = useRef(false);
    const isMobileRef = useRef(false);

    const onLoad = useCallback((splineApp: Application) => {
        splineRef.current = splineApp;
        setIsLoading(false);

        // 로봇 객체 찾기 - 여러 가능한 이름 시도
        const possibleNames = ["Robot", "robot", "Head", "Eyes", "Character"];

        for (const name of possibleNames) {
            const obj = splineApp.findObjectByName(name);
            if (obj) {
                robotRef.current = obj;
                console.log(`Found Spline object: ${name}`);
                break;
            }
        }

        // 찾지 못한 경우 모든 객체 출력 (디버깅용)
        if (!robotRef.current) {
            console.log("Available Spline objects:", splineApp.getAllObjects?.());
        }
    }, []);

    useEffect(() => {
        // 모바일 기기 감지
        isMobileRef.current =
            /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
                navigator.userAgent
            ) || window.innerWidth < 768;

        const container = containerRef.current;
        if (!container) return;

        let animationFrameId: number;
        let lastUpdateTime = 0;
        const updateInterval = isMobileRef.current ? 1000 / 30 : 1000 / 60; // 모바일: 30fps, 데스크톱: 60fps

        // 데스크톱: 마우스 이동
        function handleMouseMove(e: MouseEvent) {
            if (isTouchingRef.current || isMobileRef.current) return;
            updatePosition(e.clientX, e.clientY);
        }

        // 모바일: 터치 시작
        function handleTouchStart(e: TouchEvent) {
            isTouchingRef.current = true;
            if (e.touches.length > 0) {
                const touch = e.touches[0];
                updatePosition(touch.clientX, touch.clientY);
            }
        }

        // 모바일: 터치 이동 (드래그)
        function handleTouchMove(e: TouchEvent) {
            e.preventDefault(); // 스크롤 방지
            if (e.touches.length > 0) {
                const touch = e.touches[0];
                updatePosition(touch.clientX, touch.clientY);
            }
        }

        // 모바일: 터치 종료
        function handleTouchEnd() {
            isTouchingRef.current = false;
        }

        function updatePosition(clientX: number, clientY: number) {
            const rect = container!.getBoundingClientRect();

            touchPositionRef.current = {
                x: ((clientX - rect.left) / rect.width) * 2 - 1,
                y: -((clientY - rect.top) / rect.height) * 2 + 1,
            };
        }

        // 로봇 회전 애니메이션
        function animate(currentTime: number) {
            // 프레임레이트 제한 (성능 최적화)
            if (currentTime - lastUpdateTime < updateInterval) {
                animationFrameId = requestAnimationFrame(animate);
                return;
            }
            lastUpdateTime = currentTime;

            if (robotRef.current && splineRef.current) {
                const { x, y } = touchPositionRef.current;

                // 로봇 눈 또는 머리 회전
                const targetRotationY = x * Math.PI * 0.3; // 좌우 회전
                const targetRotationX = y * Math.PI * 0.2; // 상하 회전

                // 부드러운 전환을 위한 lerp (모바일에서는 더 빠른 전환)
                const lerpFactor = isMobileRef.current ? 0.15 : 0.1;

                if (robotRef.current.rotation) {
                    robotRef.current.rotation.y +=
                        (targetRotationY - robotRef.current.rotation.y) * lerpFactor;
                    robotRef.current.rotation.x +=
                        (targetRotationX - robotRef.current.rotation.x) * lerpFactor;
                }
            }

            animationFrameId = requestAnimationFrame(animate);
        }

        // 이벤트 리스너 등록
        if (!isMobileRef.current) {
            container.addEventListener("mousemove", handleMouseMove);
        }
        container.addEventListener("touchstart", handleTouchStart, { passive: false });
        container.addEventListener("touchmove", handleTouchMove, { passive: false });
        container.addEventListener("touchend", handleTouchEnd);

        animationFrameId = requestAnimationFrame(animate);

        return () => {
            container.removeEventListener("mousemove", handleMouseMove);
            container.removeEventListener("touchstart", handleTouchStart);
            container.removeEventListener("touchmove", handleTouchMove);
            container.removeEventListener("touchend", handleTouchEnd);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <div ref={containerRef} className={styles.splineContainer}>
            {isLoading && (
                <div className={styles.loadingOverlay}>
                    <div className={styles.loadingText}>Initializing 3D Environment...</div>
                </div>
            )}

            {!isDevelopment && !isLoading && (
                <div className={styles.developmentOverlay}>
                    <div className={styles.loadingText}>Website under development...</div>
                </div>
            )}

            <Spline
                scene="https://prod.spline.design/lhoMFjCQKliyDkMw/scene.splinecode"
                onLoad={onLoad}
                className={cn(styles.spline, isLoading ? styles.loading : styles.loaded)}
            />
        </div>
    );
}
