var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require("body-parser");
var expressValidator = require("express-validator");
var expressmess = require("express-messages");
var flash = require("connect-flash");
var session = require("express-session");
var passport = require("passport");
var localStrat = require("passport-local").Strategy;
var mongo = require("mongodb");
var mongoose = require("mongoose");
var multer = require("multer");
var upload = multer({dest: "./uploads"});
var logger = require('morgan');
var favicon = require('serve-favicon');
var bccrypt = require("bcryptjs");

var indexRouter = require('./routes/index');
var aboutRouter = require('./routes/about');
// TODO var dashRouter = require('./routes/dash');
var usersRouter = require('./routes/users');
//  TODO var regRouter = require('./routes/reg');

// db connection
mongoose.connect("mongodb://localhost/BookmarkApp");
var db = mongoose.connection;

//initialise app
var app = express();


// json file  would have  preferred  mongo but its working now and  im scared to touch the routes
app.locals.linkData =  require("./links.json");


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.png')))
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//bodyParser midware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());


//express-session midware
app.use(session({
    secret: "secret",
    saveUninitialized: true,
    resave: true
}));

//passport midware
app.use(passport.initialize());
app.use(passport.session());

//express-validator midware
app.use(expressValidator({
    errorFormatter: function (param, msg, value) {
        var namespc = param.split(".")
            , root = namespc.shift()
            , formParam = "[" + namespc.shift() + "]";

        while (namespc.length) {
            formParam += "[" + namespc.shift() + "]";
        }
        return {
            param: formParam,
            msg: msg,
            value: value
        };
    }
}));


//connect-flash midware
app.use(flash());

// global vars for flash
app.use(function (req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
})

//routes midware
app.use('/', indexRouter);
app.use("/about", aboutRouter);
app.use('/users', usersRouter);
// TODO app.use('/dash', dashRouter);
// TODO app.use('/reg', regRouter);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');


});

module.exports = app;
