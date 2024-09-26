import express from 'express';
import { changePassword, forgetPassword, getMyProfile, login,
logout, register, resetPassword, updateProfile, updateProfilePicture,getAllUsers,deleteUser,changeRole } from '../controllers/userController.js';
import { authorizeAdmin, isAuthenticated, } from '../middlewares/auth.js';
import singleUpload from '../middlewares/multer.js';
 

const router = express.Router();


// to regsister a new user
router.route('/register').post(singleUpload,register)


// Login
router.route('/login').post(login)

// Logout
router.route('/logout').get(logout)

// Get my profile
router.route('/getprofile').get( isAuthenticated, getMyProfile)

// ChangePassword
router.route('/changepassword').put( isAuthenticated, changePassword)

// updateProfile
router.route('/updateprofile').put( isAuthenticated, updateProfile)

// UpdateProfilePicture
router.route('/updateprofilepicture').put( isAuthenticated,singleUpload, updateProfilePicture)


// ForgetPassword
router.route('/forgetpassword').post(forgetPassword)

// ResetPassword
router.route('/resetpassword/:token').put(resetPassword)



// -----------------------------------admin routes------------------------------------------------


// Get all users
 router.route('/admin/users').get(isAuthenticated,authorizeAdmin,getAllUsers)

//  Delete user
router.route('/admin/user/:id').put(isAuthenticated,authorizeAdmin,changeRole).delete(isAuthenticated,authorizeAdmin,deleteUser)

export default router;