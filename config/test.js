var config = {
	mongo_uri: "mongodb://localhost/test_sessions",
	gmail: process.env.CARDS_GMAIL_ADDRESS,
	gmail_password: process.env.CARDS_GMAIL_PASSWORD,
	gmail_2: process.env.CARDS_GMAIL_ADDRESS_2,
	gmail_password_2: process.env.CARDS_GMAIL_PASSWORD_2
}
module.exports = config;
