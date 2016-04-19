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

					// Update the min-width of the cards container to ensure
					// we don't shrink the view area when moving the furthest
					// right card back to the left of the screen
					var container = $(element).parent().parent();
					var element_x = $(element).offset().left;
					var current_min_width = parseInt($(container).css('min-width'));
					if (element_x > current_min_width) {
						container.css({'min-width' : element_x});
					}

					scope.$apply(function() {
						scope.dragMove(scope.card);
					});
				},
				containment: [0,0,10000,10000]
			});
		}
	};
});

cardsApp.directive('draggable', function() {
	return {
		//A = attribute, E = Element, C = Class and M = HTML Comment
		restrict:'A',
		link: function(scope, element, attrs) {
			
			$(element).mousedown(function() {
				attrs.mouse_down = 1;
			});
			$(element).mouseup(function() {
				attrs.mouse_down = 0;
			});

			$(element).hover(function(d,i) {
				if (!attrs.mouse_down) {
					setTimeout(function() {
						$(element).find(".delete").fadeIn( "fast", function() {});
					},100);
				}
			},function(d,i) {
				if (!attrs.mouse_down) {
					setTimeout(function() {
						$(element).find(".delete").fadeOut( "fast", function() {});
					},100);
				}
			});
		}
	}
});
