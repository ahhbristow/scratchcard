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

	// Get registration page
	router.get('/register', function(req, res, next) {
		res.render('register');
	});

	// Perform new registration
	router.post('/register', function(req, res) {
		User.register(new User({ username : req.body.username }), req.body.password, function(err, account) {
			if (err) {
				return res.render('register', {user:user});
			}

			passport.authenticate('local')(req, res, function () {
				res.redirect('/');
			});
		});
	});

	// Get all sessions as JSON
	router.get('/sessions', auth, function(req, res, next) {

		CardsSession.find({}, function (err, post) {
			if (err) return next(err);
			res.json(post);
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
		CardsSession.findById(req.params.id, function (err, post) {
			if (err) return next(err);
			res.json(post);
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
