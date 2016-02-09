var LoginPage = require('./pages/login');

// TODO: Some of these scenarios are not independent.  This
// doesn't seem like a big issue at the moment, but it could be
// if the number of scenarios expand, so keep an eye on this.
describe('Registration', function() {
	
	var login_page = new LoginPage();

	// Register a user that can be used in the duplicate email/username
	// scenarios, then logout so we can run some tests.
	beforeAll(function() {
		console.log("Registering test_user");
		login_page.get();
		login_page.register("test_user","test_password","email@email.com");
		browser.get('http://localhost:4072/logout');
		login_page.get();
	});

	// Failure cases
	it('should display an error if the email address is empty',function() {
		login_page.register("non_existent_user","test_password","");
		expect(login_page.hasMissingEmailError()).toBe(true);
	});
	
	it('should display an error if the username is empty',function() {
		login_page.register("","test_password","nonexistentemail@email.com");
		expect(login_page.hasMissingUsernameError()).toBe(true);
	});

	it('should display an error if the password is empty',function() {
		login_page.register("non_existent_user","","nonexistentemail@email.com");
		expect(login_page.hasMissingPasswordError()).toBe(true);
	});

	it('should display an error if the username is already taken',function() {
		login_page.register("test_user","test_password","nonexistentemail@email.com");
		expect(login_page.hasDuplicateUsernameError()).toBe(true);
	});

	it('should display an error if the email address is already used by another user',function() {
		login_page.register("non_existent_user","test_password","email@email.com");
		expect(login_page.hasDuplicateEmailError()).toBe(true);
	});

	//TODO: Invalid email
	//TODO: Weak password


	// Success case
	it('should successfully register the user when the email and username are not in use',function() {
		login_page.register("valid_user","test_password","valid@email.com");
		var username_msg = element(by.id('username')).getText();
		expect(username_msg).toBe('Hello, valid_user');
	
	});
});
