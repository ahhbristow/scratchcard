var SessionListPage = function(browser) {

	this.browser = browser;

	this.get = function() {
		this.browser.get('https://localhost:4072/');
	}

	this.has_page_loaded = function() {
		if (this.browser.element(by.id('title'))) {
			return true;
		} else {
			return false;
		}
	}

	this.add_session = function(session_name) {
		this.browser.element(by.id('new_session_name')).sendKeys(session_name);
		this.browser.element(by.id('add_session')).click();
	};

	this.get_session_link = function(session_name) {
		console.log("Getting link for " + session_name);
		return this.browser.element(by.linkText(session_name));
	}
};

module.exports = SessionListPage;
