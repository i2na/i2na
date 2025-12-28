import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import chalk from 'chalk';

const CONFIG_PATH = path.join(os.homedir(), '.archive-config.json');

export async function getConfig() {
    try {
        const content = await fs.readFile(CONFIG_PATH, 'utf-8');
        const config = JSON.parse(content);
        
        return {
            archivePath: config.archivePath,
            gitRemote: config.gitRemote,
            baseUrl: config.baseUrl
        };
    } catch (error) {
        console.error(chalk.red('✗ Config file not found'));
        console.error(chalk.dim('Run "node setup.js" first'));
        process.exit(1);
    }
}

export async function saveConfig(config) {
    await fs.writeFile(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8');
}

