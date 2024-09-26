import mongoose from "mongoose";

const schema = new mongoose.Schema({

    filename:{
        type:String,
        required:[true,'Please enter filename'],
        // minlength:[4,'Filename must be atleast 4 character'],
        // maxlength:[20,"Filename cant't exceed 20 character"],
    },
    coursecode:{
        type:String
    },
    poster:{
        public_id:{
            type:String,
            required:true,
        },
        url:{
            type:String,
            required:true,
        }
    },
    semester:{
        type:String,
        required:true
    },
    views:{
        type:Number,
        default:0,
    },
    createdAt:{
        type:Date,
        default:Date.now,
    },

})


export const Labfile = mongoose.model("Labfile",schema);