import type { Camera, Color, Scene, Vector2 } from "three";

export type TTilt = {
    x: number;
    y: number;
};

export type TRendererKind = "webgpu" | "webgl";

export type TRendererFacade = {
    domElement: HTMLCanvasElement;
    setPixelRatio: (pixelRatio: number) => void;
    setSize: (width: number, height: number, updateStyle?: boolean) => void;
    render: (scene: Scene, camera: Camera) => void;
    setClearColor?: (color: number | string, alpha?: number) => void;
    dispose: () => void;
};

export type TRendererAdapter = {
    kind: TRendererKind;
    renderer: TRendererFacade;
};

export type TSharedCardUniforms = {
    uTime: { value: number };
    uTilt: { value: Vector2 };
    uResolution: { value: Vector2 };
    uAccentColor: { value: Color };
    uQuality: { value: number };
    uCornerRadius: { value: number };
};

export type TCardUniforms = TSharedCardUniforms;

export type TCardGlassUniforms = TSharedCardUniforms;
