import type { TProfile } from "../../../../config/profile.constants";
import {
    DESKTOP_LAYOUT,
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

function drawTopHeader(context: CanvasRenderingContext2D, profile: TProfile): void {
    const { topHeader } = DESKTOP_LAYOUT;
    const subtitleBoxX = TEXTURE_WIDTH - PADDING_X - topHeader.subtitleBoxWidth;
    const subtitleBoxY = PADDING_Y + topHeader.subtitleBoxYOffset;

    setTextStyle(context, topHeader.nameStyle.font, topHeader.nameStyle.color);
    drawSharpText(context, profile.name, PADDING_X, PADDING_Y + topHeader.nameYOffset);

    drawPanel(context, {
        x: subtitleBoxX,
        y: subtitleBoxY,
        width: topHeader.subtitleBoxWidth,
        height: topHeader.subtitleBoxHeight,
        radius: topHeader.subtitlePanel.radius,
        fill: topHeader.subtitlePanel.fill,
        stroke: topHeader.subtitlePanel.stroke,
    });

    setTextStyle(context, topHeader.subtitleStyle.font, topHeader.subtitleStyle.color);
    drawSharpText(
        context,
        profile.subtitle.toUpperCase(),
        subtitleBoxX + topHeader.subtitleTextOffsetX,
        subtitleBoxY + topHeader.subtitleTextOffsetY
    );
}

function drawMainPanels(context: CanvasRenderingContext2D, profile: TProfile): number {
    const { mainPanels } = DESKTOP_LAYOUT;
    const contentWidth = TEXTURE_WIDTH - PADDING_X * 2;
    const leftWidth = Math.round(contentWidth * mainPanels.leftWidthRatio);
    const rightWidth = contentWidth - leftWidth - mainPanels.columnGap;
    const topPanelY = PADDING_Y + mainPanels.topPanelYOffset;
    const leftPanelX = PADDING_X;
    const rightPanelX = leftPanelX + leftWidth + mainPanels.columnGap;

    drawPanel(context, {
        x: leftPanelX,
        y: topPanelY,
        width: leftWidth,
        height: mainPanels.topPanelHeight,
        fill: mainPanels.leftPanel.fill,
        stroke: mainPanels.leftPanel.stroke,
    });

    drawPanel(context, {
        x: rightPanelX,
        y: topPanelY,
        width: rightWidth,
        height: mainPanels.topPanelHeight,
        fill: mainPanels.rightPanel.fill,
        stroke: mainPanels.rightPanel.stroke,
    });

    setTextStyle(context, mainPanels.aboutTitle.style.font, mainPanels.aboutTitle.style.color);
    drawSharpText(
        context,
        mainPanels.aboutTitle.text,
        leftPanelX + mainPanels.aboutTitle.offsetX,
        topPanelY + mainPanels.aboutTitle.offsetY
    );

    setTextStyle(
        context,
        mainPanels.intro.style.font,
        mainPanels.intro.style.color,
        mainPanels.intro.style.shadowStrength
    );
    let introY = topPanelY + mainPanels.intro.startY;
    profile.introLines.forEach((line) => {
        introY = drawWrappedText(
            context,
            line,
            leftPanelX + mainPanels.intro.offsetX,
            introY,
            leftWidth - mainPanels.intro.widthInset,
            mainPanels.intro.lineHeight,
            mainPanels.intro.maxLines
        );
        introY += mainPanels.intro.lineGap;
    });

    setTextStyle(context, mainPanels.keyword.style.font, mainPanels.keyword.style.color);
    drawSharpText(
        context,
        profile.aboutKeywordLine,
        leftPanelX + mainPanels.keyword.offsetX,
        topPanelY + mainPanels.keyword.offsetY
    );

    setTextStyle(context, mainPanels.glanceTitle.style.font, mainPanels.glanceTitle.style.color);
    drawSharpText(
        context,
        mainPanels.glanceTitle.text,
        rightPanelX + mainPanels.glanceTitle.offsetX,
        topPanelY + mainPanels.glanceTitle.offsetY
    );

    setTextStyle(
        context,
        mainPanels.glanceSummary.style.font,
        mainPanels.glanceSummary.style.color
    );
    drawWrappedText(
        context,
        profile.educationSummary,
        rightPanelX + mainPanels.glanceSummary.offsetX,
        topPanelY + mainPanels.glanceSummary.educationY,
        rightWidth - mainPanels.glanceSummary.widthInset,
        mainPanels.glanceSummary.lineHeight,
        mainPanels.glanceSummary.maxLines
    );
    drawWrappedText(
        context,
        profile.workSummary,
        rightPanelX + mainPanels.glanceSummary.offsetX,
        topPanelY + mainPanels.glanceSummary.workY,
        rightWidth - mainPanels.glanceSummary.widthInset,
        mainPanels.glanceSummary.lineHeight,
        mainPanels.glanceSummary.maxLines
    );

    setTextStyle(context, mainPanels.glanceDetail.style.font, mainPanels.glanceDetail.style.color);
    const [firstGlanceDetail, secondGlanceDetail] = profile.atGlanceDetailLines;
    drawSharpText(
        context,
        firstGlanceDetail,
        rightPanelX + mainPanels.glanceDetail.offsetX,
        topPanelY + mainPanels.glanceDetail.firstY
    );
    drawSharpText(
        context,
        secondGlanceDetail,
        rightPanelX + mainPanels.glanceDetail.offsetX,
        topPanelY + mainPanels.glanceDetail.secondY
    );

    return topPanelY + mainPanels.topPanelHeight;
}

function drawTimeline(
    context: CanvasRenderingContext2D,
    profile: TProfile,
    topEndY: number
): number {
    const { timeline } = DESKTOP_LAYOUT;
    const contentWidth = TEXTURE_WIDTH - PADDING_X * 2;
    const timelineY = topEndY + timeline.panelYOffset;

    drawPanel(context, {
        x: PADDING_X,
        y: timelineY,
        width: contentWidth,
        height: timeline.panelHeight,
        fill: timeline.panel.fill,
        stroke: timeline.panel.stroke,
    });

    setTextStyle(context, timeline.title.style.font, timeline.title.style.color);
    drawSharpText(
        context,
        timeline.title.text,
        PADDING_X + timeline.title.offsetX,
        timelineY + timeline.title.offsetY
    );

    const cardWidth = Math.floor(
        (contentWidth - timeline.cards.widthGapBase) / timeline.cards.maxVisibleCards
    );
    const cardY = timelineY + timeline.cards.startY;

    profile.experiences.slice(0, timeline.cards.maxVisibleCards).forEach((experience, index) => {
        const cardX =
            PADDING_X + timeline.cards.startXInset + index * (cardWidth + timeline.cards.gap);

        drawPanel(context, {
            x: cardX,
            y: cardY,
            width: cardWidth,
            height: timeline.cards.height,
            radius: timeline.cards.panel.radius,
            fill: timeline.cards.panel.fill,
            stroke: timeline.cards.panel.stroke,
        });

        setTextStyle(
            context,
            timeline.cards.organization.style.font,
            timeline.cards.organization.style.color
        );
        drawWrappedText(
            context,
            experience.organization,
            cardX + timeline.cards.organization.offsetX,
            cardY + timeline.cards.organization.offsetY,
            cardWidth - timeline.cards.organization.widthInset,
            timeline.cards.organization.lineHeight,
            timeline.cards.organization.maxLines
        );

        setTextStyle(context, timeline.cards.role.style.font, timeline.cards.role.style.color);
        drawWrappedText(
            context,
            experience.role,
            cardX + timeline.cards.role.offsetX,
            cardY + timeline.cards.role.offsetY,
            cardWidth - timeline.cards.role.widthInset,
            timeline.cards.role.lineHeight,
            timeline.cards.role.maxLines
        );

        setTextStyle(context, timeline.cards.period.style.font, timeline.cards.period.style.color);
        drawSharpText(
            context,
            experience.period,
            cardX + timeline.cards.period.offsetX,
            cardY + timeline.cards.height - timeline.cards.period.bottomInset
        );
    });

    return timelineY + timeline.panelHeight;
}

function drawFooter(
    context: CanvasRenderingContext2D,
    profile: TProfile,
    timelineEndY: number
): void {
    const { footer } = DESKTOP_LAYOUT;
    const contentWidth = TEXTURE_WIDTH - PADDING_X * 2;
    const footerY = timelineEndY + footer.panelYOffset;
    const footerHeight = TEXTURE_HEIGHT - footerY - PADDING_Y;
    const sectionWidth = Math.floor((contentWidth - footer.sectionGap) / footer.sectionsCount);
    const leftSectionX = PADDING_X;
    const rightSectionX = leftSectionX + sectionWidth + footer.sectionGap;

    drawPanel(context, {
        x: leftSectionX,
        y: footerY,
        width: sectionWidth,
        height: footerHeight,
        fill: footer.sectionPanel.fill,
        stroke: footer.sectionPanel.stroke,
    });

    drawPanel(context, {
        x: rightSectionX,
        y: footerY,
        width: sectionWidth,
        height: footerHeight,
        fill: footer.sectionPanel.fill,
        stroke: footer.sectionPanel.stroke,
    });

    const leftColumnWidth = sectionWidth - footer.innerPadding * 2;
    const rightColumnWidth = sectionWidth - footer.innerPadding * 2;
    const leftColumnX = leftSectionX + footer.innerPadding;
    const rightColumnX = rightSectionX + footer.innerPadding;
    const sectionTitleY = footerY + footer.sectionTitleY;
    const contentStartY = footerY + footer.sectionTopPadding;
    const availableSectionHeight =
        footerHeight - footer.sectionTopPadding - footer.sectionBottomPadding;

    setTextStyle(context, footer.titleStyle.font, footer.titleStyle.color);
    drawSharpText(context, footer.stackTitle, leftColumnX, sectionTitleY);
    drawSharpText(context, footer.contactTitle, rightColumnX, sectionTitleY);

    const skillPillHeight = Math.max(
        footer.skillPill.minHeight,
        Math.min(
            footer.skillPill.maxHeight,
            Math.floor(
                (availableSectionHeight - footer.skillPill.gapY * (footer.skillPill.maxRows - 1)) /
                    footer.skillPill.maxRows
            )
        )
    );
    const skillPillRadius = Math.floor(skillPillHeight / 2);
    let skillCursorX = leftColumnX;
    let skillCursorY = contentStartY;
    let skillRow = 0;

    profile.skills.forEach((skill) => {
        if (skillRow >= footer.skillPill.maxRows) {
            return;
        }

        setTextStyle(context, footer.skillPill.textStyle.font, footer.skillPill.textStyle.color);
        const pillWidth =
            Math.ceil(context.measureText(skill).width) + footer.skillPill.horizontalPadding * 2;
        const finalPillWidth = Math.min(pillWidth, leftColumnWidth);
        const wouldOverflow = skillCursorX + finalPillWidth > leftColumnX + leftColumnWidth;

        if (wouldOverflow) {
            skillRow += 1;

            if (skillRow >= footer.skillPill.maxRows) {
                return;
            }

            skillCursorX = leftColumnX;
            skillCursorY += skillPillHeight + footer.skillPill.gapY;
        }

        drawPanel(context, {
            x: skillCursorX,
            y: skillCursorY,
            width: finalPillWidth,
            height: skillPillHeight,
            radius: skillPillRadius,
            fill: footer.skillPill.panel.fill,
            stroke: footer.skillPill.panel.stroke,
            lineWidth: footer.skillPill.panel.lineWidth,
        });

        drawFittedTextInBox(
            context,
            skill,
            skillCursorX + footer.skillPill.textInsetX,
            skillCursorY,
            finalPillWidth - footer.skillPill.textWidthInset,
            skillPillHeight,
            footer.skillPill.maxFontSize,
            footer.skillPill.minFontSize,
            footer.skillPill.fontWeight,
            footer.skillPill.textColor
        );

        skillCursorX += finalPillWidth + footer.skillPill.gapX;
    });

    const links = [
        profile.links.githubShort,
        buildMailText(profile.links.mail),
        profile.links.instagramShort,
    ];
    const contactPillHeight = Math.max(
        footer.contactPill.minHeight,
        Math.min(
            footer.contactPill.maxHeight,
            Math.floor(
                (availableSectionHeight - footer.contactPill.gapY * (footer.contactPill.rows - 1)) /
                    footer.contactPill.rows
            )
        )
    );
    const contactRightBoundary = rightColumnX + rightColumnWidth;
    const contactBottomBoundary = contentStartY + availableSectionHeight;
    let contactCursorX = rightColumnX;
    let contactCursorY = contentStartY;

    for (const link of links) {
        setTextStyle(
            context,
            footer.contactPill.textStyle.font,
            footer.contactPill.textStyle.color
        );
        const measuredWidth =
            Math.ceil(context.measureText(link).width) + footer.contactPill.horizontalPadding * 2;
        const pillWidth = Math.min(
            Math.max(measuredWidth, footer.contactPill.minWidth),
            rightColumnWidth
        );
        const shouldWrap =
            contactCursorX + pillWidth > contactRightBoundary && contactCursorX > rightColumnX;

        if (shouldWrap) {
            contactCursorX = rightColumnX;
            contactCursorY += contactPillHeight + footer.contactPill.gapY;
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
            fill: footer.contactPill.panel.fill,
            stroke: footer.contactPill.panel.stroke,
            lineWidth: footer.contactPill.panel.lineWidth,
        });

        drawFittedTextInBox(
            context,
            link,
            contactCursorX + footer.contactPill.textInsetX,
            contactCursorY,
            pillWidth - footer.contactPill.textWidthInset,
            contactPillHeight,
            footer.contactPill.maxFontSize,
            footer.contactPill.minFontSize,
            footer.contactPill.fontWeight,
            footer.contactPill.textColor
        );

        contactCursorX += pillWidth + footer.contactPill.gapX;
    }
}

export function drawDesktopLayout(context: CanvasRenderingContext2D, profile: TProfile): void {
    drawTopHeader(context, profile);
    const topEndY = drawMainPanels(context, profile);
    const timelineEndY = drawTimeline(context, profile, topEndY);
    drawFooter(context, profile, timelineEndY);
}
