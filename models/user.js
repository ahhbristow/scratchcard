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

/*
 * Return 1 if has permission, return 0 and permission status if not
 */
UserSchema.methods.hasPermission = function(session) {
	
	var has_permission = 0;
	if (session.creator = this._id) {
		return 1;
	}

	for (var i = 0; i < session.participants.length; i++) {
		var participant = session.participants[i];
		if (participant.user_id === this._id && participant.status === "A") {
			return 1;
		}
	}

	return 0;
}

UserSchema.methods.permissionRequested = function(session) {
	//TODO
	return 1;
}

var User = mongoose.model('User',UserSchema);

module.exports = User;
