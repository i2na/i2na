import { GITHUB, ENV_VARS } from "../../constants.js";

const GITHUB_TOKEN = ENV_VARS.BLOG_POSTS_GITHUB_TOKEN;
const REPO_OWNER = GITHUB.REPO_OWNER;
const REPO_NAME = GITHUB.POSTS_REPO_NAME;

interface GitHubFile {
    name: string;
    path: string;
    type: string;
    download_url: string;
}

export async function fetchGitHubFile(filename: string): Promise<string> {
    const url = `${GITHUB.API_BASE_URL}/repos/${REPO_OWNER}/${REPO_NAME}/contents/${filename}`;

    const response = await fetch(url, {
        headers: {
            Authorization: `Bearer ${GITHUB_TOKEN}`,
            Accept: "application/vnd.github.v3.raw",
            "User-Agent": GITHUB.USER_AGENT,
        },
    });

    if (!response.ok) {
        if (response.status === 404) {
            throw new Error("NOT_FOUND");
        }
        throw new Error(`GitHub API error: ${response.status}`);
    }

    return await response.text();
}

export async function fetchGitHubFileList(): Promise<GitHubFile[]> {
    const url = `${GITHUB.API_BASE_URL}/repos/${REPO_OWNER}/${REPO_NAME}/contents`;

    const response = await fetch(url, {
        headers: {
            Authorization: `Bearer ${GITHUB_TOKEN}`,
            Accept: "application/vnd.github.v3+json",
            "User-Agent": GITHUB.USER_AGENT,
        },
    });

    if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
    }

    const files = await response.json();
    return files.filter((f: any) => f.type === "file" && f.name.endsWith(".md"));
}

export async function getGitHubFileSha(filename: string): Promise<string> {
    const url = `${GITHUB.API_BASE_URL}/repos/${REPO_OWNER}/${REPO_NAME}/contents/${filename}`;

    const response = await fetch(url, {
        headers: {
            Authorization: `Bearer ${GITHUB_TOKEN}`,
            Accept: "application/vnd.github.v3+json",
            "User-Agent": GITHUB.USER_AGENT,
        },
    });

    if (!response.ok) {
        if (response.status === 404) {
            throw new Error("NOT_FOUND");
        }
        throw new Error(`GitHub API error: ${response.status}`);
    }

    const data = await response.json();
    return data.sha;
}

export async function updateGitHubFile(
    filename: string,
    content: string,
    message: string
): Promise<void> {
    const sha = await getGitHubFileSha(filename);
    const url = `${GITHUB.API_BASE_URL}/repos/${REPO_OWNER}/${REPO_NAME}/contents/${filename}`;

    const encodedContent = Buffer.from(content, "utf-8").toString("base64");

    const response = await fetch(url, {
        method: "PUT",
        headers: {
            Authorization: `Bearer ${GITHUB_TOKEN}`,
            Accept: "application/vnd.github.v3+json",
            "User-Agent": GITHUB.USER_AGENT,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            message,
            content: encodedContent,
            sha,
        }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
            `GitHub API error: ${response.status} - ${errorData.message || response.statusText}`
        );
    }
}
