const { taskSchema, patchTaskSchema } = require("../validation/taskSchema");
// const userSchema = require("../validation/userSchema");
// const Joi = require("joi");

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

  const result = await pool.query(`INSERT INTO tasks (title, is_completed, user_id)
  VALUES ( $1, $2, $3 ) RETURNING id, title, is_completed`,
  [value.title, value.isCompleted, global.user_id]);

  const task = result.rows[0];

  // const newTask = {
  // id: taskCounter(),
  // userId: global.user_id.email,
  // ...value,
  // };

  // const {userId, ...sanitizedTask } = task;
  // global.tasks.push(task);


  return res.status(201).json(task)

}

async function index(req, res){
//   const userTasks = global.tasks.filter((task) =>
//     task.userId === global.user_id.email,
// )
  const result = await pool.query("SELECT id, title, is_completed FROM tasks WHERE user_id = $1",
    [global.user_id]
  )
  
  const tasks = result.rows;

  if(tasks.length === 0){
    return res.status(404).json({
      message: "No matching task exists."
    })
  }

  // const removeIdFromTask = userTasks.map( task => { 
  //   const { userId, ...sanitizedTask} = task;
  //   return sanitizedTask; 
  // })
  
  return res.status(200).json(tasks);
  
}

async function show(req, res){
  // const taskId = parseInt(req.params?.id);

  // const task = global.tasks.find(
  //   (task) => task.id === taskId && task.userId === global.user_id.email,
  // );

  const { error, value } = patchTaskSchema.validate(req.body, {abortEarly: false,});

  let keys = Object.keys(value);

  


  if (!taskId) {
    return res.status(400).json({
      message: "The task ID passed is not valid.",
    });
  }

  if(!task) {
    return res.status(404).json({message: "No matching task exists."})
  }
  else{
    const { userId, ...sanitizedTask } = task;
    return res.status(200).json({message: sanitizedTask})
  }

  
}

async function update(req, res){
  // const taskId = parseInt(req.params?.id);

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
  const result = await pool.query(`UPDATE tasks SET ${setClauses}

    WHERE id = ${idParm} AND user_id = ${userParm} RETURNING id, title, is_completed`, 
    [...Object.values(value), req.params.id, global.user_id]);
  const updatedTask = result.rows[0];

  if (!updatedTask) {
    return res.status(404).json("The task ID passed is not valid.");
  }
  else {
    return res.status(200).json(updatedTask);
  }


  // const task = global.tasks.find(
  //   (task) => task.id === taskId && task.userId === global.user_id.email,
  // );

  // if (!task) {
  // return res.status(404).json("The task ID passed is not valid.");
  // }
  // else{
  //   Object.assign(task, value);

  //   const { userId, ...sanitizedTask } = task;

  //   return res.status(200).json(sanitizedTask);
  // }
}

async function deleteTask(req, res){
  const taskId = parseInt(req.params?.id);


  if (!taskId) {
    return res.status(400).json({
      message: "The task ID passed is not valid.",
    });
  } 
  
  const taskIndex = global.tasks.findIndex(
    (task) => task.id === taskId && task.userId === global.user_id.email,
  );

  if (taskIndex === -1) {
    return res.status(404).json({
      message: "The task ID passed is not valid.",
    });
  }
  else {
    const task = global.tasks[taskIndex];

    global.tasks.splice(taskIndex, 1);

    const { userId, ...sanitizedTask } = task;

    return res.status(200).json(sanitizedTask);
  }
}

module.exports = {create, index, show, update, deleteTask};