var http = require('http');
var dispatcher = require('httpdispatcher');

const PORT=8080

function handleRequest(req, res) {
	dispatcher.dispatch(req,res);
}

function getToken() {
	var token = require('./resources/token.json');
	return token;
}

dispatcher.setStatic('resources');


dispatcher.onPost('/token',function(req,res) {
	var code = req.params.code;
	res.setHeader('Content-Type', 'application/json');
	var token = require('./resources/token_' + code + '.json');
	res.end(JSON.stringify(token));
});
dispatcher.onGet('/profile',function(req,res) {
	res.setHeader('Content-Type', 'application/json');
	var access_token = req.params.access_token;
	var profile = require('./resources/profile_' + access_token + '.json');
	res.end(JSON.stringify(profile) + "\n\n");
});

var server = http.createServer(handleRequest);

server.listen(PORT,function() {
	console.log("Mock Google server started");	
});

