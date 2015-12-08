describe('Load session', function() {
	it('should show the same set of cards on both browsers', function() {
		var browser2 = browser.forkNewDriverInstance();
		var element2 = browser2.element;

		// Login with the first browser
		browser.get('http://localhost:4072/');
		element(by.id('username')).sendKeys("sbristow");
		element(by.id('password')).sendKeys("sbristow");
		element(by.id('login')).click();

		// Create a session
		var session_name = "Demo" + Date.now();
		element(by.id('new_session_name')).sendKeys(session_name);
		element(by.id('add_session')).click();

		// Go to that session
		var session_link = element(by.linkText(session_name));
		browser.actions().mouseMove(session_link).click().perform();

		// Check we're on the session by reading the <h1> tag
		expect(element(by.id('session_name')).getText()).toEqual(session_name);

		// Login with the second browser
		browser2.get('http://localhost:4072/');
		element2(by.id('username')).sendKeys("sbristow");
		element2(by.id('password')).sendKeys("sbristow");
		element2(by.id('login')).click();

		// Go to the existing session
		var session_link = element2(by.linkText(session_name));
		browser2.actions().mouseMove(session_link).click().perform();
		
		// Check we're on the session by reading the <h1> tag
		expect(element2(by.id('session_name')).getText()).toEqual(session_name);

		// Create a question with the first browser
		element(by.id("question")).click();

		// Check it appears on browser2
		var cards = element2.all(by.repeater('card in session.cards'));
		expect(cards.count()).toEqual(1);
	});
});
