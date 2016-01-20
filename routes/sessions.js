var express = require('express');
var flash = require('connect-flash');
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
		failureRedirect:'/login',
		failureFlash: true
	}));

	// Get login page
	router.get('/login', function(req, res) {
		res.render('pages/login', {message: req.flash('error')});
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

	// TODO: Move to middleware
	// Get all sessions for this user as JSON
	router.get('/sessions', auth, function(req, res, next) {

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
			CardsSession.find({participants: user._id})
			  .populate('participant')
			  .exec(function (err, data) {
				resp.participating_sessions = data;
				console.log(resp);
				res.json(resp);
			});
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
		CardsSession.findById(req.params.id)
	           .populate('participants','username')
		   .exec(function (err, data) {
			if (err) return next(err);

			var resp = {};
			resp.user = req.user;
			resp.session = data;
			console.log(resp);
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
