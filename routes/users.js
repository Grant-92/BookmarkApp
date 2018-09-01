var express = require('express');
var multer = require('multer');
var upload = multer({dest: './uploads'});
var router = express.Router();
var passport = require("passport");
var LocalStrat = require("passport-local").Strategy;


//importing stuff  from models/User.js
var User = require("../models/User");


//create local variable for dash page only
var groups = require("../links.json");
var res = require("express");




//get dash
router.get("/dash", function (req, res, next) {
    res.render("dash", {title: "dash"});
});

function ensureAuth(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/")

}

/* login POST dash*/
router.post("/dash",
    passport.authenticate("local", {failedRedirect: "/", failureFlash: "Invalid Username or password"}),//sending  bacck error messaage  is fail
    function (req, res) {
        req.flash('success_msg', "logged in  now");
        console.log("in /dash post  route");
        res.redirect("./dash");
    });




/* GET reg listing. */
router.get('/reg', function (req, res, next) {
    res.render('reg',
        {title: 'reg'}
    );
});

router.get("/logout"), function (req, res) {//TODO LOG out is  broke fix  it
    req.logout();
    req.flash("success_msg", "you  are now logged out");
    res.redirect("/");
};

/* reg POST*/
router.post('/reg', upload.single('profile'), function (req, res, next) {
    var username = req.body.username;
    var email = req.body.email;
    var password = req.body.password;
    var password2 = req.body.password2;
    var profile;
    console.log("recieved " + username + "  " + email + "  " + password + "  " + password2 + " for the text fields on the form")


    //if file submitted
    if (req.file) {
        console.log("Receiving file from upload")
        profile = req.file.filename;
        console.log("receiving " + profile);
    } else {
        console.log("No file designated")
        profile = "default.jpg"
    }

    //Validation
    req.checkBody('username', "Username is Mandatory").notEmpty();
    req.checkBody('email', "Email is Mandatory").notEmpty();
    req.checkBody('email', "Email must be a valid email").isEmail();
    req.checkBody('password', "Password is Mandatory").notEmpty();
    req.checkBody('password2', "Password and confirm password must match").equals(req.body.password);

    //collecting errors  from  req.checkbody
    var error = req.validationErrors();


    //if any errors collected  else create user and write to db
    if (error) {
        //render reg and pass errors
        res.render("reg", {
            error: error,
            title: 'reg'
        });
    } else {
        //init user using  schema
        var newUser = new User({
            username: username,
            email: email,
            password: password,
            profile: profile
        });


        //createUser from User.js
        User.createUser(newUser, function (err, User) {
            if (err) throw err;
            console.log(User);
        });

        //success message
        req.flash('success_msg', "You have successfully registered and can logged in  now");

        res.location("/");
        res.redirect("/");
    }
});



//passport login stuff  passport requires serialised objects to work
passport.serializeUser(function (user, done) {//TODO
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {//TODO
    User.getUserById(id, function (err, user) {
        done(err, user);

    });
});

passport.use(new LocalStrat(function (username, password, done) {//TODO

    //all method in model cclass
    User.get_user_by_username(username, function (err, user) {//TODO
        console.log("oot get_user_by_username");

        if (err) throw err;

        if (!user) {
            console.log("got !user");
            return done(null, false, {message: "User  Invalid"});
        }
        User.check_password(password, user.password, function (err, isMatch) {//TODO
            console.log("check password");

            if (err) return done(err);

            if (isMatch) {
                console.log("got ismatch");

                return done(null, user);
            } else {
                return done(null, false, {message: "Invalid Password"})
            }
        });
    });
}));

module.exports = router;
