var fs = require('fs');
var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

//=======================
// Initialise app
var app = express();


// Heroku handles SSL, so we should run the app as a
// HTTP server in production.  If the browser has come
// to the app through HTTP, then redirect to HTTPS.
// Heroku passes traffic on both protocols through to the
// single port the app is configured to listen on.
//
// TODO: Move to a middleware file.
function redirectToHTTPS(req,res,next) {
	if (req.headers['x-forwarded-proto'] != 'https') {
		res.redirect('https://' + req.hostname + req.originalUrl);
		console.log("Redirecting to https://" + req.hostname + req.originalUrl);
	} else {
		next() /* Continue to other routes if we're not redirecting */
	}
}

if (app.get('env') === 'production') {
	var server = require('http').createServer(app);
	app.use('*',redirectToHTTPS);
} else {
	// Load the self-signed certificate
	var private_key  = fs.readFileSync('certs/server.key');
	var private_cert = fs.readFileSync('certs/server.crt');
	var credentials = {key: private_key, cert: private_cert};

	var server = require('https').createServer(credentials,app);
}


//=======================
// Load in the config file
var env = app.get('env');
console.log("Loading: " + env);
var config = require(__dirname + '/config/' + env);


//=======================
// Init DB
var mongoose = require('mongoose');
var mongo_uri = config.mongo_uri;
mongoose.connect(mongo_uri, function(err) {
	if(err) {
		console.log('connection error', err);
	} else {
		console.log('connection successful');
	}
});

//=======================
// Load models
var CardsSession = require(__dirname + '/models/session.js');
var User = require(__dirname + '/models/user.js');

//=======================
// Configure flash messages
var flash = require('connect-flash');
app.use(flash());

//=======================
// Configure Sessions
var auth_config = require(__dirname + '/config/auth');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var SessionStore = new MongoStore({
	url: mongo_uri
});
app.use(cookieParser());
app.use(session({
	store: SessionStore,
	secret: auth_config.cookie_secret
}));

//=======================
// Configure Passport
var passport = require('passport');
var google_auth = require(__dirname + '/init/google_auth.js')(passport, auth_config);

app.use(passport.initialize());
app.use(passport.session());

//=======================
// Configure Socket IO
var io = require('socket.io')(server);
io.set('transports', ['websocket']);


//=======================
// Socket auth
var passportSocketIo = require("passport.socketio");
io.use(passportSocketIo.authorize({
  cookieParser: cookieParser,
  key:          'connect.sid',
  secret:       auth_config.cookie_secret,
  store:        SessionStore,
  success:      onAuthorizeSuccess,
  fail:         onAuthorizeFail,
}));
function onAuthorizeSuccess(data,accept) {
	console.log('SUCCESSFUL connection to socket.io');
	accept(null,true);
}
function onAuthorizeFail(data,message,error,accept) {
	console.log('FAILED connection to socket.io: ' + message);
	accept(null,false);
}

//=======================
// View engine setup.  Uses EJS
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/static', express.static('public'));


// Set up a httpserver on port 4072
var port = process.env.PORT || 4072;
server.listen(port); 

// Load routes
var routes = require('./routes/sessions')(passport);
app.use('/', routes);



/* =========== Other functions ============== */

/* TODO: Replace with save() call
 * app.sync_session
 *
 * Write the entire session object to the DB
 */
app.sync_session = function(session_id) {

	console.log("Synchronising to all clients");

	// Read the session from the DB
	CardsSession.getSession(session_id).then(function(session) {

		console.log("Retrieved session " + session_id + " from DB as");
		console.log(session);		

		// Update global mem
		app.locals.cardssessions[session_id].session = session;
		
		// Push to all clients
		var connected_users = app.locals.cardssessions[session_id].connected_users;
		io.emit('sync', {
			"session_id": session_id,
			"session": session,
			"connected_users": connected_users
		});
	});
}

// Init empty array of sessions
app.locals.cardssessions = [];

// ======== Handlers ===============


// Receive socket connection
io.on('connection', function(client) {
	
	// Add the client to the connected clients for the specified session 
	client.on('join', function(data) {
		var user_id = data.user_id;
		var session_id = data.session_id;
		console.log("User " + user_id + " joining session " + session_id);

		// Get the participant, and set it to connected
		var session = app.locals.cardssessions[data.session_id].session;
		var participant = session.getParticipant(user_id);
		app.locals.cardssessions[session_id].connected_users[user_id] = {
			user: participant,
			connected: 1
		}

		// Sync the entire session so all clients receive the update
		app.sync_session(session_id);	
	});


	// Client will send a move_end message once
	// dragging has stopped.  We sync at this point
	client.on('move_end', function(data) {
		console.log("Client has stopped dragging.  Saving session");
		var session_id = data.session_id;

		// Write to DB
		var session = app.locals.cardssessions[session_id].session;
		console.log("Saving session to DB as:");
		console.log(session);
		session.save().then(function() {

			// TODO:  This is inefficient as we already have the latest session
			// in memory, but it's useful because
			// it allows us to reload the session participants with their
			// extra data (if there are new ones)
			// Read from DB and sync
			app.sync_session(session_id);
		});
	});



	// Update the session
	// TODO: There's a security hole here where the user can
	// basically do whatever they want to the session and
	// get it saved in the DB. Need to filter the user input 
	client.on('move', function(data) {
		app.locals.cardssessions[data.session_id].session.cards = data.session_details.cards;
		client.broadcast.emit('sync', {
			"session_id": data.session_id,
			"session": app.locals.cardssessions[data.session_id].session
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
			app.sync_session(session_id);

		},function() {
			// Error
			console.log("Session unsaved, permission not requested");
			client.emit('request_permission_cb', {
				status: "error"
			});
		});

	});

});


/* =========== Error Handling ================ */

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
	app.use(function(err, req, res, next) {
		console.log(err.stack )
		res.status(err.status || 500);
		res.render('pages/error', {
			message: err.message,
			error: err
		});
	});
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
	res.status(err.status || 500);
	res.render('error', {
		message: err.message,
		error: {}
	});
});


module.exports = app;
