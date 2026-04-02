import express from 'express'
import {createServer} from 'node:http'
import connectToServer from './modules/SocketController/SocketManager.js'
import cors from 'cors'
import initDB  from './modules/db/db.js'
import userRoutes from './modules/user/user.routes.js'

const app=express();
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use('/api', userRoutes)
const server=createServer(app);
const io=new connectToServer(server);

const port=8080;

io.on('connection',(socket)=>{
    console.log(`a user is connected`);
    socket.on('disconnected',()=>{
        console.log(`a user disconnected`)
    })
})

const startServer=async()=>{
    try{
        
        server.listen(port,()=>{
            console.log(`🚀 server is running on port ${port}`)
        })
        
        await initDB();
    }catch(e){
        console.log(`Error starting the server ${e}`)
    }
}
startServer();
app.get('/',(req,res)=>{
    res.send(`Saying Hello from PORT ${port}`)
})
