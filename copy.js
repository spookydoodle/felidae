const fs = require('fs');
const path = require('path');

let srcDir = path.join(__dirname, 'src/public');
let destDir = path.join(__dirname, 'build', 'public');
fs.cpSync(srcDir, destDir, { recursive: true });

srcDir = path.join(__dirname, 'src/docs');
destDir = path.join(__dirname, 'build', 'docs');

fs.cpSync(srcDir, destDir, { recursive: true });
