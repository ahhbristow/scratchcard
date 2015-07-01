'use strict';

/* App Module */

var cardsApp = angular.module('cardsApp', [
		'ngRoute',
		'cardsControllers'
		]);

// Routing info
cardsApp.config(['$routeProvider',function($routeProvider) {
  $routeProvider.when('/sessions/:sessionId', {
    templateUrl: 'http://lp01799.openbet:4072/static/partials/cards.html',
    controller: 'CardsCtrl'
  })
  .when('/sessions', {
    templateUrl: '/static/partials/sessions.html',
    controller: 'SessionsCtrl'
  })
  .otherwise({
    redirectTo: '/sessions'
  });
}]);
