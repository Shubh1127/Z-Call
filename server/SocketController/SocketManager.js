import { Server } from "socket.io";

export default function connectToServer(server){
    try{
        const io=new Server(server);
        return io;

    }catch(e){
        console.error(`error connecting to server ${e}`)
    }
}