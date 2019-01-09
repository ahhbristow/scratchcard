/*
 * The SessionManager is a singleton object that manages
 * the sessions in memory (stored in app.locals)
 *
 *
 *
 */

var cardsSession = require('./../models/session.js');

var SessionManager = function() {
}


/*
 * Load the session into global memory (cardssessions)
 *
 */
SessionManager.loadSession = function(session_id) {
	console.log("Loading session from DB: " + session_id);
	return new Promise(function(resolve, reject) {
		cardsSession.getSession(session_id).then(function(session) {

			// Update global mem
			// TODO: Handle the error case, session will be null
			if (session) {
				try {
					this.app.locals.cardssessions[session_id] = {};
					this.app.locals.cardssessions[session_id].session = session;
					this.app.locals.cardssessions[session_id].connected_users = {};
					console.log("Loaded session (" + session_id + ") from DB");
					resolve(session);
				} catch (error) {
					console.log(error);
					reject(Error("Unable to update session in memory"));
				}
			} else {
				console.log("Could not load session (" + session_id + ") from DB");
				reject(Error("Unable to load session"));
			}
		});
	})

}

/*
 * Return the session as it is in memory (cardssessions)
 *
 */
SessionManager.getSession = function(session_id) {

	if (typeof this.app.locals.cardssessions[session_id] != 'undefined') {
		return this.app.locals.cardssessions[session_id].session; 
	} else {
		return null;
	}
}

// TODO: Does this need protecting?
SessionManager.getConnectedUsers = function(session_id) {
	return this.app.locals.cardssessions[session_id].connected_users;
}

/*
 * TODO: Can't we just return the promise from save()?
 */
SessionManager.saveSession = function(session_id) {
	var session = this.getSession(session_id);
	if (!session) {
		return new Promise(function(resolve, reject) {
			SessionManager.loadSession(session_id).then(function(session) {
				session.save().then(function() {
					resolve(0);
				}, function(err) {
					reject(1);
				});
			})
			.catch(function(err) {
				console.log(err);	
			});
		});
	}

	return new Promise(function(resolve, reject) {
		session.save().then(function() {
			resolve(0);
		}, function(err) {
			reject(1);
		});
	});
}


// TODO: Push down to the session model?
//
// The sessionManager should only be responsible for managing
// cardssessions.  The session model itself should have all the
// other functions on.  If a websocket command needs to update a session
// then it can use the session manager to retrieve the session object
SessionManager.deleteCard = function(session_id) {

}

module.exports = SessionManager;
