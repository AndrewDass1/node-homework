const { userSchema } = require("../validation/userSchema");
const crypto = require("crypto");
const util = require("util");
const scrypt = util.promisify(crypto.scrypt);
const Joi = require("joi");

const pool = require("./db/pg-pool");

async function hashPassword(password){
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = await scrypt(password, salt, 64);
  return `${salt}:${derivedKey.toString("hex")}`;
}

async function comparePassword(inputPassword, storedHash) {
  const [salt, key] = storedHash.split(":");
  const keyBuffer = Buffer.from(key, "hex");
  const derivedKey = await scrypt(inputPassword, salt, 64);
  return crypto.timingSafeEqual(keyBuffer, derivedKey);
}

async function register(req, res){
    const { error, value } = userSchema.validate(req.body, {
        abortEarly: false,
    });

    if (error) {
        return res.status(400).json({
            message: error.message,
        });
    } 

    const hashedPassword = await hashPassword(value.password);

    const newUser = {email: value.email, name: value.name, hashedPassword};

    global.users.push(newUser);
    global.user_id = newUser;


    res.status(201).json({
        name: global.user_id.name,
        email: global.user_id.email
    })

}

async function logon(req, res){
    const userSchema = Joi.object({
        email: Joi.string().trim().lowercase().required().email(),
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

    const { error, value } = userSchema.validate(req.body, {
        abortEarly: false,
    });

    if (error) {
        return res.status(400).json({
            message: error.message,
        });
    } 

    const email = value.email;
    const password = value.password;

    const findingEmailPassword = global.users.find(user => user.email === email);

    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

    if (error) {
    return res.status(400).json({
      message: "Validation failed",
      details: error.details,
    });
  }
    result = null;
    value.hashed_password = await hashPassword(value.password);
    // the code to here is like the in-memory version
    try {
        result = await pool.query(`INSERT INTO users (email, name, hashed_password)
        VALUES ($1, $2, $3) RETURNING id, email, name`,
        [value.email, value.name, value.hashed_password]
        ); // note that you use a parameterized query
    } catch (e) { // the email might already be registered
    if (e.code === "23505") { // this means the unique constraint for email was violated
        // here you return the 400 and the error message.  Use a return statement, so that 
        // you don't keep going in this function
    }
    return next(e); // all other errors get passed to the error handler
    }
    const user = result.rows[0];
    // otherwise user now contains the new user.  You can return a 201 and the appropriate
    // object.  Be sure to also set global.user_id with the id of the user record you just created.

    // --------------------------------------------------------------------------------------------------------------------------------

    const goodCredentials = findingEmailPassword && await comparePassword(password, findingEmailPassword.hashedPassword);

    if(goodCredentials) {
        global.user_id = findingEmailPassword;

        res.status(200).json({
            name: global.user_id.name,
            email: global.user_id.email,
        })
    }
    else {
        res.status(401).json({
            message: "Authentication required."
        });
    }
}

async function logoff(req, res){
    global.user_id = null
    res.status(200).send()
}

module.exports = {register, logon, logoff};

// so, global makes the data appear everywhere, that means all the previous names, emails and passwords can be found in the logon function