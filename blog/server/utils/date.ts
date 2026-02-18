export function getIsoTimestamp(date: Date = new Date()): string {
    return date.toISOString();
}

export function getStartDate(days: number, fromDate: Date = new Date()): Date {
    const nextDate = new Date(fromDate);
    nextDate.setDate(nextDate.getDate() - days);
    return nextDate;
}

export function toDateKey(dateValue: string | Date): string {
    const date = typeof dateValue === "string" ? new Date(dateValue) : dateValue;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}
