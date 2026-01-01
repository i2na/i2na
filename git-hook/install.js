const fs = require("fs");
const path = require("path");

const gitHookDir = path.join(__dirname);
const gitHooksDir = path.join(__dirname, "..", ".git", "hooks");

const hooks = ["pre-commit", "prepare-commit-msg", "commit-msg"];

console.log("\nGit hooks 설치 중...\n");

if (!fs.existsSync(gitHooksDir)) {
    console.error(".git/hooks 디렉토리를 찾을 수 없습니다.");
    process.exit(1);
}

hooks.forEach((hook) => {
    const source = path.join(gitHookDir, hook);
    const target = path.join(gitHooksDir, hook);

    try {
        if (fs.existsSync(source)) {
            fs.copyFileSync(source, target);
            fs.chmodSync(target, "755");
            console.log(`${hook} 설치 완료`);
        } else {
            console.warn(`${hook} 파일을 찾을 수 없습니다: ${source}`);
        }
    } catch (error) {
        console.error(`${hook} 설치 실패:`, error.message);
        process.exit(1);
    }
});

console.log("\nGit hooks 설치가 완료되었습니다!\n");
