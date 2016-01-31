var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var user = new Schema({
	email: {type: String, required: true, unique: true}
});

user.plugin(passportLocalMongoose);

module.exports = mongoose.model('User',user);
