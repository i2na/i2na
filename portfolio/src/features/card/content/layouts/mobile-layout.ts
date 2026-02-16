import type { TProfile } from "../../../../config/profile.constants";
import {
    MOBILE_LAYOUT,
    PADDING_X,
    PADDING_Y,
    TEXTURE_HEIGHT,
    TEXTURE_WIDTH,
} from "../../model/constants";
import {
    buildMailText,
    drawFittedTextInBox,
    drawPanel,
    drawSharpText,
    drawWrappedText,
    setTextStyle,
} from "../drawing/helpers";

export function drawMobileLayout(context: CanvasRenderingContext2D, profile: TProfile): void {
    const { header, summary, stackArea, skillPill, contactPill } = MOBILE_LAYOUT;
    const contentWidth = TEXTURE_WIDTH - PADDING_X * 2;
    const headerY = PADDING_Y + header.yOffset;
    const summaryY = headerY + summary.yFromHeader;
    const summaryHeight = summary.heightBase + summary.sectionHeightShift;
    const stackY = summaryY + summaryHeight + stackArea.yGapFromSummary;
    const stackHeight = TEXTURE_HEIGHT - stackY - PADDING_Y;

    setTextStyle(
        context,
        header.nameStyle.font,
        header.nameStyle.color,
        header.nameStyle.shadowStrength
    );
    drawSharpText(context, profile.name, PADDING_X, headerY);

    drawPanel(context, {
        x: TEXTURE_WIDTH - PADDING_X - header.subtitlePanel.width,
        y: headerY + header.subtitlePanel.yOffset,
        width: header.subtitlePanel.width,
        height: header.subtitlePanel.height,
        radius: header.subtitlePanel.radius,
        fill: header.subtitlePanel.fill,
        stroke: header.subtitlePanel.stroke,
    });
    setTextStyle(
        context,
        header.subtitleStyle.font,
        header.subtitleStyle.color,
        header.subtitleStyle.shadowStrength
    );
    drawSharpText(
        context,
        profile.subtitle.toUpperCase(),
        TEXTURE_WIDTH - PADDING_X - header.subtitleOffsetX,
        headerY + header.subtitleOffsetY
    );

    drawPanel(context, {
        x: PADDING_X,
        y: summaryY,
        width: contentWidth,
        height: summaryHeight,
        fill: summary.panel.fill,
        stroke: summary.panel.stroke,
    });
    setTextStyle(context, summary.aboutTitle.style.font, summary.aboutTitle.style.color);
    drawSharpText(
        context,
        summary.aboutTitle.text,
        PADDING_X + summary.aboutTitle.offsetX,
        summaryY + summary.aboutTitle.offsetY
    );

    setTextStyle(
        context,
        summary.intro.style.font,
        summary.intro.style.color,
        summary.intro.style.shadowStrength,
        summary.intro.style.strokeWidth
    );
    let introY = summaryY + summary.intro.startY;
    profile.introLines.forEach((line) => {
        introY = drawWrappedText(
            context,
            line,
            PADDING_X + summary.intro.offsetX,
            introY,
            contentWidth - summary.intro.widthInset,
            summary.intro.lineHeight,
            summary.intro.maxLines
        );
        introY += summary.intro.lineGap;
    });

    setTextStyle(context, summary.keyword.style.font, summary.keyword.style.color);
    drawSharpText(
        context,
        profile.aboutKeywordLine,
        PADDING_X + summary.keyword.offsetX,
        summaryY + summary.keyword.offsetY
    );

    setTextStyle(context, summary.glanceTitle.style.font, summary.glanceTitle.style.color);
    drawSharpText(
        context,
        summary.glanceTitle.text,
        PADDING_X + summary.glanceTitle.offsetX,
        summaryY + summary.glanceTitle.offsetY
    );

    setTextStyle(
        context,
        summary.glanceSummary.style.font,
        summary.glanceSummary.style.color,
        summary.glanceSummary.style.shadowStrength,
        summary.glanceSummary.style.strokeWidth
    );
    drawWrappedText(
        context,
        profile.educationSummary,
        PADDING_X + summary.glanceSummary.offsetX,
        summaryY + summary.glanceSummary.educationY,
        contentWidth - summary.glanceSummary.widthInset,
        summary.glanceSummary.lineHeight,
        summary.glanceSummary.maxLines
    );
    drawWrappedText(
        context,
        profile.workSummary,
        PADDING_X + summary.glanceSummary.offsetX,
        summaryY + summary.glanceSummary.workY,
        contentWidth - summary.glanceSummary.widthInset,
        summary.glanceSummary.lineHeight,
        summary.glanceSummary.maxLines
    );

    setTextStyle(context, summary.glanceDetail.style.font, summary.glanceDetail.style.color);
    const [firstGlanceDetail, secondGlanceDetail] = profile.atGlanceDetailLines;
    drawSharpText(
        context,
        firstGlanceDetail,
        PADDING_X + summary.glanceDetail.offsetX,
        summaryY + summary.glanceDetail.firstY
    );
    drawSharpText(
        context,
        secondGlanceDetail,
        PADDING_X + summary.glanceDetail.offsetX,
        summaryY + summary.glanceDetail.secondY
    );

    const sectionWidth = Math.floor(
        (contentWidth - stackArea.sectionGap) / stackArea.sectionsCount
    );
    const sectionLeftX = PADDING_X;
    const sectionRightX = sectionLeftX + sectionWidth + stackArea.sectionGap;

    drawPanel(context, {
        x: sectionLeftX,
        y: stackY,
        width: sectionWidth,
        height: stackHeight,
        fill: stackArea.sectionPanel.fill,
        stroke: stackArea.sectionPanel.stroke,
    });

    drawPanel(context, {
        x: sectionRightX,
        y: stackY,
        width: sectionWidth,
        height: stackHeight,
        fill: stackArea.sectionPanel.fill,
        stroke: stackArea.sectionPanel.stroke,
    });

    setTextStyle(
        context,
        stackArea.titleStyle.font,
        stackArea.titleStyle.color,
        stackArea.titleStyle.shadowStrength
    );
    drawSharpText(
        context,
        stackArea.stackTitle,
        sectionLeftX + stackArea.titleOffsetX,
        stackY + stackArea.titleOffsetY
    );
    drawSharpText(
        context,
        stackArea.contactTitle,
        sectionRightX + stackArea.titleOffsetX,
        stackY + stackArea.titleOffsetY
    );

    const stackStartX = sectionLeftX + skillPill.sectionPadding;
    const stackStartY = stackY + skillPill.startY;
    const stackRightBoundary = sectionLeftX + sectionWidth - skillPill.sectionPadding;
    const stackBottomBoundary = stackY + stackHeight - skillPill.sectionPadding;
    let stackCursorX = stackStartX;
    let stackCursorY = stackStartY;

    for (const skill of profile.skills) {
        setTextStyle(
            context,
            skillPill.textStyle.font,
            skillPill.textStyle.color,
            skillPill.textStyle.shadowStrength,
            skillPill.textStyle.strokeWidth
        );
        const measuredWidth =
            Math.ceil(context.measureText(skill).width) + skillPill.horizontalPadding * 2;
        const pillWidth = Math.min(
            Math.max(measuredWidth, skillPill.minWidth),
            stackRightBoundary - stackStartX
        );
        const shouldWrap =
            stackCursorX + pillWidth > stackRightBoundary && stackCursorX > stackStartX;

        if (shouldWrap) {
            stackCursorX = stackStartX;
            stackCursorY += skillPill.height + skillPill.gapY;
        }

        if (stackCursorY + skillPill.height > stackBottomBoundary) {
            break;
        }

        drawPanel(context, {
            x: stackCursorX,
            y: stackCursorY,
            width: pillWidth,
            height: skillPill.height,
            radius: skillPill.panelRadius,
            fill: skillPill.panel.fill,
            stroke: skillPill.panel.stroke,
            lineWidth: skillPill.panel.lineWidth,
        });

        drawFittedTextInBox(
            context,
            skill,
            stackCursorX + skillPill.textInsetX,
            stackCursorY,
            pillWidth - skillPill.textWidthInset,
            skillPill.height,
            skillPill.maxFontSize,
            skillPill.minFontSize,
            skillPill.fontWeight,
            skillPill.textColor
        );

        stackCursorX += pillWidth + skillPill.gapX;
    }

    const contactLinks = [
        profile.links.githubShort,
        buildMailText(profile.links.mail),
        profile.links.instagramShort,
    ];
    const contactStartX = sectionRightX + contactPill.sectionPadding;
    const contactStartY = stackY + contactPill.startY;
    const contactRightBoundary = sectionRightX + sectionWidth - contactPill.sectionPadding;
    const contactBottomBoundary = stackY + stackHeight - contactPill.sectionPadding;
    let contactCursorX = contactStartX;
    let contactCursorY = contactStartY;

    for (const link of contactLinks) {
        setTextStyle(
            context,
            contactPill.textStyle.font,
            contactPill.textStyle.color,
            contactPill.textStyle.shadowStrength,
            contactPill.textStyle.strokeWidth
        );
        const measuredWidth =
            Math.ceil(context.measureText(link).width) + contactPill.horizontalPadding * 2;
        const pillWidth = Math.min(
            Math.max(measuredWidth, contactPill.minWidth),
            contactRightBoundary - contactStartX
        );
        const shouldWrap =
            contactCursorX + pillWidth > contactRightBoundary && contactCursorX > contactStartX;

        if (shouldWrap) {
            contactCursorX = contactStartX;
            contactCursorY += contactPill.height + contactPill.gapY;
        }

        if (contactCursorY + contactPill.height > contactBottomBoundary) {
            break;
        }

        drawPanel(context, {
            x: contactCursorX,
            y: contactCursorY,
            width: pillWidth,
            height: contactPill.height,
            radius: contactPill.panelRadius,
            fill: contactPill.panel.fill,
            stroke: contactPill.panel.stroke,
            lineWidth: contactPill.panel.lineWidth,
        });

        drawFittedTextInBox(
            context,
            link,
            contactCursorX + contactPill.textInsetX,
            contactCursorY,
            pillWidth - contactPill.textWidthInset,
            contactPill.height,
            contactPill.maxFontSize,
            contactPill.minFontSize,
            contactPill.fontWeight,
            contactPill.textColor
        );

        contactCursorX += pillWidth + contactPill.gapX;
    }
}
