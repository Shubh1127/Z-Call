import mongoose, {Schema} from 'mongoose';

const meetinSchema=new Schema({

    user_id:{type:String, required:true},
    meeting_code:{type:String,unique:true},
    createdAt:{type:Date,default:Date.now()}

})

export default meetingModel=mongoose.model('Meeting',{meetinSchema})