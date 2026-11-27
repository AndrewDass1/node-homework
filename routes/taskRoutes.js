const express = require("express");
const taskController = require("../controllers/taskController");

const router = express.Router();

router.post("/", taskController.create);
router.get("/", taskController.index);
router.get("/:id", taskController.show);
router.patch("/:id", taskController.update);
router.delete("/:id", taskController.deleteTask);

module.exports = router;

exports.bulkCreate = async (req, res, next) => {
  const { tasks } = req.body;

  // Validate the tasks array
  if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
    return res.status(400).json({ 
      error: "Invalid request data. Expected an array of tasks." 
    });
  }

  // Validate all tasks before insertion
  const validTasks = [];
  for (const task of tasks) {
    const { error, value } = taskSchema.validate(task);
    if (error) {
      return res.status(400).json({
        error: "Validation failed",
        details: error.details,
      });
    }
    validTasks.push({
      title: value.title,
      isCompleted: value.isCompleted || false,
      priority: value.priority || 'medium',
      userId: global.user_id
    });
  }

  // Use createMany for batch insertion
  try {
    const result = await prisma.task.createMany({
      data: validTasks,
      skipDuplicates: false
    });

    res.status(201).json({
      message: "success!",
      tasksCreated: result.count,
      totalRequested: validTasks.length
    });
  } catch (err) {
    return next(err);
  }
};