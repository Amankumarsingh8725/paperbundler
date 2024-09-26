import express from 'express';
import { addLabfile, deleteLabfile, getLabfile } from '../controllers/labfileController.js';
import singleUpload from '../middlewares/multer.js';
import { authorizeAdmin, isAuthenticated } from '../middlewares/auth.js';

const router = express.Router();


// Get all the Labfiles
router.route('/labfile').get(getLabfile)

// Add any Labfiles
router.route('/addlabfile').post( isAuthenticated,authorizeAdmin ,singleUpload, addLabfile)

// delete any Labfiles
router.route('/deletelabfile/:id').delete(isAuthenticated,authorizeAdmin ,deleteLabfile)



export default router;