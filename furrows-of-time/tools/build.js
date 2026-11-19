// Builds index.html by putting src/logic.js into src/page.html.
// Run from the repo root: node tools/build.js
const fs = require('fs');
const page = fs.readFileSync('src/page.html', 'utf8');
if (!page.includes('/*LOGIC*/')) throw new Error('src/page.html has no /*LOGIC*/ marker');
fs.writeFileSync('index.html', page.replace('/*LOGIC*/', fs.readFileSync('src/logic.js', 'utf8')));
console.log('Wrote index.html');
