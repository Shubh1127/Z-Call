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
    },
    password:{
        type:String,
        required:true
    },
    token:{
        type:String,
    }
})

const User=mongoose.model("User",userSchema);
export default User;