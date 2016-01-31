var HtmlScreenshotReporter = require('protractor-jasmine2-screenshot-reporter');

exports.config = {
	specs: ['login.js'],
	onPrepare: function() {


		// Fork a new browser instance
		browser2 = browser.forkNewDriverInstance();
		browser.driver.manage().window().maximize();
		browser2.driver.manage().window().maximize();

		// Register the browsers for screenshots
		jasmine.getEnv().addReporter(
			new HtmlScreenshotReporter({
				dest: '$CIRCLE_ARTIFACTS',
				filename: 'index_cards_test_report.html',
			        browsers: [browser,browser2]
			})
		);
	},

	onComplete: function(exitCode) {
		browser.quit();
		browser2.quit();
	}
};
