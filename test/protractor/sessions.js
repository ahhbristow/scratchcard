var LoginPage = require('./pages/login');
var SessionListPage = require('./pages/session_list');
describe('Creating and accessing sessions',function() {

	var session_list_page = new SessionListPage(browser);
	var login_page = new LoginPage(browser,'primary');

	beforeAll(function() {
		// Logout and back in again
		browser.get('https://localhost:4072/logout/');
		login_page.get();
		login_page.login();
	});

	//it('should ',function() {});
	
	it('should create a new session and display it without a page refresh',function() {
		session_list_page.get();
		session_list_page.add_session('Test Session');
		expect(session_list_page.get_session_link('Test Session')).not.toBe(null);
	});

	it('should display sessions the user has already created on page load',function() {
		// Create a session
		session_list_page.get();
		session_list_page.add_session('An existing session');

		// Navigate to the sessions page again
		session_list_page.get();
		expect(session_list_page.get_session_link('An existing session')).not.toBe(null);


	});
	//it('should display sessions the user is participating in',function() {});
	//it('should not display sessions other users have created',function() {});
	//it('should display the session when clicking on the session name',function() {});
	//it('should error if accessing a session the user has not created or is participating in',function() {});
});
