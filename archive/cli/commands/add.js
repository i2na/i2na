import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";
import chalk from "chalk";
import { getConfig } from "../config.js";
import { commitAndPush } from "../utils/git.js";

export default async function addCommand(filepath) {
    try {
        const config = await getConfig();

        // 파일 읽기
        const content = await fs.readFile(filepath, "utf-8");
        const { content: body } = matter(content);

        // 첫 번째 # 헤딩에서 title 추출
        const headingMatch = body.match(/^#\s+(.+)$/m);
        const title = headingMatch ? headingMatch[1].trim() : path.basename(filepath, ".md");

        // slug 생성
        const slug = title
            .toLowerCase()
            .replace(/[^a-z0-9가-힣]+/g, "_")
            .replace(/^_|_$/g, "");

        // 한국 시간 생성 (KST)
        const now = new Date();
        const kstTime = new Date(now.getTime() + 9 * 60 * 60 * 1000);
        const year = kstTime.getUTCFullYear();
        const month = String(kstTime.getUTCMonth() + 1).padStart(2, "0");
        const day = String(kstTime.getUTCDate()).padStart(2, "0");
        const hours = String(kstTime.getUTCHours()).padStart(2, "0");
        const minutes = String(kstTime.getUTCMinutes()).padStart(2, "0");
        const timestamp = `${year}.${month}.${day} ${hours}:${minutes}`;

        // 파일 내용 생성 (frontmatter 제거, 타임스탬프 추가)
        const finalContent = `<sub>${timestamp}</sub>\n\n${body.trim()}\n`;

        // 파일 저장
        const targetPath = path.join(config.archivePath, "docs", `${slug}.md`);
        await fs.writeFile(targetPath, finalContent, "utf-8");

        console.log(chalk.green(`✓ Saved → docs/${slug}.md`));

        // Git 커밋 & 푸시
        await commitAndPush(config.archivePath, `docs: add ${slug}`);
        console.log(chalk.green("✓ Committed & pushed"));

        // 원본 파일 삭제
        await fs.unlink(filepath);
        console.log(chalk.green("✓ Removed original file"));

        // URL 출력
        console.log(chalk.cyan(`→ ${config.baseUrl}/${slug}`));
    } catch (error) {
        console.error(chalk.red("✗ Failed to add document"));
        console.error(chalk.dim(error.message));
        process.exit(1);
    }
}
