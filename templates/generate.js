const fs = require('fs');
const path = require('path');
const mustache = require('mustache');
const readline = require('readline');

const destinationPath = process.argv[2];
const componentName = path
  .basename(destinationPath)
  .split('-')
  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
  .join('');

console.log(`Generating component ${componentName} in ${destinationPath}`);

const files = [
  { template: path.join('templates', 'component', 'index.tsx.mustache'), filename: 'index.tsx' },
  { template: path.join('templates', 'component', 'index.test.tsx.mustache'), filename: 'index.test.tsx' },
];

// Check if folder exists
if (fs.existsSync(destinationPath)) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question(`The folder ${destinationPath} already exists. Do you want to overwrite it? (y/n): `, (answer) => {
    rl.close();
    if (answer === 'y') {
      fs.rmSync(destinationPath, { recursive: true });
      createComponent();
    } else {
      console.log('Aborting component creation.');
    }
  });
} else {
  createComponent();
}

function createComponent() {
  // Create folder
  fs.mkdirSync(destinationPath);

  // Generate files from templates
  files.forEach((file) => {
    const templatePath = path.join('.', file.template);
    const template = fs.readFileSync(templatePath, 'utf8');
    const output = mustache.render(template, { componentName });
    const filePath = path.join(destinationPath, file.filename);
    fs.writeFileSync(filePath, output);
  });

  console.log(`Component ${componentName} created at ${destinationPath}.`);
}
