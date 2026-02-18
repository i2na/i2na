export class HttpError extends Error {
    public readonly status: number;

    constructor(status: number, message: string) {
        super(message);
        this.status = status;
        this.name = "HttpError";
    }
}

export function isHttpError(value: unknown): value is HttpError {
    return value instanceof HttpError;
}
