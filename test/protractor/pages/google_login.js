var GoogleLoginPage = function () {

	this.submitEmail = function(email) {
		browser.driver.findElement(by.id('Email')).sendKeys(email);
		browser.driver.findElement(by.id('next')).click();
	}

	this.submitPassword = function(password) {
		browser.driver.sleep(1000);
		browser.driver.findElement(by.id('Passwd')).sendKeys(password)
		browser.driver.findElement(by.id('signIn')).click();
	}

	this.approveAccess = function() {
		browser.driver.sleep(5000);
		browser.driver.findElement(by.id('submit_approve_access')).click();

	}
};

module.exports = GoogleLoginPage;
