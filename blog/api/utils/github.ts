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
