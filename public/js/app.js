'use strict';

/* App Module */

var cardsApp = angular.module('cardsApp', [
		'ngRoute',
		'cardsControllers'
		]);

// Routing info
cardsApp.config(['$routeProvider',function($routeProvider) {
  $routeProvider.when('/sessions/:sessionId', {
    templateUrl: '/static/partials/cards.html',
    controller: 'CardsCtrl'
  })
  .when('/', {
    templateUrl: '/static/partials/sessions.html',
    controller: 'SessionsCtrl'
  })
  .otherwise({
    redirectTo: '/'
  });
}]);
