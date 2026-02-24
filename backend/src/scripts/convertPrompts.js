const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '../prompts');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));

for (const file of files) {
    const content = fs.readFileSync(path.join(dir, file), 'utf8');
    // Convert basic snake_case or whatever to camelCase for the export
    const exportName = file.replace('.md', '').replace(/_([a-z])/g, g => g[1].toUpperCase());
    const tsCode = `export const ${exportName}Template = ${JSON.stringify(content)};\n`;
    fs.writeFileSync(path.join(dir, file.replace('.md', '.ts')), tsCode);
    console.log(`Converted ${file} to ${file.replace('.md', '.ts')} with export name ${exportName}Template`);
}
