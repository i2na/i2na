import { CanvasTexture, LinearFilter, SRGBColorSpace } from "three";

import type { TProfile } from "../../../config/profile.constants";
import { CARD_CORNER_RADIUS_UV, TEXTURE_HEIGHT, TEXTURE_WIDTH } from "../model/constants";
import {
    drawMobileDepthBase,
    drawMobileDepthOverlay,
    drawSoftBackground,
} from "./drawing/background";
import { clearTextShadow, drawUvRoundedRectPath } from "./drawing/helpers";
import { drawDesktopLayout } from "./layouts/desktop-layout";
import { drawMobileLayout } from "./layouts/mobile-layout";

type TCardContentTextureOptions = {
    isMobileLayout?: boolean;
};

export function createCardContentTexture(
    profile: TProfile,
    options?: TCardContentTextureOptions
): CanvasTexture {
    const { isMobileLayout = false } = options ?? {};
    const renderScale = isMobileLayout ? 1.35 : 1;
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(TEXTURE_WIDTH * renderScale);
    canvas.height = Math.round(TEXTURE_HEIGHT * renderScale);

    const context = canvas.getContext("2d");

    if (!context) {
        throw new Error("Unable to create 2D drawing context for card content texture.");
    }

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.setTransform(renderScale, 0, 0, renderScale, 0, 0);
    context.textBaseline = "top";
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";

    context.save();
    drawUvRoundedRectPath(context, 0, 0, TEXTURE_WIDTH, TEXTURE_HEIGHT, CARD_CORNER_RADIUS_UV);
    context.clip();

    drawSoftBackground(context);

    if (isMobileLayout) {
        drawMobileDepthBase(context);
        drawMobileLayout(context, profile);
        drawMobileDepthOverlay(context);
    } else {
        drawDesktopLayout(context, profile);
    }

    context.restore();

    clearTextShadow(context);

    const texture = new CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace;
    texture.minFilter = LinearFilter;
    texture.magFilter = LinearFilter;
    texture.generateMipmaps = false;
    texture.needsUpdate = true;

    return texture;
}
