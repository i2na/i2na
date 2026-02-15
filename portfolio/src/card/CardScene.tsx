import { useEffect, useRef, useState } from "react";
import {
    AmbientLight,
    Clock,
    DirectionalLight,
    Group,
    MathUtils,
    Mesh,
    MeshBasicMaterial,
    PerspectiveCamera,
    PlaneGeometry,
    Scene,
    Vector2,
} from "three";

import { PROFILE } from "../config/profile.constants";
import {
    CAMERA_DISTANCE,
    CAMERA_FOV,
    CARD_ASPECT_RATIO,
    CARD_HEIGHT,
    CARD_WIDTH,
    ENABLE_DEVICE_TILT_MIN_WIDTH,
    MAX_DEVICE_TILT_DEG,
    MAX_POINTER_TILT_DEG,
} from "./card.constants";
import { createCardContentTexture } from "./card-content-texture";
import {
    createCardGlassMaterial,
    createCardMaterial,
    updateCardGlassMaterialUniforms,
    updateCardMaterialUniforms,
} from "./card-material";
import { createCardRenderer, resizeCardRenderer } from "./card-renderer";
import type { TRendererAdapter } from "./card.types";
import { usePointerTilt } from "./use-pointer-tilt";
import { useTiltSpring } from "./use-tilt-spring";

export function CardScene() {
    const sceneContainerRef = useRef<HTMLElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const frameIdRef = useRef<number>(0);
    const [isTouchInput, setIsTouchInput] = useState<boolean>(false);

    const pointerTiltRef = usePointerTilt({
        isEnabled: true,
        isTouchMode: isTouchInput,
        targetRef: sceneContainerRef,
    });
    const smoothedTiltRef = useTiltSpring({
        targetTiltRef: pointerTiltRef,
    });

    useEffect(() => {
        const mediaQuery = window.matchMedia(
            `(max-width: ${ENABLE_DEVICE_TILT_MIN_WIDTH}px), (pointer: coarse)`
        );

        const updateInputMode = (): void => {
            setIsTouchInput(mediaQuery.matches);
        };

        updateInputMode();
        mediaQuery.addEventListener("change", updateInputMode);

        return () => {
            mediaQuery.removeEventListener("change", updateInputMode);
        };
    }, []);

    useEffect(() => {
        if (!canvasRef.current) {
            return undefined;
        }

        const canvas = canvasRef.current;
        const scene = new Scene();
        const camera = new PerspectiveCamera(CAMERA_FOV, CARD_ASPECT_RATIO, 0.1, 20);
        camera.position.set(0, 0, CAMERA_DISTANCE);

        const cardGroup = new Group();
        scene.add(cardGroup);

        const cardGeometry = new PlaneGeometry(CARD_WIDTH, CARD_HEIGHT, 72, 72);
        const cardMaterial = createCardMaterial();
        const cardGlassMaterial = createCardGlassMaterial();
        const cardContentTexture = createCardContentTexture(PROFILE, {
            isMobileLayout: isTouchInput,
        });
        const cardContentMaterial = new MeshBasicMaterial({
            map: cardContentTexture,
            transparent: true,
            depthWrite: false,
            toneMapped: false,
        });

        const cardBaseMesh = new Mesh(cardGeometry, cardMaterial);
        const cardGlassMesh = new Mesh(cardGeometry, cardGlassMaterial);
        const cardContentMesh = new Mesh(cardGeometry, cardContentMaterial);

        cardGlassMesh.position.z = 0.0016;
        cardContentMesh.position.z = 0.0044;
        cardContentMesh.scale.set(1, 1, 1);
        cardBaseMesh.renderOrder = 1;
        cardGlassMesh.renderOrder = 2;
        cardContentMesh.renderOrder = 3;
        cardGroup.add(cardBaseMesh, cardGlassMesh, cardContentMesh);

        const ambientLight = new AmbientLight("#dff6f0", 0.56);
        const keyLight = new DirectionalLight("#8bf5dd", 1.45);
        keyLight.position.set(2.1, 1.6, 2.8);
        const fillLight = new DirectionalLight("#6aa8ff", 0.42);
        fillLight.position.set(-1.8, -1.2, 2.2);
        scene.add(ambientLight, keyLight, fillLight);

        const resolution = new Vector2(1, 1);
        const clock = new Clock();
        const idleDelaySeconds = isTouchInput ? 1.6 : 1.4;
        const idleFadeInSeconds = isTouchInput ? 3.2 : 2.8;
        let rendererAdapter: TRendererAdapter | null = null;
        let isMounted = true;
        let isLoopActive = false;
        let lastActiveInputTime = 0;
        let idleWeight = 0;

        const resize = (): void => {
            if (!rendererAdapter || !canvas.parentElement) {
                return;
            }

            const { clientWidth, clientHeight } = canvas.parentElement;
            resizeCardRenderer(rendererAdapter, clientWidth, clientHeight);
            camera.aspect = clientWidth / clientHeight;
            camera.updateProjectionMatrix();
            resolution.set(clientWidth, clientHeight);
        };

        const renderFrame = (): void => {
            if (!isLoopActive || !rendererAdapter) {
                return;
            }

            const elapsedTime = clock.getElapsedTime();
            const tilt = smoothedTiltRef.current;
            const inputMagnitude = Math.abs(tilt.x) + Math.abs(tilt.y);
            const isInputActive = inputMagnitude > 0.4;

            if (isInputActive) {
                lastActiveInputTime = elapsedTime;
            }

            const idleElapsed = elapsedTime - lastActiveInputTime - idleDelaySeconds;
            const idleFadeProgress = MathUtils.clamp(idleElapsed / idleFadeInSeconds, 0, 1);
            const easedIdleProgress =
                idleFadeProgress * idleFadeProgress * (3 - 2 * idleFadeProgress);
            const idleTargetWeight = easedIdleProgress;
            const idleLerpFactor = idleTargetWeight > idleWeight ? 0.022 : 0.2;
            idleWeight = MathUtils.lerp(idleWeight, idleTargetWeight, idleLerpFactor);

            const idleStrength = (isTouchInput ? 1.54 : 1.68) * idleWeight;
            const idleX =
                (Math.sin(elapsedTime * 0.56) * 1.34 + Math.sin(elapsedTime * 0.21 + 1.1) * 0.66) *
                idleStrength;
            const idleY =
                (Math.cos(elapsedTime * 0.5) * 1.46 + Math.sin(elapsedTime * 0.27 + 0.6) * 0.62) *
                idleStrength;
            const idleRoll =
                (Math.sin(elapsedTime * 0.44 + 0.8) * 0.68 + Math.sin(elapsedTime * 0.18) * 0.34) *
                idleStrength;
            const floatY = Math.sin(elapsedTime * 0.66) * 0.0105 * idleWeight;
            const tiltLimit = isTouchInput ? MAX_DEVICE_TILT_DEG : MAX_POINTER_TILT_DEG;
            const animatedTilt = {
                x: MathUtils.clamp(tilt.x + idleX, -(tiltLimit + 1.6), tiltLimit + 1.6),
                y: MathUtils.clamp(tilt.y + idleY, -(tiltLimit + 1.6), tiltLimit + 1.6),
            };

            cardGroup.rotation.x = MathUtils.degToRad(animatedTilt.x);
            cardGroup.rotation.y = MathUtils.degToRad(animatedTilt.y);
            cardGroup.rotation.z = MathUtils.degToRad(idleRoll);
            cardGroup.position.x = MathUtils.degToRad(animatedTilt.y) * 0.104;
            cardGroup.position.y = MathUtils.degToRad(-animatedTilt.x) * 0.074 + floatY;

            keyLight.position.x = 2.1 + animatedTilt.y * 0.02;
            keyLight.position.y = 1.6 + animatedTilt.x * 0.015;

            updateCardMaterialUniforms(cardMaterial, elapsedTime, animatedTilt, resolution);
            updateCardGlassMaterialUniforms(
                cardGlassMaterial,
                elapsedTime,
                animatedTilt,
                resolution
            );

            rendererAdapter.renderer.render(scene, camera);
            frameIdRef.current = window.requestAnimationFrame(renderFrame);
        };

        const startLoop = (): void => {
            if (isLoopActive) {
                return;
            }

            isLoopActive = true;
            frameIdRef.current = window.requestAnimationFrame(renderFrame);
        };

        const stopLoop = (): void => {
            isLoopActive = false;
            window.cancelAnimationFrame(frameIdRef.current);
        };

        const handleVisibilityChange = (): void => {
            if (document.hidden) {
                stopLoop();
                return;
            }

            startLoop();
        };

        const setup = async (): Promise<void> => {
            const adapter = await createCardRenderer(canvas);

            if (!isMounted) {
                adapter.renderer.dispose();
                return;
            }

            rendererAdapter = adapter;

            const rendererWithCapabilities = adapter.renderer as TRendererAdapter["renderer"] & {
                capabilities?: { getMaxAnisotropy: () => number };
            };

            const maxAnisotropy = rendererWithCapabilities.capabilities?.getMaxAnisotropy();

            if (maxAnisotropy) {
                cardContentTexture.anisotropy = maxAnisotropy;
                cardContentTexture.needsUpdate = true;
            }

            resize();
            startLoop();

            window.addEventListener("resize", resize);
            document.addEventListener("visibilitychange", handleVisibilityChange);
        };

        void setup();

        return () => {
            isMounted = false;
            stopLoop();
            window.removeEventListener("resize", resize);
            document.removeEventListener("visibilitychange", handleVisibilityChange);

            cardGeometry.dispose();
            cardMaterial.dispose();
            cardGlassMaterial.dispose();
            cardContentMaterial.dispose();
            cardContentTexture.dispose();
            rendererAdapter?.renderer.dispose();
        };
    }, [isTouchInput, smoothedTiltRef]);

    return (
        <section className="card-scene" ref={sceneContainerRef} aria-label="YENA identity card">
            <canvas className="card-scene__canvas" ref={canvasRef} />
        </section>
    );
}
