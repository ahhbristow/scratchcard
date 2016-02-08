describe('Creating a session',function() {

	var session_name;

	it('should show the name of the user',function() {
		var username = element(by.id('username')).getText();
		expect(username).toBe('Hello, Shaun Bristow');
	});

});
