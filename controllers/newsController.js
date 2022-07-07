const News = require('./../models/newsModel');
const apiError = require('./../utils/apiError');
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const axios = require('axios');

let news_Status_Percent = 0;

// post request to flask api to connect to the machine learning model ( input: news  output: percentage of correctness)
exports.callFlaskAPI = async (req, res, next) => {

    const data = {
        news: req.body.description
    };

    const temp_news = await News.findOne({
        description: req.body.description
    })

    if (temp_news)
    {
        return res.status(200).json({
            status: 'success',
            result: temp_news.status,
            result_Percent: temp_news.status_Percent,
            data: temp_news
        })
    }

    await axios.post(process.env.FLASK_API_URL, data)
        .then((res) => {
            console.log(`Status: ${res.status}`);
            news_Status_Percent = (res.data).result * 1;
            console.log('response: ', news_Status_Percent );
        }).catch((err) => {
            throw new err;
        });

    next();
};


// Detect News for user & Post new News to the database
exports.userDetectNews = async (req, res) => {

    let newsStatus = news_Status_Percent > 0.5;

    req.body.user = req.user.id;
    req.body.status_Percent = news_Status_Percent;
    req.body.status = newsStatus;
    const newNews = await News.create(req.body);

    res.status(201).json({
        status: 'success',
        result: newsStatus,
        result_Percent: news_Status_Percent,
        data: newNews
    })
}


// Detect News for the guest
exports.guestDetectNews = async (req, res) => {

    let newsStatus = news_Status_Percent > 0.5;

    res.status(201).json({
        status: 'success',
        result: newsStatus,
        result_Percent: news_Status_Percent
    })
}


// Delete News by id from the database
exports.deleteNews = async (req, res) => {

    const news = await News.findByIdAndDelete(req.params.id);

    if (!news) {
        throw new apiError('No News found with that ID', 404);
    }

    res.status(204).json({
        status: 'success',
        data: null
    });
}


// Delete News that exceed one month later from database
exports.deleteMonthAgoNews = async (req, res, next) => {

    await News.deleteMany({
        date: { $lte: new Date( ( new Date().getTime() - (30 * 24 * 60 * 60 * 1000) ) ) }
    });

    next();
}


// Get searched news that all users searched (in the last week)
exports.recentlySearchedNews = async (req, res) => {

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
exports.userHistory = async (req, res) => {

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
