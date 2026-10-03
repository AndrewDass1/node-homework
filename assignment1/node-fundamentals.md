# Node.js Fundamentals

## What is Node.js?
Node.js is a backend framework that allows to run a server that accepts JavaScript code. JavaScript code is usually front-end and this programming language usually is responsible for changing the UI of website, but with Node.js intergration, JavaScript can now be used for back-end development and perform mathematical calculations.

## How does Node.js differ from running JavaScript in the browser?
Node.js differs from running JavaScript in the browser because when running a JavaScript file with the Node.js framework, all the outputs will be printed in the terminal rather than the browser console or HTML page.

## What is the V8 engine, and how does Node use it?
The V8 engine is what runs Google Chrome and makes it execute JavaScript. It was further customized and changed to run Node.js, and outputs are now seen locally in the terminal.

## What are some key use cases for Node.js?
Node.js is commonly used to read and write variables and files, make web servers, interact with the local operating system services and download and use libraries. 

## Explain the difference between CommonJS and ES Modules. Give a code example of each.
The difference between CommonJS and ES Modules is the syntax for running code that produces code, is different. CommonJS uses require() and .exports while ES modules uses both import and export keywords. Below are two examples, that does a comparison in both syntax to showcase how to write functions in each to add some numbers:

**CommonJS (default in Node.js):**
```js
const {add} = require("./second.js")

console.log(add());

// second.js file
// function add(a, b){
//     return a + b;
// }

// module.exports = { add };

```

**ES Modules (supported in modern Node.js):**
```js
import {add} from './add.js';

console.log(add(3, 5))

// add.js
// export function add(a, b){
//     return a + b;
// }
``` 