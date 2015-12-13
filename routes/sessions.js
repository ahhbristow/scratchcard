var express = require('express');
var router = express.Router();

// Load models
var CardsSession = require(__dirname + '/../models/session.js');
var User = require(__dirname + '/../models/user.js');

// Load Middleware
var auth = require(__dirname + '/../middleware/auth');


module.exports = function(passport) {

	// Get home page (list of sessions)
	router.get('/', auth, function(req, res, next) {
		res.render('pages/index');
	});

	// Perform login
	router.post('/login', passport.authenticate('local',{
		successRedirect:'/',
		failureRedirect:'/login'
	}));

	// Get login page
	router.get('/login', function(req, res) {
		res.render('pages/login');
	});

	// Perform logout
	router.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/login');
	});


	// Perform new registration
	// TODO: Move to middleware
	router.post('/register', function(req, res, next) {
		User.register(new User({ username : req.body.username }), req.body.password, function(err, user) {
			if (err) {
				console.log("Registration error: " + err);
				return res.render('pages/login');
			}
			console.log("Registration successful, redirecting to sessions");
			passport.authenticate('local')(req, res, function () {
				
				res.redirect('/');
			});
		});
	});

	// Get all sessions as JSON
	router.get('/sessions', auth, function(req, res, next) {

		CardsSession.find({}, function (err, data) {
			if (err) return next(err);
			
			var resp = {};
			resp.user = req.user;
			resp.sessions = data;
			res.json(resp);
		});
	});

	// Add new session
	router.post('/sessions', auth, function(req, res, next) {
		console.log("Adding new card");
		CardsSession.create(req.body, function (err, post) {
			if (err) return next(err);
			res.json(post);
		});
	});

	// Get a session as JSON
	router.get('/sessions/:id', auth, function(req, res, next) {
		CardsSession.findById(req.params.id, function (err, data) {
			if (err) return next(err);

			var resp = {};
			resp.user = req.user;
			resp.session = data;
			res.json(resp);
		});
	});

	// Update a session
	router.put('/sessions/:id', auth, function(req, res, next) {
		CardsSession.findByIdAndUpdate(req.params.id, req.body, function (err, post) {
			if (err) return next(err);
			res.json(post);
		});
	});

	// Delete a session
	router.delete('/sessions/:id', auth, function (req, res, next) {
		CardsSession.findByIdAndRemove(req.params.id, function (err, post) {
			if (err) return next(err);
			res.json('{"msg": "success"}');
		});
	});

	return router;
}
