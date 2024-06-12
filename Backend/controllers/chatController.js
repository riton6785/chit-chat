const asyncHandler = require("express-async-handler");
const Chat = require("../model/chatModel");
const User = require("../model/userModel");


const accessChat = asyncHandler( async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        console.log(" UserId param not send with request")
        return resizeBy.sendStatus(400);
    }
    var isChat = await Chat.find({
        iGroupChat: false,
        $and: [
            {users: {$elemMatch: { $eq: req.user._id}}},
            { users: {$elemMatch: { $eq: userId}}}
        ],
    })
    .populate("users", "-password")
    .populate("latestMessage");

    isChat = await User.populate(isChat, {
        path: "latestMessage.sender",
        select: "name pic email"
    })

    if( isChat.length > 0) {
        res.send(isChat[0]);
    } else {
        var chatData = {
            chatName: "sender",
            iGroupChat: false,
            users: [req.user._id, userId]
        }
    }
    try {
        const createdChat = await Chat.create(chatData);
        const fullChat = await Chat.findOne({_id: createdChat._id}).populate("users", "-password")
        res.send(fullChat);
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
        
    }
})

const fetchChats = asyncHandler(async (req, res) => {
    try {
        Chat.find({users: {$elemMatch: {$eq: req.user._id}}})
        .populate("users", "-password")
        .populate("groupAdmin", "-password")
        .populate("latestMessage")
        .sort({updatedAt: -1})   //sort the chat as per the latest one
        .then(async (results)=> {
            results = await User.populate(results, {
                path: "latestMessage.sender",
                select: "name email pic"
            });
            res.status(200).send(results);
        })
        console.log(req.user)
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
})

const createGroupChat = asyncHandler( async (req, res) => {
    if( !req.body.users || !req.body.name) {
        res.status(400).send({ message: "please fill all the fields"})
    }
    var users = JSON.parse(req.body.users)    // we will send the users id in string form from frontend and will parse it in backend

    if(users.length < 2) {
        return res.status(400).send("More than 2 users are required to form a group chat")
    }
    users.push(req.user);
    try {
        const groupChat = await Chat.create({
            chatName: req.body.name,
            users: users,
            isGroupChat: true,
            groupAdmin: req.user,
        })
        const fullGroupChat = await Chat.findOne({_id: groupChat._id})
        .populate("users", "-password")
        .populate("groupAdmin", "-password")
        res.status(200).json(fullGroupChat)
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
})

const renameGroup = asyncHandler( async(req, res) => {
    const {chatId, chatName} = req.body;

    const updatedChat = await Chat.findByIdAndUpdate(
        chatId,
        {
            chatName,
        },
        {
            new: true,   // if not provide this it will update the name but return the old name so by passing true it will return the new name
        }
    )
    .populate("users", "-password")
    .populate("groupAdmin", "-password")

    if(!updatedChat) {
        res.status(400);
        throw new Error("Chat not found")
    } else {
        res.json(updatedChat)
    }
})

const addToGroup = asyncHandler( async(req, res) => {
    const { chatId, userId} = req.body;

    const added = await Chat.findByIdAndUpdate(
        chatId,
        {
            $push: {users: userId}
        },
        {
            new: true
        }
    )
    .populate("users", "-password")
    .populate("groupAdmin", "-password")

    if(added) {
        res.json(added)
    } else {
        res.status(404);
        throw new Error("Chat not found")
    }

})

const removeFromGroup = asyncHandler( async(req, res) => {
    const { chatId, userId} = req.body;

    const removed = await Chat.findByIdAndUpdate(
        chatId,
        {
            $pull: {users: userId}
        },
        {
            new: true
        }
    )
    .populate("users", "-password")
    .populate("groupAdmin", "-password")

    if(removed) {
        res.json(removed)
    } else {
        res.status(404);
        throw new Error("Chat not found")
    }

})
module.exports = { accessChat, fetchChats, createGroupChat, renameGroup, addToGroup, removeFromGroup }