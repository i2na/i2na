import { WebGLRenderer } from "three";

import { MAX_DPR_DESKTOP, MAX_DPR_MOBILE } from "./card.constants";
import type { TRendererAdapter, TRendererFacade } from "./card.types";

const WEBGPU_MODULE_ID: string = "three/webgpu";

type TWebGPURendererCtor = new (parameters: {
    canvas: HTMLCanvasElement;
    antialias?: boolean;
    alpha?: boolean;
}) => TRendererFacade & { init?: () => Promise<void> };

function getPixelRatio(): number {
    const isTouchInput = window.matchMedia("(pointer: coarse)").matches;
    const maxDpr = isTouchInput ? MAX_DPR_MOBILE : MAX_DPR_DESKTOP;

    return Math.min(window.devicePixelRatio || 1, maxDpr);
}

function canUseWebGPU(): boolean {
    if (typeof window === "undefined") {
        return false;
    }

    const navigatorWithGPU = navigator as Navigator & { gpu?: unknown };

    return Boolean(window.isSecureContext && navigatorWithGPU.gpu);
}

function configureRenderer(renderer: TRendererFacade): void {
    renderer.setPixelRatio(getPixelRatio());
    renderer.setClearColor?.(0x000000, 0);
    renderer.domElement.style.backgroundColor = "transparent";
}

export async function createCardRenderer(canvas: HTMLCanvasElement): Promise<TRendererAdapter> {
    if (canUseWebGPU()) {
        try {
            const webgpuModule = await import(WEBGPU_MODULE_ID);
            const WebGPURenderer = webgpuModule.WebGPURenderer as TWebGPURendererCtor;
            const renderer = new WebGPURenderer({
                canvas,
                antialias: true,
                alpha: true,
            });

            if (typeof renderer.init === "function") {
                await renderer.init();
            }

            configureRenderer(renderer);

            return {
                kind: "webgpu",
                renderer,
            };
        } catch (error) {
            console.warn("WebGPU initialization failed. Falling back to WebGL.", error);
        }
    }

    const renderer = new WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
    });

    configureRenderer(renderer);

    return {
        kind: "webgl",
        renderer,
    };
}

export function resizeCardRenderer(adapter: TRendererAdapter, width: number, height: number): void {
    adapter.renderer.setPixelRatio(getPixelRatio());
    adapter.renderer.setSize(width, height, false);
}
