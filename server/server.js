import dotenv from 'dotenv';
dotenv.config();
import http from "http";
import express from 'express';
import cors from 'cors';
import { connectDB } from "./lib/db.js";
import userRouter from './routes/userRoutes.js'
import messageRouter from './routes/messageRoutes.js'
import { Server } from 'socket.io';

const PORT = process.env.PORT || 5000;

const app = express();
const server = http.createServer(app);

// intiliz socket.io server
export const io = new Server(server, {
    cors: { origin: "*" }
})

// store onliine users
export const userSocketMap = {}; // {userid : socketId}

// socket handlers
io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    console.log("User Connected", userId);
    if (userId) userSocketMap[userId] = socket.id;

    // emit online users to all connected clients
    io.emit("getOnlineUsers",Object.keys(userSocketMap));

    socket.on("disconnect",()=>{
        console.log("User Disconnected", userId);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers",Object.keys(userSocketMap))
    })
})

app.use(cors());
app.use(express.json({ limit: '5mb' }));

app.use("/api/status", (req, res) => res.send("Server is live!"));
app.use('/api/auth', userRouter)
app.use('/api/messages', messageRouter)

const start = async () => {
    try {
        connectDB(process.env.MONGODB_URI);
        server.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Error connecting to the database", error);
    }
};
start();





