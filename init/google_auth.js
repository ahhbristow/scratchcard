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

	passport.use(new GoogleStrategy({
		clientID        : auth_config.googleAuth.clientID,
		clientSecret    : auth_config.googleAuth.clientSecret,
		callbackURL     : auth_config.googleAuth.callbackURL,

	},
	function(token, refreshToken, profile, done) {

		// TODO: Remove
		console.log(JSON.stringify(profile));

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
				newUser.google.id    = profile.id;
				newUser.google.token = token;
				newUser.google.name  = profile.displayName;
				newUser.google.email = profile.emails[0].value; // pull the first email
				newUser.google.picture = profile._json.image.url; // pull the first email

				// save the user
				newUser.save(function(err) {
					if (err)
					throw err;
				return done(null, newUser);
				});
			}
			});
		});

	}));

}
