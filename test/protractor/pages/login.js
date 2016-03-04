var GoogleLoginPage = require('./google_login');
var TestConfig = require(__dirname + '/../../../config/test');
var LoginPage = function () {

	this.get = function() {
		browser.driver.get('https://localhost:4072/');
	}

	this.login = function() {
		// Login to the first browser
		browser.driver.findElement(by.id('sign_in_button')).click();
		var google_login_page = new GoogleLoginPage();

		// If we've logged into Google already, then the
		// credentials don't need to be entered again and
		// Google redirects straight back to the app.
		google_login_page.isQuickLogin().then(function(result) {
			if (result == "true") {
				console.log("On quick login page, performing quick login");
				google_login_page.performQuickLogin();

			} else {
				google_login_page.emailPageLoaded().then(function(result) {
					console.log("On Email entry page? " + result);
					if (result === true) {
						console.log("Performing full Google login");
						google_login_page.submitEmail(TestConfig.gmail);
						google_login_page.submitPassword(TestConfig.gmail_password);
						google_login_page.approveAccess();

					} else {
						// Do nothing, we should have logged in
					}
				});
			}
		});
	}


	this.has_google_sign_in = function() {
		if (browser.driver.findElement(by.id('sign_in_button'))) {
			return true;
		} else {
			return false;	
		};
	}
};

module.exports = LoginPage;
