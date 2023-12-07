const fs = require('fs');
const path = require('path');
const mustache = require('mustache');
const readline = require('readline');

const type = process.argv[2];
const destinationPath = process.argv[3];
let name;
let params = {};

if (type === 'component') {
  name = path
    .basename(destinationPath)
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
  params = { componentName: name };
} else if (type === 'container') {
  name = path
    .basename(destinationPath)
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
  params = { componentName: name };
} else if (type === 'saga') {
  name = path
    .basename(destinationPath)
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
  params = {
    sagaName: name,
    sagaNameLower: name.charAt(0).toLowerCase() + name.slice(1),
  };
} else {
  console.error(`Unknown type ${type}. Please specify "component", "container", or "saga".`);
  process.exit(1);
}

const templateDir = path.join('.', 'templates', type);
const templateFiles = fs
  .readdirSync(templateDir)
  .filter((filename) => filename.endsWith('.mustache'))
  .map((filename) => {
    return {
      template: path.join(templateDir, filename),
      filename: filename.replace(/\.mustache$/, ''),
    };
  });

const doTheWork = async function () {
  if (fs.existsSync(destinationPath) && type !== 'container') {
    const overwriteAccepted = await confirmFolderOverwrite();
    if (!overwriteAccepted) {
      return;
    }
  }
  createComponent();
};
doTheWork();

//
// Helpers
//

function createComponent() {
  if (!fs.existsSync(destinationPath)) {
    fs.mkdirSync(destinationPath);
  }

  // Generate files from templates
  templateFiles.forEach((file) => {
    const templatePath = path.join('.', file.template);
    const template = fs.readFileSync(templatePath, 'utf8');
    const output = mustache.render(template, params);
    const filePath = path.join(destinationPath, file.filename);
    fs.writeFileSync(filePath, output);
  });

  console.log(`${type} ${name} created at ${destinationPath}.`);
}

async function confirmFolderOverwrite() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve, _reject) => {
    rl.question(`The folder ${destinationPath} already exists. Do you want to overwrite it? (y/n): `, (answer) => {
      rl.close();
      if (answer === 'y' && type !== 'container') {
        fs.rmSync(destinationPath, { recursive: true });
        resolve(true);
      } else {
        console.log('Aborting component creation.');
        resolve(false);
      }
    });
  });
}
