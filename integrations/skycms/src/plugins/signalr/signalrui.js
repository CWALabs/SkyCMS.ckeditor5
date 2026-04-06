/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { Plugin } from 'ckeditor5';

// Emits editor interaction events to the host integration.
//
// Expected host API on window.parent:
//   window.parent.cosmosSignalOthers(editor, eventName)
//
// Event names emitted by this plugin:
//   - focus
//   - blur
//   - keydown
//   - mousedown
//
// This keeps CKEditor-side logic simple and delegates transport and presence
// semantics to the CMS host.
export default class SignalRUI extends Plugin {
	static get pluginName() {
		return 'SignalR';
	}

	init() {
		const editor = this.editor;
		const signalOthers = eventName => {
			const runtimeWindow = globalThis.window;
			const hostSignal = runtimeWindow?.parent?.cosmosSignalOthers;

			if ( hostSignal ) {
				hostSignal( editor, eventName );
			} else {
				console.log( `signalr: ${ eventName }` );
			}
		};

		editor.editing.view.document.on( 'change:isFocused', () => {
			if ( editor.editing.view.document.isFocused ) {
				signalOthers( 'focus' );
			} else {
				signalOthers( 'blur' );
			}
		} );

		editor.editing.view.document.on( 'keydown', () => {
			signalOthers( 'keydown' );
		} );

		editor.editing.view.document.on( 'mousedown', () => {
			signalOthers( 'mousedown' );
		} );
	}
}
