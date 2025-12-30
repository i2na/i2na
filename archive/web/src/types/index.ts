export interface MarkdownFile {
    filename: string;
    title: string;
    content: string;
    path: string;
}

export interface TocItem {
    level: number;
    text: string;
    id: string;
}
