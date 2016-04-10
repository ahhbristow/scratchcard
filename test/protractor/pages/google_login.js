var TestConfig = require(__dirname + '/../../../config/test');
var fs = require('fs');
var GoogleLoginPage = function (browser, account) {

	this.browser = browser;
	this.browser.ignoreSynchronization = true;
	

	function writeScreenShot(browser, filename) {
		return browser.takeScreenshot().then(function(png_data) {
			var stream = fs.createWriteStream(filename);
			stream.write(new Buffer(png_data, 'base64'));
			stream.end();
		});
	}

	// Tell this page object which Gmail account to use		
	if (account != 'primary') {
		this.email_address = TestConfig.gmail_2;
		this.password = TestConfig.gmail_password_2;
	} else {
		this.email_address = TestConfig.gmail;
		this.password = TestConfig.gmail_password;
	}

	this.submitEmail = function(email) {
		this.browser.driver.findElement(by.id('Email')).sendKeys(email);
		this.browser.driver.findElement(by.id('next')).click();
	}

	this.submitPassword = function(password) {
		this.browser.driver.sleep(2000);
		this.browser.driver.findElement(by.id('Passwd')).sendKeys(password)
	}

	this.approveAccess = function() {
		var filename = this.email_address + '_approve_access.png';
		writeScreenShot(this.browser,filename);

		this.browser.driver.sleep(4000);
		this.browser.driver.findElement(by.id('submit_approve_access')).click();
		// Last Google page, so enable checking for Angular again
		this.browser.ignoreSynchronization = false;

	}

	this.isQuickLogin = function() {
		var is_quick_login = browser.element(by.id('account-' + TestConfig.gmail)).isPresent();
		return is_quick_login;
	}

	this.performQuickLogin = function() {
		var account_button = this.browser.driver.findElement(by.id('account-' + TestConfig.gmail));
		account_button.click();
	}
	this.performFullLogin = function() {
		var filename = this.email_address + '_before_full_login.png';
		writeScreenShot(this.browser,filename);

		this.submitEmail(this.email_address);
		this.submitPassword(this.password);
		this.browser.driver.findElement(by.id('signIn')).click();
		this.approveAccess();
	}

	// Checks whether the main Google Login page has been loaded
	this.emailPageLoaded = function() {
		return this.browser.element(by.id('Email')).isPresent();
	}
};

module.exports = GoogleLoginPage;
