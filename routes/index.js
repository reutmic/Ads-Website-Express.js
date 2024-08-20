var express = require('express');
var router = express.Router();

/**
 * This route is for getting the landing/main page:
 */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Yad2 Website' });
});

module.exports = router;
