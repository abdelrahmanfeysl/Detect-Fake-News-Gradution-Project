const express = require('express');
const authController = require('./../controllers/authController');
const newsController = require('./../controllers/newsController');

//************************************************************************************************* */

const router = express.Router();

router.route('/userHistory')
    .get(authController.protect, authController.restrict("user"), newsController.userHistory);
router.route('/recentlySearchedNews').get(newsController.recentlySearchedNews);
router.route('/').post(authController.protect, authController.restrict("user"), newsController.searchNews);
router.route('/:id').delete(authController.protect, authController.restrict("user"), newsController.deleteNews);

module.exports = router;
