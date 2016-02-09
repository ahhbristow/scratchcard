var config = {
	mongo_uri: "mongodb://localhost/test_sessions",
	gmail: process.env.CARDS_GMAIL_ADDRESS,
	gmail_password: process.env.CARDS_GMAIL_PASSWORD
}
module.exports = config;
