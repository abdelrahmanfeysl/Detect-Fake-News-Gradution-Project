const express = require('express');
const authController = require('./../controllers/authController');
const newsController = require('./../controllers/newsController');

//************************************************************************************************* */

const router = express.Router();

router.route('/recentlySearchedNews').get(newsController.recentlySearchedNews);
router.route('/guestDetectNews').post(newsController.callFlaskAPI, newsController.guestDetectNews);

router.use( authController.protect, authController.restrict("user") );
router.route('/userHistory').get(newsController.deleteMonthAgoNews, newsController.userHistory);
router.route('/userDetectNews').post(newsController.callFlaskAPI, newsController.userDetectNews);
router.route('/:id').delete(newsController.deleteNews);

module.exports = router;
