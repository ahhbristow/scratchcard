/*
 * The SessionManager is a singleton object that manages
 * the sessions in memory (stored in app.locals)
 *
 *
 *
 */

var cardsSession = require('./../models/session.js');

var SessionManager = function() {}

SessionManager.init = function(app) {
	this.app = app;
}

/*
 * Handle a card move message from a client, updating the card
 * position in memory.
 *
 * If the session isn't present, we just drop messages and do
 * a session reload on the move_end message
 *
 * TODO: Can't we just put data.card straight into card?  Why do we need to read every
 * var and copy?
 */
SessionManager.handleCardMove = function(data) {
	// TODO: Validate websocket data.  We should do this everywhere
	var session_id = data.session_id;
	var session = this.getSession(session_id);
	if (!session) {
		console.log("ERROR: SessionManager.handleCardMove(): session not in memory");
		return;
	} else {
		var card_id = data.card._id;
		var card = session.findCard(card_id);

		card.x = data.card.x;
		card.y = data.card.y;
		card.z = data.card.z;
		card.text = data.card.text;
		session.max_z = data.max_z;
	}
}


/*
 * Load the session into global memory (cardssessions)
 *
 */
SessionManager.loadSession = function(session_id) {

	var sess_mgr = this;

	console.log("INFO: SessionManager.loadSession: Loading session from DB: " + session_id);
	return new Promise(function(resolve, reject) {
		cardsSession.getSession(session_id).then(function(session) {
			sess_mgr.app.locals.cardssessions[session_id] = {};
			sess_mgr.app.locals.cardssessions[session_id].session = session;
			sess_mgr.app.locals.cardssessions[session_id].connected_users = {};
			console.log("INFO: SessionManager.loadSession: Loaded session (" + session_id + ") from DB");
			resolve(session);
		})
			.catch(function(err) {
				console.log(err);
				reject(Error("ERROR: SessionManager.loadSession() - Could not load session from DB"));
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

/*
 * Loads the session if it doesn't exist and approves the participant.  Todo:
 * should this be pushed down to the session itself?
 *
 * No, because the sessionManager looks after all the in-memory sessions
 * and the Mongoose model doesn't know about this.
 *
 */
SessionManager.handleApproveParticipant = function(user_id, session_id) {
	return this.loadSession(session_id).then(function(session) {
		console.log("SessionRoutes.handleApproveParticipant: Loaded session");
		var approval_outcome = session.approveParticipant(user_id);
		return approval_outcome;
	}).catch(function() {
		return Error("Could not approve");
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
