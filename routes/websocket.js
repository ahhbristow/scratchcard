var cardsSession = require('./../models/session.js');

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

		// Read the session from the DB
		var socket_io = this;
		cardsSession.getSession(session_id).then(function(session) {

			// Update global mem
			socket_io.app.locals.cardssessions[session_id].session = session;

			// Push to all clients
			var connected_users = socket_io.app.locals.cardssessions[session_id].connected_users;
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
		});
	}

	/*
	 * Push out to all clients without reloading from the DB.
	 * Used for handling updates to card positions, where we
	 * don't need to sync major session updates (such as new
	 * participant)
	 */
	this.soft_sync_session = function(client, session_id) {

		var socket_io = this;
		client.to(session_id).emit('sync', {
			"session_id"     : session_id,
			"session"        : socket_io.app.locals.cardssessions[session_id].session,
			"connected_users": socket_io.app.locals.cardssessions[session_id].connected_users
		});
	}


	// Receive socket connection
	var socket_io = this;
	io.on('connection', function(client) {

		console.log("Client connected to websocket");

		// Add the client to the connected clients for the specified session 
		client.on('join', function(data) {

			// Client is asking to join the room for this session
			// Check they're allowed to
			var user = client.request.user;
			var session_id = data.session_id;
			console.log("User " + user._id + " wants to connect to session " + session_id);

			// Get the participant, and set it to connected
			var session = app.locals.cardssessions[data.session_id].session;
			if (session.accessibleBy(user)) {
				client.join(session_id);

				app.locals.cardssessions[session_id].connected_users[user._id] = {
					user: user,
			connected: 1
				}
				console.log("User has permission, connection successful");
			} else {
				console.log("User doesn't have permission to connect");
			}

			// Sync the entire session so all clients receive the update
			socket_io.sync_session(client, 1, session_id);	
		});


		// Client will send a move_end message once
		// dragging has stopped.  We sync at this point
		client.on('move_end', function(data) {
			console.log("Received move_end. Saving session to DB")
			var session_id = data.session_id;

			// Write to DB
			var session = app.locals.cardssessions[session_id].session;
			session.save().then(function() {

				// TODO:  This is inefficient as we already have the latest session
				// in memory, but it's useful because
				// it allows us to reload the session participants with their
				// extra data (if there are new ones)
				// Read from DB and sync
				//
				// We don't want the caller to get this message as it causes
				// Angular to refresh.  TODO: Bit of a hack
				console.log("Saved to DB");
				socket_io.sync_session(client, 0, session_id);
			});
		});

		client.on('delete_card', function(data) {

			console.log("Deleting card");
			// TODO: I think there's a security hole here,
			// as we don't check that the user is allowed to
			// actually update this session
			var session_id = data.session_id;
			
			// Delete the card from in-memory session object
			var session = app.locals.cardssessions[session_id].session;
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
			
			// Update the in-memory session
			var session = app.locals.cardssessions[session_id].session;
			session.cards.push(data.card);
		
			// Save entire session and synchronise everyone
			session.save().then(function() {
				socket_io.sync_session(client, 1, session_id);
			});
		});

		client.on('move_card', function(data) {
			var session_id = data.session_id;
			
			// Update the in-memory session
			var session = app.locals.cardssessions[session_id].session;
			var card_id = data.card._id;
			var card = session.findCard(card_id);
			
			card.x = data.card.x;
			card.y = data.card.y;
			card.text = data.card.text;

			client.to(session_id).emit('card_moved', {
				card: data.card	
			});
		});

		// Handle a request to join a session
		// TODO: Convert to HTTP?
		client.on('request_permission',function(data) {

			var user_id = data.user_id;
			var session_id = data.session_id;
			console.log("User " + user_id + " requesting permission to session " + session_id);

			var session = app.locals.cardssessions[session_id].session;
			session.requestParticipation(user_id).then(function() {
				// Success
				console.log("Session saved, permission requested");
				client.emit('request_permission_cb', {
					status: "success"
				});
				socket_io.sync_session(client, 1, session_id);

			},function() {
				// Error
				console.log("Session unsaved, permission not requested");
				client.emit('request_permission_cb', {
					status: "error"
				});
			});

		});

	});
}

module.exports = socket_io;
