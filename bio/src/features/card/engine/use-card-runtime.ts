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

import { PROFILE } from "../../../config/profile.constants";
import { detectTouchInput } from "../input/detect-input-mode";
import { usePointerTilt } from "../input/use-pointer-tilt";
import { useTiltSpring } from "../input/use-tilt-spring";
import {
    AMBIENT_LIGHT_INTENSITY,
    CARD_ENTRANCE_DURATION_SECONDS_DESKTOP,
    CARD_ENTRANCE_DURATION_SECONDS_TOUCH,
    CARD_ENTRANCE_SCALE_BACK_OVERSHOOT_DESKTOP,
    CARD_ENTRANCE_SCALE_BACK_OVERSHOOT_TOUCH,
    CARD_ENTRANCE_START_OFFSET_Y_DESKTOP,
    CARD_ENTRANCE_START_OFFSET_Y_TOUCH,
    CARD_ENTRANCE_START_ROLL_DEG_DESKTOP,
    CARD_ENTRANCE_START_ROLL_DEG_TOUCH,
    CARD_ENTRANCE_START_SCALE_DESKTOP,
    CARD_ENTRANCE_START_SCALE_TOUCH,
    CARD_ENTRANCE_START_TILT_X_DEG_DESKTOP,
    CARD_ENTRANCE_START_TILT_X_DEG_TOUCH,
    CARD_ENTRANCE_START_TILT_Y_DEG_DESKTOP,
    CARD_ENTRANCE_START_TILT_Y_DEG_TOUCH,
    CARD_ENTRANCE_SWAY_CYCLES_DESKTOP,
    CARD_ENTRANCE_SWAY_CYCLES_TOUCH,
    CARD_ENTRANCE_SWAY_ROLL_DEG_DESKTOP,
    CARD_ENTRANCE_SWAY_ROLL_DEG_TOUCH,
    CARD_ASPECT_RATIO,
    CARD_CONTENT_LAYER_Z,
    CARD_GEOMETRY_SEGMENTS,
    CARD_GLASS_LAYER_Z,
    CARD_GROUP_POSITION_FACTOR,
    CARD_HEIGHT,
    CARD_WIDTH,
    CAMERA_DISTANCE,
    CAMERA_FOV,
    FILL_LIGHT_INTENSITY,
    FILL_LIGHT_POSITION,
    IDLE_DELAY_SECONDS_DESKTOP,
    IDLE_DELAY_SECONDS_TOUCH,
    IDLE_FADE_IN_SECONDS_DESKTOP,
    IDLE_FADE_IN_SECONDS_TOUCH,
    IDLE_FLOAT_AMPLITUDE,
    IDLE_FLOAT_FREQUENCY,
    IDLE_LERP_FALL,
    IDLE_LERP_RISE,
    IDLE_ROLL_WAVE,
    IDLE_STRENGTH_DESKTOP,
    IDLE_STRENGTH_TOUCH,
    IDLE_TILT_MARGIN_DEG,
    IDLE_X_WAVE,
    IDLE_Y_WAVE,
    INPUT_ACTIVITY_THRESHOLD,
    INPUT_MODE_MEDIA_QUERY,
    KEY_LIGHT_BASE_POSITION,
    KEY_LIGHT_INTENSITY,
    KEY_LIGHT_TILT_FACTOR,
    MAX_DEVICE_TILT_DEG,
    MAX_POINTER_TILT_DEG,
} from "../model/constants";
import type { TRendererAdapter, TTilt } from "../model/types";
import { createCardContentTexture } from "../content/create-content-texture";
import {
    createCardGlassMaterial,
    createCardMaterial,
    updateCardGlassMaterialUniforms,
    updateCardMaterialUniforms,
} from "./materials";
import { createCardRenderer, resizeCardRenderer } from "./create-renderer";

type TUseCardRuntimeResult = {
    sceneContainerRef: React.MutableRefObject<HTMLElement | null>;
    canvasRef: React.MutableRefObject<HTMLCanvasElement | null>;
};

type TCardEntranceMotion = {
    durationSeconds: number;
    startScale: number;
    startOffsetY: number;
    startRollDeg: number;
    startTiltXDeg: number;
    startTiltYDeg: number;
    scaleBackOvershoot: number;
    swayRollDeg: number;
    swayCycles: number;
};

function calculateIdleTilt(elapsedTime: number, idleStrength: number): TTilt {
    const idleX =
        (Math.sin(elapsedTime * IDLE_X_WAVE.primaryFrequency) * IDLE_X_WAVE.primaryAmplitude +
            Math.sin(elapsedTime * IDLE_X_WAVE.secondaryFrequency + IDLE_X_WAVE.secondaryPhase) *
                IDLE_X_WAVE.secondaryAmplitude) *
        idleStrength;
    const idleY =
        (Math.cos(elapsedTime * IDLE_Y_WAVE.primaryFrequency) * IDLE_Y_WAVE.primaryAmplitude +
            Math.sin(elapsedTime * IDLE_Y_WAVE.secondaryFrequency + IDLE_Y_WAVE.secondaryPhase) *
                IDLE_Y_WAVE.secondaryAmplitude) *
        idleStrength;

    return { x: idleX, y: idleY };
}

function calculateIdleRoll(elapsedTime: number, idleStrength: number): number {
    return (
        (Math.sin(elapsedTime * IDLE_ROLL_WAVE.primaryFrequency + IDLE_ROLL_WAVE.primaryPhase) *
            IDLE_ROLL_WAVE.primaryAmplitude +
            Math.sin(elapsedTime * IDLE_ROLL_WAVE.secondaryFrequency) *
                IDLE_ROLL_WAVE.secondaryAmplitude) *
        idleStrength
    );
}

function easeOutCubic(progress: number): number {
    const inverseProgress = 1 - progress;

    return 1 - inverseProgress * inverseProgress * inverseProgress;
}

function easeOutBack(progress: number, overshoot: number): number {
    const shiftedProgress = progress - 1;

    return (
        1 +
        (overshoot + 1) * shiftedProgress * shiftedProgress * shiftedProgress +
        overshoot * shiftedProgress * shiftedProgress
    );
}

function calculateEntranceLinearProgress(elapsedTime: number, durationSeconds: number): number {
    if (durationSeconds <= 0) {
        return 1;
    }

    return MathUtils.clamp(elapsedTime / durationSeconds, 0, 1);
}

function calculateDampedSwayRoll(
    linearProgress: number,
    swayRollDeg: number,
    swayCycles: number
): number {
    const dampingWeight = Math.pow(1 - linearProgress, 1.15);

    return Math.sin(linearProgress * Math.PI * 2 * swayCycles) * swayRollDeg * dampingWeight;
}

function getCardEntranceMotion(isTouchInput: boolean): TCardEntranceMotion {
    if (isTouchInput) {
        return {
            durationSeconds: CARD_ENTRANCE_DURATION_SECONDS_TOUCH,
            startScale: CARD_ENTRANCE_START_SCALE_TOUCH,
            startOffsetY: CARD_ENTRANCE_START_OFFSET_Y_TOUCH,
            startRollDeg: CARD_ENTRANCE_START_ROLL_DEG_TOUCH,
            startTiltXDeg: CARD_ENTRANCE_START_TILT_X_DEG_TOUCH,
            startTiltYDeg: CARD_ENTRANCE_START_TILT_Y_DEG_TOUCH,
            scaleBackOvershoot: CARD_ENTRANCE_SCALE_BACK_OVERSHOOT_TOUCH,
            swayRollDeg: CARD_ENTRANCE_SWAY_ROLL_DEG_TOUCH,
            swayCycles: CARD_ENTRANCE_SWAY_CYCLES_TOUCH,
        };
    }

    return {
        durationSeconds: CARD_ENTRANCE_DURATION_SECONDS_DESKTOP,
        startScale: CARD_ENTRANCE_START_SCALE_DESKTOP,
        startOffsetY: CARD_ENTRANCE_START_OFFSET_Y_DESKTOP,
        startRollDeg: CARD_ENTRANCE_START_ROLL_DEG_DESKTOP,
        startTiltXDeg: CARD_ENTRANCE_START_TILT_X_DEG_DESKTOP,
        startTiltYDeg: CARD_ENTRANCE_START_TILT_Y_DEG_DESKTOP,
        scaleBackOvershoot: CARD_ENTRANCE_SCALE_BACK_OVERSHOOT_DESKTOP,
        swayRollDeg: CARD_ENTRANCE_SWAY_ROLL_DEG_DESKTOP,
        swayCycles: CARD_ENTRANCE_SWAY_CYCLES_DESKTOP,
    };
}

function preventDefaultBehavior(event: Event): void {
    event.preventDefault();
}

export function useCardRuntime(): TUseCardRuntimeResult {
    const sceneContainerRef = useRef<HTMLElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const frameIdRef = useRef<number>(0);
    const [isTouchInput, setIsTouchInput] = useState<boolean>(() => detectTouchInput());

    const pointerTiltRef = usePointerTilt({
        isEnabled: true,
        isTouchMode: isTouchInput,
        targetRef: sceneContainerRef,
    });
    const smoothedTiltRef = useTiltSpring({
        targetTiltRef: pointerTiltRef,
    });

    useEffect(() => {
        const mediaQuery = window.matchMedia(INPUT_MODE_MEDIA_QUERY);

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
        if (!isTouchInput || !sceneContainerRef.current) {
            return undefined;
        }

        const sceneContainer = sceneContainerRef.current;
        sceneContainer.addEventListener("contextmenu", preventDefaultBehavior);
        sceneContainer.addEventListener("dragstart", preventDefaultBehavior);
        sceneContainer.addEventListener("selectstart", preventDefaultBehavior);

        return () => {
            sceneContainer.removeEventListener("contextmenu", preventDefaultBehavior);
            sceneContainer.removeEventListener("dragstart", preventDefaultBehavior);
            sceneContainer.removeEventListener("selectstart", preventDefaultBehavior);
        };
    }, [isTouchInput]);

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

        const cardGeometry = new PlaneGeometry(
            CARD_WIDTH,
            CARD_HEIGHT,
            CARD_GEOMETRY_SEGMENTS,
            CARD_GEOMETRY_SEGMENTS
        );
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

        cardGlassMesh.position.z = CARD_GLASS_LAYER_Z;
        cardContentMesh.position.z = CARD_CONTENT_LAYER_Z;
        cardContentMesh.scale.set(1, 1, 1);
        cardBaseMesh.renderOrder = 1;
        cardGlassMesh.renderOrder = 2;
        cardContentMesh.renderOrder = 3;
        cardGroup.add(cardBaseMesh, cardGlassMesh, cardContentMesh);

        const ambientLight = new AmbientLight("#dff6f0", AMBIENT_LIGHT_INTENSITY);
        const keyLight = new DirectionalLight("#8bf5dd", KEY_LIGHT_INTENSITY);
        keyLight.position.set(
            KEY_LIGHT_BASE_POSITION.x,
            KEY_LIGHT_BASE_POSITION.y,
            KEY_LIGHT_BASE_POSITION.z
        );
        const fillLight = new DirectionalLight("#6aa8ff", FILL_LIGHT_INTENSITY);
        fillLight.position.set(FILL_LIGHT_POSITION.x, FILL_LIGHT_POSITION.y, FILL_LIGHT_POSITION.z);
        scene.add(ambientLight, keyLight, fillLight);

        const resolution = new Vector2(1, 1);
        const clock = new Clock();
        const idleDelaySeconds = isTouchInput
            ? IDLE_DELAY_SECONDS_TOUCH
            : IDLE_DELAY_SECONDS_DESKTOP;
        const idleFadeInSeconds = isTouchInput
            ? IDLE_FADE_IN_SECONDS_TOUCH
            : IDLE_FADE_IN_SECONDS_DESKTOP;
        const entranceMotion = getCardEntranceMotion(isTouchInput);
        let rendererAdapter: TRendererAdapter | null = null;
        let isMounted = true;
        let isLoopActive = false;
        let lastActiveInputTime = 0;
        let idleWeight = 0;

        cardGroup.scale.setScalar(entranceMotion.startScale);
        cardGroup.position.y = entranceMotion.startOffsetY;
        cardGroup.rotation.x = MathUtils.degToRad(entranceMotion.startTiltXDeg);
        cardGroup.rotation.y = MathUtils.degToRad(entranceMotion.startTiltYDeg);
        cardGroup.rotation.z = MathUtils.degToRad(entranceMotion.startRollDeg);

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
            const isInputActive = inputMagnitude > INPUT_ACTIVITY_THRESHOLD;
            const entranceLinearProgress = calculateEntranceLinearProgress(
                elapsedTime,
                entranceMotion.durationSeconds
            );
            const entranceProgress = easeOutCubic(entranceLinearProgress);
            const entranceScaleProgress = easeOutBack(
                entranceLinearProgress,
                entranceMotion.scaleBackOvershoot
            );
            const entranceScale = MathUtils.lerp(
                entranceMotion.startScale,
                1,
                entranceScaleProgress
            );
            const entranceOffsetY = MathUtils.lerp(
                entranceMotion.startOffsetY,
                0,
                entranceProgress
            );
            const entranceBaseRoll = MathUtils.lerp(
                entranceMotion.startRollDeg,
                0,
                entranceProgress
            );
            const entranceSwayRoll = calculateDampedSwayRoll(
                entranceLinearProgress,
                entranceMotion.swayRollDeg,
                entranceMotion.swayCycles
            );
            const entranceRoll = entranceBaseRoll + entranceSwayRoll;
            const entranceTiltX = MathUtils.lerp(entranceMotion.startTiltXDeg, 0, entranceProgress);
            const entranceTiltY = MathUtils.lerp(entranceMotion.startTiltYDeg, 0, entranceProgress);

            if (isInputActive) {
                lastActiveInputTime = elapsedTime;
            }

            const idleElapsed = elapsedTime - lastActiveInputTime - idleDelaySeconds;
            const idleFadeProgress = MathUtils.clamp(idleElapsed / idleFadeInSeconds, 0, 1);
            const easedIdleProgress =
                idleFadeProgress * idleFadeProgress * (3 - 2 * idleFadeProgress);
            const idleTargetWeight = easedIdleProgress;
            const idleLerpFactor = idleTargetWeight > idleWeight ? IDLE_LERP_RISE : IDLE_LERP_FALL;
            idleWeight = MathUtils.lerp(idleWeight, idleTargetWeight, idleLerpFactor);

            const idleStrength =
                (isTouchInput ? IDLE_STRENGTH_TOUCH : IDLE_STRENGTH_DESKTOP) * idleWeight;
            const idleTilt = calculateIdleTilt(elapsedTime, idleStrength);
            const idleRoll = calculateIdleRoll(elapsedTime, idleStrength);
            const floatY =
                Math.sin(elapsedTime * IDLE_FLOAT_FREQUENCY) * IDLE_FLOAT_AMPLITUDE * idleWeight;
            const tiltLimit =
                (isTouchInput ? MAX_DEVICE_TILT_DEG : MAX_POINTER_TILT_DEG) + IDLE_TILT_MARGIN_DEG;
            const animatedTilt = {
                x: MathUtils.clamp(tilt.x + idleTilt.x, -tiltLimit, tiltLimit),
                y: MathUtils.clamp(tilt.y + idleTilt.y, -tiltLimit, tiltLimit),
            };

            cardGroup.rotation.x = MathUtils.degToRad(animatedTilt.x + entranceTiltX);
            cardGroup.rotation.y = MathUtils.degToRad(animatedTilt.y + entranceTiltY);
            cardGroup.rotation.z = MathUtils.degToRad(idleRoll + entranceRoll);
            cardGroup.position.x =
                MathUtils.degToRad(animatedTilt.y) * CARD_GROUP_POSITION_FACTOR.x;
            cardGroup.position.y =
                MathUtils.degToRad(-animatedTilt.x) * CARD_GROUP_POSITION_FACTOR.y +
                floatY +
                entranceOffsetY;
            cardGroup.scale.setScalar(entranceScale);

            keyLight.position.x =
                KEY_LIGHT_BASE_POSITION.x + animatedTilt.y * KEY_LIGHT_TILT_FACTOR.x;
            keyLight.position.y =
                KEY_LIGHT_BASE_POSITION.y + animatedTilt.x * KEY_LIGHT_TILT_FACTOR.y;

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

    return {
        sceneContainerRef,
        canvasRef,
    };
}
