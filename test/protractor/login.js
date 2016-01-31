var LoginPage = require('./pages/login');
console.log(LoginPage);

describe('Registration', function() {
	
	var login_page = new LoginPage();

	// Logout, just incase some other
	// suites have left the browser logged in
	beforeAll(function() {
		browser.get('http://localhost:4072/logout');
		login_page.get();
	});

	// Failure cases
	it('should display an error if the email address is empty',function() {
		login_page.register("test_user","test_password","");
		expect(login_page.hasMissingEmailError()).toBe(true);
	});
	
	it('should display an error if the username is empty',function() {
		login_page.get();
		login_page.register("","test_password","email@email.com");
		expect(login_page.hasMissingUsernameError()).toBe(true);
	});

	it('should display an error if the password is empty',function() {
		login_page.get();
		login_page.register("test_user","","email@email.com");
		expect(login_page.hasMissingPasswordError()).toBe(true);
	});

	it('should display an error if the username is already taken',function() {
		login_page.get();
		login_page.register("test_user","","email@email.com");
		expect(login_page.hasDuplicateUsernameError()).toBe(true);
	});

	it('should display an error if the email address is already used by another user',function() {
		login_page.get();
		login_page.register("test_user","","email@email.com");
		expect(login_page.hasDuplicateEmailError()).toBe(true);
	});

	//TODO: Invalid email
	//TODO: Weak password


	// Success case
	it('should successfully register the user when the email and username are not in use',function() {
		login_page.get();
		login_page.register("test_user","test_password","email@email.com");
		var username_msg = element(by.id('username')).getText();
		expect(username_msg).toBe('Hello, test_user');
	
	});
});
