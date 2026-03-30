import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config();

const db_uri=process.env.MONGODB_URI || 'null';

export default async function initDB(){
    try{
        const db=await mongoose.connect(db_uri);
        console.log(`✅ connected to DB with host ${db.connection.host}`)
    }catch(e){
        console.log(`❌ error connecting to database with error ${e}`)
    }
}   