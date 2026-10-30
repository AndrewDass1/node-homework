const { userSchema } = require("../validation/userSchema");
const crypto = require("crypto");
const util = require("util");
const scrypt = util.promisify(crypto.scrypt);

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

    const goodCredentials = findingEmailPassword && await comparePassword(password, findingEmailPassword.hashedPassword);

    if(goodCredentials) {
        global.user_id = findingEmailPassword;

        res.status(200).json({
            name: global.user_id.name,
            email: global.user_id.email
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