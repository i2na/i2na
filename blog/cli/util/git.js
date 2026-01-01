import simpleGit from 'simple-git';
import chalk from 'chalk';

export async function commitAndPush(repoPath, message) {
    try {
        const git = simpleGit(repoPath);
        
        await git.add('.');
        await git.commit(message);
        await git.push();
        
    } catch (error) {
        console.error(chalk.red('✗ Git operation failed'));
        throw error;
    }
}

