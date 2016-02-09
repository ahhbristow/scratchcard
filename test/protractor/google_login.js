var GoogleLoginPage = require('./pages/google_login');
var TestConfig = require(__dirname + '/../../config/test');
describe('Creating a session',function() {

	var session_name;

	beforeAll(function() {
		// Login to the first browser
		browser.driver.get('https://localhost:4072/');
		element(by.id('sign_in_button')).click();
		var google_login_page = new GoogleLoginPage();
		google_login_page.submitEmail(TestConfig.gmail);
		google_login_page.submitPassword(TestConfig.gmail_password);
		google_login_page.approveAccess();

	});

	it('should show the name of the user',function() {
		var username = element(by.id('username')).getText();
		expect(username).toBe('Hello, Shaun Bristow');
	});

});
