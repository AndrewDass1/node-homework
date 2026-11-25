const { userSchema } = require("../validation/userSchema");
const crypto = require("crypto");
const util = require("util");
const scrypt = util.promisify(crypto.scrypt);
const Joi = require("joi");

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
        const result = await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
                data: {name, email, hashedPassword},
                select: {name: true, email: true, id: true}
            })

        const welcomeTaskData = [
            {title: "Complete your profile", userId: newUser.id, priority: "medium"},
            {title: "Add your first task", userId: newUser.id, priority: "high"},
            {title: "Explore the app", userId: newUser.id, priority: "low"}
        ];

        await tx.task.createMany({data: welcomeTaskData});

        const welcomeTasks = await tx.task.findMany({
            where: {
                userId: newUser.id,
                title: { in: welcomeTaskData.map(t => title) }
            },
            select: {
                id: true,
                title: true,
                isCompleted: true,
                userId: true,
                priority: true
            }
        });
        return { user: newUser, welcomeTasks }
        })
    } catch (e) {
        if (err.code === "P2002") {
            return res.status(400).json({ error: "Email already registered" });
        } else {
            return next(err);
        }
        // if (e.code === "23505") { 
        //     return res.status(400).json({message: e.message})
        // }
        // if (e.name === "PrismaClientKnownRequestError" && e.code === "P2002") {
        //     return res.status(400).json({
        //         error: "User with this email already exists"
        //     });
        // }
    // return next(e); 
    }

    const newUser = user;
    global.user_id = newUser.id;


    res.status(201).json({
        user: result.user,
        welcomeTasks: result.welcomeTasks,
        transactionStatus: "success"
    });
    return;
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