'use strict';

/* Controllers */

var cardsControllers = angular.module('cardsControllers', []);

/*
 * CardsCtrl - controller for a particular session
 *
 */
cardsControllers.controller('CardsCtrl', ['$scope','$http','$routeParams','socket',function ($scope,$http,$routeParams,socket) {

	// Init
	$scope.session_id = $routeParams.sessionId;
	$scope.session = {};

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
	$scope.addCard = function(card_type) {
		console.log("Adding new card");
		var card = {text: "", x: 100, y: 100, type: card_type};
		this.session.cards.push(card);
		$scope.syncSession();
		$scope.writeSession();
	}
	$scope.getCards = function(session_id) {
		$http.get("/sessions/" + session_id).success(function (response) {
			$scope.session = response;
		});
	}
	$scope.getCards($scope.session_id);
	

	// Handlers for moving cards
	//
	
	// Tells the server to write what it has to the DB
	$scope.writeSession = function() {
		console.log("Synchronising...");
		socket.emit('move_end', {
		   session_id: $scope.session_id
		}, function (result) {
		      if (!result) {
		         console('There was an error registering move_end');
		      }
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
	$scope.syncSession=function() {
		var session_details = $scope.session;
		console.log("Registering move " + JSON.stringify(session_details));
		socket.emit('move', {
			session_id:       $scope.session_id,
			session_details:  session_details
		}, function (result) {
			if (!result) {
				console('There was an error registering move');
			}
		});
	}

	// Handle socket events
	socket.on('move', function(msg){
		$scope.handleMoveMsg(msg)
	});
	socket.on('sync', function(msg) {
		var session_id = msg.session_id;
		var session_details = msg.session;
		console.log("Received sync message: " + session_details);

		if ($scope.session_id = session_id) {
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


}]);


/*
 * SessionsCtrl - controller to retrieve a list of sessions
 *
 */
cardsControllers.controller('SessionsCtrl', ['$scope','$http','$routeParams','socket',function ($scope,$http,$routeParams,socket) {

	console.log("Sessions controller");

	// Build a list of all sessions and display them
	$scope.sessions = [];
	
	$scope.getSessions = function() {
		$http.get("/sessions").success(function (response) {
			$scope.sessions = response;
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
