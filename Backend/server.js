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
    console.log("Hitted___________________")
    res.send(chats);
})
app.use(notFound);
app.use(errorHandler);

app.listen(process.env.port, console.log(`server is running on port ${process.env.port}`))