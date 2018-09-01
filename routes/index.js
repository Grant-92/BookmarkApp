var express = require('express');
var multer = require('multer');
var upload = multer({dest: './uploads'});
var router = express.Router();
var passport = require("passport");
var LocalStrat = require("passport-local").Strategy;

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'WebLinX' });
});




module.exports = router;
