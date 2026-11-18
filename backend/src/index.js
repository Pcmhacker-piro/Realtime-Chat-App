import dotenv from "dotenv";
import cors from "cors"
import cookeiparser from "cookie-parser"
dotenv.config();

import express from "express";
import {connectDB} from "../lib/db.js"
import authRoutes from "../routes/auth.route.js"
import messageRoutes from "../routes/message.route.js"
import { server ,app } from "../lib/socket.js";
import path from "path";
import { jwt } from "jsonwebtoken";
import { TokenExpiredError } from "jwt";

const port = process.env.PORT;


app.use(express.json());
app.use(cookeiparser());
app.use(cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true
}));

const __dirname = path.resolve();


app.use("/api/auth",authRoutes)
app.use("/api/messages",messageRoutes)

if(process.env.NODE_ENV == "production"){
    app.use(express.static(path.join(__dirname,"../frontend/dist")));

    app.get("*",(req,res) =>{
        res.sendFile(path.resolve(__dirname,"../frontend","dist","index.html"));
    })
}



server.listen(port, () => {
    console.log(`server is running on port ${port}`);
    connectDB();
});