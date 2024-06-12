const jwt = require("jsonwebtoken");

const generateToken = (id) => {
    console.log("___________________called")
    return jwt.sign({id},"Aditya", {
        expiresIn: "30d",
    });
};

module.exports = generateToken