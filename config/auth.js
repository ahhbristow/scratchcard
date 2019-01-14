module.exports = {
	google_auth : {
		'clientID'      : process.env.CLIENT_ID,
		'clientSecret'  : process.env.CLIENT_SECRET,
		'callbackURL'   : process.env.GOOGLE_CALLBACK
	},
	cookie_secret: process.env.COOKIE_SECRET
}
