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
					scope.$apply(function() {
						scope.dragEnd();
					});
				},
				drag:function(e, ui) {

					console.log(scope.session);
					console.log("Moving "  + attrs.cardId);
					var moved_card = scope.findCard(attrs.cardId);
					var prev_x = moved_card.x;
					var prev_y = moved_card.y;
					console.log("Prev: " + prev_x + "," + prev_y + ")");
					var new_x  = $(element).offset().left;
					var new_y  = $(element).offset().top;
					console.log("New: " + new_x + "," + new_y + ")");
					var dx = new_x - prev_x;
					var dy = new_y - prev_y;
					console.log("Diff: " + dx + "," + dy + ")");

					//scope.$eval(attrs.x + '=' + new_x);
					//scope.$eval(attrs.y + '=' + new_y);

					// If this card is in a selection group, we should move
					// all the other cards too
					if (scope.selection_group_active) {
						for (var card of scope.selection_group) {
							card.x += dx;
							card.y += dy;
							console.log("Moving card " + card._id + " from group to (" + card.x + "," + card.y + ")");
							scope.dragMove(card);
						}
					} else {
						moved_card.x += dx;
						moved_card.y += dy;
						scope.dragMove(moved_card);
					}

					// Update the min-width of the cards container to ensure
					// we don't shrink the view area when moving the furthest
					// right card back to the left of the screen.
					//
					// TODO: We should do this based on the extremeties of the
					// selection group
					var container = $(element).parent().parent();
					var element_x = $(element).offset().left;
					var current_min_width = parseInt($(container).css('min-width'));
					if (element_x > (current_min_width - 400)) {
						container.css({'min-width': (element_x + 600)});
					}
					console.log("Done movin'");

					scope.$apply(function() {
						console.log("Applyin'");
					});
				},
				containment: [0,0,10000,10000]
			});
		}
	};
});

cardsApp.directive('card', function() {
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

cardsApp.directive('textFocus', function() {
	return {
		restrict: 'A',
		link : function(scope, element, attrs) {
			if (scope.card._id === scope.selected_card) {
				element[0].focus();
			}

		}
	}
});

cardsApp.directive('selectable', function() {
	return {
		restrict: 'A',
		link: function(scope, element, attrs) {
			$(element).selectable({
				filter: ".card_padding",
				selected: function(event,ui) {
					console.log("Adding selectable");
					var card_id = ui.selected.attributes.card_id.value;
					scope.$apply(function() {
						scope.multiSelectCard(card_id);
					});


				}
			});
		}
	}
});
