const { userSchema } = require("../validation/userSchema");

function register(req, res){
    const user = {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
    };

    global.users.push(user);
    global.user_id = user;
    
    res.status(201).json({
        name: global.user_id.name,
        email: global.user_id.email
    })
}

function logon(req, res){
    const email = req.body.email;
    const password = req.body.password;

    const findingEmailPassword = global.users.find(user => user.email === email && user.password === password);

    if(findingEmailPassword) {
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

function logoff(req, res){
    global.user_id = null
    res.status(200).send()
}

module.exports = {register, logon, logoff};

// so, global makes the data appear everywhere, that means all the previous names, emails and passwords can be found in the logon function