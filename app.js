var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');


// ====== DB initialise =======

var mongoose = require('mongoose');
mongoose.connect(process.env.MONGOLAB_URI, function(err) {
    if(err) {
        console.log('connection error', err);
    } else {
        console.log('connection successful');
    }
});




// ===== Initialise app =======

var app = express();
var server = require('http').createServer(app);  
var io = require('socket.io')(server);

var Session = require(__dirname + '/models/session.js');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/static', express.static('public'));


// Set up a httpserver on port 4072
server.listen(4072); 

/* =========== Other functions ============== */

/*
 * app.sync_session
 *
 * Write the entire session object to the DB
 */
app.sync_session = function(session_id) {

    var session_details = app.locals.sessions[session_id];
    Session.findByIdAndUpdate(session_id, session_details, function (err, updated_session) {
      if (err) return next(err);
		
      io.emit('sync', {
	      "session_id": session_id,
	      "session": session_details
      });
    });
}

// Init empty array of sessions
app.locals.sessions = [];

// ======== Handlers ===============


// Default route
app.get('/', function(req, res,next) {
	res.sendFile(__dirname + '/views/index.html');
});


// =========================================================
// Menu level routes

/* GET /sessions
 *
 * Retrieves a list of sessions
 */
app.get('/sessions', function(req, res, next) {

  Session.find({}, function (err, post) {

	if (err) return next(err);
	res.json(post);
  });
});


/* POST /sessions
 *
 * Adds a new session
 */
app.post('/sessions', function(req, res, next) {
  console.log("BODY: " + JSON.stringify(req.body));

  Session.create(req.body, function (err, post) {
    if (err) return next(err);
    res.json(post);
  });
});



// =========================================================
// Individual session routes

/* GET /sessions/id 
 *
 *
 */
app.get('/sessions/:id', function(req, res, next) {
  Session.findById(req.params.id, function (err, post) {
	if (err) return next(err);
	console.log(post);
	res.json(post);
  });
});

/* PUT /sessions/:id 
 *
 * Update a session
 */
app.put('/sessions/:id', function(req, res, next) {
  Session.findByIdAndUpdate(req.params.id, req.body, function (err, post) {
    if (err) return next(err);
    res.json(post);
  });
});

/* DELETE /session/id
 *
 * Deletes the specified session
 */
app.delete('/sessions/:id', function (req, res, next) {
  Session.findByIdAndRemove(req.params.id, function (err, post) {
    if (err) return next(err);
    res.json('{"msg": "success"}');
  });
});



// Receive socket connection
io.on('connection', function(client) {  
    console.log('Client connected...');

  
    // Get the session from DB and story in memory 
    client.on('join', function(data) {
	var session_id = data.session_id;
    	client.join(session_id);
  	Session.findById(session_id, function (err, session_details) {
		if (err) return next(err);
		app.locals.sessions[session_id] = session_details
  	});
    });

    // Client will send a move_end message once
    // dragging has stopped.  We sync at this point
    client.on('move_end', function(data) {
       console.log("Saving session to DB");
       var session_id = data.session_id;
       app.sync_session(session_id);
    });
   
    // Update the session 
    client.on('move', function(data) {
        app.locals.sessions[data.session_id] = data.session_details;
	console.log("Updating to: " + JSON.stringify(data.session_details));
        io.emit('sync', {
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
        res.status(err.status || 500);
        res.render('error', {
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
