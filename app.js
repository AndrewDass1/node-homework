const express = require('express');

const app = express();

const timeRouter = require("./routes/timeRoutes");
const userRouter = require("./routes/userRoutes");
const { notFound } = require("./middleware/not-found");
const { errorHandler } = require('./middleware/error-handler');

const authMiddleware = require("./middleware/auth");
const taskRouter = require("./routes/taskRoutes");

const prisma = require("../db/prisma.js");

global.user_id = null;

app.use(express.json());

app.use("/api", timeRouter);
app.use("/api/users", userRouter);
app.use("/api/tasks", authMiddleware, taskRouter);

app.get("/", (req, res) => {
    res.send("Hello, World!");
})

app.get("/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok", db: "connected" });
  } catch (err) {
    res.status(500).json({ status:'error', db: 'not connected', error: err.message });
  }
});

app.post("/testpost", (req, res) => {
    res.status(200).json({
        message: "POST route works",
    });
});

// app.use((req, res) => {
//   res.status(404).json({
//     message: `No route found for ${req.method} ${req.path}`,
//   });
// });

app.use(notFound);
app.use(errorHandler);

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
    console.log(`Server is listening on port ${port}...`);
});

await prisma.$disconnect();
console.log("Prisma disconnected");

  try {
    await new Promise((resolve, reject) => {
      server.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });

  } catch (err) {
    console.error("Error during shutdown:", err);
  }


module.exports = {app, server};