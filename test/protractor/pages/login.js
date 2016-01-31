var LoginPage = function () {

	this.get = function() {
		browser.get('http://localhost:4072/');
	}

	// TODO: Make this look for a specific email
	// error
	this.hasMissingEmailError = function() {
		return element(by.id('error_messages')).isPresent();
	}
	this.hasMissingPasswordError = function() {
		return element(by.id('error_messages')).isPresent();
	}
	this.hasMissingUsernameError = function() {
		return element(by.id('error_messages')).isPresent();
	}
	this.hasDuplicateEmailError = function() {
		return element(by.id('error_messages')).isPresent();
	}
	this.hasDuplicateUsernameError = function() {
		return element(by.id('error_messages')).isPresent();
	}

	this.register = function(username,password,email) {
		element(by.id('new_username')).click();
		element(by.id('new_username')).sendKeys(username);
		element(by.id('new_password')).click();
		element(by.id('new_password')).sendKeys(password);
		element(by.id('new_email')).click();
		element(by.id('new_email')).sendKeys(email);
		element(by.id('register')).click();
	}
};

module.exports = LoginPage;
