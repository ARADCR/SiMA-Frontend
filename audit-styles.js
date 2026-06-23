const fs   = require('fs');
const path = require('path');

function findFiles(dir, results = []) {
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const full = path.join(dir, item);
    if (fs.statSync(full).isDirectory() && item !== 'node_modules' && item !== 'dist' && item !== '.angular') {
      findFiles(full, results);
    } else if (item.endsWith('.component.ts')) {
      results.push(full);
    }
  }
  return results;
}

const files = findFiles('src');
const problematic = [];

for (const f of files) {
  const content = fs.readFileSync(f, 'utf8');
  if (content.includes("styles: [`") && (
    content.includes("&:hover") ||
    content.includes("&.") ||
    content.includes("@use ") ||
    content.includes("@media") && content.includes("{  .") ||
    // Nested selectors like "h1 {" or "h3 {" inside styles
    /styles:\s*\[`[^`]*\bh[1-6]\s*\{/s.test(content) ||
    /styles:\s*\[`[^`]*span:[^`]*/s.test(content)
  )) {
    problematic.push(f);
    console.log('ISSUE:', path.relative('.', f));
  }
}

console.log('\nTotal problematic:', problematic.length);
