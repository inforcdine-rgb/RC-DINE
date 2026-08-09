const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const projectRoot = path.resolve(__dirname, '..');
const now = new Date();
const deploymentId =
    process.env.VERCEL_GIT_COMMIT_SHA ||
    process.env.RENDER_GIT_COMMIT ||
    process.env.SOURCE_VERSION ||
    crypto.randomBytes(4).toString('hex');
const version = `${now
    .toISOString()
    .replace(/[-:.TZ]/g, '')
    .slice(0, 14)}-${deploymentId.slice(0, 8)}`;
const generatedDirectory = path.join(projectRoot, 'src', 'generated');
const publicVersionPath = path.join(projectRoot, 'public', 'app-version.json');
const sourceVersionPath = path.join(generatedDirectory, 'appVersion.js');

fs.mkdirSync(generatedDirectory, { recursive: true });
fs.writeFileSync(
    sourceVersionPath,
    `// Generated automatically before start/build. Do not edit manually.\nexport const APP_VERSION = '${version}';\n`
);
fs.writeFileSync(publicVersionPath, `${JSON.stringify({ version, builtAt: now.toISOString() }, null, 2)}\n`);

console.log(`R&C Dine app version generated: ${version}`);
