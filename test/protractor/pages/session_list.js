var SessionListPage = function() {

	this.has_page_loaded = function() {
		if (element(by.id('title'))) {
			return true;
		} else {
			return false;
		}
	}
};

module.exports = SessionListPage;
