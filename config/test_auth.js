module.exports = {
	google_auth : {
		'clientID'      : process.env.CLIENT_ID,
		'clientSecret'  : process.env.CLIENT_SECRET,
		'callbackURL'   : process.env.GOOGLE_CALLBACK,
		'authorizationURL': "https://localhost:4072/auth/google/callback?code=1",
		'userProfileURL'  : "http://localhost:8080/profile",
		'tokenURL'        : "http://localhost:8080/token"
	},
	cookie_secret: process.env.COOKIE_SECRET
}
