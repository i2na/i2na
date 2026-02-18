import { subscribeEmail } from "@server/models/subscriptions.model";

export async function subscribeController(payload: { email: string }) {
    const result = await subscribeEmail(payload.email);

    return {
        email: result.email,
        subscribed: true,
        isNew: result.isNew,
    };
}
