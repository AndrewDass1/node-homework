const { taskSchema, patchTaskSchema } = require("../validation/taskSchema");

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

  const newTask = {
  id: taskCounter(),
  userId: global.user_id.email,
  ...value,
  };

  const {userId, ...sanitizedTask } = newTask;

  global.tasks.push(newTask);

  return res.status(201).json({
    message: (sanitizedTask),
  })

}

async function index(req, res){
  const userTasks = global.tasks.filter((task) =>
    task.userId === global.user_id.email,
)

  if(userTasks.length === 0){
    return res.status(404).json({
      message: "No matching task exists."
    })
  }

  const removeIdFromTask = userTasks.map( task => { 
    const { userId, ...sanitizedTask} = task;
    return sanitizedTask; 
  })
  
  return res.status(200).json({
    message: (removeIdFromTask),
  })
  
}

async function show(req, res){
  const taskId = parseInt(req.params?.id);

  const task = global.tasks.find(
    (task) => task.id === taskId && task.userId === global.user_id.email,
  );


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
  const taskId = parseInt(req.params?.id);

  const { error, value } = userSchema.validate(req.body, {abortEarly: false,});

  const task = global.tasks.find(
    (task) => task.id === taskId && task.userId === global.user_id.email,
  );

  const { userId, ...sanitizedTask } = task;

  if (error) {
    return res.status(400).json({
      message: error.message,
    });
  }

  if (!taskId) {
  return res.status(404).json({
    message: "The task ID passed is not valid.",
  });
  }
  else{
    return res.status(200).json({sanitizedTask});
  }
}

async function deleteTask(req, res){
  const taskId = parseInt(req.params?.id);

  const task = global.tasks.find(
    (task) => task.id === taskId && task.userId === global.user_id.email,
  );

  if (!taskId) {
  return res.status(400).json({
    message: "The task ID passed is not valid.",
  });
  }  

  if (!task) {
    return res.status(404).json({
      message: "The task ID passed is not valid.",
    });
  }
  else {
    return res.status(200).json({message: global.tasks.find((task)=>task.id)})
  }
}

module.exports = {create, index, show, update, deleteTask};