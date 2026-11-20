const { userSchema } = require("../validation/userSchema");
const crypto = require("crypto");
const util = require("util");
const scrypt = util.promisify(crypto.scrypt);
const Joi = require("joi");

// const pool = require("../db/pg-pool");
const prisma = require("../db/prisma.js");


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

async function register(req, res, next){
    const { error, value } = userSchema.validate(req.body, {
        abortEarly: false,
    });
    
    if (error) {
    return res.status(400).json({
      message: "Validation failed",
      details: error.details,
    });
  }
    let user = null;
    const name = value.name;
    const email = value.email;
    const hashedPassword = await hashPassword(value.password);
    try {
        // result = await pool.query(`INSERT INTO users (email, name, hashed_password) VALUES ($1, $2, $3) RETURNING id, email, name`, [value.email, value.name, value.hashed_password]); // note that you use a parameterized query
        user = await prisma.user.create({
            data: {name, email, hashedPassword},
            select: {name: true, email: true, id: true}
        })
        console.log(user)
    } catch (e) {
        if (e.code === "23505") { 
            return res.status(400).json({message: e.message})
        }
        if (e.name === "PrismaClientKnownRequestError" && e.code === "P2002") {
            return res.status(400).json({
                error: "User with this email already exists"
            });
        }
    return next(e); 
    }

    const newUser = user;
    global.user_id = newUser.id;


    res.status(201).json({
        name: newUser.name,
        email: newUser.email
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

    let email = value.email;
    const password = value.password;

    // const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    const user = await prisma.user.findUnique({ where: { email }});

    if (user === null) {
        return res.status(401).json({message: "No data found."})
    }

    const goodCredentials = user && await comparePassword(password, user.hashedPassword);

    if(goodCredentials) {
        global.user_id = user.id;

        res.status(200).json({
            name: user.name,
            email: user.email,
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