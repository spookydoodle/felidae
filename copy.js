const fs = require('fs');
const path = require('path');

let srcDir = path.join(__dirname, 'public');
let destDir = path.join(__dirname, 'build', 'public');
fs.cpSync(srcDir, destDir, { recursive: true });

srcDir = path.join(__dirname, 'src/graphql/schemas');
destDir = path.join(__dirname, 'build', 'graphql/schemas');
fs.cpSync(srcDir, destDir, { recursive: true });
