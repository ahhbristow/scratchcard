var express = require('express');
var flash = require('connect-flash');
var router = express.Router();

// Load models
var CardsSession = require(__dirname + '/../models/session.js');
var User = require(__dirname + '/../models/user.js');

// Load Middleware
var auth = require(__dirname + '/../middleware/auth');

var sessionManager = require('./../models/session_manager.js');
var SocketRouter = require('./../routes/websocket');

/*
 * Singleton to handle routing.
 */
var SessionRoutes = function() {

	// Get home page (list of sessions)
	router.get('/',function(req, res, next) {
		res.render('pages/index');
	});

	// Get a session as JSON.  If user doesn't have permission
	// then return an error.
	//
	// Store the session in global mem
	router.get('/api/sessions', auth, function(req, res, next) {

		// Get all the sessions where the creator is the user we're
		// logged in as.
		var user = req.user;
		CardsSession.find({creator: user._id})
			.populate('creator','username')
			.exec(function (err, data) {
				if (err) return next(err);

				var resp = {};
				resp.user = user;
				resp.sessions = data;

				// Get participating sessions
				CardsSession.find({'participants.user_id': user._id})
					.populate('participant')
					.exec(function (err, data) {
						resp.participating_sessions = data;
						res.json(resp);
					});
			});
	});

	// Add new session
	router.post('/api/sessions', auth, function(req, res, next) {
		console.log("Adding new card");

		// Generate a random hash to use in the URL as a
		// session ID

		CardsSession.create(req.body, function (err, post) {
			if (err) return next(err);
			res.json(post);
		});
	});

	// Get a session as JSON
	router.get('/api/sessions/:id', auth, function(req, res, next) {

		CardsSession.getSession(req.params.id).then(function(session) {
			console.log("Retrieved session " + req.params.id);

			var resp = {};
			var user = req.user;
			resp.user = user;

			// If the user doesn't have permission to view this,
			// return an error
			if (session.accessibleBy(user)) {
				console.log("User " + user.id + " has permission to view the session");
				resp.has_permission = 1;
				resp.session = session;
			} else {
				console.log("User " + user.id + " does not have permission to view the session");
				resp.session = {};
				resp.has_permission = 0;
				resp.permission_requested = session.hasPending(user);
			}

			// If we haven't already, put this session
			// in global mem to make it available for
			// updates by all clients
			if (typeof(req.app.locals.cardssessions[session._id]) == "undefined") {
				console.log("Storing session in global memory");
				req.app.locals.cardssessions[session._id] = {};
				req.app.locals.cardssessions[session._id].connected_users = {};
			}
			req.app.locals.cardssessions[session._id].session = session;
			res.json(resp);
		});
	});


	// Approve a participant.  Update internal representation
	// of session and return it
	router.put('/api/sessions/:session_id/approveParticipant/:user_id', auth, function(req, res, next) {
		var user_id = req.params.user_id;
		var session_id = req.params.session_id;

		// TODO: I think the HTTP and Websocket routes should just be combined into a
		// single router object that handles all incoming messages and calls
		// the SessionManager as required.
		sessionManager.handleApproveParticipant(user_id, session_id).then(function() {
			console.log("User approved");
			SocketRouter.sendParticipantApproved(user_id,session_id);
			res.json({"status": 1});
		}).catch(function(err) {
			console.log(err);
		});

	});

	// Update a session
	router.put('/api/sessions/:id', auth, function(req, res, next) {
		CardsSession.findByIdAndUpdate(req.params.id, req.body, function (err, post) {
			if (err) return next(err);
			res.json(post);
		});
	});

	// Delete a session
	router.delete('/api/sessions/:id', auth, function (req, res, next) {
		CardsSession.findByIdAndRemove(req.params.id, function (err, post) {
			if (err) return next(err);
			res.json('{"msg": "success"}');
		});
	});

	return router;
}

module.exports = SessionRoutes;
