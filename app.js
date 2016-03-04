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
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var SessionStore = new MongoStore({
	url: mongo_uri
});
app.use(cookieParser());
app.use(session({
	store: SessionStore,
	secret: 'billythefish'
}));

//=======================
// Configure Passport
var passport = require('passport');
var auth_config = require(__dirname + '/config/auth');
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


// Set up a httpserver port
var port = process.env.PORT;
server.listen(port);

// Load routes
var routes = require('./routes/sessions')(passport);
app.use('/', routes);



/* =========== Other functions ============== */

/*
 * app.sync_session
 *
 * Write the entire session object to the DB
 */
app.sync_session = function(session_id) {

	var session_details = app.locals.sessions[session_id];
	var cards = session_details.cards;
	CardsSession.findByIdAndUpdate(session_id, {$set: {cards: cards}}, function (err, updated_session) {
		if (err) {
			console.log(err);
		}

		io.emit('sync', {
			"session_id": session_id,
			"session": session_details
		});
	});
}

// Init empty array of sessions
app.locals.sessions = [];

// ======== Handlers ===============


// Receive socket connection
io.on('connection', function(client) {
	console.log('Client connected...');

	// Get the session from DB and story in memory
	client.on('join', function(data) {
		console.log("Join");
		var session_id = data.session_id;
		client.join(session_id);
		CardsSession.findById(session_id, function (err, session_details) {
			if (err) return next(err);
			app.locals.sessions[session_id] = session_details
		});
	});

	// Client will send a move_end message once
	// dragging has stopped.  We sync at this point
	client.on('move_end', function(data) {
		var session_id = data.session_id;
		app.sync_session(session_id);
	});

	// Update the session
	client.on('move', function(data) {
		app.locals.sessions[data.session_id] = data.session_details;
		client.broadcast.emit('sync', {
			"session_id": data.session_id,
			"session": data.session_details
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
