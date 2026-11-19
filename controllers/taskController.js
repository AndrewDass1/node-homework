const { taskSchema, patchTaskSchema } = require("../validation/taskSchema");
// const pool = require("../db/pg-pool");
const prisma = require("./db/prisma");


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

  const tasks = await prisma.task.findMany({
  where: {
    userId: global.user_id, // only the tasks for this user!
  },
  select: { title: true, isCompleted: true, id: true }
});

  const task = tasks.rows[0];


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
    select: {userId: true}
  });

  const tasks = task.rows;

  if(tasks.length === 0){
    return res.status(404).json({
      message: "No matching task exists."
    })
  }
  
  return res.status(200).json(tasks);
  
}

async function show(req, res){
  const taskId = parseInt(req.params?.id);

  if (!taskId || taskId < 0 || taskId != parseInt(req.params?.id, 10) ) {
    return res.status(400).json({
      message: "The task ID passed is not valid.",
    });
  }

  // const result = await pool.query("SELECT id, title, is_completed FROM tasks WHERE id = $1 AND user_id = $2",
  //   [taskId, global.user_id]
  // )

    const task = await prisma.task.update({
      data: value,
      where: {
        id,
        userId: global.user_id,
      },
      select: { taskId: true, userId: true }
  });



  if(task.rows.length === 0){
    return res.status(404).json({message: "The task ID passed is not valid."})
  }
  else
    {  return res.status(200).json({message: task.rows[0]}) }
  
}

async function update(req, res){

  const { error, value } = patchTaskSchema.validate(req.body, {abortEarly: false,});

  if (error) {
    return res.status(400).json({
      message: error.message,
    });
  }

  let keys = Object.keys(value);
  keys = keys.map((key) => key === "isCompleted" ? "is_completed" : key);

  const setClauses = keys.map((key, i) => `${key} = $${i + 1}`).join(", ");
  const idParm = `$${keys.length + 1}`;
  const userParm = `$${keys.length + 2}`;
  // const result = await pool.query(`UPDATE tasks SET ${setClauses}
  //   WHERE id = ${idParm} AND user_id = ${userParm} RETURNING id, title, is_completed`, 
  //   [...Object.values(value), req.params.id, global.user_id]);

  try {
    const task = await prisma.task.update({
      data: value,
      where: {
        id,
        userId: global.user_id,
      },
      select: { title: true, isCompleted: true, id: true }
    });
  } catch (err) {
    if (err.code === "P2025" ) {
      return res.status(404).json({ message: "The task was not found."})
    } else {
      return next(err); // pass other errors to the global error handler
    }
  }


  const updatedTask = task.rows[0];

  if (!updatedTask) {
    return res.status(404).json("The task ID passed is not valid.");
  }
  else {
    return res.status(200).json(updatedTask);
  }

}

async function deleteTask(req, res){
  const taskId = Number(req.params?.id);

  if (taskId <= 0 || !Number.isInteger(taskId) ) {
    return res.status(400).json({
      message: "The task ID passed is not valid.",
    });
  }
  
  // const result = await pool.query("DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING id, title, is_completed", [taskId, global.user_id])

  try {
    const task = await prisma.task.update({
        data: value,
        where: {
          id,
          userId: global.user_id,
        },
        select: { taskId: true, userId: true}
    });
  } catch (err) {
    if (err.code === "P2025" ) {
      return res.status(404).json({ message: "The task was not found."})
    } else {
      return next(err); // pass other errors to the global error handler
    }
  }

  if(result.rows.length === 0){
    return res.status(404).json({message: "The task ID passed is not valid"})
  }
  else {
    return res.status(200).json(result.rows[0])
  }

}

module.exports = {create, index, show, update, deleteTask};