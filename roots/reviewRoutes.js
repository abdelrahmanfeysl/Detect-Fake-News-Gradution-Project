const reviewController = require("../controllers/reviewController");
const authController = require('./../controllers/authController');
const express=require('express');

const router=express.Router();


router.use( authController.protect, authController.restrict("user"));
router.post('/createReview',reviewController.createReview);
router.patch('/updateReview',reviewController.updateReview);
router.get('/getReview',reviewController.getReview);
router.get('/getAllReviews',reviewController.getAllReviews);
router.delete('/deleteReview',reviewController.deleteReview);

module.exports = router;
