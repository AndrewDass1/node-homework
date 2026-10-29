const Joi = require("joi");

const userSchema = Joi.object({
    email: Joi.string().trim().lowercase().required().email(),
    name: Joi.string().required().trim().min(3).max(30),
    password: Joi.string()
    .trim()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).+$/)
    .required()
    .messages({
      "string.pattern.base":
        "Password must be at least 8 characters long and include upper and lower case letters, a number, and a special character.",
    }),
});

module.exports = { userSchema };



// All Done (maybe except the trivial part):
// user Joi to fulfill the requirements:
// paterns to use : email: Joi.string().trim().lowercase().email().required()

// requirements:s
// email is required, trimmed, lowercased, and must be valid email format.
// name is required, trimmed, and must be 3 to 30 characters.
// password is required and must not be trivial.