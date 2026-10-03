const os = require('os');
const path = require('path');
const fs = require('fs');

const sampleFilesDir = path.join(__dirname, 'sample-files');
if (!fs.existsSync(sampleFilesDir)) {
  fs.mkdirSync(sampleFilesDir, { recursive: true });
}

console.log('Platform:', os.platform());
console.log('CPU:', os.cpus()[0]['model']);
console.log('Total Memory:', os.totalmem());

const breakPath = path.parse(sampleFilesDir);
const gitkeep = path.join(breakPath.dir, '\sample-files\\.gitkeep');
console.log('Joined path:', gitkeep);

const fsPromises = fs.promises;

async function writeAndReadFile() {
  await fsPromises.writeFile(__dirname + '\\sample-files\\demo.txt', 'Hello from fs.promises!');
  return (console.log("fs.promises read:", await fsPromises.readFile(__dirname + "\\sample-files\\" + "demo.txt", "utf-8")));
}

writeAndReadFile();