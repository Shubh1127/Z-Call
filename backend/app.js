import mongoose from "mongoose"
import express from "express"
import dotenv from "dotenv"
import { createServer } from "node:http"
// import {Server} from "socket.io"
import cors from "cors"
import connectToSocket from "./controllers/socketManager"

dotenv.config();

const app = express();
const server=createServer(app);
const io = connectToSocket(server);

app.use(cors());
app.use(express.json({limit:'40kb'}))
app.use(express.urlencoded({limit:'40kb',extended:true}))

app.get('/',(req,res)=>{
    return res.json("hello World")
})

const start=async()=>{
    try{
        await mongoose.connect(process.env.MONGO_URL);
        console.log("Connected to Database");
        server.listen(8000,()=>{
            console.log("Server started on port 8000");
        })
    }catch(err){
        console.log(err.message)
        // return res.status(500).json({error: err.message});
    }
}

start();