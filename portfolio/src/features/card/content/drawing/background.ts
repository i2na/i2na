import { CARD_CORNER_RADIUS_UV, TEXTURE_HEIGHT, TEXTURE_WIDTH } from "../../model/constants";
import { drawUvRoundedRectPath } from "./helpers";

export function drawSoftBackground(context: CanvasRenderingContext2D): void {
    const gradient = context.createLinearGradient(0, 0, TEXTURE_WIDTH, TEXTURE_HEIGHT);
    gradient.addColorStop(0, "rgba(5, 11, 18, 0.5)");
    gradient.addColorStop(0.6, "rgba(4, 9, 16, 0.35)");
    gradient.addColorStop(1, "rgba(7, 13, 21, 0.52)");

    context.fillStyle = gradient;
    context.fillRect(0, 0, TEXTURE_WIDTH, TEXTURE_HEIGHT);
}

export function drawMobileDepthBase(context: CanvasRenderingContext2D): void {
    const directionalShade = context.createLinearGradient(0, 0, TEXTURE_WIDTH, TEXTURE_HEIGHT);
    directionalShade.addColorStop(0, "rgba(255, 255, 255, 0.08)");
    directionalShade.addColorStop(0.44, "rgba(255, 255, 255, 0.0)");
    directionalShade.addColorStop(1, "rgba(0, 0, 0, 0.24)");
    context.fillStyle = directionalShade;
    context.fillRect(0, 0, TEXTURE_WIDTH, TEXTURE_HEIGHT);

    const centerVignette = context.createRadialGradient(
        TEXTURE_WIDTH * 0.46,
        TEXTURE_HEIGHT * 0.36,
        TEXTURE_WIDTH * 0.08,
        TEXTURE_WIDTH * 0.5,
        TEXTURE_HEIGHT * 0.52,
        TEXTURE_WIDTH * 0.78
    );
    centerVignette.addColorStop(0, "rgba(255, 255, 255, 0.04)");
    centerVignette.addColorStop(0.7, "rgba(255, 255, 255, 0.0)");
    centerVignette.addColorStop(1, "rgba(0, 0, 0, 0.18)");
    context.fillStyle = centerVignette;
    context.fillRect(0, 0, TEXTURE_WIDTH, TEXTURE_HEIGHT);
}

export function drawMobileDepthOverlay(context: CanvasRenderingContext2D): void {
    const rimInset = 10;
    const rimWidth = TEXTURE_WIDTH - rimInset * 2;
    const rimHeight = TEXTURE_HEIGHT - rimInset * 2;

    const rimHighlight = context.createLinearGradient(rimInset, rimInset, rimWidth, rimHeight);
    rimHighlight.addColorStop(0, "rgba(255, 255, 255, 0.22)");
    rimHighlight.addColorStop(0.32, "rgba(255, 255, 255, 0.06)");
    rimHighlight.addColorStop(1, "rgba(255, 255, 255, 0.0)");
    context.strokeStyle = rimHighlight;
    context.lineWidth = 5;
    drawUvRoundedRectPath(context, rimInset, rimInset, rimWidth, rimHeight, CARD_CORNER_RADIUS_UV);
    context.stroke();

    const rimShadow = context.createLinearGradient(
        TEXTURE_WIDTH * 0.84,
        TEXTURE_HEIGHT * 0.84,
        TEXTURE_WIDTH * 0.14,
        TEXTURE_HEIGHT * 0.16
    );
    rimShadow.addColorStop(0, "rgba(0, 0, 0, 0.24)");
    rimShadow.addColorStop(0.48, "rgba(0, 0, 0, 0.08)");
    rimShadow.addColorStop(1, "rgba(0, 0, 0, 0.0)");
    context.strokeStyle = rimShadow;
    context.lineWidth = 8;
    drawUvRoundedRectPath(
        context,
        rimInset + 2,
        rimInset + 2,
        rimWidth - 4,
        rimHeight - 4,
        CARD_CORNER_RADIUS_UV
    );
    context.stroke();
}
