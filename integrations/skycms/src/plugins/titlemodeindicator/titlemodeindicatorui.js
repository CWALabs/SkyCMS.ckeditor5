/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { ButtonView, Plugin } from 'ckeditor5';

export default class TitleModeIndicatorUI extends Plugin {
	init() {
		const editor = this.editor;
		const t = editor.t;

		editor.ui.componentFactory.add( 'titleModeIndicator', locale => {
			const button = new ButtonView( locale );

			button.set( {
				label: t( 'Title editor' ),
				tooltip: t( 'Title editing mode. Advanced editor tools are not available here.' ),
				withText: true,
				isEnabled: false
			} );

			return button;
		} );
	}
}