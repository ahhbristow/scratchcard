var cardsSession = require('./../models/session.js');
var sessionManager = require('./../models/session_manager.js');
/*
 * websocket.js
 *
 * This file handles all the websocket activity from
 * connected clients.
 *
 */



var socket_io = function() {}

socket_io.init = function(app,io) {

	this.io = io;
	this.clients = {};
	this.app = app;  // TODO: Remove, to be handled in SessionManager
	var self = this;

	// Receive socket connection
	io.on('connection', function(client) {

		// Store the client
		console.log("Client " + client.request.user + " connected to socket");
		self.clients[client.request.user._id] = client;

		/* 
		 * Handle a "join" session message from a client.
		 *  - Check they have permission to join the SocketIO room for this session
		 */
		client.on('join', function(data) {
			var session_id = data.session_id;
			self.syncSession(client, session_id);

			// If the user has permission, 
			var user = client.request.user;
			console.log("User " + user._id + " wants to connect to session " + session_id);

			var session = sessionManager.getSession(session_id);
			if (session.accessibleBy(user)) {

				// Join the SocketIO room
				client.join(session_id);

				// Add this user to the list of connected users
				// and sync so everyone can see them
				// TODO: Move this to SessionManager
				self.app.locals.cardssessions[session_id].connected_users[user._id] = {
					user: user,
					connected: 1
				}
				self.syncSession(client, session_id);

				console.log("User has permission, connection successful");
			} else {
				console.log("User doesn't have permission to connect");
			}

		});


		// Client will send a move_end message once
		// dragging has stopped.  We sync at this point
		client.on('move_end', function(data) {
			var session_id = data.session_id;
			sessionManager.saveSession(session_id).then(function(res) {

				// TODO: Check res. Should be 0 for success
				console.log("Save completed with code: " + res);

				// TODO:  This is inefficient as we already have the latest session
				// in memory, but it's useful because
				// it allows us to reload the session participants with their
				// extra data (if there are new ones)
				// Read from DB and sync
				//
				// We don't want the caller to get this message as it causes
				// Angular to refresh.  TODO: Bit of a hack
				//
				// TODO: This shouldn't be a problem though surely because the
				// session data should match what the local data is?
				self.syncSession(client, session_id);
			});
		});

		client.on('delete_card', function(data) {

			console.log("Deleting card");
			// TODO: I think there's a security hole here,
			// as we don't check that the user is allowed to
			// actually update this session
			var session_id = data.session_id;

			// Delete the card from in-memory session object
			var session = sessionManager.getSession(session_id);
			var index = session.getIndexOf(data.card._id);

			if (index != -1) {
				session.cards.splice(index, 1);
			}

			// Save entire session and synchronise everyone
			session.save().then(function() {
				self.syncSession(client, session_id);
			});
		});

		client.on('add_card', function(data) {

			// TODO: I think there's a security hole here,
			// as we don't check that the user is allowed to
			// actually update this session
			var session_id = data.session_id;

			var session = sessionManager.getSession(session_id);
			session.cards.push(data.card);
			session.save().then(function() {
				self.syncSession(client, session_id);
			});
		});

		// TODO: Should we check whether handleCardMove was successful?
		client.on('move_card', function(data) {
			sessionManager.handleCardMove(data);
			client.to(data.session_id).emit('card_moved', {
				card: data.card	
			});
		});
		client.on('select_card', function(data) {
			sessionManager.handleCardMove(data);
			client.to(data.session_id).emit('card_selected', {
				card: data.card	
			});
		});



		/*
		 * Handle a request to join a session
		 * TODO: Convert to HTTP?
		 */
		client.on('request_permission',function(data) {

			var user_id = data.user_id;
			var session_id = data.session_id;
			console.log("User " + user_id + " requesting permission to session " + session_id);

			sessionManager.loadSession(session_id).then(function(session) {
				session.requestParticipation(user_id).then(function() {
					// Success
					console.log("Session saved, permission requested");
					client.emit('request_permission_cb', {
						status: "success"
					});
					self.syncSession(client, session_id);

				}).catch(function(err) {
					console.log(err);
					console.log("Session unsaved, permission not requested");
					client.emit('request_permission_cb', {
						status: "error"
					});
				});
			}).catch (function(err) {
				// We couldn't even load the session
				// TODO: We should show an error of
				// some kind.
				//
				// At the moment just silently ignore.
				// Nothing will happen on frontend
			});
		});

	});
}

socket_io.getClient = function(user_id) {

}

/*
 * Tell all clients in a room that a participant has been approved.
 *
 * TODO: How do we tell the actual participant they've been approved?
 * They won't be in the room yet. We'd have to find them?
 *
 */
socket_io.sendParticipantApproved = function(user_id, session_id) {
	// TODO: First check if client is connected
	var client = this.clients[user_id];
	var msg = {
		"session_id": session_id
	}
	client.emit('approved', msg);
}

/* TODO: Replace with save() call
 * app.syncSession
 *
 * Read from the DB and push out to all clients.
 */
socket_io.syncSession = function(client, session_id) {
	console.log("Syncing session (" + session_id + ")");
	sessionManager.loadSession(session_id).then(function(session) {
		// Successfully loaded session
		var connected_users = sessionManager.getConnectedUsers(session_id);
		var msg = {
			"session_id": session_id,
			"session": session,
			"connected_users": connected_users
		}
		socket_io.io.to(session_id).emit('sync', msg);
	}).catch(function(err) {
		console.log(err);	
	});
}

module.exports = socket_io;
