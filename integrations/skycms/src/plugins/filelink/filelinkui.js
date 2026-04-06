/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { Plugin, ButtonView, IconBrowseFiles } from 'ckeditor5';

export default class FileLinkUI extends Plugin {
	init() {
		const editor = this.editor;
		const t = editor.t;

		editor.ui.componentFactory.add( 'fileLink', locale => {
			const button = new ButtonView( locale );

			button.set( {
				label: t( 'Link to file uploaded to this website.' ),
				icon: IconBrowseFiles,
				tooltip: true
			} );

			this.listenTo( button, 'execute', () => {
				const runtimeWindow = globalThis.window;
				const openInsertFileLinkModal = runtimeWindow?.parent?.openInsertFileLinkModel;

				if ( openInsertFileLinkModal ) {
					openInsertFileLinkModal( editor );
					return;
				}

				// Playground fallback: prompt for a file URL and apply the standard link command.
				const promptForFileUrl = runtimeWindow?.prompt;
				const fileUrl = promptForFileUrl ?
					promptForFileUrl( 'Enter file URL (example: /files/brochure.pdf):', '/files/brochure.pdf' ) :
					null;

				if ( fileUrl && fileUrl.trim().length > 0 ) {
					editor.execute( 'link', fileUrl.trim() );
				}
			} );

			return button;
		} );
	}
}
