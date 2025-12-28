export function parseDate(dateStr: string): string {
    if (dateStr.includes("T") && dateStr.includes("Z")) {
        return dateStr;
    }

    let normalized = dateStr.replace(/\//g, "-");

    if (normalized.includes(" ")) {
        const [datePart, timePart] = normalized.split(" ");
        return `${datePart}T${timePart}:00.000Z`;
    }

    return `${normalized}T00:00:00.000Z`;
}

export function formatDate(
    dateStr: string,
    locale: string = "en-US",
    options?: Intl.DateTimeFormatOptions
): string {
    return new Date(dateStr).toLocaleDateString(locale, {
        year: "numeric",
        month: "short",
        day: "2-digit",
        ...options,
    });
}
