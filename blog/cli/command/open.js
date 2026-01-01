import { exec } from 'child_process';
import { promisify } from 'util';
import chalk from 'chalk';
import { getConfig } from '../config.js';

const execAsync = promisify(exec);

export default async function openCommand() {
    try {
        const config = await getConfig();
        
        console.log(chalk.dim('Opening blog project in Cursor...'));
        await execAsync(`cursor "${config.blogPath}"`);
        
        console.log(chalk.green('✓ Opening blog project in Cursor...'));
    } catch (error) {
        console.error(chalk.red('✗ Failed to open project'));
        console.error(chalk.dim(error.message));
        process.exit(1);
    }
}

