import fs from 'fs';
import path from 'path';

const toolsDir = path.join(process.cwd(), 'pages', 'tools');
const dashboardDir = path.join(process.cwd(), 'pages', 'dashboard');

// Regex to find the target condition and replace it
// Target: errorJson.error === 'PLAN_LOCKED'
// Replace: errorJson.code === 'REQUIRE_UPGRADE' || errorJson.upgradeRequired === true || errorJson.error === 'PLAN_LOCKED'

function processDirectory(directory: string) {
    if (!fs.existsSync(directory)) return;

    const files = fs.readdirSync(directory);
    for (const file of files) {
        const fullPath = path.join(directory, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDirectory(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let modified = false;

            // Pattern 1: if (response.status === 403 || (errorJson && (errorJson.error === 'PLAN_LOCKED'
            if (content.includes("errorJson.error === 'PLAN_LOCKED'") && !content.includes("REQUIRE_UPGRADE")) {
                content = content.replace(
                    /errorJson\.error === 'PLAN_LOCKED'/g,
                    "errorJson.code === 'REQUIRE_UPGRADE' || errorJson.upgradeRequired === true || errorJson.error === 'PLAN_LOCKED'"
                );
                modified = true;
            }

            // Pattern 2: simple string check if it doesn't use errorJson
            if (content.includes("includes('PLAN_LOCKED')") && !content.includes("REQUIRE_UPGRADE")) {
                content = content.replace(
                    /includes\('PLAN_LOCKED'\)/g,
                    "includes('PLAN_LOCKED') || errMsg.includes('REQUIRE_UPGRADE')"
                );
                modified = true;
            }

            if (content.includes("includes('upgradeRequired')") && !content.includes("REQUIRE_UPGRADE")) {
                 content = content.replace(
                    /includes\('upgradeRequired'\)/g,
                    "includes('upgradeRequired') || errMsg.includes('REQUIRE_UPGRADE')"
                );
                modified = true;
            }

            if (modified) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log(`✅ Patched: ${fullPath}`);
            }
        }
    }
}

console.log('--- STARTING FRONTEND UX PATCH ---');
processDirectory(toolsDir);
processDirectory(dashboardDir);
console.log('--- FINISHED FRONTEND UX PATCH ---');
