var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var user = new Schema({
	email: {type: String, required: true, unique: true, index: true}
});


user.plugin(passportLocalMongoose);

var User = mongoose.model('User',user);

module.exports = User;
