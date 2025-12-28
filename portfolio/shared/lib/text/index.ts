export function extractSummary(content: string, maxLength: number = 150): string {
    const cleaned = content.replace(/^#+\s+.+$/gm, "").trim();
    const firstParagraph = cleaned.split("\n\n")[0] || cleaned;
    return (
        firstParagraph.substring(0, maxLength) + (firstParagraph.length > maxLength ? "..." : "")
    );
}
