var passportSocketIo = require("passport.socketio");

module.exports = function(io,auth_config,server,cookieParser,sessionStore) {
	//=======================
	// Configure Socket IO
	console.log("Loading Socket.io configuration");
	io.set('transports', ['websocket']);

	io.use(passportSocketIo.authorize({
		cookieParser: cookieParser,
		key:          'connect.sid',
		secret:       auth_config.cookie_secret,
		store:        sessionStore,
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
}
