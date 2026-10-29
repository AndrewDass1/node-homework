const joi = require('joi');

function getTasks(err, req, res, next) {
    if (global.user_id == true){
        next()
    }
    else{
        return res.status(401).json({
            message: "Unauthorized"
        });
    }
}

const taskSchema = Joi.object({
    title: Joi.string().required(),
    isCompleted: Joi.boolean().default(false).not(null),
});

const patchTaskSchema = Joi.object({
    title: Joi.string().required(),
    isCompleted: Joi.boolean().default(false).not(null),
}).min(1);

module.exports = { taskSchema, patchTaskSchema };