/*global jasmine, describe, it, beforeEach, expect, afterEach, jQuery, expect, observable, spyOn*/
describe('storyboardMenuWidget', function () {
	'use strict';
	var template = '<span id="test-menu"><a data-mm-role="storyboard-add-scene"></a><a data-mm-role="storyboard-remove-scenes-for-idea-id"></a></span>',
		storyboardController,
		storyboardModel,
		mapModel,
		underTest;
	beforeEach(function () {

		storyboardModel = observable(jasmine.createSpyObj('storyboardModel', ['getScenes', 'setInputEnabled', 'getInputEnabled']));
		storyboardController = observable(jasmine.createSpyObj('storyboardController', ['addScene', 'removeScenesForIdeaId']));
		mapModel = jasmine.createSpyObj('mapModel', ['getSelectedNodeId', 'getInputEnabled']);
		underTest = jQuery(template).appendTo('body').storyboardMenuWidget(storyboardController, storyboardModel, mapModel);
	});
	afterEach(function () {
		underTest.remove();
	});
	describe('before input is enabled on storyboardModel', function () {
		it('should be hidden', function () {
			expect(underTest.css('display')).toBe('none');
		});
		it('should be shown if storyboardModel.getInputEnabled is true', function () {
			storyboardModel.getInputEnabled.and.returnValue(true);
			underTest.remove();
			underTest = jQuery(template).appendTo('body').storyboardMenuWidget(storyboardController, storyboardModel, mapModel);
			expect(underTest.css('display')).not.toBe('none');
		});
	});
	describe('after input is enabled on storyboardModel', function () {
		beforeEach(function () {
			storyboardModel.dispatchEvent('inputEnabled', true);
		});
		it('should be visible', function () {
			expect(underTest.css('display')).not.toBe('none');
		});
		it('should add scene when add-scene link is clicked', function () {
			mapModel.getSelectedNodeId.and.returnValue(23);
			underTest.find('[data-mm-role=storyboard-add-scene]').click();
			expect(storyboardController.addScene).toHaveBeenCalledWith(23);
		});
		it('should remove scenes for selected idea when remove-scenes link is clicked', function () {
			mapModel.getSelectedNodeId.and.returnValue(23);
			underTest.find('[data-mm-role=storyboard-remove-scenes-for-idea-id]').click();
			expect(storyboardController.removeScenesForIdeaId).toHaveBeenCalledWith(23);
		});
		describe('when subsequently disabled', function () {
			it('should be hidden', function () {
				storyboardModel.dispatchEvent('inputEnabled', false);
				expect(underTest.css('display')).toBe('none');
			});
		});
	});
});
describe('storyboardKeyHandlerWidget', function () {
	'use strict';
	var storyboardController,
		storyboardModel,
		mapModel,
		underTest;
	beforeEach(function () {

		storyboardModel = observable(jasmine.createSpyObj('storyboardModel', ['getScenes', 'setInputEnabled']));
		storyboardController = observable(jasmine.createSpyObj('storyboardController', ['addScene']));
		mapModel = jasmine.createSpyObj('mapModel', ['getSelectedNodeId', 'getInputEnabled']);
		mapModel.getInputEnabled.and.returnValue(true);
		underTest = jQuery('<div>').appendTo('body').storyboardKeyHandlerWidget(storyboardController, storyboardModel, mapModel, '+');
	});
	afterEach(function () {
		underTest.remove();
	});
	describe('before input is enabled on storyboardModel', function () {
		it('does not act on add scene key handler', function () {
			underTest.trigger(jQuery.Event('keypress', { charCode: 43 }));
			expect(storyboardController.addScene).not.toHaveBeenCalled();
		});
	});
	describe('after input is enabled on storyboardModel', function () {
		beforeEach(function () {
			storyboardModel.dispatchEvent('inputEnabled', true);
		});
		it('acts on add scene key handler', function () {
			mapModel.getSelectedNodeId.and.returnValue(23);
			underTest.trigger(jQuery.Event('keypress', { charCode: 43 }));
			expect(storyboardController.addScene).toHaveBeenCalledWith(23);
		});
		it('does not act on add scene key handler if input is disabled', function () {
			mapModel.getInputEnabled.and.returnValue(false);
			underTest.trigger(jQuery.Event('keypress', { charCode: 43 }));
			expect(storyboardController.addScene).not.toHaveBeenCalled();
		});
		describe('when subsequently disabled', function () {
			it('does not act on add scene key handler', function () {
				storyboardModel.dispatchEvent('inputEnabled', false);
				underTest.trigger(jQuery.Event('keypress', { charCode: 43 }));
				expect(storyboardController.addScene).not.toHaveBeenCalled();
			});
		});
	});
});
describe('Storyboard widget', function () {
	'use strict';
	var underTest,
		storyboardController,
		storyboardModel,
		template = '<div><div>' +
					'<a data-mm-role="storyboard-remove-scene"></a>' +
					'<a data-mm-role="storyboard-move-scene-left"></a>' +
					'<a data-mm-role="storyboard-move-scene-right"></a>' +
					'</div><div id="sceneParent"><div data-mm-role="scene-template"><span data-mm-role="scene-title"></span></div></div></div>';
	beforeEach(function () {
		storyboardModel = observable(jasmine.createSpyObj('storyboardModel', ['getScenes', 'setInputEnabled']));
		storyboardController = observable(jasmine.createSpyObj('storyboardController', ['addScene', 'removeScene', 'moveSceneAfter']));
		storyboardModel.getScenes.and.returnValue([
			{ideaId: 12, title: 'already in ted storyboard', index: 1},
			{ideaId: 13, title: 'in two storyboards', index: 2}
		]);
		underTest = jQuery(template).appendTo('body').storyboardWidget(storyboardController, storyboardModel);
	});
	afterEach(function () {
		underTest.remove();
	});
	describe('when shown', function () {
		it('removes old scene content and rebuilds the UI using the list of scenes', function () {
			var scenes;
			underTest.find('#sceneParent').append('<div data-mm-role="scene">BBB</div>');
			underTest.trigger('show');
			scenes = underTest.find('[data-mm-role=scene]');

			expect(scenes.length).toBe(2);

			expect(scenes.first().attr('data-mm-idea-id')).toEqual('12');
			expect(scenes.first().attr('data-mm-index')).toEqual('1');
			expect(scenes.first().find('[data-mm-role=scene-title]').text()).toEqual('already in ted storyboard');

			expect(scenes.last().attr('data-mm-idea-id')).toEqual('13');
			expect(scenes.last().attr('data-mm-index')).toEqual('2');
			expect(scenes.last().find('[data-mm-role=scene-title]').text()).toEqual('in two storyboards');
		});
		it('sets storyboardModel to be editing enabled', function () {
			underTest.trigger('show');
			expect(storyboardModel.setInputEnabled).toHaveBeenCalledWith(true);
		});
		describe('event processing', function () {
			beforeEach(function () {
				underTest.trigger('show');
			});
			describe('storyboardSceneAdded', function () {
				it('adds a scene on storyboardSceneAdded', function () {
					storyboardModel.dispatchEvent('storyboardSceneAdded', {ideaId: 14, title: 'new one', index: 1.5 });

					var scenes = underTest.find('[data-mm-role=scene]');
					expect(scenes.length).toBe(3);
					expect(scenes.first().attr('data-mm-idea-id')).toEqual('12');
					expect(scenes.first().attr('data-mm-index')).toEqual('1');
					expect(scenes.first().find('[data-mm-role=scene-title]').text()).toEqual('already in ted storyboard');
					expect(scenes.eq(1).attr('data-mm-idea-id')).toEqual('14');
					expect(scenes.eq(1).attr('data-mm-index')).toEqual('1.5');
					expect(scenes.eq(1).find('[data-mm-role=scene-title]').text()).toEqual('new one');
					expect(scenes.last().attr('data-mm-idea-id')).toEqual('13');
					expect(scenes.last().attr('data-mm-index')).toEqual('2');
					expect(scenes.last().find('[data-mm-role=scene-title]').text()).toEqual('in two storyboards');
				});
				it('adds a scene to the end if the index is > than max', function () {

					storyboardModel.dispatchEvent('storyboardSceneAdded', {ideaId: 14, title: 'new one', index: 6 });

					var scenes = underTest.find('[data-mm-role=scene]');
					expect(scenes.length).toBe(3);
					expect(scenes.first().attr('data-mm-idea-id')).toEqual('12');
					expect(scenes.first().attr('data-mm-index')).toEqual('1');
					expect(scenes.first().find('[data-mm-role=scene-title]').text()).toEqual('already in ted storyboard');

					expect(scenes.eq(1).attr('data-mm-idea-id')).toEqual('13');
					expect(scenes.eq(1).attr('data-mm-index')).toEqual('2');
					expect(scenes.eq(1).find('[data-mm-role=scene-title]').text()).toEqual('in two storyboards');

					expect(scenes.last().attr('data-mm-idea-id')).toEqual('14');
					expect(scenes.last().attr('data-mm-index')).toEqual('6');
					expect(scenes.last().find('[data-mm-role=scene-title]').text()).toEqual('new one');

				});
				it('adds a scene to the start of the storyboard', function () {
					underTest.find('[data-mm-role=scene]').remove();
					storyboardModel.dispatchEvent('storyboardSceneAdded', {ideaId: 14, title: 'new one', index: 6 });
					var scenes = underTest.find('[data-mm-role=scene]');
					expect(scenes.length).toBe(1);
					expect(scenes.last().attr('data-mm-idea-id')).toEqual('14');
					expect(scenes.last().attr('data-mm-index')).toEqual('6');
					expect(scenes.last().find('[data-mm-role=scene-title]').text()).toEqual('new one');
				});
				it('scrollSceneIntoFocus', function () {
					spyOn(jQuery.fn, 'scrollSceneIntoFocus');
					storyboardModel.dispatchEvent('storyboardSceneAdded', {ideaId: 14, title: 'new one', index: 1.5 });
					var scenes = underTest.find('[data-mm-role=scene]').finish();
					expect(jQuery.fn.scrollSceneIntoFocus).toHaveBeenCalledOnJQueryObject(scenes.eq(1));
				});
			});
			describe('storyboardSceneRemoved', function () {
				it('removes a scene matching index and idea-id, even if the title is different', function () {
					storyboardModel.dispatchEvent('storyboardSceneRemoved', {ideaId: 12, title: 'non matching', index: 1 });
					underTest.find('[data-mm-role=scene]').finish();
					var scenes = underTest.find('[data-mm-role=scene]');
					expect(scenes.length).toBe(1);
					expect(scenes.last().attr('data-mm-idea-id')).toEqual('13');
					expect(scenes.last().attr('data-mm-index')).toEqual('2');
					expect(scenes.last().find('[data-mm-role=scene-title]').text()).toEqual('in two storyboards');
				});
				it('ignores non-matching removals', function () {
					storyboardModel.dispatchEvent('storyboardSceneRemoved', {ideaId: 14, title: 'already in ted storyboard', index: 1 });
					var scenes = underTest.find('[data-mm-role=scene]').finish();
					expect(scenes.length).toBe(2);
					expect(scenes.first().attr('data-mm-idea-id')).toEqual('12');
					expect(scenes.first().attr('data-mm-index')).toEqual('1');
					expect(scenes.first().find('[data-mm-role=scene-title]').text()).toEqual('already in ted storyboard');
					expect(scenes.last().attr('data-mm-idea-id')).toEqual('13');
					expect(scenes.last().attr('data-mm-index')).toEqual('2');
					expect(scenes.last().find('[data-mm-role=scene-title]').text()).toEqual('in two storyboards');
				});
			});
			describe('storyboardSceneContentUpdated', function () {
				it('updates a title matching the index and idea id', function () {
					storyboardModel.dispatchEvent('storyboardSceneContentUpdated', {ideaId: 12, title: 'new title', index: 1 });
					var scenes = underTest.find('[data-mm-role=scene]');
					expect(scenes.length).toBe(2);
					expect(scenes.first().attr('data-mm-idea-id')).toEqual('12');
					expect(scenes.first().attr('data-mm-index')).toEqual('1');
					expect(scenes.first().find('[data-mm-role=scene-title]').text()).toEqual('new title');
					expect(scenes.last().attr('data-mm-idea-id')).toEqual('13');
					expect(scenes.last().attr('data-mm-index')).toEqual('2');
					expect(scenes.last().find('[data-mm-role=scene-title]').text()).toEqual('in two storyboards');
				});
				it('ignores non-matching removals', function () {
					storyboardModel.dispatchEvent('storyboardSceneContentUpdated', {ideaId: 14, title: 'new title', index: 1 });
					var scenes = underTest.find('[data-mm-role=scene]');
					expect(scenes.length).toBe(2);
					expect(scenes.first().attr('data-mm-idea-id')).toEqual('12');
					expect(scenes.first().attr('data-mm-index')).toEqual('1');
					expect(scenes.first().find('[data-mm-role=scene-title]').text()).toEqual('already in ted storyboard');
					expect(scenes.last().attr('data-mm-idea-id')).toEqual('13');
					expect(scenes.last().attr('data-mm-index')).toEqual('2');
					expect(scenes.last().find('[data-mm-role=scene-title]').text()).toEqual('in two storyboards');
				});

			});
		});
	});
	describe('when hidden', function () {
		it('sets storyboardModel to be editing enabled', function () {
			underTest.trigger('show');
			storyboardModel.setInputEnabled.calls.reset();
			underTest.trigger('hide');
			expect(storyboardModel.setInputEnabled).toHaveBeenCalledWith(false);
		});
		it('does not update content on sceneAdded', function () {
			var scenes;
			underTest.trigger('show');
			underTest.trigger('hide');

			storyboardModel.getScenes.and.returnValue([
				{ideaId: 12, title: 'already in ted storyboard', index: 1},
				{ideaId: 14, title: 'inside', index: 5}
			]);
			storyboardModel.dispatchEvent('storyboardSceneAdded');

			scenes = underTest.find('[data-mm-role=scene]');

			expect(scenes.length).toBe(2);
			expect(scenes.last().attr('data-mm-idea-id')).toEqual('13');
			expect(scenes.last().attr('data-mm-index')).toEqual('2');
			expect(scenes.last().find('[data-mm-role=scene-title]').text()).toEqual('in two storyboards');
		});
	});
	describe('navigating a stroyboard', function () {
		var dummyElement, selectedScene;
		beforeEach(function () {
			underTest.trigger('show');

			storyboardModel.getScenes.and.returnValue([
				{ideaId: 12, title: 'already in ted storyboard', index: 1},
				{ideaId: 14, title: 'inside', index: 5}
			]);
			storyboardModel.dispatchEvent('storyboardSceneAdded');
			selectedScene = underTest.find('[data-mm-role=scene]').last();
			selectedScene.focus();
			dummyElement = underTest.find('[data-mm-role=scene]').first();
			spyOn(jQuery.fn, 'focus').and.callThrough();
		});
		describe('responds to direction keys for navigation', [
			['left', 37, 'prev'],
			['up', 38, 'gridUp'],
			['right', 39, 'next'],
			['down', 40, 'gridDown']
		], function (keycode, jQueryFunction) {
			spyOn(jQuery.fn, jQueryFunction).and.returnValue(dummyElement);
			var evt = jQuery.Event('keydown', {which: keycode});
			selectedScene.trigger(evt);
			expect(jQuery.fn[jQueryFunction]).toHaveBeenCalledOnJQueryObject(selectedScene);
			expect(jQuery.fn.focus).toHaveBeenCalledOnJQueryObject(dummyElement);
		});
	});
	describe('editing a storyboard', function () {
		beforeEach(function () {
			storyboardModel.getScenes.and.returnValue([
				{ideaId: 12, title: 'already in ted storyboard', index: 1},
				{ideaId: 15, title: 'inside', index: 3},
				{ideaId: 14, title: 'inside', index: 5}
			]);
			underTest.trigger('show');
			underTest.find('[data-mm-role=scene]').last().focus();
		});
		it('should remove scene when storyboard-remove-scene menu item is clicked', function () {
			underTest.find('[data-mm-role=storyboard-remove-scene]').click();
			expect(storyboardController.removeScene).toHaveBeenCalledWith({ideaId: 14, title: 'inside', index: 5});
			expect(storyboardController.removeScene.calls.count()).toBe(1);
		});
		describe('should move a node', function () {
			describe('later in the storyboard', function () {
				var selectedScene, sceneBeingMoved;
				beforeEach(function () {
					selectedScene = underTest.find('[data-mm-role=scene]').eq(1);
					sceneBeingMoved = {ideaId: 15, title: 'inside', index: 3};
					selectedScene.focus();
				});
				it('when meta+right is clicked', function () {
					var evt = jQuery.Event('keydown', {which: 39, metaKey: true});
					selectedScene.trigger(evt);
					expect(storyboardController.moveSceneAfter).toHaveBeenCalledWith(sceneBeingMoved, {ideaId: 14, title: 'inside', index: 5});
				});
				it('when ctrl+right is clicked', function () {
					var evt = jQuery.Event('keydown', {which: 39, ctrlKey: true});
					selectedScene.trigger(evt);
					expect(storyboardController.moveSceneAfter).toHaveBeenCalledWith(sceneBeingMoved, {ideaId: 14, title: 'inside', index: 5});
				});
				it('when  move right control is clicked', function () {
					underTest.find('[data-mm-role=storyboard-move-scene-right]').click();
					expect(storyboardController.moveSceneAfter).toHaveBeenCalledWith(sceneBeingMoved, {ideaId: 14, title: 'inside', index: 5});
				});
			});
			describe('earlier in the storyboard', function () {
				var selectedScene, sceneBeingMoved, movedBefore;
				beforeEach(function () {
					selectedScene = underTest.find('[data-mm-role=scene]').last();
					sceneBeingMoved = {ideaId: 14, title: 'inside', index: 5};
					movedBefore = {ideaId: 12, title: 'already in ted storyboard', index: 1};
					selectedScene.focus();
				});
				it('when meta+left is clicked', function () {
					var evt = jQuery.Event('keydown', {which: 37, metaKey: true});
					selectedScene.trigger(evt);
					expect(storyboardController.moveSceneAfter).toHaveBeenCalledWith(sceneBeingMoved, movedBefore);
				});
				it('when ctrl+left is clicked', function () {
					var evt = jQuery.Event('keydown', {which: 37, ctrlKey: true});
					selectedScene.trigger(evt);
					expect(storyboardController.moveSceneAfter).toHaveBeenCalledWith(sceneBeingMoved, movedBefore);
				});
				it('when move left control is clicked', function () {
					underTest.find('[data-mm-role=storyboard-move-scene-left]').click();
					expect(storyboardController.moveSceneAfter).toHaveBeenCalledWith(sceneBeingMoved, movedBefore);
				});

			});
			describe('the second scene to the start of the list', function () {
				var selectedScene,
					sceneBeingMoved;

				beforeEach(function () {
					selectedScene = underTest.find('[data-mm-role=scene]').eq(1);
					sceneBeingMoved = {ideaId: 15, title: 'inside', index: 3};
					selectedScene.focus();
				});
				it('when meta+left is clicked', function () {
					var evt = jQuery.Event('keydown', {which: 37, ctrlKey: true});
					selectedScene.trigger(evt);
					expect(storyboardController.moveSceneAfter).toHaveBeenCalledWith(sceneBeingMoved, undefined);
				});
				it('when ctrl+left is clicked', function () {
					var evt = jQuery.Event('keydown', {which: 37, metaKey: true});
					selectedScene.trigger(evt);
					expect(storyboardController.moveSceneAfter).toHaveBeenCalledWith(sceneBeingMoved, undefined);
				});
				it('when move left control is clicked', function () {
					underTest.find('[data-mm-role=storyboard-move-scene-left]').click();
					expect(storyboardController.moveSceneAfter).toHaveBeenCalledWith(sceneBeingMoved, undefined);
				});
			});
		});
	});
});
