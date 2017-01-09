var HtmlScreenshotReporter = require('protractor-jasmine2-screenshot-reporter');
var GoogleLoginPage = require('./pages/google_login');
var TestConfig = require(__dirname + '/../../config/test');

// abstract writing screen shot to a file
var fs = require('fs');
function writeScreenShot(data, filename) {
	var stream = fs.createWriteStream(filename);
	stream.write(new Buffer(data, 'base64'));
	stream.end();
}

exports.config = {
	specs: ['google_login.js','sessions.js','request_participation.js'],
	seleniumAddress: 'http://localhost:4444/wd/hub',
	onPrepare: function() {


		// Fork a new browser instance
		browser2 = browser.forkNewDriverInstance();

		// Register the browsers for screenshots
		jasmine.getEnv().addReporter(
			new HtmlScreenshotReporter({
				dest: browser.params.screenshot_dir,
				filename: 'index_cards_test_report.html',
				browsers: [browser,browser2]
			})
		);
	

	},

	onComplete: function(exitCode) {
		browser.quit();
		browser2.quit();
		console.log("All tests finished. Cleaning up...");
	}
};
