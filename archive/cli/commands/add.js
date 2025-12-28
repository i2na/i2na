import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import chalk from 'chalk';
import { getConfig } from '../config.js';
import { commitAndPush } from '../utils/git.js';

export default async function addCommand(filepath) {
    try {
        const config = await getConfig();
        
        // 파일 읽기
        const content = await fs.readFile(filepath, 'utf-8');
        const { data: frontmatter, content: body } = matter(content);
        
        // slug 생성
        const title = frontmatter.title || 'untitled';
        const slug = title
            .toLowerCase()
            .replace(/[^a-z0-9가-힣]+/g, '_')
            .replace(/^_|_$/g, '');
        
        // frontmatter에 날짜 추가
        const updatedFrontmatter = {
            ...frontmatter,
            created: new Date().toISOString().split('T')[0]
        };
        
        // 파일 저장
        const targetPath = path.join(config.archivePath, 'docs', `${slug}.md`);
        const finalContent = matter.stringify(body, updatedFrontmatter);
        await fs.writeFile(targetPath, finalContent, 'utf-8');
        
        console.log(chalk.green(`✓ Saved → docs/${slug}.md`));
        
        // Git 커밋 & 푸시
        await commitAndPush(config.archivePath, `docs: add ${slug}`);
        console.log(chalk.green('✓ Committed & pushed'));
        
        // 원본 파일 삭제
        await fs.unlink(filepath);
        console.log(chalk.green('✓ Removed original file'));
        
        // URL 출력
        console.log(chalk.cyan(`→ ${config.baseUrl}/${slug}`));
        
    } catch (error) {
        console.error(chalk.red('✗ Failed to add document'));
        console.error(chalk.dim(error.message));
        process.exit(1);
    }
}

