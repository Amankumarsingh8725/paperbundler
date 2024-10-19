import express from 'express';
import { authorizeAdmin, isAuthenticated } from '../middlewares/auth.js';
import {contact, getDashboardStats} from '../controllers/otherscontroller.js';


const router = express.Router();



router.route('/admin/stats').get(isAuthenticated,authorizeAdmin ,getDashboardStats)
router.route('/contact').post(contact)



export default router;