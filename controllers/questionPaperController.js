import { catchAsynError } from '../middlewares/catchAsyncError.js';
import { Questionpaper } from '../modals/Questionpaper.js';
import { Globalstats } from '../modals/Globalstats.js';
import ErrorHandler from '../utils/ErrorHandler.js';
import getDataUri from '../utils/dataUri.js';
import cloudnary from "cloudinary";
import { Stats } from "../modals/Stats.js";



export const getQuestionPaper = catchAsynError(async (req, res, next) => {
   // res.send("working");

   const globalstatsviews = await Globalstats.findOne();
   if (!globalstatsviews) {
      globalstatsviews = await Globalstats.create({ globalviews });
   };
   globalstatsviews.globalviews += 1;
   await globalstatsviews.save();

   const keyword = req.query.keyword || '';
const semester = req.query.semester || '';
const category = req.query.category || '';


   const questionpapers = await Questionpaper.find({
      questionpapername: {
         $regex: keyword,
         $options: 'i'
      },
      semester: {
         $regex: semester,
         $options: 'i'
      },
      category: {
         $regex: category,
         $options: 'i'
      }
   });
   for (let questionpaper of questionpapers) {
      questionpaper.views += 1;
      await questionpaper.save();
   }

   res.status(200).json({
      success: true,
      questionpapers,
      globalstatsviews
   });

})


export const addQuestionPaper = catchAsynError(async (req, res, next) => {

   const { questionpapername, category, semester, year } = req.body;

   if (!questionpapername || !category || !semester || !year)
      return next(new ErrorHandler("Please add all fields", 400))

   const file = req.file;
   // console.log(file);



   const fileUri = getDataUri(file);

   const mycloud = await cloudnary.v2.uploader.upload(fileUri.content, {
      resource_type: "auto"
   });


   await Questionpaper.create({
      questionpapername, category, semester, year,
      poster: {
         public_id: mycloud.public_id,
         url: mycloud.secure_url,
      },
   })

   res.status(201).json({
      success: true,
      message: "QuestionPaper Added Successfully.",
   });
});


export const deleteQuestionPaper = catchAsynError(async (req, res, next) => {
   const { id } = req.params;

   const questionpaper = await Questionpaper.findById(id);

   if (!questionpaper) return next(new ErrorHandler("Course Not Found", 404));

   await cloudnary.v2.uploader.destroy(questionpaper.poster.public_id);

   await questionpaper.deleteOne();



   res.status(201).json({
      success: true,
      message: "QuestionPaper Deleted Successfully.",
   });
});


Questionpaper.watch().on('change', async () => {
   const stats = await Stats.findOne({}).sort({ createdAt: "desc" }).limit(1);

   const globalstatsviews = await Globalstats.findOne();
   stats.totalviews = globalstatsviews.globalviews
   stats.createdAt = new Date(Date.now());
   await stats.save();
});








