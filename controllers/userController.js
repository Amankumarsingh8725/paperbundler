import { catchAsynError } from '../middlewares/catchAsyncError.js';
import { User } from '../modals/User.js';
import ErrorHandler from '../utils/ErrorHandler.js';
import { sendEmail } from '../utils/sendEmail.js';
import { sendToken } from '../utils/sendToken.js';
import crypto from "crypto";
import getDataUri from '../utils/dataUri.js';
import cloudnary from "cloudinary";
import {Stats} from "../modals/Stats.js";


export const register = catchAsynError(async (req, res, next) => {

    const { name, email, password } = req.body;


    if (!name || !email || !password)
        return next(new ErrorHandler("Please add all fields", 400))

    let user = await User.findOne({ email });

    if (user) return next(new ErrorHandler("user Already Exist", 409));

    const file = req.file;
    const fileUri = getDataUri(file);
    const mycloud = await cloudnary.v2.uploader.upload(fileUri.content);
    user = await User.create({
        name, email, password,
        avatar: {
            public_id: mycloud.public_id,
            url: mycloud.secure_url,
        },
    });

    sendToken(res, user, "Registered successfully", 201)

})



export const login = catchAsynError(async (req, res, next) => {

    const { email, password } = req.body;

    // const file = req.file;

    if (!email || !password)
        return next(new ErrorHandler("Please add all fields", 400))

    let user = await User.findOne({ email }).select("+password");

    if (!user) return next(new ErrorHandler("Incorrect Email & Password", 401));

    const isMatch = await user.comparePassword(password);

    if (!isMatch)
        return next(new ErrorHandler("Incorrect Email & Password", 401));

    sendToken(res, user, `Welcome back, ${user.name}`, 200)

})


export const logout = catchAsynError(async (req, res, next) => {
    res.status(200).cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
        secure:true,
        sameSite: "none",
    }).json({
        success: true,
        message: "Logged Out Successfully",
    })
})

export const getMyProfile = catchAsynError(async (req, res, next) => {
    const user = await User.findById(req.user._id);
    res.status(200).json({
        success: true,
        user,
    });
})

export const changePassword = catchAsynError(async (req, res, next) => {
    const { oldpassword, newpassword } = req.body;
    if (!oldpassword || !newpassword)
        return next(new ErrorHandler("Please add all fields", 400))

    const user = await User.findById(req.user._id).select("+password");

    const isMatch = await user.comparePassword(oldpassword);

    if (!isMatch)
        return next(new ErrorHandler("Incorrect Oldpassword", 401));

    user.password = newpassword;
    await user.save();

    res.status(200).json({
        success: true,
        message: "Password Changed Successfully",
    });
})

export const updateProfile = catchAsynError(async (req, res, next) => {
    const { name, email } = req.body;

    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (email) user.email = email;
    await user.save();

    res.status(200).json({
        success: true,
        message: "Profile Updated Successfully",
    });
})


export const updateProfilePicture = catchAsynError(async (req, res, next) => {

    const file = req.file;
    const user = await User.findById(req.user._id);
    const fileUri = getDataUri(file);
    const mycloud = await cloudnary.v2.uploader.upload(fileUri.content);

    await cloudnary.v2.uploader.destroy(user.avatar.public_id);
    user.avatar = {
        public_id: mycloud.public_id,
        url: mycloud.secure_url,
    }
    await user.save();


    res.status(200).json({
        success: true,
        message: "Profile Picture Updated Successfully",
    })
})


export const forgetPassword = catchAsynError(async (req, res, next) => {

    const { email } = req.body;
    const user = await User.findOne({ email });


    if (!user) return next(new ErrorHandler("User was not found", 400))

    const resetToken = await user.getResetToken();

    await user.save();

    // send token via email
    const url = `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`
    const message = `Click on the link to reset your password.${url}.If you are not requistes then ignore.`;
    await sendEmail(user.email, "Paperbundler Reset Password", message);

    res.status(200).json({
        success: true,
        message: `Reset Token has been sent to ${user.email} Successfully`,
    })
})




export const resetPassword = catchAsynError(async (req, res, next) => {
    const { token } = req.params;

    const resetPasswordToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: {
            $gt: Date.now(),
        }
    })

    if (!user) return next(new ErrorHandler("Token is invalied or has been expired"));

    user.password = req.body.password;

    user.resetPasswordExpire = undefined;
    user.resetPasswordToken = undefined;
    await user.save();

    res.status(200).json({
        success: true,
        message: "Password Changed Successfully",
    })
})




// -------------------------------------------admincontroller.js--------------------------------------------
export const getAllUsers = catchAsynError(async (req, res, next) => {
    const users = await User.find();
    res.status(200).json({
        success: true,
        users
    });

})


export const deleteUser = catchAsynError(async (req, res, next) => {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return next(new ErrorHandler("User Not Found", 404));
    if(user.role==="admin") return next(new ErrorHandler("Admin Cannot delete himself/herself", 404));
    await cloudnary.v2.uploader.destroy(user.avatar.public_id);
    await user.deleteOne();
    res.status(200).json({
        success: true,
        message: "User Deleted Successfully",
    });
})

export const changeRole = catchAsynError(async (req, res, next) => {
    const { id } = req.params;
    const user = await User.findById(id);
    

    if (user.role === "user") {
        user.role = "admin";
    }
    else { user.role = "user"; }

    await user.save();

    res.status(200).json({
        success: true,
        message: "Role Changed Successfully",
    });
})


User.watch().on('change', async () => {
    const stats = await Stats.findOne({}).sort({ createdAt: "desc" }).limit(1);

    stats.users =await User.countDocuments({},{hint:"_id_"});

    stats.createdAt=new Date(Date.now());
    await stats.save();

})

