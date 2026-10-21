const express = require("express");
const dogsRouter = require("./routes/dogs");
const { randomUUID } = require("crypto");

const app = express();

app.use(express.json());

app.use(express.static("public"));

// Assignment 3b and 3c ask you to add middleware in this file.
app.use((req, res, next) => {
  req.requestId = randomUUID();
  res.setHeader("X-Request-Id", req.requestId);
  console.log('[timestamp]: GET /dogs', req.requestId);
  next();
});



app.use("/", dogsRouter);// Do not remove this line

app.use( (req, res) => res.status(404).json({message: `Route not found`}))

app.use( (err, req, res, next) => res.status(500).json({message: 'Internal Server Error'}))

if (require.main === module) {
  app.listen(3000, () => {
    console.log("Dog rescue app is listening on port 3000...");
  });
}

module.exports = app;

