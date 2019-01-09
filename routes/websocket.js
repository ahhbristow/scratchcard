var cardsSession = require('./../models/session.js');
var sessionManager = require('./../models/session_manager.js');
/*
 * websocket.js
 *
 * This file handles all the websocket activity from
 * connected clients.
 *
 */



var socket_io = function(app, io) {

	// Socket IO object needs to know
	// about the app to be able to update
	// the in memory objects
	sessionManager.app = app;
	this.app = app;
	this.io = io;

	console.log("Setting up websocket routes");

	/* TODO: Replace with save() call
	 * app.sync_session
	 *
	 * Read from the DB and push out to all clients.  If send_to_caller
	 * is 1 then we should send the message to all clients including the
	 * initiator
	 */
	this.sync_session = function(client, send_to_caller, session_id) {

		console.log("Syncing session (" + session_id + ")");
		var socket_io = this;
		sessionManager.loadSession(session_id).then(function(session) {

			// Successfully loaded session

			var connected_users = sessionManager.getConnectedUsers(session_id);
			var msg = {
				"session_id": session_id,
				"session": session,
				"connected_users": connected_users
			}
			if (send_to_caller) {
				socket_io.io.to(session_id).emit('sync', msg);
			} else {
				client.to(session_id).emit('sync', msg);
			}
		})
			.catch(function(err) {
				console.log(err);	
			});
	}

	// Receive socket connection
	var socket_io = this;
	io.on('connection', function(client) {
		console.log("Client " + client.request.user + " connected to socket");

		/* 
		 * Handle a "join" session message from a client.
		 *  - Check they have permission to join the SocketIO room for this session
		 */
		client.on('join', function(data) {
			var session_id = data.session_id;
			socket_io.sync_session(client, 1, session_id);

			// If the user has permission, 
			var user = client.request.user;
			console.log("User " + user._id + " wants to connect to session " + session_id);

			var session = sessionManager.getSession(session_id);
			if (session.accessibleBy(user)) {

				// Join the SocketIO room
				client.join(session_id);

				// Add this user to the list of connected users
				// and sync so everyone can see them
				app.locals.cardssessions[session_id].connected_users[user._id] = {
					user: user,
					connected: 1
				}
				socket_io.sync_session(client, 1, session_id);

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
				sync_session(client, 1, session_id);
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
				socket_io.sync_session(client, 1, session_id);
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
				socket_io.sync_session(client, 1, session_id);
			});
		});

		client.on('move_card', function(data) {

			// TODO: Validate websocket data.  We should do this everywhere
			var session_id = data.session_id;
			if (typeof (app.locals.cardssessions[session_id]) == 'undefined') {
				console.log("Session (id = " + session_id + ") not in memory, loading");
				socket_io.sync_session(client, 1, session_id);
			} else {
				// Update the in-memory session
				//
				// TODO: There is a defect here.  cardssessions is undefined
				//
				// The session may not have been initialised.  Fix. Upon reconnection from a client
				// we need to reload the session that they were trying to view.
				var session = app.locals.cardssessions[session_id].session;
				var card_id = data.card._id;
				var card = session.findCard(card_id);

				card.x = data.card.x;
				card.y = data.card.y;
				card.text = data.card.text;

				client.to(session_id).emit('card_moved', {
					card: data.card	
				});
			}
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
					socket_io.sync_session(client, 1, session_id);

				})
				.catch(function(err) {
					console.log(err);
					console.log("Session unsaved, permission not requested");
					client.emit('request_permission_cb', {
						status: "error"
					});
				});
			})
			.catch (function(err) {
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

module.exports = socket_io;
