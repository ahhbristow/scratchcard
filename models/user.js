var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var user = new Schema({
	_id: Schema.Types.ObjectId,
	username: String,
	password: String
});

user.plugin(passportLocalMongoose);

module.exports = mongoose.model('User',user);
