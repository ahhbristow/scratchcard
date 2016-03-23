var TestConfig = require(__dirname + '/../../../config/test');
var GoogleLoginPage = function () {
		
	browser.ignoreSynchronization = true;

	this.submitEmail = function(email) {
		browser.driver.findElement(by.id('Email')).sendKeys(email);
		browser.driver.findElement(by.id('next')).click();
	}

	this.submitPassword = function(password) {
		browser.driver.sleep(2000);
		browser.driver.findElement(by.id('Passwd')).sendKeys(password)
	}

	this.approveAccess = function() {
		browser.driver.sleep(4000);
		browser.driver.findElement(by.id('submit_approve_access')).click();
		// Last Google page, so enable checking for Angular again
		browser.ignoreSynchronization = false;

	}

	this.isQuickLogin = function() {
		var is_quick_login = element(by.id('account-' + TestConfig.gmail)).isPresent();
		return is_quick_login;
	}

	this.performQuickLogin = function() {
		var account_button = browser.driver.findElement(by.id('account-' + TestConfig.gmail));
		account_button.click();
	}
	this.performFullLogin = function() {
		this.submitEmail(TestConfig.gmail);
		this.submitPassword(TestConfig.gmail_password);
		browser.driver.findElement(by.id('signIn')).click();
		this.approveAccess();
	}

	// Checks whether the main Google Login page has been loaded
	this.emailPageLoaded = function() {
		return element(by.id('Email')).isPresent();
	}
};

module.exports = GoogleLoginPage;
