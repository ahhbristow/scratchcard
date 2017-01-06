var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var User       = require('../models/user');

module.exports = function(passport, auth_config) {

	passport.serializeUser(function(user, done) {
		done(null, user.id);
	});

	passport.deserializeUser(function(id, done) {
		User.findById(id, function(err, user) {
			done(err, user);
		});
	});

	var google_options = {
		clientID        : auth_config.google_auth.clientID,
		clientSecret    : auth_config.google_auth.clientSecret,
		callbackURL     : auth_config.google_auth.callbackURL,
		authorizationURL: auth_config.google_auth.authorizationURL,
		userProfileURL  : auth_config.google_auth.userProfileURL,
		tokenURL        : auth_config.google_auth.tokenURL
	}

	passport.verifyGoogleUser = function(token, refresh_token, profile, done) {

		// make the code asynchronous
		// User.findOne won't fire until we have all our data back from Google
		console.log("Returned profile: ");
		console.log(profile);
		process.nextTick(function() {
			User.findOne({ 'google.id' : profile.id }, function(err, user) {
				if (err) {
					return done(err);
				}

				console.log("User: " + user);
				if (user) {
					// Found a user, so log them in
					return done(null, user);
				} else {
					// if the user isnt in our database, create a new user
					var new_user = new User();

					// set all of the relevant information
					new_user.google.id      = profile._json.id;
					new_user.google.token   = token;
					new_user.google.name    = profile._json.displayName;
					new_user.google.email   = profile._json.emails[0].value;
					new_user.google.picture = profile._json.image.url;

					// save the user
					new_user.save(function(err) {
						if (err) {
							throw(err);
						}
						return done(null,new_user);
					});
				}
			});
		});
	}

	passport.use(new GoogleStrategy(google_options,passport.verifyGoogleUser));

}
