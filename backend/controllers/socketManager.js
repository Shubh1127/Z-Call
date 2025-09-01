import {Server} from "socket.io"

const connectToSocket=(server)=>{
   return new Server(server);
}
export default connectToSocket;