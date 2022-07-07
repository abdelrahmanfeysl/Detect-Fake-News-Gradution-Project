const Review = require("../models/reviewModel");
const mongoose = require("mongoose");
const apiError = require("../utils/apiError");
const User = require("../models/userModel");
const ObjectId = mongoose.Types.ObjectId;

exports.createReview = async (req, res) => {
    req.body.user = req.user.id;
    const review = await Review.findOne({
        user: ObjectId(req.user.id)
    });
    if(review)
        throw new apiError('A user can have only one review',400);
    const newReview = await Review.create(req.body);

    const user = await User.findOne({
        id: req.user.id
    })
    console.log(user);
    newReview.name = user.name;
    await newReview.save();

    res.status(201).json({
        status: 'success',
        data: {
            review: newReview
        }
    });
}

exports.getReview = async (req, res) => {
    const review = await Review.findOne({
        user: ObjectId(req.user.id),
    });

    console.log(review);
    if (!review) {
        throw new apiError('You didnt review yet', 404);
    }

    res.status(200).json({
        status: 'success',
        data: {
            data: review
        }
    });
}

exports.getAllReviews = async (req, res) => {
    const reviews = await Review.find();

    // SEND RESPONSE
    res.status(200).json({
        status: 'success',
        results: reviews.length,
        data: {
            reviews
        }
    });
}


exports.updateReview = async (req, res, next) => {
    const review = await Review.findOneAndUpdate({
        user: ObjectId(req.user.id),
    }, req.body,
        {
            new: true
        }
    );

    console.log(review);
    res.status(200).json({
        status: 'success',
        data: {
            review
        }
    });
}

exports.deleteReview = async (req, res, next) => {
    await Review.findOneAndDelete({
        user: ObjectId(req.user.id),
    });

    res.status(204).json({
        status: 'success',
        data: null
    });
}
