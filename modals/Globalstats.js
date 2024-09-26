import mongoose from "mongoose";

const schema = new mongoose.Schema({

    globalviews:{
        type:Number,
        default:0,
    },

})


export const Globalstats = mongoose.model("Globalstats",schema);