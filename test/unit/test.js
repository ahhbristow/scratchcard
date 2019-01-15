var sinon = require('sinon');
var chai = require('chai');
var expect = chai.expect;
var assert = chai.assert;
var mongoose = require('mongoose');
require('sinon-mongoose');

var SessionManager = require('../../models/session_manager');
var SessionRoutes = require('../../routes/sessions');
var Session = require('../../models/session');

/*
 * These are code level unit tests.  They test all the model
 * functions work
 */
describe('Model Tests', function() {

	// Setup some stuff
	SessionManager.app = {};
	SessionManager.app.locals = {
		cardssessions: {}
	};

	// A session was returned from the DB
	it("should load a session into memory", function(done) {
		var mock = sinon.mock(Session)
		  .expects('findById')
		  .withArgs(sinon.match.string)
		  .chain('populate')
		  .withArgs(sinon.match.string)
		  .chain('exec')
		  .resolves("some_session_that_needs_mocking");

		SessionManager.loadSession("1").then(function() {
			var loaded_session = SessionManager.app.locals.cardssessions["1"].session;
			console.log(loaded_session);
			assert(
			  loaded_session == "some_session_that_needs_mocking",
			  "ERROR"
			);
			done();
		}).catch(function(err) {
			done(err);
		});
		Session.findById.restore();
	});


	// A session was returned from the DB
	it("should return an error because the session didn't exist", function(done) {
		var mock = sinon.mock(Session)
		  .expects('findById')
		  .withArgs(sinon.match.string)
		  .chain('populate')
		  .withArgs(sinon.match.string)
		  .chain('exec')
		  .rejects(Error("SessionMock: Could not load session"));

		SessionManager.loadSession("1").then(function() {
			done(Error("Expected to not be able to load session"));
		}).catch(function(err) {
			// We just need to check we got here
			assert(true);
			done();
		});
		Session.findById.restore();
	});

	// A card was moved by a client
	it("should update the card position in memory", function(done) {
		socket_data = {};
		SessionManager.handleCardMove(socket_data);

		// TODO: Check that the session was updating in mem
		//
		done();
	});
	//
	// Assert card_move: not in memory
	//
	// Assert join
});