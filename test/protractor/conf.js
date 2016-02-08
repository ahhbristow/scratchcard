var HtmlScreenshotReporter = require('protractor-jasmine2-screenshot-reporter');
var GoogleLoginPage = require('./pages/google_login');

exports.config = {
	specs: ['google_login.js'],
	seleniumAddress: 'http://localhost:4444/wd/hub',
	onPrepare: function() {


		// Fork a new browser instance
		//browser2 = browser.forkNewDriverInstance();
		//browser.driver.manage().window().maximize();
		//browser2.driver.manage().window().maximize();

		// Register the browsers for screenshots
		jasmine.getEnv().addReporter(
			new HtmlScreenshotReporter({
				dest: '',
				filename: 'index_cards_test_report.html',
			        browsers: [browser]
			})
		);

		// Login to the first browser
		console.log("Logging in");
		browser.driver.get('http://localhost:4072/');
		element(by.id('sign_in_button')).click();
		var google_login_page = new GoogleLoginPage();
		google_login_page.submitEmail('');
		google_login_page.submitPassword('');
		google_login_page.approveAccess();

	},

	onComplete: function(exitCode) {
		browser.quit();
		//browser2.quit();
		console.log("All tests finished. Cleaning up...");
	}
};
