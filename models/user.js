var mongoose = require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose');

var UserSchema = new mongoose.Schema({
	google: {
		id           : String,
		token        : String,
		email        : String,
		name         : String,
		picture      : String
	}
});

var User = mongoose.model('User',UserSchema);

module.exports = User;
