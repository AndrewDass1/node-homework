const { taskSchema, patchTaskSchema } = require("../validation/taskSchema");
const prisma = require("../db/prisma.js");

const taskCounter = (() => {
  let lastTaskNumber = 0;
  return () => {
    lastTaskNumber += 1;
    return lastTaskNumber;
  };
})();

async function create(req, res){
  const { error, value } = taskSchema.validate(req.body, { abortEarly: false });

  if (error) {
    return res.status(400).json({
      message: error.message,
    });
  } 


  const task = await prisma.task.create({
      data: { ...value,
        userId: global.user_id,
      },
      select: { title: true, isCompleted: true, userId: true, id: true, priority: true }
  });

  return res.status(201).json(task)
}

async function index(req, res){
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const whereClause = { userId: global.user_id };

  if (req.query.find) {
    whereClause.title = {
      contains: req.query.find,
      mode: 'insensitive'
    };
  }

  const tasks = await prisma.task.findMany({
    where: whereClause,
    take: limit,
    skip: skip,
    orderBy: { createdAt: 'desc' },
    select: {title: true, 
      isCompleted: true, 
      id: true,
      priority: true,
      createdAt: true,
      User: {
        select: {
          name: true, email: true
        }
      }
    }
  });

  const totalTasks = await prisma.task.count({
    where: whereClause
  });

  const pagination = {
    page,
    limit,
    total: totalTasks,
    pages: Math.ceil(totalTasks / limit),
    hasNext: page * limit < totalTasks,
    hasPrev: page > 1
  };
  
  return res.status(200).json({tasks, pagination});
  
}

async function show(req, res){
  const taskId = parseInt(req.params?.id);

  if (!taskId || taskId < 0 || taskId != parseInt(req.params?.id, 10) ) {
    return res.status(400).json({
      message: "The task ID passed is not valid.",
    });
  }

  const task = await prisma.task.findUnique({
    where: {
        id_userId: {
          id: taskId,
          userId: global.user_id
        }
      },
      include: {
        User: true,
      },
  });


  if(task === null){
    return res.status(404).json({message: "The task ID passed is not valid."})
  }
  else
    {  return res.status(200).json({message: task}) }
}

async function update(req, res, next){
  const { error, value } = patchTaskSchema.validate(req.body, {abortEarly: false,});

  if (error) {
    return res.status(400).json({
      message: error.message,
    });
  }

  try {
      const task = await prisma.task.update({
      data: value,
      where: {
        id_userId: {
          id: parseInt(req.params.id, 10),
          userId: global.user_id
        }
      },
      select: { title: true, isCompleted: true, id: true, priority: true }

      
    });
    return res.status(200).json(task);
  } catch (error) {
    if (error.code === "P2025" ) {
      return res.status(404).json({ message: "The task was not found."})
    }
    else {
      return next(error);
    } 
  }
}

async function deleteTask(req, res, next){
  const taskId = Number(req.params?.id);

  if (taskId <= 0 || !Number.isInteger(taskId) ) {
    return res.status(400).json({
      message: "The task ID passed is not valid.",
    });
  }
  
  try {
    const task = await prisma.task.delete({
        where: {
        id_userId: {
          id: taskId,
          userId: global.user_id
          }
        },
        select: { id: true, userId: true}
    }
  );
    return res.status(200).json(task);
  } catch (err) {
    if (err.code === "P2025" ) {
      return res.status(404).json({ message: "The task was not found."})
    } else {
      return next(err); // pass other errors to the global error handler
    }
  }  

}

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

module.exports = {create, index, show, update, deleteTask};