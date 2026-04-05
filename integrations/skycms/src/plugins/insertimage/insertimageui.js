/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import {
	Plugin,
	ButtonView,
	MenuBarMenuListItemButtonView,
	ImageInsertUI,
	IconImageAssetManager,
	IconImageUpload,
	IconImageUrl
} from 'ckeditor5';

// UI bridge for the SkyCMS host integration.
//
// Expected host API on window.parent:
//   window.parent.openInsertImageModel(editor)
//
// The host method opens a CMS picker and inserts the selected image into the
// current editor instance. In local playground mode, where host APIs do not
// exist, this plugin falls back to prompting for an image URL and executes
// CKEditor image insertion command directly.
export default class InsertImageUI extends Plugin {
	static get requires() {
		return [ ImageInsertUI ];
	}

	init() {
		const editor = this.editor;
		const t = editor.t;

		editor.ui.componentFactory.add( 'skyCmsInsertImage', () => {
			const button = this._createSkyCmsButton( ButtonView, {
				label: t( 'From website' ),
				withText: false,
				tooltip: true
			} );

			return button;
		} );
	}

	afterInit() {
		const editor = this.editor;
		const t = editor.t;
		const imageInsertUI = editor.plugins.get( 'ImageInsertUI' );
		const configuredIntegrations = editor.config.get( 'image.insert.integrations' ) || [];
		const desiredOrder = [ 'upload', 'skyCmsWebsite', 'url' ];
		const mergedIntegrations = [
			...desiredOrder,
			...configuredIntegrations.filter( integrationName => !desiredOrder.includes( integrationName ) )
		];

		editor.config.set( 'image.insert.integrations', mergedIntegrations );

		imageInsertUI.registerIntegration( {
			name: 'upload',
			override: true,
			observable: () => editor.commands.get( 'uploadImage' ),
			buttonViewCreator: () => this._createForwardingButton( 'imageUpload', {
				label: t( 'From computer' ),
				icon: IconImageUpload,
				withText: false,
				tooltip: true
			} ),
			formViewCreator: () => this._createForwardingButton( 'imageUpload', {
				label: t( 'From computer' ),
				icon: IconImageUpload,
				withText: true,
				closeImageInsertDropdown: true
			} ),
			menuBarButtonViewCreator: () => this._createForwardingMenuBarButton( 'menuBar:uploadImage', t( 'From computer' ) )
		} );

		imageInsertUI.registerIntegration( {
			name: 'skyCmsWebsite',
			observable: () => editor.commands.get( 'insertImage' ),
			buttonViewCreator: () => this._createSkyCmsButton( ButtonView, {
				label: t( 'From website storage' ),
				withText: false,
				tooltip: true
			} ),
			formViewCreator: () => this._createSkyCmsButton( ButtonView, {
				label: t( 'From website storage' ),
				withText: true,
				closeImageInsertDropdown: true
			} ),
			menuBarButtonViewCreator: () => this._createSkyCmsButton( MenuBarMenuListItemButtonView, {
				label: t( 'From website storage' ),
				withText: true
			} )
		} );

		imageInsertUI.registerIntegration( {
			name: 'url',
			override: true,
			observable: () => editor.commands.get( 'insertImage' ),
			buttonViewCreator: () => this._createForwardingButton( 'insertImageViaUrl', {
				label: t( 'From another website' ),
				icon: IconImageUrl,
				withText: false,
				tooltip: true
			} ),
			formViewCreator: () => this._createForwardingButton( 'insertImageViaUrl', {
				label: t( 'From another website' ),
				icon: IconImageUrl,
				withText: true,
				closeImageInsertDropdown: true
			} ),
			menuBarButtonViewCreator: () => this._createForwardingMenuBarButton( 'menuBar:insertImageViaUrl', t( 'From another website' ) )
		} );
	}

	_createForwardingButton( componentName, {
		label,
		icon,
		withText = false,
		tooltip = false,
		closeImageInsertDropdown = false
	} = {} ) {
		const editor = this.editor;
		const button = editor.ui.componentFactory.create( componentName );

		if ( icon ) {
			button.icon = icon;
		}

		if ( label ) {
			button.label = label;
		}

		button.withText = withText;
		button.tooltip = tooltip;

		if ( closeImageInsertDropdown ) {
			const imageInsertUI = editor.plugins.get( 'ImageInsertUI' );

			this.listenTo( button, 'execute', () => {
				if ( imageInsertUI.dropdownView ) {
					imageInsertUI.dropdownView.isOpen = false;
				}
			} );
		}

		return button;
	}

	_createForwardingMenuBarButton( componentName, label ) {
		const button = this.editor.ui.componentFactory.create( componentName );

		button.label = label;
		button.withText = true;

		return button;
	}

	_createSkyCmsButton( ButtonClass, {
		label,
		withText = false,
		tooltip = false,
		closeImageInsertDropdown = false
	} = {} ) {
		const editor = this.editor;
		const button = new ButtonClass( editor.locale );

		button.set( {
			label,
			icon: IconImageAssetManager,
			withText,
			tooltip
		} );

		this.listenTo( button, 'execute', () => {
			if ( closeImageInsertDropdown ) {
				const imageInsertUI = editor.plugins.get( 'ImageInsertUI' );
				if ( imageInsertUI.dropdownView ) {
					imageInsertUI.dropdownView.isOpen = false;
				}
			}

			this._openSkyCmsImagePicker();
		} );

		return button;
	}

	_openSkyCmsImagePicker() {
		const editor = this.editor;
		const runtimeWindow = globalThis.window;
		const openInsertImageModal = runtimeWindow?.parent?.openInsertImageModel;

		if ( openInsertImageModal ) {
			openInsertImageModal( editor );
			return;
		}

		// Playground fallback for local validation.
		const promptForImageUrl = runtimeWindow?.prompt;
		const imageUrl = promptForImageUrl ?
			promptForImageUrl( 'Enter image URL (example: /images/hero.jpg):', '/images/hero.jpg' ) :
			null;

		if ( imageUrl && imageUrl.trim().length > 0 ) {
			editor.execute( 'insertImage', { source: imageUrl.trim() } );
		}
	}
}
