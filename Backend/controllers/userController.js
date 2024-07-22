const expressAsyncHandler = require("express-async-handler");
const asyncHandler = require("express-async-handler");
const User = require("../model/userModel");
const generateToken = require("../config/generateToken");

const registerUser = expressAsyncHandler( async(req, res) => {
    const { name, email, password, pic} = req.body;

    if(!name || !email || !password) {
        res.status(400);
        throw new Error("Please Enter all the fields")
    }
    const userExists = await User.findOne({email});
    if(userExists) {
        res.status(400);
        throw new Error("User already exists")
    }
    const user = await User.create({
        name,
        email,
        password,
        pic,
    });
    if(user) {
        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            pic: user.pic,
            token: generateToken(user._id)
        })
    } else {
        res.status(400)
        throw new Error("failed to create user")
    }
});

const authUser = asyncHandler( async(req,res)=> {
    const { email, password} = req.body;
    const user = await User.findOne({ email });

    if(user && (await user.matchPassword(password))) {
        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            pic: user.pic,
            token: generateToken(user._id),

        });
    } else {
        res.status(400);
        throw new Error("Invalid Credentils")
    }
})

const allUser = asyncHandler(async (req, res)=> {
    const keyword = req.query.search
        ? {
           $or: [
            {name: { $regex: req.query.search, $options: "i"}},    // regex in mongodb is used to match the string pattrns and mongodb provides the various options here options="i" means the comparioson will be case insensitive
            {email: { $regex: req.query.search, $options: "i"}}
           ],

        }: {}
        const users = await User.find(keyword).find({ _id: {$ne: req.user._id}}); //it will find the user except the current logged in user
        res.send(users);
})

module.exports = { registerUser, authUser, allUser }