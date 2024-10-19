import { Stats } from '../modals/Stats.js';
import { catchAsynError } from '../middlewares/catchAsyncError.js';
import {sendEmail} from '../utils/sendEmail.js';
import ErrorHandler from '../utils/ErrorHandler.js';



export const contact = catchAsynError(async (req,res,next)=>{
    const {name,email,message}=req.body;

    if(!name || !email || !message){
        return next(new ErrorHandler("Please fill all the fields",400));}


        const to= process.env.MY_MAIL;
        const subject="Contact from PaperBundler";
        const text=`I am ${name} and my email is ${email}. \nMy message is ${message}`;

        await sendEmail(to,subject,text);
    

    res.status(200).json({
        success:true,
        message:"Message sent successfully"
    });
})

export const getDashboardStats = catchAsynError(async (req, res, next) => {

    const stats = await Stats.find({}).sort({ createdAt: "desc" }).limit(12);

    const statsData=[];
    for(let i=0;i<stats.length;i++){
        statsData.unshift(stats[i]);
    }
    const requireSize=12-stats.length;

    for(let i=0;i<requireSize;i++){
        statsData.unshift({
            users:0,
            totalviews:0
        });
    }

    const usercount=statsData[11].users;
    const totalviewscount=statsData[11].totalviews;

    let usersProfit=true;
    let totalviewsProfit=true;

    let usersPercentage=0;
    let totalviewsPercentage=0;

    if(statsData[10].users===0) usersPercentage=usercount*100;
    if(statsData[10].totalviews===0) totalviewsPercentage=totalviewscount*100;

    else{
        const difference={
            users:usercount-statsData[10].users,
            totalviews:totalviewscount-statsData[10].totalviews
        }

        usersPercentage=(difference.users/statsData[10].users)*100;
        totalviewsPercentage=(difference.totalviews/statsData[10].totalviews)*100;

        if(difference.users<0) usersProfit=false;
        if(difference.totalviews<0) totalviewsProfit=false;
    }


    res.status(200).json({
        success: true,
        stats:statsData,
        usercount,
        totalviewscount,
        usersProfit,
        totalviewsProfit,
        usersPercentage,
        totalviewsPercentage
    });


});
