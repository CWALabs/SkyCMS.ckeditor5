/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { Plugin, ButtonView, IconCode } from 'ckeditor5';

// Expected host API on window.parent:
//   window.parent.openVsCodeBlockEditor(editor)
//
// The host controls the external code editing experience and applies changes
// back into the CKEditor instance.
export default class VSCodeEditorUI extends Plugin {
	static get pluginName() {
		return 'VSCodeEditor';
	}

	init() {
		const editor = this.editor;
		const t = editor.t;

		editor.ui.componentFactory.add( 'vsCodeEditor', locale => {
			const button = new ButtonView( locale );

			button.set( {
				label: t( 'Open code editor.' ),
				icon: IconCode,
				tooltip: true
			} );

			this.listenTo( button, 'execute', () => {
				const runtimeWindow = globalThis.window;
				const openVsCodeBlockEditor = runtimeWindow?.parent?.openVsCodeBlockEditor;

				if ( openVsCodeBlockEditor ) {
					openVsCodeBlockEditor( editor );
				} else {
					const showAlert = globalThis.alert;

					if ( showAlert ) {
						showAlert( 'No host VS Code editor bridge detected.' );
					}
				}
			} );

			return button;
		} );
	}
}
