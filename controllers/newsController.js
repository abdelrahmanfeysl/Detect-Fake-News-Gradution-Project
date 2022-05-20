const News = require('./../models/newsModel');
const User = require("../models/userModel");
const apiError = require('./../utils/apiError');
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;


// Post new News to the database
exports.searchNews = async (req, res, next) => {

    if(!req.body.user) req.body.user = req.user.id;

    const newNews = await News.create(req.body);

    res.status(201).json({
        status: 'success',
        data: newNews
    })
}


// Delete News by id from the database
exports.deleteNews = async (req, res, next) => {

    const news = await News.findByIdAndDelete(req.params.id);

    if (!news) {
        throw new apiError('No tour found with that ID', 404);
    }

    res.status(204).json({
        status: 'success',
        data: null
    });
}


// Get searched news that all users searched (in the last week)
exports.recentlySearchedNews = async (req, res, next) => {

    const news = await News.find({
        date: { $gte: new Date( ( new Date().getTime() - (7 * 24 * 60 * 60 * 1000) ) ) } // last week
    });

    res.status(200).json({
        status: 'success',
        result_length: news.length,
        data: news
    })
}


// Get History of news that specific user searched before (in the last month)
exports.userHistory = async (req, res, next) => {

    const news = await News.find({
        user: ObjectId(req.user.id),
        date: { $gte: new Date( ( new Date().getTime() - (30 * 24 * 60 * 60 * 1000) ) ) } // last month
    });

    res.status(200).json({
        status: 'success',
        result_length: news.length,
        data: news
    })
}
