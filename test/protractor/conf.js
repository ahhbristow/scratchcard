var HtmlScreenshotReporter = require('protractor-jasmine2-screenshot-reporter');
var GoogleLoginPage = require('./pages/google_login');
var TestConfig = require(__dirname + '/../../config/test');

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
		browser.driver.get('https://localhost:4072/');
		element(by.id('sign_in_button')).click();
		var google_login_page = new GoogleLoginPage();
		google_login_page.submitEmail(TestConfig.gmail);
		google_login_page.submitPassword(TestConfig.gmail_password);
		google_login_page.approveAccess();

	},

	onComplete: function(exitCode) {
		browser.quit();
		//browser2.quit();
		console.log("All tests finished. Cleaning up...");
	}
};
