const fs = require('fs')
const path = require('path')
const execSync = require('child_process').execSync

const include = [];
const target = process.argv[2];
const folder = path.join(__dirname, target);
if (!target) {
    console.error(`Target folder was not specified`);
    exit(1);
}
console.log(`Reviewing ${target}...`);
const base = path.join(folder, 'node_modules');
review(base);
// tryInclude(folder, ['ios', 'android', 'node_modules/@capacitor/ios', 'node_modules/@capacitor/android']);
tryInclude(folder, ['android', 'node_modules/@capacitor/android']);

fs.writeFileSync('tar-include.txt', include.join('\n'));
execSync(`tar -cJf app.tar.xz $(cat tar-include.txt)`);

// You can run:
// curl --upload-file ./app.tar.xz https://transfer.sh/app.tar.xz

console.log(`app.tar.xz written.`);
function review(folder) {
    if (isNativeDep(folder)) {
        include.push(folder.replace(__dirname + path.sep, ''));
    }
    fs.readdirSync(folder, { withFileTypes: true })
        .filter(dir => dir.isDirectory())
        .map(dir => review(path.join(folder, dir.name)));
}

function tryInclude(folder, paths) {
    for (const sub of paths) {
        if (fs.existsSync(path.join(folder, sub))) {
            const f = folder.replace(__dirname + path.sep, '');
            include.push(path.join(f, sub));
        }
    }
}

function isNativeDep(folder) {
    const packageJsonFilename = path.join(folder, 'package.json');
    if (fs.existsSync(packageJsonFilename)) {
        try {
            const package = JSON.parse(fs.readFileSync(packageJsonFilename, 'utf-8'));
            if (package.capacitor || package.cordova) {
                return true;
            }
        } catch {
            return false;
        }
    }
    return false;
}