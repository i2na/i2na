import inquirer from "inquirer";
import { saveConfig } from "./cli/config.js";
import chalk from "chalk";

async function setup() {
    console.log(chalk.bold("\n🗂️  Archive Setup\n"));

    // 현재 프로젝트 경로 자동 인식
    const currentPath = process.cwd();

    const answers = await inquirer.prompt([
        {
            type: "input",
            name: "archivePath",
            message: "Archive project path:",
            default: currentPath,
        },
        {
            type: "input",
            name: "gitRemote",
            message: "Git repository URL:",
            default: "https://github.com/i2na/i2na.git",
        },
        {
            type: "input",
            name: "baseUrl",
            message: "Deployment URL:",
            default: "https://archive.yena.io.kr",
        },
    ]);

    await saveConfig({
        archivePath: answers.archivePath,
        gitRemote: answers.gitRemote,
        baseUrl: answers.baseUrl,
    });

    console.log(chalk.green("\n✓ Configuration saved to ~/.archive-config.json"));
    console.log(chalk.dim("\nNext steps:"));
    console.log(chalk.dim("  1. yarn install"));
    console.log(chalk.dim("  2. yarn link"));
    console.log(chalk.dim("  3. archive call"));
}

setup().catch((error) => {
    console.error(chalk.red("\n✗ Setup failed"));
    console.error(chalk.dim(error.message));
    process.exit(1);
});
