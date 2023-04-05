import * as fs from 'fs';

console.log('Building the mocks');

buildMocks('@zero-tech/zui/icons', './src/icon-mocks.ts');
buildMocks('@zero-tech/zui/components', './src/component-mocks.ts');

function buildMocks(packagePath, outFile) {
  const imports = require(packagePath);
  const lines = [
    '// Automatically generated via `npm run generate-mocks`',
    `jest.mock('${packagePath}', () => ({`,
  ];
  Object.keys(imports).forEach(function (key) {
    lines.push(`${key}: () => null,`);
  });
  lines.push('}));');
  lines.push('export {};');
  fs.writeFile(outFile, lines.join('\n'), (err) => {
    if (err) console.error(err);
  });
}
