import {Server} from "socket.io"

let connections={};
let messages={};
let timeOnline={};

const connectToSocket=(server)=>{

   const io=new Server(server);
   io.on("connection",(socket)=>{
         console.log("New client connected",socket.id);

         socket.on("join-room",(path)=>{

         })

         socket.on("signal",(toId,message)=>{
            io.to(told).emit("signal",socket.id,message);
         })
         
   })
   return io;
}
export default connectToSocket;