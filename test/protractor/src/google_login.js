var LoginPage = require('./../pages/login');
var SessionListPage = require('./../pages/session_list');
describe('Logging into the app',function() {



	var login_page = new LoginPage(browser,'primary');
	var session_list_page = new SessionListPage(browser);
	beforeAll(function() {
		browser.driver.get('https://' + app_host + ':4072/logout/');
	});
	afterAll(function() {
		browser.driver.get('https://' + app_host + ':4072/logout/');
	});




	it('should show the home page',function() {
		login_page.get();
		expect(login_page.hasGoogleSignIn()).toBe(true);
	});

	it('should redirect to the sessions screen after logging in via Google',function() {
		login_page.get();
		login_page.login();
		expect(session_list_page.has_page_loaded()).toBe(true);
	});

	it('should redirect to the login screen if not logged in',function() {
		// Given
		// Create a session
		// Logout

		// When
		// Access the session

		// Then
		// Assert that we're redirected to the login screen
	});

	it('should redirect to the session after logging in via Google, if previously redirected to login from a session',function() {
		// Given
		// Create a session
		// Logout

		// When
		// Access session
		// Log in
		
		// Then
		// Redirected to session

	});
	
	
	it('should redirect to the login screen after logging out',function() {

	});
});
