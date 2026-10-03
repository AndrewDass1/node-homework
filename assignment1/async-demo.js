const fs = require('fs');
const path = require('path');
const fsPromises = fs.promises;


// 1. Callback style

  // Callback hell example (test and leave it in comments):
async function makeFile(){
  try {
    const fileIsMade = await fsPromises.writeFile((__dirname + '\\sample-files\\sample.txt'), 'Hello, async world! \n');
    fileIsMade;

    await fsPromises.readFile(__dirname + '\\sample-files\\sample.txt', 'utf-8', (err, content) => {
      if(err){
        console.log("An error occurred:", err.message);
      }
      console.log(content);  
    }) 
  }
  catch (err) {
    console.log("An error occurred:", err.message);
  }
}

makeFile();

  // 2. Promise style
async function makeAndReadFile() {
  const startFile = fsPromises.appendFile((__dirname + '\\sample-files\\sample.txt'), 'Hello, async world! \n');
  startFile;
  const checkFile = await fsPromises.readFile(__dirname + '\\sample-files\\sample.txt', 'utf-8');
  return console.log(checkFile); 
}

makeAndReadFile();

  // 3. Async/Await style
async function useAsync(){
  const fileIsMade = fsPromises.appendFile((__dirname + '\\sample-files\\sample.txt'), 'Hello, async world! \n');
  fileIsMade;
  return console.log(await fsPromises.readFile(__dirname + '\\sample-files\\sample.txt', 'utf-8'));
}

useAsync();