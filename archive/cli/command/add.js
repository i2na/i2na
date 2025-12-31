import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";
import chalk from "chalk";
import { getConfig } from "../config.js";
import { commitAndPush } from "../utils/git.js";

export default async function addCommand(filepath, options) {
    try {
        const config = await getConfig();

        // 파일 읽기
        const content = await fs.readFile(filepath, "utf-8");
        const parsed = matter(content);
        const body = parsed.content;

        // 원본 파일명을 그대로 사용 (확장자 제거)
        const slug = path.basename(filepath, ".md");

        // 한국 시간 생성 (KST)
        const now = new Date();
        const kstTime = new Date(now.getTime() + 9 * 60 * 60 * 1000);
        const year = kstTime.getUTCFullYear();
        const month = String(kstTime.getUTCMonth() + 1).padStart(2, "0");
        const day = String(kstTime.getUTCDate()).padStart(2, "0");
        const hours = String(kstTime.getUTCHours()).padStart(2, "0");
        const minutes = String(kstTime.getUTCMinutes()).padStart(2, "0");
        const timestamp = `${year}.${month}.${day} ${hours}:${minutes}`;

        // Frontmatter 생성
        const frontmatter = {
            visibility: parsed.data.visibility || "private",
            sharedWith: parsed.data.sharedWith || ["yena@moss.land"],
            createdAt: parsed.data.createdAt || timestamp,
        };

        // 파일 내용 생성 (frontmatter 추가)
        const finalContent = matter.stringify(body.trim(), frontmatter);

        // 파일 저장
        const targetPath = path.join(config.archivePath, "docs", `${slug}.md`);
        await fs.writeFile(targetPath, finalContent, "utf-8");

        console.log(chalk.green(`✓ Saved → docs/${slug}.md`));

        // Git 커밋 & 푸시
        await commitAndPush(config.archivePath, `docs: add ${slug}`);
        console.log(chalk.green("✓ Committed & pushed"));

        // -d 플래그가 있을 때만 원본 파일 삭제
        if (options.delete) {
            await fs.unlink(filepath);
            console.log(chalk.green("✓ Removed original file"));
        }

        // URL 출력
        console.log(chalk.cyan(`→ ${config.baseUrl}/${slug}`));
    } catch (error) {
        console.error(chalk.red("✗ Failed to add document"));
        console.error(chalk.dim(error.message));
        process.exit(1);
    }
}
