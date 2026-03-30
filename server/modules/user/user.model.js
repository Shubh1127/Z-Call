import mongoose, { Schema } from "mongoose";

const userSchema=new Schema(
    {
        name:{
            type:String,
            required:true
        },
        token:{
            type:String
        },
        googleId:{
            type:sting,
            unique:true,
            sparse:true
        },
        provider:{
            type:String,
            default:'Google'
        }
    }
)

export default userModel= mongoose.Model("User",{userSchema});
