const fs = require('fs');
const path = require('path');
const fsPromises = fs.promises;


// 1. Callback style

  // Callback hell example (test and leave it in comments)

  // An explanation of Callbacks and Callback hell
  // Usually, a callback in programming including JavaScript is a function is passed into another function as a parameter, and the function can use another function as
  // a parameter or the callback in its argument when it runs. Also known in programming, callback hell is when there are many nested functions that call functions 
  // as parameters and that can result in callback hell. It becomes difficult to keep track of how all the data is processed and ran if someone were to review 
  // the code or someone else peer reviews the code.

  // Below shows there are variables that are functions, which is passed into other functions to use callbacks

async function makeFile(){
  const filepath = __dirname + '\\sample-files\\sample.txt';
  const content = 'Hello, async world! \n';
  try {
    fs.writeFile(filepath, content, (err, result) => {
      const readingFile = fs.readFile(filepath, 'utf-8', callbackfunction => {
          if(err){
            console.log("An error occurred:", err.message);
          }
          console.log(content); 
          return readingFile;
      });
    });
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


// Sources
/// https://www.geeksforgeeks.org/javascript/what-to-understand-callback-and-callback-hell-in-javascript/ (1)