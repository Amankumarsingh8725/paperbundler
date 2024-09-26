import express from 'express';
import { getQuestionPaper,addQuestionPaper,deleteQuestionPaper } from '../controllers/questionPaperController.js';
import singleUpload from '../middlewares/multer.js';
import { authorizeAdmin, isAuthenticated } from '../middlewares/auth.js';

const router = express.Router();


// Get all the Labfiles
router.route('/questionpaper').get(getQuestionPaper)

// Add any Labfiles
router.route('/addquestionpaper').post( isAuthenticated,authorizeAdmin ,singleUpload, addQuestionPaper)

// delete any Labfiles
router.route('/deletequestionpaper/:id').delete(isAuthenticated,authorizeAdmin ,deleteQuestionPaper)



export default router;