var SessionPage = function(url,browser) {
	
	this.url = url;
	this.browser = browser;
	
	var page = this;
	this.get = function() {
		console.log("Retrieving session from: " + url);
		page.browser.get(url);
	}

	this.has_page_loaded = function() {
		if (this.browser.element(by.id('title'))) {
			return true;
		} else {
			return false;
		}
	}

	this.get_request_permission_button = function() {
		return this.browser.element(by.id('request_permission'));
	}
	
	this.get_awaiting_approval_message = function() {
		return this.browser.element(by.id('awaiting_approval_msg'));
	}

	this.has_pending_participant = function(user_id) {
		var xpath = '//li[@data-id="' + user_id + '"]';
		return this.browser.element(by.xpath(xpath));
	}

	// TODO: Move to a 'user' page object
	// Retrieve the user_id of the logged in user
	this.get_user_id = function() {
		return this.browser.element(by.id('menu_controls')).getAttribute('data-user_id');
	
	}
};

module.exports = SessionPage;
