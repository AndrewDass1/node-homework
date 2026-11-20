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

  // const result = await pool.query(`INSERT INTO tasks (title, is_completed, user_id)
  // VALUES ( $1, $2, $3 ) RETURNING id, title, is_completed`,
  // [value.title, value.isCompleted, global.user_id]);

  const task = await prisma.task.create({
      data: { ...value,
        userId: global.user_id,
      },
      select: { title: true, isCompleted: true, userId: true }
  });

  return res.status(201).json(task)
}

async function index(req, res){
  // const result = await pool.query("SELECT id, title, is_completed FROM tasks WHERE user_id = $1",
  //   [global.user_id]
  // )
  const task = await prisma.task.findMany({
    where: {
      userId: global.user_id,
    },
    select: {title: true, isCompleted: true, id: true}
  });

  if(task.length === 0){
    return res.status(404).json({
      message: "No matching task exists."
    })
  }
  
  return res.status(200).json(task);
  
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
      }
  });


  if(task === null){
    return res.status(404).json({message: "The task ID passed is not valid."})
  }
  else
    {  return res.status(200).json({message: task}) }
}

async function update(req, res){
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
      select: { title: true, isCompleted: true, id: true }

      
    });
    return res.status(200).json(task);
  } catch (error) {
    if (error.code === "P2025" ) {
      return res.status(404).json({ message: "The task was not found."})
    }
    else {
      return res.status(404).json({message: "The task was not found."})
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
  
  // const result = await pool.query("DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING id, title, is_completed", [taskId, global.user_id])

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

module.exports = {create, index, show, update, deleteTask};