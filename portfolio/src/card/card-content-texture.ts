import { CanvasTexture, LinearFilter, SRGBColorSpace } from "three";

import type { TProfile } from "../config/profile.constants";
import { CARD_ASPECT_RATIO, CARD_CORNER_RADIUS_UV } from "./card.constants";

const TEXTURE_WIDTH = 3072;
const TEXTURE_HEIGHT = Math.round(TEXTURE_WIDTH / CARD_ASPECT_RATIO);
const PADDING_X = 152;
const PADDING_Y = 112;

type TCardContentTextureOptions = {
    isMobileLayout?: boolean;
};

type TPanelOptions = {
    x: number;
    y: number;
    width: number;
    height: number;
    radius?: number;
    fill?: string;
    stroke?: string;
    lineWidth?: number;
};

function drawRoundRectPath(
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

function drawUvRoundedRectPath(
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

function drawPanel(context: CanvasRenderingContext2D, options: TPanelOptions): void {
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

function setTextStyle(
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

function clearTextShadow(context: CanvasRenderingContext2D): void {
    context.shadowColor = "transparent";
    context.shadowBlur = 0;
    context.shadowOffsetX = 0;
    context.shadowOffsetY = 0;
}

function drawSharpText(
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

function drawWrappedText(
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

function drawFittedTextInBox(
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

function buildMailText(mailLink: string): string {
    return mailLink.startsWith("mailto:") ? mailLink.replace("mailto:", "") : mailLink;
}

function drawSoftBackground(context: CanvasRenderingContext2D): void {
    const gradient = context.createLinearGradient(0, 0, TEXTURE_WIDTH, TEXTURE_HEIGHT);
    gradient.addColorStop(0, "rgba(5, 11, 18, 0.5)");
    gradient.addColorStop(0.6, "rgba(4, 9, 16, 0.35)");
    gradient.addColorStop(1, "rgba(7, 13, 21, 0.52)");

    context.fillStyle = gradient;
    context.fillRect(0, 0, TEXTURE_WIDTH, TEXTURE_HEIGHT);
}

function drawMobileDepthBase(context: CanvasRenderingContext2D): void {
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

function drawMobileDepthOverlay(context: CanvasRenderingContext2D): void {
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

function drawTopHeader(context: CanvasRenderingContext2D, profile: TProfile): void {
    const subtitleBoxWidth = 420;
    const subtitleBoxHeight = 92;
    const subtitleBoxX = TEXTURE_WIDTH - PADDING_X - subtitleBoxWidth;
    const subtitleBoxY = PADDING_Y - 8;

    setTextStyle(
        context,
        "700 158px Inter, Segoe UI, Arial, sans-serif",
        "rgba(242, 252, 249, 0.98)"
    );
    drawSharpText(context, profile.name, PADDING_X, PADDING_Y - 24);

    drawPanel(context, {
        x: subtitleBoxX,
        y: subtitleBoxY,
        width: subtitleBoxWidth,
        height: subtitleBoxHeight,
        radius: 46,
        fill: "rgba(255, 255, 255, 0.09)",
        stroke: "rgba(255, 255, 255, 0.22)",
    });

    setTextStyle(
        context,
        "600 34px Inter, Segoe UI, Arial, sans-serif",
        "rgba(232, 247, 242, 0.95)"
    );
    drawSharpText(context, profile.subtitle.toUpperCase(), subtitleBoxX + 34, subtitleBoxY + 28);
}

function drawMainPanels(context: CanvasRenderingContext2D, profile: TProfile): number {
    const contentWidth = TEXTURE_WIDTH - PADDING_X * 2;
    const leftWidth = Math.round(contentWidth * 0.6);
    const rightWidth = contentWidth - leftWidth - 34;
    const topPanelY = PADDING_Y + 176;
    const topPanelHeight = 620;
    const leftPanelX = PADDING_X;
    const rightPanelX = leftPanelX + leftWidth + 34;

    drawPanel(context, {
        x: leftPanelX,
        y: topPanelY,
        width: leftWidth,
        height: topPanelHeight,
        fill: "rgba(4, 10, 18, 0.58)",
        stroke: "rgba(255, 255, 255, 0.2)",
    });

    drawPanel(context, {
        x: rightPanelX,
        y: topPanelY,
        width: rightWidth,
        height: topPanelHeight,
        fill: "rgba(7, 14, 24, 0.6)",
        stroke: "rgba(255, 255, 255, 0.18)",
    });

    setTextStyle(
        context,
        "600 44px Inter, Segoe UI, Arial, sans-serif",
        "rgba(176, 244, 224, 0.95)"
    );
    drawSharpText(context, "ABOUT", leftPanelX + 42, topPanelY + 36);

    setTextStyle(
        context,
        "500 52px Inter, Segoe UI, Arial, sans-serif",
        "rgba(243, 252, 249, 0.98)",
        0.56
    );
    let introY = topPanelY + 114;
    profile.introLines.forEach((line) => {
        introY = drawWrappedText(context, line, leftPanelX + 42, introY, leftWidth - 84, 68, 2);
        introY += 14;
    });

    setTextStyle(
        context,
        "500 31px Inter, Segoe UI, Arial, sans-serif",
        "rgba(194, 220, 230, 0.92)"
    );
    drawSharpText(context, profile.aboutKeywordLine, leftPanelX + 42, topPanelY + 468);

    setTextStyle(
        context,
        "600 44px Inter, Segoe UI, Arial, sans-serif",
        "rgba(176, 244, 224, 0.95)"
    );
    drawSharpText(context, "AT A GLANCE", rightPanelX + 38, topPanelY + 36);

    setTextStyle(
        context,
        "600 42px Inter, Segoe UI, Arial, sans-serif",
        "rgba(243, 252, 249, 0.98)"
    );
    drawWrappedText(
        context,
        profile.educationSummary,
        rightPanelX + 38,
        topPanelY + 112,
        rightWidth - 76,
        54,
        2
    );
    drawWrappedText(
        context,
        profile.workSummary,
        rightPanelX + 38,
        topPanelY + 180,
        rightWidth - 76,
        54,
        2
    );

    setTextStyle(
        context,
        "500 30px Inter, Segoe UI, Arial, sans-serif",
        "rgba(199, 225, 235, 0.93)"
    );
    drawSharpText(context, profile.atGlanceDetailLines[0], rightPanelX + 38, topPanelY + 410);
    drawSharpText(context, profile.atGlanceDetailLines[1], rightPanelX + 38, topPanelY + 456);

    return topPanelY + topPanelHeight;
}

function drawTimeline(
    context: CanvasRenderingContext2D,
    profile: TProfile,
    topEndY: number
): number {
    const contentWidth = TEXTURE_WIDTH - PADDING_X * 2;
    const timelineY = topEndY + 34;
    const timelineHeight = 460;

    drawPanel(context, {
        x: PADDING_X,
        y: timelineY,
        width: contentWidth,
        height: timelineHeight,
        fill: "rgba(5, 11, 20, 0.6)",
        stroke: "rgba(255, 255, 255, 0.2)",
    });

    setTextStyle(
        context,
        "600 44px Inter, Segoe UI, Arial, sans-serif",
        "rgba(176, 244, 224, 0.95)"
    );
    drawSharpText(context, "TIMELINE", PADDING_X + 40, timelineY + 32);

    const cardY = timelineY + 94;
    const cardWidth = Math.floor((contentWidth - 100) / 3);
    const cardHeight = 328;
    const gap = 22;

    profile.experiences.slice(0, 3).forEach((experience, index) => {
        const cardX = PADDING_X + 40 + index * (cardWidth + gap);

        drawPanel(context, {
            x: cardX,
            y: cardY,
            width: cardWidth,
            height: cardHeight,
            radius: 24,
            fill: "rgba(255, 255, 255, 0.06)",
            stroke: "rgba(255, 255, 255, 0.2)",
        });

        setTextStyle(
            context,
            "600 33px Inter, Segoe UI, Arial, sans-serif",
            "rgba(242, 252, 249, 0.98)"
        );
        drawWrappedText(
            context,
            experience.organization,
            cardX + 24,
            cardY + 24,
            cardWidth - 48,
            42,
            2
        );

        setTextStyle(
            context,
            "500 28px Inter, Segoe UI, Arial, sans-serif",
            "rgba(195, 222, 233, 0.95)"
        );
        drawWrappedText(context, experience.role, cardX + 24, cardY + 122, cardWidth - 48, 37, 3);

        setTextStyle(
            context,
            "600 27px Inter, Segoe UI, Arial, sans-serif",
            "rgba(152, 245, 221, 0.98)"
        );
        drawSharpText(context, experience.period, cardX + 24, cardY + cardHeight - 58);
    });

    return timelineY + timelineHeight;
}

function drawFooter(
    context: CanvasRenderingContext2D,
    profile: TProfile,
    timelineEndY: number
): void {
    const contentWidth = TEXTURE_WIDTH - PADDING_X * 2;
    const footerY = timelineEndY + 30;
    const footerHeight = TEXTURE_HEIGHT - footerY - PADDING_Y;
    const sectionGap = 34;
    const sectionWidth = Math.floor((contentWidth - sectionGap) / 2);
    const leftSectionX = PADDING_X;
    const rightSectionX = leftSectionX + sectionWidth + sectionGap;

    drawPanel(context, {
        x: leftSectionX,
        y: footerY,
        width: sectionWidth,
        height: footerHeight,
        fill: "rgba(4, 10, 18, 0.56)",
        stroke: "rgba(255, 255, 255, 0.2)",
    });

    drawPanel(context, {
        x: rightSectionX,
        y: footerY,
        width: sectionWidth,
        height: footerHeight,
        fill: "rgba(4, 10, 18, 0.56)",
        stroke: "rgba(255, 255, 255, 0.2)",
    });

    const innerPadding = 40;
    const leftColumnWidth = sectionWidth - innerPadding * 2;
    const rightColumnWidth = sectionWidth - innerPadding * 2;
    const leftColumnX = leftSectionX + innerPadding;
    const rightColumnX = rightSectionX + innerPadding;
    const sectionTitleY = footerY + 30;
    const sectionTopPadding = 94;
    const sectionBottomPadding = 28;
    const contentStartY = footerY + sectionTopPadding;
    const availableSectionHeight = footerHeight - sectionTopPadding - sectionBottomPadding;

    setTextStyle(
        context,
        "700 44px Inter, Segoe UI, Arial, sans-serif",
        "rgba(176, 244, 224, 0.98)"
    );
    drawSharpText(context, "TECH STACK", leftColumnX, sectionTitleY);
    drawSharpText(context, "CONTACT", rightColumnX, sectionTitleY);

    const skillPillGapX = 16;
    const skillPillGapY = 16;
    const skillMaxRows = 2;
    const skillPillHeight = Math.max(
        76,
        Math.min(
            94,
            Math.floor((availableSectionHeight - skillPillGapY * (skillMaxRows - 1)) / skillMaxRows)
        )
    );
    const skillPillRadius = Math.floor(skillPillHeight / 2);
    const skillPillPaddingX = 34;
    const skillInnerWidth = leftColumnWidth;
    let skillCursorX = leftColumnX;
    let skillCursorY = contentStartY;
    let skillRow = 0;

    profile.skills.forEach((skill) => {
        if (skillRow >= skillMaxRows) {
            return;
        }

        setTextStyle(
            context,
            "700 36px Inter, Segoe UI, Arial, sans-serif",
            "rgba(238, 251, 247, 0.99)"
        );
        const pillWidth = Math.ceil(context.measureText(skill).width) + skillPillPaddingX * 2;
        const maxPillWidth = skillInnerWidth;
        const finalPillWidth = Math.min(pillWidth, maxPillWidth);
        const wouldOverflow = skillCursorX + finalPillWidth > leftColumnX + skillInnerWidth;

        if (wouldOverflow) {
            skillRow += 1;

            if (skillRow >= skillMaxRows) {
                return;
            }

            skillCursorX = leftColumnX;
            skillCursorY += skillPillHeight + skillPillGapY;
        }

        drawPanel(context, {
            x: skillCursorX,
            y: skillCursorY,
            width: finalPillWidth,
            height: skillPillHeight,
            radius: skillPillRadius,
            fill: "rgba(255, 255, 255, 0.11)",
            stroke: "rgba(255, 255, 255, 0.24)",
            lineWidth: 2.5,
        });

        drawFittedTextInBox(
            context,
            skill,
            skillCursorX + 24,
            skillCursorY,
            finalPillWidth - 48,
            skillPillHeight,
            36,
            24,
            700,
            "rgba(238, 251, 247, 0.99)"
        );

        skillCursorX += finalPillWidth + skillPillGapX;
    });

    const links = [
        profile.links.githubShort,
        buildMailText(profile.links.mail),
        profile.links.instagramShort,
    ];
    const contactPillGapX = 12;
    const contactPillGapY = 14;
    const contactPillHeight = Math.max(
        74,
        Math.min(92, Math.floor((availableSectionHeight - contactPillGapY * 2) / 3))
    );
    const contactPillPaddingX = 26;
    const contactRightBoundary = rightColumnX + rightColumnWidth;
    const contactBottomBoundary = contentStartY + availableSectionHeight;
    let contactCursorX = rightColumnX;
    let contactCursorY = contentStartY;

    for (const link of links) {
        setTextStyle(
            context,
            "700 34px Inter, Segoe UI, Arial, sans-serif",
            "rgba(232, 252, 246, 0.99)"
        );
        const measuredWidth = Math.ceil(context.measureText(link).width) + contactPillPaddingX * 2;
        const pillWidth = Math.min(Math.max(measuredWidth, 230), rightColumnWidth);
        const shouldWrap =
            contactCursorX + pillWidth > contactRightBoundary && contactCursorX > rightColumnX;

        if (shouldWrap) {
            contactCursorX = rightColumnX;
            contactCursorY += contactPillHeight + contactPillGapY;
        }

        if (contactCursorY + contactPillHeight > contactBottomBoundary) {
            break;
        }

        drawPanel(context, {
            x: contactCursorX,
            y: contactCursorY,
            width: pillWidth,
            height: contactPillHeight,
            radius: Math.floor(contactPillHeight / 2),
            fill: "rgba(64, 231, 194, 0.22)",
            stroke: "rgba(64, 231, 194, 0.52)",
            lineWidth: 2.7,
        });

        drawFittedTextInBox(
            context,
            link,
            contactCursorX + 16,
            contactCursorY,
            pillWidth - 32,
            contactPillHeight,
            34,
            22,
            700,
            "rgba(232, 252, 246, 0.99)"
        );

        contactCursorX += pillWidth + contactPillGapX;
    }
}

function drawMobileLayout(context: CanvasRenderingContext2D, profile: TProfile): void {
    const contentWidth = TEXTURE_WIDTH - PADDING_X * 2;
    const headerY = PADDING_Y - 6;
    const summaryY = headerY + 228;
    const sectionHeightShift = 120;
    const summaryHeight = 780 + sectionHeightShift;
    const stackY = summaryY + summaryHeight + 36;
    const stackHeight = TEXTURE_HEIGHT - stackY - PADDING_Y;

    setTextStyle(
        context,
        "700 178px Inter, Segoe UI, Arial, sans-serif",
        "rgba(242, 252, 249, 0.99)",
        0.2
    );
    drawSharpText(context, profile.name, PADDING_X, headerY);

    drawPanel(context, {
        x: TEXTURE_WIDTH - PADDING_X - 468,
        y: headerY + 8,
        width: 468,
        height: 104,
        radius: 52,
        fill: "rgba(255, 255, 255, 0.1)",
        stroke: "rgba(255, 255, 255, 0.26)",
    });
    setTextStyle(
        context,
        "700 42px Inter, Segoe UI, Arial, sans-serif",
        "rgba(232, 247, 242, 0.98)",
        0.16
    );
    drawSharpText(
        context,
        profile.subtitle.toUpperCase(),
        TEXTURE_WIDTH - PADDING_X - 428,
        headerY + 40
    );

    drawPanel(context, {
        x: PADDING_X,
        y: summaryY,
        width: contentWidth,
        height: summaryHeight,
        fill: "rgba(4, 11, 19, 0.62)",
        stroke: "rgba(255, 255, 255, 0.24)",
    });
    setTextStyle(
        context,
        "700 50px Inter, Segoe UI, Arial, sans-serif",
        "rgba(176, 244, 224, 0.98)"
    );
    drawSharpText(context, "ABOUT", PADDING_X + 46, summaryY + 46);

    setTextStyle(
        context,
        "600 55px Inter, Segoe UI, Arial, sans-serif",
        "rgba(243, 252, 249, 0.995)",
        0.2,
        1.45
    );
    let introY = summaryY + 140;
    profile.introLines.forEach((line) => {
        introY = drawWrappedText(context, line, PADDING_X + 46, introY, contentWidth - 92, 70, 2);
        introY += 18;
    });

    setTextStyle(
        context,
        "500 38px Inter, Segoe UI, Arial, sans-serif",
        "rgba(194, 220, 230, 0.92)"
    );
    drawSharpText(context, profile.aboutKeywordLine, PADDING_X + 56, summaryY + 330);

    setTextStyle(
        context,
        "700 50px Inter, Segoe UI, Arial, sans-serif",
        "rgba(176, 244, 224, 0.98)"
    );
    drawSharpText(context, "AT A GLANCE", PADDING_X + 46, summaryY + 448);

    setTextStyle(
        context,
        "600 53px Inter, Segoe UI, Arial, sans-serif",
        "rgba(218, 240, 247, 0.99)",
        0.2,
        1.45
    );
    drawWrappedText(
        context,
        profile.educationSummary,
        PADDING_X + 46,
        summaryY + 542,
        contentWidth - 92,
        84,
        2
    );
    drawWrappedText(
        context,
        profile.workSummary,
        PADDING_X + 46,
        summaryY + 630,
        contentWidth - 92,
        84,
        2
    );

    setTextStyle(
        context,
        "500 38px Inter, Segoe UI, Arial, sans-serif",
        "rgba(199, 225, 235, 0.93)"
    );
    drawSharpText(context, profile.atGlanceDetailLines[0], PADDING_X + 46, summaryY + 730);
    drawSharpText(context, profile.atGlanceDetailLines[1], PADDING_X + 46, summaryY + 782);

    const sectionGap = 22;
    const sectionWidth = Math.floor((contentWidth - sectionGap) / 2);
    const sectionLeftX = PADDING_X;
    const sectionRightX = sectionLeftX + sectionWidth + sectionGap;

    drawPanel(context, {
        x: sectionLeftX,
        y: stackY,
        width: sectionWidth,
        height: stackHeight,
        fill: "rgba(4, 10, 18, 0.62)",
        stroke: "rgba(255, 255, 255, 0.24)",
    });

    drawPanel(context, {
        x: sectionRightX,
        y: stackY,
        width: sectionWidth,
        height: stackHeight,
        fill: "rgba(4, 10, 18, 0.62)",
        stroke: "rgba(255, 255, 255, 0.24)",
    });

    setTextStyle(
        context,
        "700 50px Inter, Segoe UI, Arial, sans-serif",
        "rgba(176, 244, 224, 0.99)",
        0.2
    );
    drawSharpText(context, "TECH STACK", sectionLeftX + 36, stackY + 36);
    drawSharpText(context, "CONTACT", sectionRightX + 36, stackY + 36);

    const stackSkills = profile.skills;
    const stackPillGapX = 23;
    const stackPillGapY = 23;
    const stackPillHeight = 84;
    const stackSectionPadding = 28;
    const stackStartX = sectionLeftX + stackSectionPadding;
    const stackStartY = stackY + 126;
    const stackRightBoundary = sectionLeftX + sectionWidth - stackSectionPadding;
    const stackBottomBoundary = stackY + stackHeight - stackSectionPadding;
    const stackMinWidth = 180;
    const stackHorizontalPadding = 32;
    let stackCursorX = stackStartX;
    let stackCursorY = stackStartY;

    for (const skill of stackSkills) {
        setTextStyle(
            context,
            "700 46px Inter, Segoe UI, Arial, sans-serif",
            "rgba(238, 251, 247, 0.995)",
            0.14,
            1.6
        );
        const measuredWidth =
            Math.ceil(context.measureText(skill).width) + stackHorizontalPadding * 2;
        const pillWidth = Math.min(
            Math.max(measuredWidth, stackMinWidth),
            stackRightBoundary - stackStartX
        );
        const shouldWrap =
            stackCursorX + pillWidth > stackRightBoundary && stackCursorX > stackStartX;

        if (shouldWrap) {
            stackCursorX = stackStartX;
            stackCursorY += stackPillHeight + stackPillGapY;
        }

        if (stackCursorY + stackPillHeight > stackBottomBoundary) {
            break;
        }

        drawPanel(context, {
            x: stackCursorX,
            y: stackCursorY,
            width: pillWidth,
            height: stackPillHeight,
            radius: 42,
            fill: "rgba(255, 255, 255, 0.13)",
            stroke: "rgba(255, 255, 255, 0.26)",
            lineWidth: 2.8,
        });

        drawFittedTextInBox(
            context,
            skill,
            stackCursorX + 18,
            stackCursorY,
            pillWidth - 36,
            stackPillHeight,
            44,
            28,
            700,
            "rgba(238, 251, 247, 0.995)"
        );

        stackCursorX += pillWidth + stackPillGapX;
    }

    const contactLinks = [
        profile.links.githubShort,
        buildMailText(profile.links.mail),
        profile.links.instagramShort,
    ];
    const contactPillGapX = 23;
    const contactPillGapY = 23;
    const contactPillHeight = 86;
    const contactSectionPadding = 28;
    const contactStartX = sectionRightX + contactSectionPadding;
    const contactStartY = stackY + 126;
    const contactRightBoundary = sectionRightX + sectionWidth - contactSectionPadding;
    const contactBottomBoundary = stackY + stackHeight - contactSectionPadding;
    const contactMinWidth = 220;
    const contactHorizontalPadding = 28;
    let contactCursorX = contactStartX;
    let contactCursorY = contactStartY;

    for (const link of contactLinks) {
        setTextStyle(
            context,
            "700 42px Inter, Segoe UI, Arial, sans-serif",
            "rgba(232, 252, 246, 0.99)",
            0.14,
            1.6
        );
        const measuredWidth =
            Math.ceil(context.measureText(link).width) + contactHorizontalPadding * 2;
        const pillWidth = Math.min(
            Math.max(measuredWidth, contactMinWidth),
            contactRightBoundary - contactStartX
        );
        const shouldWrap =
            contactCursorX + pillWidth > contactRightBoundary && contactCursorX > contactStartX;

        if (shouldWrap) {
            contactCursorX = contactStartX;
            contactCursorY += contactPillHeight + contactPillGapY;
        }

        if (contactCursorY + contactPillHeight > contactBottomBoundary) {
            break;
        }

        drawPanel(context, {
            x: contactCursorX,
            y: contactCursorY,
            width: pillWidth,
            height: contactPillHeight,
            radius: 43,
            fill: "rgba(64, 231, 194, 0.22)",
            stroke: "rgba(64, 231, 194, 0.52)",
            lineWidth: 2.7,
        });

        drawFittedTextInBox(
            context,
            link,
            contactCursorX + 16,
            contactCursorY,
            pillWidth - 32,
            contactPillHeight,
            42,
            26,
            700,
            "rgba(232, 252, 246, 0.99)"
        );

        contactCursorX += pillWidth + contactPillGapX;
    }
}

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
        drawTopHeader(context, profile);
        const topEndY = drawMainPanels(context, profile);
        const timelineEndY = drawTimeline(context, profile, topEndY);
        drawFooter(context, profile, timelineEndY);
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
