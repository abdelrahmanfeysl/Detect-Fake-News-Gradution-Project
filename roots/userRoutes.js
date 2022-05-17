const express=require('express');
const authController = require('./../controllers/authController');
const userController =require('./../controllers/userController')

const router=express.Router();


//ROUTES THESE NOT NEED AUTHENTICATION
router.post('/signup',authController.signUp);
router.post('/login',authController.logIn);
router.get('/logout',authController.logout);
router.get('/print',authController.protect,authController.print);



//ROUTES WHICH MUST BE AUTHENTICATED
router.use(authController.protect);

router.get('/getMe',userController.getMe);
router.get('/deleteMe',userController.deleteMe);
router.post('/updatePassword',authController.protect,authController.updatePassword);



module.exports =router;