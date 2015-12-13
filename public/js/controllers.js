'use strict';

/* Controllers */

var cardsControllers = angular.module('cardsControllers', []);

/*
 * CardsCtrl - controller for a particular session
 *
 */
cardsControllers.controller('CardsCtrl', ['$scope','$http','$routeParams','$location','socket',function ($scope,$http,$routeParams,$location,socket) {

	// Init
	$scope.session_id = $routeParams.sessionId;
	$scope.session = {};


	// Delete session and redirect to main page
	$scope.deleteSession = function() {
		$http.delete("/sessions/" + $scope.session_id).success(function (response) {
			console.log(response);
			$location.path('/sessions');
		});
		
	}

	$scope.deleteCard = function(card, event) {
		// CTRL key must be pressed to do deletion
		if (event.ctrlKey) {
			console.log("Deleting: " + card._id);
			var index = $scope.session.cards.indexOf(card);
			$scope.session.cards.splice(index, 1);
			$scope.syncSession();
			$scope.writeSession();
		}
	}
	$scope.addCard = function(card_type, event) {
		var card = {text: "", x: event.pageX, y: event.pageY-300, type: card_type};
		this.session.cards.push(card);
		$scope.syncSession();
		$scope.writeSession();
	}

	// Initial retrieval of cards
	$scope.getCards = function(session_id) {
		$http.get("/sessions/" + session_id).success(function (response) {
			$scope.user = response.user;
			$scope.session = response.session;
		});
	}
	$scope.getCards($scope.session_id);
	

	// Handlers for moving cards
	//
	
	// Tells the server to write what it has to the DB
	$scope.writeSession = function() {
		console.log("Sending move_end")
		socket.emit('move_end', {
		   session_id: $scope.session_id
		}, function (result) {
			if (!result) {
		      		console.log("ERROR");
			}
			console.log(result);
		}
	);

	}
	$scope.dragMove = function() {
		$scope.syncSession();
	}
	$scope.saveCard = function() {
		$scope.writeSession();
	}
	$scope.updateText = function() {
		$scope.syncSession();
	}
	$scope.dragEnd = function() {
		$scope.writeSession();
	}

	// TODO: Send only the card, don't serialise the session.
	// Too much data
	// Sends the entire cards JSON back to the server to be updated
	// in server memory
	$scope.syncSession=function() {
		var session_details = $scope.session;
		socket.emit('move', {
			session_id:       $scope.session_id,
			session_details:  session_details
		}, function (result) {
			if (!result) {
				console.log("Error emitting 'move'");
			}
			console.log(result);
		});
	}

	// Handle socket events
	socket.on('move', function(msg){
		$scope.handleMoveMsg(msg)
	});
	socket.on('sync', function(msg) {
		var session_id      = msg.session_id;
		var session_details = msg.session;

		if ($scope.session_id == session_id) {
			$scope.session = session_details;
		}
	});
	$scope.handleMoveMsg = function(msg) {
	
		var card_id = msg._id;
		var x = msg.x;
		var y = msg.y;

		var card = this.session.findCard(card_id);
		card.x = x;
		card.y = y;
	}
	
	$scope.session.findCard = function(id) {
		for (var i = 0; i < $scope.session.cards.length; i++) {
			var card = $scope.session.cards[i];
			if (card._id == id) {
				return card;
			}
		}
	}

	$scope.logout = function() {
		console.log("Logging out");
		window.location.href = "/logout";
	}

}]);


/*
 * SessionsCtrl - controller to retrieve a list of sessions
 *
 */
cardsControllers.controller('SessionsCtrl', ['$scope','$http','$routeParams','socket',function ($scope,$http,$routeParams,socket) {


	// Build a list of all sessions and display them
	$scope.sessions = [];
	
	$scope.getSessions = function() {
		$http.get("/sessions").success(function (response) {
			$scope.user = response.user;
			$scope.sessions = response.sessions;
			console.log("Sessions: " + JSON.stringify(response));
		});
	}
	$scope.getSessions();

	$scope.addSession = function(name) {
		var session = {
			name: $scope.new_session.name,
			cards: []
		}

		$http.post('/sessions', session).
 		success(function(saved_session, status, headers, config) {
			console.log("Added session: " + JSON.stringify(saved_session));
			$scope.sessions.push(saved_session);
		});
	}

}]);
