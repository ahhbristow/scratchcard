'use strict';

/* Directives */

cardsApp.directive('draggable', function() {
	return {
		//A = attribute, E = Element, C = Class and M = HTML Comment
		restrict:'A',
		link: function(scope, element, attrs) {
			
			element.draggable({
				revert:false,
				stop:function (e, ui) {
					scope.$eval(attrs.x + '=' + $(element).offset().left);
					scope.$eval(attrs.y + '=' + $(element).offset().top);
					scope.$apply(function() {
						scope.dragEnd(scope.card);
					});
				},
				drag:function(e, ui) {
					scope.$eval(attrs.x + '=' + $(element).offset().left);
					scope.$eval(attrs.y + '=' + $(element).offset().top);
					scope.$apply(function() {
						scope.dragMove(scope.card);
					});
				}
			});
		}
	};
});
