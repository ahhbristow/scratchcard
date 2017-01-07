var LoginPage = require('./pages/login');
var SessionListPage = require('./pages/session_list');
var SessionPage = require('./pages/session');

describe('Requesting permission to participate in a session',function() {

	var fs = require('fs');

	// abstract writing screen shot to a file
	function writeScreenShot(data, filename) {
		var stream = fs.createWriteStream(filename);
		stream.write(new Buffer(data, 'base64'));
		stream.end();
	}

	var session_list_page = new SessionListPage(browser);
	var login_page = new LoginPage(browser, 'primary');

	var login_page2 = new LoginPage(browser2, 'secondary');

	beforeAll(function() {
		// Logout and back in again
		browser.get('https://localhost:4072/logout/');


		browser.takeScreenshot().then(function (png) {
			writeScreenShot(png, 'browser1_before_login.png');
		}).then(function() {
			login_page.get();
			login_page.login();
		}).then(function() {
			return browser.takeScreenshot();
		}).then(function(png) {
			writeScreenShot(png, 'browser1_after_login.png');
		});

		browser2.get('https://localhost:4072/logout/');
		browser2.takeScreenshot().then(function (png) {
			writeScreenShot(png, 'browser2_before_login.png');
		}).then(function() {
			login_page2.get();
			login_page2.login();
		}).then(function() {
			return browser2.takeScreenshot();
		}).then(function(png) {
			writeScreenShot(png, 'browser2_after_login.png');
		});
	});

	// TODO: An add_session_and_get_link() function would be useful
	it('should allow a user to request participation',function() {
		// Create session with user A
		session_list_page.get();
		var session_name = "Session " + Date.now();
		session_list_page.add_session(session_name);

		var link = session_list_page
		.get_session_link(session_name)
		.getAttribute('href')
		.then(function(link) {

			// Access with user B
			var session_page_2 = new SessionPage(link,browser2);
			session_page_2.get();

			// Button should be there
			expect(session_page_2.get_request_permission_button().isPresent()).toBeTruthy();
		});

	});

	it('should show a message indicating permission has been requested',function() {
		session_list_page.get();
		var session_name = "Session " + Date.now();
		session_list_page.add_session(session_name);

		// Create a new session
		var link = session_list_page
		.get_session_link(session_name)
		.getAttribute('href')
		.then(function(link) {

			// Access with user B
			var session_page_2 = new SessionPage(link,browser2);
			session_page_2.get();

			// Request permission and assert that message shows
			session_page_2.get_request_permission_button().click();
			expect(session_page_2.get_awaiting_approval_message()).toBeTruthy();
		});
	});

	it('should show the owner that another user has requested permission',function() {

		var session_name = "Session " + Date.now();
		session_list_page.get();
		session_list_page.add_session(session_name);
		var session_page_2, session_page_1;

		// Get the link for user A's session 
		var link = session_list_page
		.get_session_link(session_name)
		.getAttribute('href')
		.then(function(link) {

			// Go to session with user A
			session_page_1 = new SessionPage(link,browser);
			session_page_1.get();

			// Go to session with user B
			session_page_2 = new SessionPage(link,browser2);
			session_page_2.get();
			return session_page_2.get_user_id();

		}).then(function(user_id) {
			console.log(user_id);
			session_page_2.get_request_permission_button().click();
			expect(session_page_1.has_pending_participant(user_id).isPresent());
		});
	});

});
