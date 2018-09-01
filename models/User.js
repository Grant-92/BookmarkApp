var mongoose = require("mongoose");
var bccrypt = require("bcryptjs");


//DB adress
mongoose.connect("mongodb://localhost/BookmarkApp");
//DB connection var
var db = mongoose.connection;

//scchema for user
var USchema = mongoose.Schema({
    username: {
        type: String,
        index: true
    },
    email: {
        type: String
    },
    password: {
        type: String
    },
    profile: {
        type: String
    }
});

//exporting schema
var User = module.exports = mongoose.model("User", USchema);

//exporting creation function
module.exports.createUser = function (newUser, callback) {

//complex salt and hash the password before save
    bccrypt.genSalt(10, function (err, salt) {
        bccrypt.hash(newUser.password, salt, function (err, hash) {

            newUser.password = hash;
            newUser.save(callback);
            console.log("password encrypted successfully");
        });

    });

};

module.exports.getUserById = function(id, callback){
    var query = {id: id};
    User.findOne(query, callback);
    User.findById(id, callback);

};

module.exports.get_user_by_username = function(username, callback){
    var query = {username: username};
    User.findOne(query, callback);
};

module.exports.check_password = function(candidatePassword, hash, callback){
    bccrypt.compare(candidatePassword, hash, function (err, isMatch) {
        callback(null, isMatch);
    });

};