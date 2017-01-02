module.exports = function(req, res, next) {

	if (req.isAuthenticated()) {
		console.log("Successfully authenticated");
		return next();
	}

	console.log("User not authenticated, redirecting to login screen");
	var session_id = req.params.id;
	console.log("Session ID: " + session_id);
	if(session_id) {
		console.log("Redirecting with session_id");
		res.redirect('/login/' + session_id);
	} else {
		console.log("Redirecting without session_id");
		res.redirect('/login/');
	}

}
