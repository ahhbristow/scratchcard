var GoogleLoginPage = require('./google_login');
var TestConfig = require(__dirname + '/../../../config/test');
var LoginPage = function (browser,account) {

	this.browser = browser;

	this.get = function() {
		this.browser.driver.get('https://localhost:4072/');
	}

	this.login = function() {
		if (account == "primary") {
			this.browser.driver.get('https://localhost:4072/google/callback?code=1');
		} else {
			this.browser.driver.get('https://localhost:4072/google/callback?code=2');
		}
	}


	this.hasGoogleSignIn = function() {
		if (this.browser.driver.findElement(by.id('sign_in_button'))) {
			return true;
		} else {
			return false;	
		};
	}
};

module.exports = LoginPage;
