/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock( 'ckeditor5', () => {
	class Plugin {
		constructor( editor ) {
			this.editor = editor;
		}

		listenTo( target, eventName, callback ) {
			if ( !target.__listeners ) {
				target.__listeners = {};
			}

			target.__listeners[ eventName ] = callback;
		}
	}

	class ButtonView {
		constructor( locale ) {
			this.locale = locale;
			this.__listeners = {};
		}

		set( props ) {
			this.props = props;
		}
	}

	class MenuBarMenuListItemButtonView extends ButtonView {}
	class ImageInsertUI {}

	const createDropdown = locale => {
		return {
			locale,
			buttonView: new ButtonView( locale ),
			isOpen: false,
			__listeners: {}
		};
	};

	const addToolbarToDropdown = ( dropdownView, getButtons ) => {
		dropdownView.__toolbarButtons = getButtons();
	};

	return {
		Plugin,
		ButtonView,
		MenuBarMenuListItemButtonView,
		ImageInsertUI,
		createDropdown,
		addToolbarToDropdown,
		IconBrowseFiles: 'icon-browse-files',
		IconCode: 'icon-code',
		IconImageAssetManager: 'icon-image-asset-manager',
		IconImageUpload: 'icon-image-upload',
		IconImageUrl: 'icon-image-url',
		IconLink: 'icon-link'
	};
} );

import FileLinkUI from '../src/plugins/filelink/filelinkui.js';
import InsertImageUI from '../src/plugins/insertimage/insertimageui.js';
import PageLinkUI from '../src/plugins/pagelink/pagelinkui.js';
import SignalRUI from '../src/plugins/signalr/signalrui.js';
import VSCodeEditorUI from '../src/plugins/vscodeeditor/vscodeeditorui.js';

function createEditorMock() {
	const components = new Map();
	const execute = vi.fn();
	const configValues = new Map();
	const imageInsertUI = {
		dropdownView: { isOpen: true },
		registerIntegration: vi.fn()
	};

	const uploadImageCommand = { isEnabled: true, isAccessAllowed: true };
	const insertImageCommand = { isEnabled: true };

	const commands = {
		get: name => {
			switch ( name ) {
				case 'uploadImage':
					return uploadImageCommand;
				case 'insertImage':
					return insertImageCommand;
				default:
					return { isEnabled: true };
			}
		}
	};

	return {
		t: value => value,
		execute,
		config: {
			define: ( key, value ) => {
				if ( !configValues.has( key ) ) {
					configValues.set( key, value );
				}
			},
			set: ( key, value ) => {
				configValues.set( key, value );
			},
			get: key => configValues.get( key )
		},
		plugins: {
			has: name => name === 'ImageInsertUI',
			get: name => {
				if ( name === 'ImageInsertUI' ) {
					return imageInsertUI;
				}

				return null;
			}
		},
		commands,
		ui: {
			componentFactory: {
				add: ( name, factory ) => {
					components.set( name, factory );
				},
				create: name => {
					const factory = components.get( name );
					if ( factory ) {
						return factory( { language: 'en' } );
					}

					return {
						label: name,
						withText: false,
						tooltip: false,
						__listeners: {}
					};
				}
			}
		},
		editing: {
			view: {
				document: {
					isFocused: false,
					handlers: {},
					on( eventName, callback ) {
						this.handlers[ eventName ] = callback;
					}
				}
			}
		},
		__components: components,
		__imageInsertUI: imageInsertUI,
		__configValues: configValues
	};
}

function createWindowMock() {
	const prompt = vi.fn();
	const alert = vi.fn();
	const parent = {};

	globalThis.window = {
		parent,
		prompt,
		alert
	};

	globalThis.alert = alert;

	return { prompt, alert, parent };
}

function initButton( PluginClass, componentName ) {
	const editor = createEditorMock();
	const plugin = new PluginClass( editor );

	plugin.init();
	if ( typeof plugin.afterInit === 'function' ) {
		plugin.afterInit();
	}

	const factory = editor.__components.get( componentName );
	const button = factory( { language: 'en' } );

	return { editor, button };
}

describe( 'SkyCMS plugin UI smoke tests', () => {
	beforeEach( () => {
		vi.restoreAllMocks();
		createWindowMock();
	} );

	it( 'registers pageLink and runs fallback link command', () => {
		const { editor, button } = initButton( PageLinkUI, 'pageLink' );

		window.prompt.mockReturnValue( '/about' );
		button.__listeners.execute();

		expect( editor.execute ).toHaveBeenCalledWith( 'link', '/about' );
	} );

	it( 'registers skyCmsLink dropdown with two source options', () => {
		const { button } = initButton( PageLinkUI, 'skyCmsLink' );

		expect( button.__toolbarButtons ).toHaveLength( 2 );
		expect( button.__toolbarButtons[ 0 ].props.label ).toBe( 'From website page' );
		expect( button.__toolbarButtons[ 1 ].label ).toBe( 'From another website' );
	} );

	it( 'registers fileLink and calls host bridge when available', () => {
		const { editor, button } = initButton( FileLinkUI, 'fileLink' );

		window.parent.openInsertFileLinkModel = vi.fn();
		button.__listeners.execute();

		expect( window.parent.openInsertFileLinkModel ).toHaveBeenCalledWith( editor );
		expect( editor.execute ).not.toHaveBeenCalled();
	} );

	it( 'registers insertImage and runs fallback insertImage command', () => {
		const { editor, button } = initButton( InsertImageUI, 'skyCmsInsertImage' );

		window.prompt.mockReturnValue( '/images/hero.jpg' );
		button.__listeners.execute();

		expect( editor.execute ).toHaveBeenCalledWith( 'insertImage', { source: '/images/hero.jpg' } );
	} );

	it( 'registers imageInsert dropdown integrations in expected order', () => {
		const editor = createEditorMock();
		const plugin = new InsertImageUI( editor );

		plugin.init();
		plugin.afterInit();

		expect( editor.config.get( 'image.insert.integrations' ) ).toEqual( [
			'upload',
			'skyCmsWebsite',
			'url'
		] );

		const calls = editor.__imageInsertUI.registerIntegration.mock.calls;
		expect( calls ).toHaveLength( 3 );
		expect( calls.map( ( [ integration ] ) => integration.name ) ).toEqual( [
			'upload',
			'skyCmsWebsite',
			'url'
		] );
	} );

	it( 'registers vsCodeEditor and warns when host bridge is missing', () => {
		const { button } = initButton( VSCodeEditorUI, 'vsCodeEditor' );

		button.__listeners.execute();

		expect( window.alert ).toHaveBeenCalledWith( 'No host VS Code editor bridge detected.' );
	} );

	it( 'signalr plugin emits events through host bridge', () => {
		const editor = createEditorMock();
		const signal = vi.fn();

		window.parent.cosmosSignalOthers = signal;

		const plugin = new SignalRUI( editor );
		plugin.init();

		editor.editing.view.document.isFocused = true;
		editor.editing.view.document.handlers[ 'change:isFocused' ]();
		editor.editing.view.document.handlers.keydown();
		editor.editing.view.document.handlers.mousedown();

		editor.editing.view.document.isFocused = false;
		editor.editing.view.document.handlers[ 'change:isFocused' ]();

		expect( signal ).toHaveBeenNthCalledWith( 1, editor, 'focus' );
		expect( signal ).toHaveBeenNthCalledWith( 2, editor, 'keydown' );
		expect( signal ).toHaveBeenNthCalledWith( 3, editor, 'mousedown' );
		expect( signal ).toHaveBeenNthCalledWith( 4, editor, 'blur' );
	} );

	it( 'signalr plugin logs fallback events when host bridge is missing', () => {
		const editor = createEditorMock();
		const logSpy = vi.spyOn( console, 'log' ).mockImplementation( () => {} );

		const plugin = new SignalRUI( editor );
		plugin.init();

		editor.editing.view.document.isFocused = true;
		editor.editing.view.document.handlers[ 'change:isFocused' ]();
		editor.editing.view.document.handlers.keydown();
		editor.editing.view.document.handlers.mousedown();

		expect( logSpy ).toHaveBeenCalledWith( 'signalr: focus' );
		expect( logSpy ).toHaveBeenCalledWith( 'signalr: keydown' );
		expect( logSpy ).toHaveBeenCalledWith( 'signalr: mousedown' );
	} );
} );
