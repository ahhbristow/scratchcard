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

	passport.use(new GoogleStrategy(google_options,function(token, refreshToken, profile, done) {


		// make the code asynchronous
		// User.findOne won't fire until we have all our data back from Google
		process.nextTick(function() {

			// try to find the user based on their google id
			User.findOne({ 'google.id' : profile.id }, function(err, user) {
				if (err)
				return done(err);

			if (user) {

				// if a user is found, log them in
				return done(null, user);
			} else {
				// if the user isnt in our database, create a new user
				var newUser          = new User();

				// set all of the relevant information
				newUser.google.id    = profile._json.id;
				newUser.google.token = token;
				newUser.google.name  = profile._json.displayName;
				newUser.google.email = profile._json.emails[0].value; // pull the first email
				newUser.google.picture = profile._json.image.url; // pull the first email

				// save the user
				newUser.save(function(err) {
					if (err) {
						console.log(err);
						throw err;
					}
				return done(null, newUser);
				});
			}
			});
		});

	}));

}
