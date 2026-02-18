import { MONGODB } from "@server/config/constants";
import { getIsoTimestamp } from "@server/utils/date";
import { HttpError } from "@server/utils/http-error";
import { findMany, findOne, insertOne, updateOne } from "./mongo-data-api";
import type { ISubscriptionDocument } from "./types";

function validateEmailAddress(email: string): string {
    const normalizedEmail = email.trim().toLowerCase();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(normalizedEmail)) {
        throw new HttpError(400, "valid email is required");
    }

    return normalizedEmail;
}

export async function subscribeEmail(email: string): Promise<{ email: string; isNew: boolean }> {
    const normalizedEmail = validateEmailAddress(email);
    const existing = await findOne<ISubscriptionDocument>(MONGODB.COLLECTIONS.SUBSCRIPTIONS, {
        email: normalizedEmail,
    });

    if (existing && existing.isActive) {
        return {
            email: normalizedEmail,
            isNew: false,
        };
    }

    if (existing && !existing.isActive) {
        await updateOne(
            MONGODB.COLLECTIONS.SUBSCRIPTIONS,
            { email: normalizedEmail },
            {
                $set: {
                    isActive: true,
                    createdAt: getIsoTimestamp(),
                },
            }
        );

        return {
            email: normalizedEmail,
            isNew: true,
        };
    }

    await insertOne<ISubscriptionDocument>(MONGODB.COLLECTIONS.SUBSCRIPTIONS, {
        email: normalizedEmail,
        createdAt: getIsoTimestamp(),
        isActive: true,
    });

    return {
        email: normalizedEmail,
        isNew: true,
    };
}

export async function listActiveSubscriberEmails(): Promise<string[]> {
    const subscriptions = await findMany<ISubscriptionDocument>(MONGODB.COLLECTIONS.SUBSCRIPTIONS, {
        filter: { isActive: true },
    });

    return subscriptions.map((subscription) => subscription.email);
}

interface IAlertLogDocument {
    _id?: unknown;
    postSlug: string;
    postTitle: string;
    email: string;
    sentAt: string;
    provider: "resend" | "queue";
    success: boolean;
}

export async function logAlertDelivery(log: Omit<IAlertLogDocument, "_id">): Promise<void> {
    await insertOne<IAlertLogDocument>(MONGODB.COLLECTIONS.ALERT_LOGS, {
        ...log,
    });
}

export async function listAlertLogsByPostSlug(postSlug: string): Promise<IAlertLogDocument[]> {
    return await findMany<IAlertLogDocument>(MONGODB.COLLECTIONS.ALERT_LOGS, {
        filter: { postSlug },
        sort: { sentAt: -1 },
    });
}
