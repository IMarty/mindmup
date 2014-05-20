/*global jQuery, _*/
jQuery.fn.storyboardWidget = function (storyboardController, mapContainer, mapModel, addSceneHotkey) {
	'use strict';
	var addSceneHandler = function (evt) {
		var unicode = evt.charCode || evt.keyCode,
			actualkey = String.fromCharCode(unicode);
		if (actualkey === addSceneHotkey && mapModel.getInputEnabled()) {
			storyboardController.addScene(mapModel.getSelectedNodeId());
		}
	};
	return jQuery.each(this, function () {
		var element = jQuery(this),
			template = element.find('[data-mm-role=scene-template]'),
		    templateParent = template.parent(),
			rebuildStoryboard = function () {
				templateParent.empty();
				_.each(storyboardController.getScenes(), function (scene) {
					template.clone()
						.appendTo(templateParent)
						.attr({
							'data-mm-role': 'scene',
							'data-mm-idea-id': scene.ideaId,
							'data-mm-index': scene.index
						})
						.find('[data-mm-role=scene-title]').text(scene.title);
				});
			},
			showStoryboard = function () {
				rebuildStoryboard();
				mapContainer.on('keypress', addSceneHandler);
				storyboardController.addListener(rebuildStoryboard);
			},
			hideStoryboard = function () {
				mapContainer.off('keypress', addSceneHandler);
				storyboardController.removeListener(rebuildStoryboard);
			};
		template.detach();
		element.on('show', showStoryboard).on('hide', hideStoryboard);

	});
};