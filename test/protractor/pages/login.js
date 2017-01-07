var GoogleLoginPage = require('./google_login');
var TestConfig = require(__dirname + '/../../../config/test');
var LoginPage = function (browser,account) {

	this.browser = browser;

	this.get = function() {
		this.browser.driver.get('https://localhost:4072/');
	}

	/*this.loginFull = function() {
		// Login to the first browser
		this.browser.driver.findElement(by.id('sign_in_button')).click();
		var google_login_page = new GoogleLoginPage(this.browser,account);

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
						google_login_page.performFullLogin();
					} else {
						// Do nothing, we should have logged in
					}
				});
			}
		});
	}*/

	this.login = function() {
		if (account == "primary") {
			this.browser.driver.get('https://localhost:4072/auth/google/callback?code=1');
		} else {
			this.browser.driver.get('https://localhost:4072/auth/google/callback?code=2');
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
