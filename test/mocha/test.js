// Load the test stuff
process.env.NODE_ENV = "test";
var request = require('supertest');
var assert = require('assert');
var should = require('should');

// Load all the stuff our app loads
var app = require('../../app');

// Load the models
var Session = require('../../models/session');

// Load the routes
var passport = require('passport');
var routes = require('../../routes/sessions')(passport);


/*
 * These are code level unit tests.  They test all the model
 * functions work
 */
describe('Model Tests', function() {
	it('should save a session', function(done) {
		var session = {name: "Demo", cards: []};
		Session.create(session, function() {
			console.log("Session created");
			done();
		});
	});
});



/*
 * These test the routes, which is useful for testing the
 * authentication etc.  You need to pass a faked request object
 * to them
 *
 */
describe('Route Level Tests', function() {
	it('should return "unauthenticated" error', function(done) {
		var req = {};
		var res = {};
		routes(req,res);
	});
});


/*
 * Test using Socket IO
 *
 */
describe('Socket level tests', function {
	it('should return "unauthenticated" error', function(done) {


	});
});


/*
 * These tests just use GET and POST to test the REST API
 */

/*
describe('API Tests', function() {
	it('should show the login screen', function(done){
		request(app).get('/login')
		.set('Accept', 'text/html')
		.expect('Content-Type', 'html')
		.expect(200)
		.end(function(err, res) {
			console.log(res);
			done();
		});
	});
});
*/
