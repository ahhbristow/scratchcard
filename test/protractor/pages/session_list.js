var SessionListPage = function() {

	this.get = function() {
		browser.get('https://localhost:4072/');
	}

	this.has_page_loaded = function() {
		if (element(by.id('title'))) {
			return true;
		} else {
			return false;
		}
	}

	this.add_session = function(session_name) {
		element(by.id('new_session_name')).sendKeys(session_name);
		element(by.id('add_session')).click();
	};

	this.get_session_link = function(session_name) {
		return element(by.linkText(session_name));
	}
};

module.exports = SessionListPage;
