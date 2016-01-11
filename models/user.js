var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var user = new Schema({
	username: String,
	password: String
});

user.plugin(passportLocalMongoose);

module.exports = mongoose.model('User',user);
