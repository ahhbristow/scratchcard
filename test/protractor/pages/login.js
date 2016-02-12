var GoogleLoginPage = require('./google_login');
var TestConfig = require(__dirname + '/../../../config/test');
var LoginPage = function () {

	this.get = function() {
		browser.get('https://localhost:4072/');
	}

	this.login = function() {
		// Login to the first browser
		element(by.id('sign_in_button')).click();
		var google_login_page = new GoogleLoginPage();
		google_login_page.submitEmail(TestConfig.gmail);
		google_login_page.submitPassword(TestConfig.gmail_password);
		google_login_page.approveAccess();
	}



	this.has_google_sign_in = function() {
		if (element(by.id('sign_in_button'))) {
			return true;
		} else {
			return false;	
		};
	}
};

module.exports = LoginPage;
