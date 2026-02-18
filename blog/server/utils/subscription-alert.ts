import { ALERTS, URLS } from "@server/config/constants";
import { getIsoTimestamp } from "@server/utils/date";
import { listActiveSubscriberEmails, logAlertDelivery } from "@server/models/subscriptions.model";

interface IPublicationAlertInput {
    postSlug: string;
    postTitle: string;
    postDescription: string;
    postUrl: string;
}

interface IResendResponse {
    id: string;
}

async function sendEmailWithResend(input: {
    to: string;
    subject: string;
    html: string;
}): Promise<boolean> {
    if (!ALERTS.RESEND_API_KEY) {
        return false;
    }

    const response = await fetch(URLS.RESEND_EMAIL_ENDPOINT, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${ALERTS.RESEND_API_KEY}`,
        },
        body: JSON.stringify({
            from: ALERTS.FROM_EMAIL,
            to: input.to,
            subject: input.subject,
            html: input.html,
        }),
    });

    if (!response.ok) {
        return false;
    }

    const data = (await response.json()) as IResendResponse;
    return Boolean(data.id);
}

function createEmailHtml(input: IPublicationAlertInput): string {
    return [
        "<h1>New post published</h1>",
        `<p><strong>${input.postTitle}</strong></p>`,
        `<p>${input.postDescription}</p>`,
        `<p><a href="${input.postUrl}">Read post</a></p>`,
    ].join("");
}

export async function deliverPublicationAlerts(input: IPublicationAlertInput): Promise<number> {
    const subscriberEmails = await listActiveSubscriberEmails();
    if (subscriberEmails.length === 0) {
        return 0;
    }

    const emailHtml = createEmailHtml(input);
    const subject = `New post: ${input.postTitle}`;

    let successCount = 0;

    for (const email of subscriberEmails) {
        const sent = await sendEmailWithResend({
            to: email,
            subject,
            html: emailHtml,
        });

        if (sent) {
            successCount += 1;
        }

        await logAlertDelivery({
            postSlug: input.postSlug,
            postTitle: input.postTitle,
            email,
            sentAt: getIsoTimestamp(),
            provider: ALERTS.RESEND_API_KEY ? "resend" : "queue",
            success: sent,
        });
    }

    return successCount;
}
