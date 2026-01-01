import inquirer from "inquirer";
import { saveConfig } from "./cli/config.js";
import chalk from "chalk";
import path from "path";
import { GITHUB, URLS } from "./constants.js";

async function setup() {
    console.log(chalk.bold("\n🗂️  Blog Setup\n"));
    console.log(chalk.dim("Please provide the following information:\n"));

    const currentBlogPath = process.cwd();

    const answers = await inquirer.prompt([
        {
            type: "input",
            name: "blogPath",
            message: "Blog folder (local absolute path):",
            default: currentBlogPath,
        },
        {
            type: "input",
            name: "blogGitRemote",
            message: "Blog Git repository URL:",
            default: GITHUB.BLOG_REPO_URL,
        },
        {
            type: "input",
            name: "postsRepoPath",
            message: "Posts folder (local absolute path):",
            validate: (input) => {
                if (!input || input.trim() === "") {
                    return "Posts folder path is required";
                }
                if (!path.isAbsolute(input)) {
                    return "Please provide an absolute path";
                }
                return true;
            },
        },

        {
            type: "input",
            name: "postsGitRemote",
            message: "Posts Git repository URL:",
            default: GITHUB.POSTS_REPO_URL,
        },
        {
            type: "input",
            name: "baseUrl",
            message: "Deployment URL:",
            default: URLS.DEPLOYMENT_BASE,
        },
    ]);

    await saveConfig({
        blogPath: answers.blogPath,
        postsRepoPath: answers.postsRepoPath,
        blogGitRemote: answers.blogGitRemote,
        postsGitRemote: answers.postsGitRemote,
        baseUrl: answers.baseUrl,
    });

    console.log(chalk.green("\n✓ Configuration saved to ~/.blog-config.json"));
    console.log(chalk.dim("\nNext steps:"));
    console.log(chalk.dim("  1. yarn link"));
    console.log(chalk.dim("  2. blog call"));
}

setup().catch((error) => {
    console.error(chalk.red("\n✗ Setup failed"));
    console.error(chalk.dim(error.message));
    process.exit(1);
});
