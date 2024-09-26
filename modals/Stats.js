import mongoose from "mongoose";

const schema = new mongoose.Schema({

    users:{
        type:Number,
        default:0,
    },
    totalviews:{
        type:Number,
        default:0,
    },
    createdAt:{
        type:Date,
        default: Date.now,
    },

})


export const Stats = mongoose.model("Stats",schema);