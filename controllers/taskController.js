const taskCounter = (() => {
  let lastTaskNumber = 0;
  return () => {
    lastTaskNumber += 1;
    return lastTaskNumber;
  };
})();

// function taskCounter(){
//     const numCounter = 0;
//     numCounter += 1;
//     return numCounter;
// }