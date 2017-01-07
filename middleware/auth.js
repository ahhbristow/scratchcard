module.exports = function(req, res, next) {

	if (req.isAuthenticated()) {
		console.log("Successfully authenticated");
		return next();
	}

	console.log("User not authenticated, redirecting to login screen");
	var resp = {
		logged_in: 0
	}
	res.json(resp);
}
