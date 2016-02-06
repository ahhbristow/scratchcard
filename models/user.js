var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var user = new Schema({
	google: {
		id           : String,
    		token        : String,
    		email        : String,
    		name         : String
	}
});


var User = mongoose.model('User',user);

module.exports = User;
