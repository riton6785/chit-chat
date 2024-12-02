const express = require("express");
const dotenv = require("dotenv");
const chats = require("./data/data");
const cors = require("cors");
const connectDB = require("./config/db");
const colors = require("colors");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const { notFound, errorHandler } = require("./middlwares/errorMiddleware");

dotenv.config();
connectDB();
const app = express();
app.use(express.json());
app.use(cors());

app.get("/", (req, res)=>{
    res.send("Api is running");
})

app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes)

app.get("/api/chats", (req, res)=>{
    res.send(chats);
})
app.use(notFound);
app.use(errorHandler);

const server = app.listen(process.env.PORT, console.log(`server is running on port ${process.env.PORT }`))

const io = require('socket.io')(server, {
    pingTimeout: 60000,
    cors: {
        origin: "http://localhost:5173"
    },
})

onlineUsers = []
io.on("connection", (socket)=>{
    socket.on("setup", (userData)=> {
        socket.join(userData._id)
        socket.emit("connected");
        userExists = onlineUsers.find((u)=> u.userId === userData._id);
        if(userExists){
            userExists.socketId = socket.id;
        } else {
            onlineUsers.push({
                userId : userData._id,
                name : userData.name,
                socketId : socket.id,
            })
        }
        io.emit("get-online-users", onlineUsers)
    })

    socket.on("join-room", (room)=> {
        socket.join(room);
    })

    socket.on("typing", (room)=> socket.in(room).emit("typing"));
    socket.on("stop typing", (room)=> socket.in(room).emit("stop typing"));

    socket.on("new-message", (newMessageRecieved) => {
        var chat = newMessageRecieved.chat;
        if(!chat.users) return;

        chat.users.forEach((user) => {
            if(user._id == newMessageRecieved.sender._id) return;
            socket.in(user._id).emit("message-recieved", newMessageRecieved);
        })
    })

    socket.off("setup", ()=> {
        socket.leave(userData._id);
    })

    socket.on("disconnect", ()=> {
        onlineUsers = onlineUsers.filter((user) => user.socketId !== socket.id);
        io.emit("get-online-users", onlineUsers)
    })
})
