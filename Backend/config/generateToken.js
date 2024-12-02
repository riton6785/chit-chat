const jwt = require("jsonwebtoken");

const generateToken = (id) => {
    return jwt.sign({id},"Aditya", {
        expiresIn: "30d",
    });
};

module.exports = generateToken