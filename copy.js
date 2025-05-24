const fs = require('fs');
const path = require('path');

let srcDir = path.join(__dirname, 'public');
let destDir = path.join(__dirname, 'build', 'public');
fs.cpSync(srcDir, destDir, { recursive: true });
