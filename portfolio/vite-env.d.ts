/// <reference types="vite/client" />

interface ImportMeta {
    readonly glob: <T = Record<string, () => Promise<any>>>(
        pattern: string,
        options?: {
            as?: string;
            eager?: boolean;
        }
    ) => T;
}
