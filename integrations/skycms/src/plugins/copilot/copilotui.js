/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { Plugin, ButtonView } from 'ckeditor5';

const assistantIcon = [
	'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">',
	[
		'<path d="',
		'M12 2a1 1 0 0 1 1 1 4 4 0 0 0 4 4 1 1 0 1 1 0 2 4 4 0 0 0-4 4 1 1 0 1 1-2 0 ',
		'4 4 0 0 0-4-4 1 1 0 1 1 0-2 4 4 0 0 0 4-4 1 1 0 0 1 1-1zm6.5 11a.75.75 0 0 1 .75.75A2.75 ',
		'2.75 0 0 0 22 16.5a.75.75 0 0 1 0 1.5 2.75 2.75 0 0 0-2.75 2.75.75.75 0 0 1-1.5 0A2.75 ',
		'2.75 0 0 0 15 18a.75.75 0 0 1 0-1.5 2.75 2.75 0 0 0 2.75-2.75.75.75 0 0 1 .75-.75zM6 13a1 1 ',
		'0 0 1 .98.8l.12.61a2.5 2.5 0 0 0 1.96 1.96l.61.12a1 1 0 0 1 0 1.96l-.61.12a2.5 2.5 0 0 0-1.96 ',
		'1.96l-.12.61a1 1 0 0 1-1.96 0l-.12-.61a2.5 2.5 0 0 0-1.96-1.96l-.61-.12a1 1 0 0 1 0-1.96l.61-.12A2.5 ',
		'2.5 0 0 0 4.9 14.4l.12-.61A1 1 0 0 1 6 13z"/>'
	].join( '' ),
	'</svg>'
].join( '' );

export default class CopilotUI extends Plugin {
	static get pluginName() {
		return 'Copilot';
	}

	init() {
		const editor = this.editor;
		const t = editor.t;

		editor.ui.componentFactory.add( 'copilotAssist', locale => {
			const button = new ButtonView( locale );

			button.set( {
				label: t( 'Open AI writing assistant.' ),
				icon: assistantIcon,
				tooltip: true
			} );

			this.listenTo( button, 'execute', () => {
				const runtimeWindow = globalThis.window;
				const openCopilot = runtimeWindow?.parent?.openCkEditorCopilot || runtimeWindow?.openCkEditorCopilot;

				if ( openCopilot ) {
					openCopilot( editor );
					return;
				}

				const showAlert = globalThis.alert;

				if ( showAlert ) {
					showAlert( 'No host AI assistant bridge detected.' );
				}
			} );

			return button;
		} );
	}
}
