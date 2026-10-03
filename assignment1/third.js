// run node fs code
// make a new sample text
// understand syntax if you look at both resources, need to:

// declare a variable
// its file path
// optional () to declare more variables to state error or print out
// something from console

// research callback

const fs = require("fs");

fs.readFile("./sampletext.txt", "utf-8", (error, content) => {
    if (error) {
        console.log("File read failed:", error.message);
        return;
    }
    console.log("File content:", content);
})

// console.log(fs.readFile("./sampletext.txt", "utf-8"));