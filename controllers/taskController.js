const { taskSchema, patchTaskSchema } = require("../validation/taskSchema");

const taskCounter = (() => {
  let lastTaskNumber = 0;
  return () => {
    lastTaskNumber += 1;
    return lastTaskNumber;
  };
})();

async function create(){
  const { error, value } = taskSchema.validate(req.body, { abortEarly: false });

  exports.register = async (req, res) => {
  if (!req.body) req.body = {};
  const { error, value } = userSchema.validate(req.body, { abortEarly: false });

  const newTask = { id: taskCounter(), userId: global.user_id.email, ...value };
  
  if (error) {
        return res.status(400).json({
            message: error.message,
        });
        }
    };
}

async function index(){
  const userTasks = global.tasks.filter((task) => task.userId === global.user_id.email,)}

async function show(){
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
    return res.status(200).json({message: global.tasks.find((task)=>task.id)})
  }
}

async function update(){
  const taskId = parseInt(req.params?.id);

  const { error, value } = userSchema.validate(req.body, {abortEarly: false,});

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
    return res.status(200).json({message: global.tasks.find((task)=>task.id)})
  }
}

async function deleteTask(){
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