// TODO: Replace with env vars
module.exports = {
	google_auth : {
		'clientID'      : process.env.CLIENT_ID,
		'clientSecret'  : process.env.CLIENT_SECRET,
		'callbackURL'   : process.env.GOOGLE_CALLBACK,
		'authorizationURL': "http://172.17.0.1:8080/auth",
		'userProfileURL'  : "http://172.17.0.1:8080/plus/v1/people/me",
		'tokenURL'        : "http://172.17.0.1:8080/token"
	},
	cookie_secret: process.env.COOKIE_SECRET
}
