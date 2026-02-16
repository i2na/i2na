export type TPanelOptions = {
    x: number;
    y: number;
    width: number;
    height: number;
    radius?: number;
    fill?: string;
    stroke?: string;
    lineWidth?: number;
};

export function drawRoundRectPath(
    context: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
): void {
    const safeRadius = Math.min(radius, width / 2, height / 2);

    context.beginPath();
    context.moveTo(x + safeRadius, y);
    context.lineTo(x + width - safeRadius, y);
    context.quadraticCurveTo(x + width, y, x + width, y + safeRadius);
    context.lineTo(x + width, y + height - safeRadius);
    context.quadraticCurveTo(x + width, y + height, x + width - safeRadius, y + height);
    context.lineTo(x + safeRadius, y + height);
    context.quadraticCurveTo(x, y + height, x, y + height - safeRadius);
    context.lineTo(x, y + safeRadius);
    context.quadraticCurveTo(x, y, x + safeRadius, y);
    context.closePath();
}

export function drawUvRoundedRectPath(
    context: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radiusUv: number
): void {
    const radiusX = Math.min(width * radiusUv, width / 2);
    const radiusY = Math.min(height * radiusUv, height / 2);

    context.beginPath();
    context.moveTo(x + radiusX, y);
    context.lineTo(x + width - radiusX, y);
    context.ellipse(x + width - radiusX, y + radiusY, radiusX, radiusY, 0, -Math.PI / 2, 0);
    context.lineTo(x + width, y + height - radiusY);
    context.ellipse(x + width - radiusX, y + height - radiusY, radiusX, radiusY, 0, 0, Math.PI / 2);
    context.lineTo(x + radiusX, y + height);
    context.ellipse(x + radiusX, y + height - radiusY, radiusX, radiusY, 0, Math.PI / 2, Math.PI);
    context.lineTo(x, y + radiusY);
    context.ellipse(x + radiusX, y + radiusY, radiusX, radiusY, 0, Math.PI, Math.PI * 1.5);
    context.closePath();
}

export function drawPanel(context: CanvasRenderingContext2D, options: TPanelOptions): void {
    const {
        x,
        y,
        width,
        height,
        radius = 28,
        fill = "rgba(7, 15, 23, 0.6)",
        stroke = "rgba(255, 255, 255, 0.16)",
        lineWidth = 2,
    } = options;

    drawRoundRectPath(context, x, y, width, height, radius);
    context.fillStyle = fill;
    context.fill();
    context.strokeStyle = stroke;
    context.lineWidth = lineWidth;
    context.stroke();
}

export function setTextStyle(
    context: CanvasRenderingContext2D,
    font: string,
    color: string,
    shadowStrength: number = 0.28,
    strokeWidth: number = 1.2
): void {
    context.font = font;
    context.fillStyle = color;
    context.shadowColor = `rgba(0, 0, 0, ${shadowStrength})`;
    context.shadowBlur = 4;
    context.shadowOffsetX = 0;
    context.shadowOffsetY = 1;
    context.strokeStyle = "rgba(0, 0, 0, 0.64)";
    context.lineWidth = strokeWidth;
    context.lineJoin = "round";
    context.miterLimit = 2;
}

export function clearTextShadow(context: CanvasRenderingContext2D): void {
    context.shadowColor = "transparent";
    context.shadowBlur = 0;
    context.shadowOffsetX = 0;
    context.shadowOffsetY = 0;
}

export function drawSharpText(
    context: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number
): void {
    const sharpX = Math.round(x);
    const sharpY = Math.round(y);
    context.strokeText(text, sharpX, sharpY);
    context.fillText(text, sharpX, sharpY);
}

export function drawWrappedText(
    context: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number,
    maxLines: number
): number {
    const words = text.split(" ");
    const lines: string[] = [];
    let currentLine = "";

    words.forEach((word) => {
        const nextLine = currentLine ? `${currentLine} ${word}` : word;

        if (context.measureText(nextLine).width > maxWidth && currentLine) {
            lines.push(currentLine);
            currentLine = word;
            return;
        }

        currentLine = nextLine;
    });

    if (currentLine) {
        lines.push(currentLine);
    }

    const visibleLines = lines.slice(0, maxLines);
    const isOverflowed = lines.length > maxLines;

    visibleLines.forEach((line, index) => {
        const isLastLine = index === visibleLines.length - 1;
        const displayLine = isOverflowed && isLastLine ? `${line}...` : line;
        drawSharpText(context, displayLine, x, y + lineHeight * index);
    });

    return y + visibleLines.length * lineHeight;
}

export function drawFittedTextInBox(
    context: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    width: number,
    height: number,
    maxFontSize: number,
    minFontSize: number,
    weight: number,
    color: string
): void {
    let fontSize = maxFontSize;

    while (fontSize > minFontSize) {
        context.font = `${weight} ${fontSize}px Inter, Segoe UI, Arial, sans-serif`;

        if (context.measureText(text).width <= width) {
            break;
        }

        fontSize -= 1;
    }

    setTextStyle(
        context,
        `${weight} ${fontSize}px Inter, Segoe UI, Arial, sans-serif`,
        color,
        0.22
    );
    const textY = y + (height - fontSize) / 2 - 2;
    drawSharpText(context, text, x, textY);
}

export function buildMailText(mailLink: string): string {
    return mailLink.startsWith("mailto:") ? mailLink.replace("mailto:", "") : mailLink;
}
