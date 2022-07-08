const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
    {
        review: {
            type: String,
            required: [true, 'Review can not be empty!']
        },
        rating: {
            type: Number,
            min: 1,
            max: 5,
            required: [true, 'a review must have a rating']
        },
        createdAt: {
            type: Date,
            default: Date.now
        },
        user: {
            type: mongoose.Schema.ObjectId,
            reference: "User",
            required: [true, "User reference can't be empty"]
        },
        name: {
            type: String,
            default: ""
        }
    });


const Review = mongoose.model('Review',reviewSchema);

module.exports = Review;