import jwt from "jsonwebtoken";
import ErrorHandler from "../utils/ErrorHandler.js";
import { catchAsynError } from "./catchAsyncError.js";
import {User} from "../modals/User.js"

export const isAuthenticated = catchAsynError(async(req,res,next)=>{
    const {token}=req.cookies;

    if(!token) return next(new ErrorHandler("Not Logged In",401));

    const decode=jwt.verify(token,process.env.JWT_SECRET);

    req.user = await User.findById(decode._id);

    next();
})


export const authorizeAdmin = (req,res,next)=>{
    if(req.user.role!=="admin")
    return next(
        new ErrorHandler(`${req.user.role} is not allowed to access this resourse`,403)
    );

    next()

}