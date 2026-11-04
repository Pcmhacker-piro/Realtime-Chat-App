import dotenv from "dotenv";
import cors from "cors"
import cookeiparser from "cookie-parser"
dotenv.config();

import express from "express";
import {connectDB} from "../lib/db.js"
import authRoutes from "../routes/auth.route.js"
import messageRoutes from "../routes/message.route.js"
import { server ,app } from "../lib/socket.js";


const port = process.env.PORT;

app.use(express.json());
app.use(cookeiparser());
app.use(cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true
}));


app.use("/api/auth",authRoutes)
app.use("/api/messages",messageRoutes)


server.listen(port, () => {
    console.log(`server is running on port ${port}`);
    connectDB();
});