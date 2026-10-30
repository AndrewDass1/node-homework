const Joi = require('joi');

// function getTasks(err, req, res, next) {
//     if (global.user_id == true){
//         next()
//     }
//     else{
//         return res.status(401).json({
//             message: "Unauthorized"
//         });
//     }
// }

const taskSchema = Joi.object({
  title: Joi.string().trim().min(3).max(30).required(),
  isCompleted: Joi.boolean().default(false).not(null),
});

const patchTaskSchema = Joi.object({
  title: Joi.string().trim().min(3).max(30).not(null),
  isCompleted: Joi.boolean().not(null),
}).min(1).message("No attributes to change were specified.");

module.exports = { taskSchema, patchTaskSchema };