import  app from "./app.js"
import {connectDB} from "./config/database.js"
import cloudnary from "cloudinary";

import nodeCron from "node-cron";   // this is for statistsis which help in creating a new document in Stats.js module every 1st day of month
import { Stats } from './modals/Stats.js';


connectDB();


cloudnary.v2.config({
    cloud_name:process.env.CLOUD_NAME,
    api_key:process.env.CLOUD_API_KEY,
    api_secret:process.env.CLOUD_API_SECRET,
})


// this is the code which help in creating a new document in Stats.js module every 1st day of month
nodeCron.schedule("0 0 1 * *",async()=>{
    try{
        await Stats.create({})
    }
    catch(err){
        console.log(err);
    }
});

app.listen(process.env.PORT,()=>{
    console.log(`Server is   running on http://localhost:${process.env.PORT}`)
})