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
	$scope.connected_users = {};
	$scope.loading = 1;
	$scope.selected_card = {};

	$scope.requestPermission = function() {

		var session_id = $scope.session_id;
		var user_id = $scope.user._id;

		// Send a websocket message asking for permission,
		// then wait
		socket.emit('request_permission', {
			session_id:  session_id,
			user_id:     user_id
		}, function (result) {
			if (!result) {
				console.log("Error requesting permission");
			}
			// Reload session
			$location.path('/sessions/' + session_id);
		});
	}

	$scope.goBackToSessions = function() {
		$location.path('/sessions');
	}

	// Delete session and redirect to main page
	$scope.deleteSession = function() {
		$http.delete("/sessions/" + $scope.session_id).success(function (response) {
			console.log(response);
			$location.path('/sessions');
		});
		
	}

	$scope.deleteCard = function(card, event) {
		console.log("Deleting card");
		var index = $scope.session.cards.indexOf(card);
		$scope.session.cards.splice(index, 1);
		socket.emit('delete_card', {
			session_id: $scope.session_id,
			card: card
		}, function (result) {
		});
	}

	// Push this card to the front of the list
	$scope.selectCard = function(card) {
		$scope.selected_card = card._id;
	}

	$scope.deselectCard = function(card) {
		$scope.selected_card = {};
	}
	$scope.dragMove = function(card) {
		$scope.moveCard(card);
	}
	$scope.updateText = function(card) {
		$scope.moveCard(card);
	}
	$scope.dragEnd = function() {
		$scope.writeSession();
	}

	// Adds a new card to the session
	$scope.addCard = function(card_type, event) {
		var card = {text: "", x: event.pageX, y: event.pageY-300, type: card_type};
		this.session.cards.push(card);
		socket.emit('add_card', {
			session_id: $scope.session_id,
			card: card
		}, function (result) {
		});
	}

	// Send a move_card event to the socket
	$scope.moveCard = function(card) {
		socket.emit('move_card', {
			session_id: $scope.session_id,
			card: card
		}, function(result) {

		});
	}

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
		});
	}

	// Handle socket events
	socket.on('card_moved', function(card) {
		$scope.cardMoved(card);
	});

	// Handle full session sync
	socket.on('sync', function(msg) {
		console.log("Received full session sync message");
		var session_id      = msg.session_id;
		var session_details = msg.session;
		var connected_users = msg.connected_users;

		if ($scope.session_id == session_id) {
			$scope.session = session_details;	
			$scope.connected_users = connected_users;
		}
	});

	$scope.handlePermissionCB = function(msg) {
		console.log("Permission request successful");
		if (msg.status == "success") {
			$scope.permission_requested = 1;
		}
	}
	socket.on('request_permission_cb', function(msg) {
		$scope.handlePermissionCB(msg);
	});
		
	$scope.cardMoved = function(msg) {
		var card = this.findCard(msg.card._id);
		card.x = msg.card.x;
		card.y = msg.card.y;
		card.text = msg.card.text
	}
	
	$scope.findCard = function(id) {
		for (var i = 0; i < $scope.session.cards.length; i++) {
			var card = $scope.session.cards[i];
			if (card._id == id) {
				return card;
			}
		}
	}

	// Post approval, then update scope
	$scope.approveParticipant = function(user_id) {
		console.log("Approving user " + user_id);

		var path = '/api/sessions/' + this.session_id + '/approveParticipant/' + user_id;
		$http.put(path).
 			success(function(resp, status, headers, config) {
				var approved = resp.status;
				var session  = resp.session;
				console.log("Approval status: " + approved);

				$scope.session = session;
		});

	}

	// TODO: Should go in it's own controller
	$scope.logout = function() {
		console.log("Logging out");
		window.location.href = "/logout";
	}

	// Join the websocket session
	$scope.joinSession=function() {
		socket.emit('join', {
			user_id:     $scope.user._id,
			session_id:  $scope.session_id
		}, function (result) {
			if (!result) {
				console.log("Error emitting 'join'");
			}
			console.log(result);
		});
	}
	
	// Initial retrieval of session on page load
	$scope.getSession = function(session_id) {
		$http.get("/api/sessions/" + session_id).success(function (response) {

			console.log("Retrieving session: " + session_id);

			if (response.logged_in == 0) {
				window.location.href = "/login/" + session_id;
				return;
			}
			console.log("User is logged in");

			// Get info from response
			var session = response.session;
			var user_has_permission = response.has_permission;
			var permission_requested = response.permission_requested;

			// Populate $scope
			$scope.user_has_permission = user_has_permission;
			$scope.permission_requested = permission_requested;
			$scope.user = response.user;

			// If user doesn't have permission, set the session
			// as an empty object
			if(!user_has_permission) {
				$scope.session = {};
			} else {
				$scope.session = response.session;
				$scope.joinSession();  // Socket connection
			}
			$scope.loading = 0;
	
		});
	}
	$scope.getSession($scope.session_id);
}]);


/*
 * SessionsCtrl - controller to retrieve a list of sessions
 *
 */
cardsControllers.controller('SessionsCtrl', ['$scope','$http','$routeParams','socket',function ($scope,$http,$routeParams,socket) {


	// Build a list of all sessions and display them
	$scope.sessions = [];
	$scope.new_session = {name: ''}
	$scope.loading = 1;
	
	$scope.getSessions = function() {
		$http.get("/api/sessions").success(function (response) {

			if (response.logged_in == 0) {
				// We need to redirect here
				window.location.href = "/login";
				return;
			}

			$scope.user = response.user;
			$scope.sessions = response.sessions;
			$scope.participating_sessions = response.participating_sessions;
			$scope.loading = 0;
			console.log("Sessions: " + JSON.stringify(response));
		});
	}
	$scope.getSessions();

	$scope.addSession = function(name) {
		var session = {
			name: $scope.new_session.name,
			creator: $scope.user._id,
			cards: []
		}

		$http.post('/api/sessions', session).
 		success(function(saved_session, status, headers, config) {
			console.log("Added session: " + JSON.stringify(saved_session));
			$scope.sessions.push(saved_session);
		});
	}
	
	// TODO: Should go in it's own controller
	$scope.logout = function() {
		console.log("Logging out");
		window.location.href = "/logout";
	}

}]);
