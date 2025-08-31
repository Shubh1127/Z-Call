import mongoose from "mongoose";

const userSchema=new Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    isVerified:{
        type:Boolean,
        default:false
    }
})

const User=mongoose.model("User",userSchema);
export default User;