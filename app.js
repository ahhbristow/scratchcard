var fs = require('fs');
var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

//=======================
// Initialise app
var app = express();
// TODO: How should we set this up properly?
app.locals.cardssessions = [];



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


// TODO: This mess needs tidying up.  "Production" needs
// renaming to 'heroku', because Heroku sorts out all the
// HTTPS stuff and actually strips headers and sends to
// a HTTP app
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
var mongo_uri = process.env.MONGOLAB_URI;
mongoose.connect(mongo_uri, function(err) {
	if(err) {
		console.log('connection error', err);
	} else {
		console.log('connection successful');
	}
});

//=======================
// Configure flash messages
var flash = require('connect-flash');
app.use(flash());

//=======================
// Configure Sessions
if (app.get('env') === 'test') {
	var auth_config = require(__dirname + '/config/test_auth.js');
} else {
	var auth_config = require(__dirname + '/config/auth.js');
}

var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var sessionStore = new MongoStore({
	mongooseConnection: mongoose.connection
});
app.use(cookieParser());
app.use(session({
	store: sessionStore,
	secret: auth_config.cookie_secret
}));

//=======================
// Configure Passport
var passport = require('passport');
var google_auth = require('./init/google_auth.js')(passport, auth_config);

app.use(passport.initialize());
app.use(passport.session());

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

// Load Socket IO config
var io = require('socket.io')(server);
var socket_io = require('./init/websocket.js')(
	io,
	auth_config,
	server,
	cookieParser,
	sessionStore
);

// Load routes
var auth_routes    = require('./routes/auth')(passport)
var session_routes = require('./routes/sessions')();
var socket_routes  = require('./routes/websocket.js')(app,io);
app.use('/', auth_routes);
app.use('/', session_routes);


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
