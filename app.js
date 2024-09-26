import express from "express";
import {config} from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
 
config({
    path:"./config/config.env",
})
const app =express();

app.use(express.json());
app.use(express.urlencoded({
    extended:true,
}))

app.use(cookieParser());
app.use(cors({
    credentials:true,
    origin:process.env.FRONTEND_URL,
    methods:["GET","POST","PUT","DELETE"],
}))



// Importing & using Routes
import labfiles from './routes/labfileRoutes.js'
import users from './routes/userRouter.js'
import questionPaper from './routes/questionPaperRoutes.js'
import { ErrorMiddleWare } from "./middlewares/Error.js";
import others from "./routes/otherRoutes.js";


app.use("/api/v1",labfiles)
app.use("/api/v1",users)
app.use("/api/v1",questionPaper)
app.use("/api/v1",others)




export default app;
app.get("/",(req,res)=>res.send(`site is running on ${process.env.FRONTEND_URL}`))
app.use(ErrorMiddleWare)