import { catchAsynError } from '../middlewares/catchAsyncError.js';
import { Labfile } from '../modals/Labfile.js';
import { Globalstats } from '../modals/Globalstats.js';
import ErrorHandler from '../utils/ErrorHandler.js';
import getDataUri from '../utils/dataUri.js';
import cloudnary from "cloudinary";
import { Stats } from "../modals/Stats.js";



export const getLabfile = catchAsynError(async (req, res, next) => {

   const globalstatsviews = await Globalstats.findOne();
   if (!globalstatsviews) {
      globalstatsviews = await Globalstats.create({});
   };
   globalstatsviews.globalviews += 1;
   await globalstatsviews.save();


   const keyword = req.query.keyword || '';
   const semester = req.query.semester || '';

   const labfiles = await Labfile.find({
      filename: {
         $regex: keyword,
         $options: 'i'
      },
      semester: {
         $regex: semester,
         $options: 'i'
      }
   });
   for (let labfile of labfiles) {
      labfile.views += 1;
      await labfile.save();
   }


   res.status(200).json({
      success: true,
      labfiles,
      globalstatsviews,
   });

})


export const addLabfile = catchAsynError(async (req, res, next) => {

   const { filename, coursecode, semester } = req.body;

   if (!filename || !coursecode || !semester)
      return next(new ErrorHandler("Please add all fields", 400))

   const file = req.file;
   // console.log(file);



   const fileUri = getDataUri(file);

   const mycloud = await cloudnary.v2.uploader.upload(fileUri.content, {
      resource_type: "auto"
   });


   await Labfile.create({
      filename, coursecode, semester,
      poster: {
         public_id: mycloud.public_id,
         url: mycloud.secure_url,
      },
   })

   res.status(201).json({
      success: true,
      message: "Labfile Added Successfully.",
   });
});


export const deleteLabfile = catchAsynError(async (req, res, next) => {
   const { id } = req.params;

   const labfile = await Labfile.findById(id);

   if (!labfile) return next(new ErrorHandler("Course Not Found", 404));

   await cloudnary.v2.uploader.destroy(labfile.poster.public_id);

   await labfile.deleteOne();



   res.status(201).json({
      success: true,
      message: "Labfile Deleted Successfully.",
   });
});


Labfile.watch().on('change', async () => {
   const stats = await Stats.findOne({}).sort({ createdAt: "desc" }).limit(1);

   const globalstatsviews = await Globalstats.findOne();
   stats.totalviews = globalstatsviews.globalviews
   stats.createdAt = new Date(Date.now());
   await stats.save();
});








