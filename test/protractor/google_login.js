var LoginPage = require('./pages/login');
var SessionListPage = require('./pages/session_list');
describe('Logging into the app',function() {

	var login_page = new LoginPage();
	var session_list_page = new SessionListPage();

	it('should show the home page',function() {
		login_page.get();
		expect(login_page.has_google_sign_in()).toBe(true);
	});

	it('should redirect to the sessions screen after logging in via Google',function() {
		login_page.get();
		login_page.login();

		expect(session_list_page.has_page_loaded()).toBe(true);
	});
});
