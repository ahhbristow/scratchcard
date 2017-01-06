var express = require('express');
var flash = require('connect-flash');
var router = express.Router();
var app = express();

module.exports = function(passport) {

	// Perform authentication with Google
	// We need to pass the request, response and next objects
	// as Mongoose will try and use these
	router.get('/auth/google/:id', function(req,res,next) {
		passport.authenticate('google', {
			scope: ['profile', 'email'],
			state: req.params.id
		})(req,res,next);
	});
	router.get('/auth/google', function(req,res,next) {
		passport.authenticate('google', {
			scope: ['profile', 'email'],
		})(req,res,next);
	});

	// Callback from Google once authenticated
	router.get('/google/callback', function(req,res,next) {
		console.log("Query: " + req.query);
		var session_id = req.query.state;
		console.log("Session ID: " + session_id);
		if (typeof(session_id) != 'undefined') {
			success_redirect = '/#/sessions/' + session_id;
			fail_redirect = '/login/' + session_id;
		} else {
			success_redirect = '/#/sessions';
			fail_redirect = '/login/';
		}

		passport.authenticate('google', {
			successRedirect : success_redirect,
			failureRedirect : fail_redirect
		})(req,res,next);
	});

	// Get login page
	router.get('/login/', function(req, res) {
		res.render('pages/login', {message: req.flash('error'),session_id:''});
	});
	router.get('/login/:id', function(req, res) {
		console.log("Login via session");
		var session_id = req.params.id;
		res.render('pages/login', {message: req.flash('error'),session_id:session_id});
	});

	// Perform logout
	router.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/login');
	});
	
	return router;
}
